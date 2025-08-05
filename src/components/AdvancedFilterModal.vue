<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', false)"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-4">
        <span class="text-h5 ps-2">Advanced Filtering</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-divider></v-divider>

      <v-card-text v-if="state.isLoading" class="d-flex align-center justify-center" style="min-height: 60vh;">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-card-text>
      <v-card-text v-else-if="state.error" class="d-flex align-center justify-center" style="min-height: 60vh;">
          <div class="text-center">
              <v-icon icon="mdi-alert-circle-outline" color="error" size="64"></v-icon>
              <p class="mt-4 text-h6">Could not load filters</p>
              <p class="text-medium-emphasis">{{ state.error }}</p>
              <v-btn color="primary" class="mt-4" @click="loadFilters">Retry</v-btn>
          </div>
      </v-card-text>

      <v-card-text v-else-if="state.filters" class="bg-grey-lighten-5 pa-6">
        <v-container fluid class="pa-0">
          <v-row>
            <v-col v-for="card in orderedCards" :key="card.key" cols="12" sm="6" lg="3">
                <v-card flat border class="h-100 d-flex flex-column">
                    <v-card-item class="pb-0">
                        <v-card-title>{{ card.title }}</v-card-title>
                        <v-text-field
                            v-if="!excludedAddText.includes(card.title)"
                            v-model="state.newText[card.key]"
                            label="Add custom item..."
                            density="compact" variant="outlined" hide-details class="my-4"
                            @keydown.enter.prevent="addCustomItem(card.key, card.title, card.type)"
                        ></v-text-field>
                    </v-card-item>
                    <v-card-text 
                        :class="[
                            'flex-grow-1 filter-options-container pa-0', 
                            { 
                                'mt-6': excludedAddText.includes(card.title) 
                            }
                        ]"
                    >
                        <template v-if="card.type === 'tag'">
                            <div v-for="group in getCardDetails(card).groups" :key="group.key" class="px-4 mt-2">
                                <v-chip v-if="isPopulationOrIntervention(card.key)" label size="small" color="grey-dark-3" class="my-3">
                                  {{ replaceWithMapper(group.key) }}
                                </v-chip>
                                <v-row>
                                  <v-col v-for="option in group.options" :key="option.key" cols="12" md="6" class="py-0">
                                      <div class="d-flex align-center">
                                          <v-checkbox 
                                              :label="replaceWithMapper(option.value.display)"
                                              :model-value="isChecked(option.value)"
                                              @update:modelValue="toggleOption(option.value, $event)"
                                              density="compact" hide-details class="flex-grow-1"
                                          ></v-checkbox>
                                          <v-btn v-if="option.value.isUserAdded" icon="mdi-close" variant="text" size="x-small" @click="removeCustomTag(card.key, group.key, option.key)"></v-btn>
                                      </div>
                                  </v-col>
                                </v-row>
                            </div>
                        </template>
                        <template v-if="card.type === 'other'">
                            <div class="px-4 mt-6">
                               <v-row>
                                  <v-col v-for="(option, index) in card.data" :key="`${option}-${index}`" cols="12" md="6" class="py-0">
                                    <div class="d-flex align-center">
                                        <v-checkbox
                                            :label="option.toString()"
                                            :model-value="state.selectedFilters.includes(option)"
                                            @update:modelValue="toggleOption({ display: option, synonyms: [option] }, $event)"
                                            density="compact" hide-details class="flex-grow-1"
                                          ></v-checkbox>
                                          <v-btn v-if="isCustomOther(card.title, option)" icon="mdi-close" variant="text" size="x-small" @click="removeCustomOther(card.title, option)"></v-btn>
                                    </div>
                                   </v-col>
                                </v-row>
                            </div>
                        </template>
                    </v-card-text>
                </v-card>
            </v-col>
          </v-row>
          
          <v-row class="mt-4">
               <v-col cols="12">
                  <v-card flat border>
                    <v-card-text class="pb-4">
                      <v-row>
                        <v-col cols="12" lg="8">
                          <v-label class="font-weight-bold mb-2">Additional Fields</v-label>
                          <div v-for="(field, i) in state.additionalFields" :key="i" class="d-flex ga-2 mb-2">
                            <v-select v-model="field.column" item-title="value" item-value="key" :items="orderColumns" label="Field" variant="outlined" density="compact" hide-details></v-select>
                            <v-text-field v-model="field.value" label="Value" variant="outlined" density="compact" hide-details></v-text-field>
                            <v-select v-model="field.type" :items="['Like Where', 'Or Like Where']" label="Operator" variant="outlined" density="compact" hide-details></v-select>
                            <v-btn v-if="i === state.additionalFields.length - 1" color="primary" @click="addAdditionalField" icon="mdi-plus" size="small"></v-btn>
                            <v-btn v-if="state.additionalFields.length > 1" color="grey" @click="removeAdditionalField(i)" icon="mdi-minus" size="small"></v-btn>
                          </div>
                        </v-col>
                        <v-col cols="12" lg="4">
                          <v-label class="font-weight-bold mb-2">Order By</v-label>
                          <div class="d-flex ga-2">
                            <v-select v-model="state.orderBy.column" :items="orderColumns" item-title="value" item-value="key" label="Column" variant="outlined" density="compact" hide-details></v-select>
                            <v-select v-model="state.orderBy.direction" :items="['ASC', 'DESC']" label="Direction" variant="outlined" density="compact" hide-details></v-select>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
               </v-col>
             </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn variant="outlined" @click="resetFilters">Reset</v-btn>
        <v-btn color="primary" variant="flat" @click="submitFilters">Filter</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, defineExpose } from 'vue';
import { mapper } from '@/services/index.js'; 

defineProps({ modelValue: Boolean });
const emit = defineEmits(['update:modelValue', 'apply-filters', 'filters-loaded']);

// Unified state object to prevent conflicts
const state = reactive({
    isLoading: true,
    error: null,
    filters: { tag_filters: {}, others: {} },
    selectedFilters: [],
    newText: {},
    customOthers: {},
    additionalFields: [{ column: '', value: '', type: 'likewhere' }],
    orderBy: { column: 'primary_id', direction: 'ASC' },
});

// Constants
const excludedAddText = ['AMSTAR 2 Rating'];
const orderColumns = [{key: 'title', value: 'By Title'}, {key: 'authors', value: 'By Author'}, {key: 'journal', value: 'journal'}, {key: 'primary_id', value: 'By ID'}];
const columnMapping = { Year: { column: 'year', type: 'where' }, Country: { column: 'country', type: 'likewhere' }, Language: { column: 'language', type: 'likewhere' }, region: { column: 'region', type: 'likewhere' }, 'AMSTAR 2 Rating': { column: 'AMSTAR 2 Rating', type: 'likewhere' }};
const replaceWithMapper = (key) => key ? (mapper[key] ?? key.replace(/_/g, ' ')) : '';

const loadFilters = async () => {
    state.isLoading = true;
    state.error = null;
    try {
        const response = await fetch('http://0.0.0.0:5400/api/v1/api/record/filters');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        state.filters = data.data;
        emit('filters-loaded', data.data);
        Object.keys(data.data.tag_filters).forEach(key => state.newText[key] = '');
        Object.keys(data.data.others).forEach(key => {
            state.newText[key] = '';
            state.customOthers[key] = new Set();
        });
    } catch (e) {
        state.error = e.message;
    } finally {
        state.isLoading = false;
    }
};
onMounted(loadFilters);

const orderedCards = computed(() => {
    if (!state.filters.others) return [];

    const categoryOrder = ['popu', 'intervention', 'outcome', 'topic'];
    const othersOrder = ['AMSTAR 2 Rating', 'region', 'Country', 'Year'];

    const tagFilters = categoryOrder
        .filter(key => state.filters.tag_filters[key])
        .map(key => ({
            key: key,
            title: replaceWithMapper(key),
            type: 'tag',
            data: state.filters.tag_filters[key]
        }));

    const otherFilters = othersOrder
        .filter(key => state.filters.others[key])
        .map(key => ({
            key: key, // Use the original key for data access, matching customOthers
            title: key,
            type: 'other',
            data: state.filters.others[key]
        }));

    return [...tagFilters, ...otherFilters];
});

const getCardDetails = (card) => {
    if (card.type === 'tag') {
        const popuSortOrder = ['nb_0__1', 'chi_2__9', 'ado_10__17', 'adu_18__64', 'eld_65__10000'];
        if (card.key === 'outcome' || card.key === 'topic') {
            const allOptions = Object.values(card.data).flatMap(group => 
                Object.entries(group).map(([optionKey, optionValue]) => ({ key: optionKey, value: optionValue }))
            );
            return { groups: [{ key: card.key, title: '', options: allOptions }] };
        }
        return {
            groups: Object.entries(card.data).map(([groupKey, groupValue]) => {
                let options = Object.entries(groupValue).map(([optionKey, optionValue]) => ({ key: optionKey, value: optionValue }));
                if (card.key === 'popu' && groupKey === 'age__group') {
                    options.sort((a, b) => {
                        const indexA = popuSortOrder.indexOf(a.key);
                        const indexB = popuSortOrder.indexOf(b.key);
                        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
                    });
                }
                return { key: groupKey, title: replaceWithMapper(groupKey), options };
            })
        };
    }
    return {};
};

const isPopulationOrIntervention = (key) => ['popu', 'intervention'].includes(key);

const toggleOption = (option, isChecked) => {
    const allValues = [option.display, ...(option.synonyms || [])];
    if (isChecked) {
        allValues.forEach(val => { if (!state.selectedFilters.includes(val)) state.selectedFilters.push(val); });
    } else {
        state.selectedFilters = state.selectedFilters.filter(item => !allValues.includes(item));
    }
};

const isChecked = (option) => {
    return state.selectedFilters.includes(option.display) || (option.synonyms || []).some(synonym => state.selectedFilters.includes(synonym));
};

const addCustomItem = (key, title, type) => {
    const text = state.newText[key]?.trim();
    if (!text) return;
    
    if (type === 'tag') {
        const category = state.filters.tag_filters[key];
        if (!category) return;
        const groupKey = 'CustomGroup';
        if (!category[groupKey]) category[groupKey] = {};
        const newKey = `custom_${text.toLowerCase().replace(/\s/g, '_')}`;
        category[groupKey][newKey] = { display: text, synonyms: [text], isUserAdded: true };
    } else if (type === 'other') {
        if (!state.filters.others[title]) state.filters.others[title] = [];
        if (!state.filters.others[title].includes(text)) {
            state.filters.others[title].push(text);
            state.customOthers[title].add(text);
        }
    }
    state.newText[key] = '';
};

const removeCustomTag = (categoryKey, groupKey, optionKey) => {
    const option = state.filters.tag_filters[categoryKey]?.[groupKey]?.[optionKey];
    if (option) {
        toggleOption(option, false);
        delete state.filters.tag_filters[categoryKey][groupKey][optionKey];
    }
};

const removeCustomOther = (originalTitle, item) => {
    toggleOption({ display: item, synonyms: [item] }, false);
    const index = state.filters.others[originalTitle].indexOf(item);
    if (index > -1) {
        state.filters.others[originalTitle].splice(index, 1);
    }
    state.customOthers[originalTitle].delete(item);
};

const isCustomOther = (originalTitle, item) => state.customOthers[originalTitle]?.has(item);
const addAdditionalField = () => state.additionalFields.push({ column: '', value: '', type: 'likewhere' });
const removeAdditionalField = (index) => state.additionalFields.splice(index, 1);

const resetFilters = () => {
    state.selectedFilters = [];
    state.additionalFields.splice(0, state.additionalFields.length, { column: '', value: '', type: 'likewhere' });
    Object.assign(state.orderBy, { column: 'primary_id', direction: 'ASC' });
    loadFilters();
};

const submitFilters = () => {
    const othersItems = new Set(Object.values(state.filters.others).flat());
    const additionalFromOthers = state.selectedFilters.filter(sel => othersItems.has(sel)).map(sel => {
        const column = Object.keys(state.filters.others).find(key => state.filters.others[key].includes(sel));
        return {
            column: columnMapping[column]?.column || column,
            value: sel,
            type: columnMapping[column]?.type || 'likewhere'
        };
    });
    const finalAdditionalFields = [ ...state.additionalFields.filter(f => f.column && f.value), ...additionalFromOthers ].map(f => ({...f, type: f.type.replace(' ', '').toLowerCase()}));
    const finalUserSelections = state.selectedFilters.filter(sel => !othersItems.has(sel));
    const orderByMap = { 'Relevance': 'primary_id', 'Date': 'date', 'Title': 'title' };
    console.log('Final User Selections:', finalUserSelections);
    console.log('Final Additional Fields:', finalAdditionalFields);
    const payload = {
        user_selections: finalUserSelections,
        additional_fields: finalAdditionalFields,
        order_by: [ orderByMap[state.orderBy.column] || state.orderBy.column, state.orderBy.direction ],
        export: null
    };
    emit('apply-filters', payload);
    emit('update:modelValue', false);
};

defineExpose({
  loadFilters
});
</script>

<style scoped>
.filter-options-container {
  max-height: 250px;
  overflow-y: auto;
  flex-grow: 1;
}
</style>