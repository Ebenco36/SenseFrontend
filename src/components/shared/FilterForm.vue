<template>
  <div>
    <!-- Button to open modal -->
    <v-btn color="primary" @click="openModal = true">
      <SearchIcon size="20" stroke-width="1.5" /> Search
    </v-btn>

    <!-- Modal for Advanced Search -->
    <v-dialog v-model="openModal" max-width="85%" persistent>
      <v-card>
        <!-- Modal Title -->
        <v-card-title>
          <span class="text-h5 font-weight-bold">Advanced Search</span>
        </v-card-title>

        <!-- Modal Content -->
        <v-card-text>
          <form @submit.prevent="submitFilters">
            <div class="categories-container">
              <!-- Loop through tag_filters -->
              <div v-for="(categories, categoryKey) in filters.tag_filters" :key="categoryKey" class="category">
                <h3>{{ replaceWithMapper(categoryKey, categoryKey) }}</h3>
                <div class="add-text">
                  <input type="text" v-model="newCategoryText[categoryKey]"
                    placeholder="Add custom item and press Enter" @keydown.enter="addTextToCategory(categoryKey)" />
                </div>
                <div class="groups-container">
                  <div v-for="(group, groupKey) in categories" :key="groupKey" class="group">
                    <small 
                      v-if="isPopulationOrIntervention(categoryKey)" 
                      style="
                        background-color: grey; 
                        padding: 5px; 
                        color:white; 
                        width: fit-content; 
                        margin-bottom: 20px!important;
                      "
                    >
                      {{ replaceWithMapper(groupKey, groupKey) }}
                    </small>
                    <div class="options-container">
                      <div v-for="(option, optionKey) in group" :key="optionKey" class="option">
                        <label>
                          <input type="checkbox" :checked="selectedFilters.includes(String(option.display)) ||
                            (option.synonyms ?? []).some((synonym) => selectedFilters.includes(synonym))
                            " @change="toggleOption(option, $event.target.checked)" />
                          {{ replaceWithMapper(option.display, option.display) }}
                        </label>
                        <span v-if="option.isUserAdded" class="remove-button"
                          @click="removeOption(categoryKey, groupKey, optionKey)">
                          ×
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loop through others -->
              <div v-for="(items, otherKey) in filters.others" :key="otherKey" class="category">
                <h3>{{ otherKey.charAt(0).toUpperCase() + otherKey.slice(1) }}</h3>
                <div class="add-text">
                  <input type="text" v-model="newOtherText[otherKey]" placeholder="Add custom item and press Enter"
                    @keydown.enter="addTextToOther(otherKey)" />
                </div>
                <div class="options-container">
                  <div v-for="(item, index) in items" :key="index" class="option">
                    <label>
                      <input type="checkbox" :checked="selectedFilters.includes(item)"
                        @change="toggleOption({ display: item }, $event.target.checked)" />
                      {{ item }}
                    </label>
                    <span v-if="isCustomOtherItem(item, otherKey)" class="remove-button"
                      @click="removeOtherItem(otherKey, index)">
                      ×
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Fields Section -->
            <div class="form-container">
              <v-row cols="12">
                <v-col>
                  <div class="additional-fields">
                    <h3>Additional Fields</h3>
                    <div v-for="(field, index) in additionalFields" :key="index" class="field-row">
                      <select v-model="field.column" style="width: 100% !important">
                        <option selected="true">Select field</option>
                        <option v-for="value in orderColumns" :key="value.key" :value="value.key">
                          {{ value.value }}
                        </option>
                      </select>
                      
                      <input type="text" v-model="field.value" placeholder="Value" />
                      <select v-model="field.type">
                        <option value="likewhere">Like Where</option>
                        <option value="orlikewhere">Or Like Where</option>
                      </select>
                      <v-btn v-if="index" type="button" @click="removeField(index)">
                        <MinusIcon size="20" stroke-width="1.5" />
                        <!-- Remove -->
                      </v-btn>
                      <v-btn type="button" @click="addField" v-if="index === additionalFields.length - 1"> 
                        <PlusIcon size="20" stroke-width="1.5" />
                        <!-- Add -->
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Order By Section -->
              <v-row cols="12">
                <v-col>
                  <h3>Order By</h3>
                  <v-row>
                    <v-col cols="2" sm="6" md="4" lg="2" xl="2" class="field-row-2nd">
                      <label>
                        Column:
                        <select v-model="orderBy.column" style="width: 100% !important">
                          <option v-for="value in orderColumns" :key="value.key" :value="value.key">
                            {{ value.value }}
                          </option>
                        </select>
                      </label>
                    </v-col>
                    <v-col cols="2" sm="6" md="4" lg="2" xl="2" class="field-row-2nd">
                      <label>
                        Direction:
                        <select v-model="orderBy.direction" style="width: 100% !important">
                          <option value="ASC">Ascending</option>
                          <option value="DESC">Descending</option>
                        </select>
                      </label>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>

            <!-- Modal Footer Buttons -->
            <div class="d-flex justify-end mt-3">
              <v-btn @click="closeModal" class="mr-2"> Close </v-btn>
              <v-btn type="submit">Search</v-btn>
            </div>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, defineEmits, onBeforeUnmount } from 'vue';
import { fetchFilters } from '@/api/filters';
import type { FiltersData, FilterOption } from '@/types/my-types/filters';
import { SearchIcon, PlusIcon, MinusIcon } from 'vue-tabler-icons';
import { mapper } from '@/services/index.js';
// Emits
const emit = defineEmits(['updateFilters']);

// Modal state
const openModal = ref(false);

// Constants and initial states
const categoryOrder = [
  'popu',
  'intervention',
  'outcome',
  'topic'
  // 'Reviews', 'Gender'
];
const othersOrder = ['Amster 2 Overall Rating', 'countries', 'languages', 'region', 'years'];
const filters = ref<FiltersData>({
  tag_filters: {},
  others: {}
});
// const showMore = reactive({});
const selectedFilters = ref<string[]>([]);
const newCategoryText = reactive<Record<string, string>>({});
const newOtherText = reactive<Record<string, string>>({});
const additionalFields = reactive([{ column: '', value: '', type: 'likewhere' }]);
const orderColumns = [
  {'key': 'Title', 'value': 'By Title'}, 
  {'key': 'Author', 'value': 'By Author'}, 
  {'key': 'Abstract', 'value': 'By Abstract'}, 
  {'key': 'Journal', 'value': 'By Journal'}, 
  {'key': 'verification_id', 'value': 'By ID'}
  // 'Date', 'Primary ID'
];
const orderBy = reactive({ column: 'primary_id', direction: 'ASC' });
const customOthers = reactive<Record<string, Set<string>>>({});
// Mapping for `others` fields to specific column names and types
const columnMapping: Record<string, { column: string; type: string }> = {
  Year: { column: 'Year', type: 'where' },
  Country: { column: 'Country', type: 'likewhere' },
  Language: { column: 'Language', type: 'likewhere' },
  region: { column: 'region', type: 'likewhere' }
};

// Helper method for renaming categories or options
const replaceWithMapper = (key: keyof typeof mapper, name: string) => {
  console.log(name)
  return mapper[key] ?? name.replace(/_/g, ' ');
};

// Fetch filters
const loadFilters = async () => {
  try {
    const response = await fetchFilters();
    if (response.status === 'success') {
      filters.value.tag_filters = response.data.tag_filters;
      filters.value.others = reorderOthers(response.data.others);

      // Initialize `newCategoryText` and `newOtherText`
      Object.keys(response.data.tag_filters).forEach((key) => {
        newCategoryText[key] = '';
      });
      if (response?.data?.others && typeof response.data.others === 'object') {
        Object.keys(response?.data?.others).forEach((key) => {
          newOtherText[key] = '';
        });
      }

      // Mark items in `tag_filters` as not user-added
      Object.entries(filters.value.tag_filters).forEach(([, category]) => {
        Object.values(category).forEach((group) => {
          Object.values(group).forEach((option: FilterOption) => {
            option.isUserAdded = false;
          });
        });
      });
      console.log(filters.value.tag_filters);
      // Reorder tag_filters categories
      const sortedCategories = categoryOrder.reduce(
        (sorted, key) => {
          if (filters.value.tag_filters[key]) {
            // Add custom sorting logic for the `popu` group
            console.log('my key : ' + key);
            if (key === 'popu') {
              console.log(filters.value.tag_filters[key]);
              const popuSortOrder = [
                'nb_0__1', // Newborns
                'chi_2__9', // Children
                'ado_10__17', // Adolescents
                'adu_18__64', // Adults
                'eld_65__10000' // Elderly
              ];

              // Sort `age__group` within `popu`
              const sortedPopu = Object.entries(filters.value.tag_filters[key]).reduce(
                (acc, [subKey, subValue]) => {
                  if (subKey === 'age__group') {
                    // Sort `age__group` based on the defined order
                    const sortedAgeGroup = Object.entries(subValue)
                      .sort(([keyA], [keyB]) => {
                        const indexA = popuSortOrder.indexOf(keyA);
                        const indexB = popuSortOrder.indexOf(keyB);
                        return (indexA !== -1 ? indexA : Infinity) - (indexB !== -1 ? indexB : Infinity);
                      })
                      .reduce(
                        (groupAcc, [groupKey, groupValue]) => {
                          groupAcc[groupKey] = groupValue;
                          return groupAcc;
                        },
                        {} as typeof subValue
                      );

                    acc[subKey] = sortedAgeGroup;
                  } else {
                    // Keep other groups as they are
                    acc[subKey] = subValue;
                  }
                  return acc;
                },
                {} as (typeof filters.value.tag_filters)['popu']
              );

              sorted[key] = sortedPopu;
            } else {
              // Default handling for other categories
              sorted[key] = filters.value.tag_filters[key];
            }
          }
          return sorted;
        },
        {} as FiltersData['tag_filters']
      );
      filters.value.tag_filters = sortedCategories;
    } else {
      console.error('Failed to fetch filters:', response.message);
    }
  } catch (error) {
    console.error('Error loading filters:', error);
  }
};

// Utility functions
const toggleOption = (option: { display: string; synonyms?: string[] }, isChecked: boolean) => {
  if (isChecked) {
    selectedFilters.value.push(...(option.synonyms ?? [option.display]));
  } else {
    selectedFilters.value = selectedFilters.value.filter((item) => !(option.synonyms ?? [option.display]).includes(item));
  }
};

// Reorder the `others` filters based on the `othersOrder` array
const reorderOthers = (others: FiltersData['others']): FiltersData['others'] => {
  const reordered: FiltersData['others'] = {};
  if (others && typeof others === 'object') {
    othersOrder.forEach((key) => {
      if (others[key] !== undefined) {
        reordered[key] = others[key];
      }
    });

    // Include any remaining keys that are not in `othersOrder`
    Object.keys(others).forEach((key) => {
      if (!(key in reordered)) {
        reordered[key] = others[key];
      }
    });
  }
  return reordered;
};

const isPopulationOrIntervention = (key: string) => ['popu', 'intervention'].includes(key);

const addTextToCategory = (categoryKey: string) => {
  const text = newCategoryText[categoryKey]?.trim();
  if (!text) return;

  const groupKey = 'CustomGroup';
  const category = filters.value.tag_filters[categoryKey];
  if (!category[groupKey]) category[groupKey] = {};

  const newKey = `Custom_${Date.now()}`;
  category[groupKey][newKey] = {
    display: text,
    synonyms: [],
    isUserAdded: true,
    additional_context: null
  };

  newCategoryText[categoryKey] = '';
};

// Function to add custom items to `others`
const addTextToOther = (otherKey: string) => {
  // Ensure `newOtherText` and the specific key exist, and trim the text
  const text = newOtherText[otherKey]?.trim();
  if (!text) return;

  // Check if `filters.value.others` exists, and initialize it if not
  if (!filters?.value?.others) {
    filters.value.others = {}; // Initialize `others` if undefined
  }

  if (!filters.value.others[otherKey]) {
    filters.value.others[otherKey] = []; // Initialize the array if not present
  }

  filters.value.others[otherKey].push(text);

  // Track the item as custom
  if (!customOthers[otherKey]) {
    customOthers[otherKey] = new Set(); // Initialize `Set` if undefined
  }
  customOthers[otherKey].add(text);

  // Clear the input field
  newOtherText[otherKey] = '';
};

// Helper to check if an item is custom
const isCustomOtherItem = (item: string, otherKey: string) => {
  return customOthers[otherKey]?.has(item) ?? false;
};

// Function to remove a custom item from `others`
const removeOtherItem = (otherKey: string, index: number) => {
  // Ensure `filters.value.others` and `filters.value.others[otherKey]` are defined
  const othersArray = filters?.value?.others?.[otherKey];
  if (!othersArray || index < 0 || index >= othersArray.length) return; // Validate array and index

  const item = othersArray[index];

  // Remove the item from `filters.value.others`
  othersArray.splice(index, 1);

  // If the item is custom, remove it from `customOthers`
  const customSet = customOthers[otherKey];
  if (customSet) {
    customSet.delete(item);
  }
};

const removeOption = (categoryKey: string, groupKey: string, optionKey: string) => {
  const category = filters.value.tag_filters[categoryKey];
  if (category[groupKey]) {
    delete category[groupKey][optionKey];
    if (Object.keys(category[groupKey]).length === 0) delete category[groupKey];
  }
};

const addField = (column: string, value: string, type: string="likewhere") => {
  additionalFields.push({ column, value, type: type });
};

const removeField = (index: number) => {
  if (index >= 0 && index < additionalFields.length) {
    additionalFields.splice(index, 1);
  } else {
    console.error('Invalid index');
  }
};

// Submit filters
const submitFilters = () => {
  // Extract selections for `others` and convert them to the `additional_fields` format
  const othersFields = Object.keys(filters.value.others).reduce(
    (acc, otherKey) => {
      const selectedForField = filters.value.others[otherKey].filter((item) => selectedFilters.value.includes(item));
      if (selectedForField.length > 0) {
        console.log(otherKey, columnMapping[otherKey])

        acc.push(
          ...selectedForField.map((value) => ({
            column: columnMapping[otherKey]?.column || otherKey, // Use mapped column or fallback to original key
            value: value, // The selected item in `others`
            type: columnMapping[otherKey]?.type || 'likewhere' // Use mapped type or fallback to "likewhere"
          }))
        );
      }
      return acc;
    },
    [] as Array<{ column: string; value: string; type: string }>
  );

  // Filter `user_selections` to exclude items in `others`
  const othersItems = othersFields.map((field) => field.value);
  const filteredUserSelections = selectedFilters.value.filter((item) => !othersItems.includes(item));

  // Merge `othersFields` into `additional_fields`
  const mergedAdditionalFields = [
    ...additionalFields.filter((field) => field.column && field.value),
    ...othersFields // Add processed `others` selections
  ];

  // Prepare the result
  const result = {
    user_selections: filteredUserSelections,
    additional_fields: mergedAdditionalFields,
    order_by: [orderBy.column, orderBy.direction]
  };

  emit('updateFilters', result);
  closeModal();
};

const closeModal = () => {
  openModal.value = false;
};

// Prevent default behavior of Enter key
const preventDefaultOnEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
};
// Lifecycle hooks
onMounted(() => {
  loadFilters();
  window.addEventListener('keydown', preventDefaultOnEnter);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', preventDefaultOnEnter);
});
</script>

<style scoped>
select {
  -moz-appearance: auto;
  -webkit-appearance: auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h3 {
  margin: 0.5rem 0;
}

h4 {
  margin: 0.3rem 0;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button {
  /* padding: 0.5rem 1rem; */
  cursor: pointer;
}

/* Grid container for categories */
.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* Individual category styling */
.category {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 5px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Groups container for each category */
.groups-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  /* Set a fixed height */
  overflow-y: auto;
  /* Enable vertical scrolling within groups */
}

/* Individual group styling */
.group {
  border: 1px solid #eee;
  padding: 0.5rem;
  border-radius: 3px;
  background-color: #fdfdfd;
}

/* Options container for each group */
.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 200px;
  /* Set a fixed height */
  overflow-y: auto;
  /* Enable vertical scrolling for options */
}

/* Individual option styling */
.option {
  flex: 1 1 45%;
}

/* Container for the three sections */
.form-container {
  display: grid;
  /* grid-template-columns: 2fr 1fr 1fr; */
  /* gap: 1rem; */
  /* align-items: flex-start; */
  /* padding: 1rem 0; */
}

/* Additional Fields Section */
.additional-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-row {
  display: grid;
  grid-template-columns: 2fr 6fr 2fr auto auto;
  gap: 0.5rem;
  align-items: center;
}

.field-row-2nd {
  display: grid;
  grid-template-columns: 12fr;
  gap: 0.5rem;
  align-items: center;
}

input,
select {
  border: 1px solid grey !important;
}

.field-row input,
.field-row select,
.field-row button,
.field-row-2nd input,
.field-row-2nd select,
.field-row-2nd button {
  padding: 0.4rem;
  font-size: 0.9rem;
}

/* Order By Section */
.order-by {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-by label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
}

.order-by input,
.order-by select {
  padding: 0.4rem;
  font-size: 0.9rem;
  width: 150px;
}

form button {
  /* margin-top: 1rem; */
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

form button:hover {
  background-color: #0056b3;
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.category {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 5px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-text {
  margin-bottom: 1rem;
}

.add-text input {
  width: 100%;
  padding: 0.4rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group {
  border: 1px solid #eee;
  padding: 0.5rem;
  border-radius: 3px;
  background-color: #fdfdfd;
}

.options-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option label {
  flex: 1;
}

.remove-button {
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 1rem;
}
</style>
