<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', false)"
    persistent
    scrollable
    max-width="1400px"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center py-4">
        <span class="text-h5 ps-2">Advanced Filtering</span>
        <v-chip v-if="selectedCount > 0" color="primary" class="mx-4">
          {{ selectedCount }} filters selected
        </v-chip>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      
      <v-divider></v-divider>

      <!-- Loading State -->
      <v-card-text v-if="state.isLoading" class="d-flex align-center justify-center" style="min-height: 60vh;">
        <div class="text-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-body-1">Loading filters...</p>
        </div>
      </v-card-text>

      <!-- Error State -->
      <v-card-text v-else-if="state.error" class="d-flex align-center justify-center" style="min-height: 60vh;">
        <div class="text-center">
          <v-icon icon="mdi-alert-circle-outline" color="error" size="64"></v-icon>
          <p class="mt-4 text-h6">Could not load filters</p>
          <p class="text-medium-emphasis">{{ state.error }}</p>
          <v-btn color="primary" class="mt-4" @click="loadFilters">Retry</v-btn>
        </div>
      </v-card-text>

      <!-- Filters Content -->
      <v-card-text v-else class="bg-grey-lighten-5 pa-6">
        <v-container fluid class="pa-0">
          <!-- Quick Search -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-text-field
                v-model="state.quickSearch"
                label="Quick search filters..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Filter Cards -->
          <v-row>
            <v-col v-for="card in filteredCards" :key="card.key" cols="12" sm="6" lg="3">
              <v-card flat border class="h-100 d-flex flex-column">
                <v-card-item class="pb-0">
                  <!-- Card Header with Title, Count, and Sort Button -->
                  <div class="d-flex align-center justify-space-between mb-3">
                    <v-card-title class="pa-0 d-flex align-center">
                      {{ card.title }}
                      <v-chip v-if="getCardSelectionCount(card) > 0" size="small" color="primary" class="ms-2">
                        {{ getCardSelectionCount(card) }}
                      </v-chip>
                    </v-card-title>
                    
                    <!-- Sort Button (except for Year) -->
                    <v-btn
                      v-if="card.type !== 'year'"
                      :icon="state.sortOrder[card.key] === 'asc' ? 'mdi-sort-alphabetical-ascending' : 'mdi-sort-alphabetical-descending'"
                      variant="text"
                      size="small"
                      @click="toggleSort(card.key)"
                    >
                      <v-icon></v-icon>
                      <v-tooltip activator="parent" location="top">
                        Sort {{ state.sortOrder[card.key] === 'asc' ? 'Z-A' : 'A-Z' }}
                      </v-tooltip>
                    </v-btn>
                  </div>
                  
                  <!-- Dual-Purpose Custom Input: Search + Add -->
                  <v-text-field
                    v-if="!excludedAddText.includes(card.title) && card.type !== 'year'"
                    v-model="state.newText[card.key]"
                    :label="state.newText[card.key] ? 'Press Enter to add or search...' : 'Search or add custom item...'"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="my-2"
                    clearable
                    @keydown.enter.prevent="handleCustomInput(card)"
                    @input="handleSearchInput(card)"
                  >
                    <template #prepend-inner>
                      <v-icon size="small" :color="state.newText[card.key] ? 'primary' : 'grey'">
                        mdi-magnify
                      </v-icon>
                    </template>
                    <template #append-inner>
                      <v-btn
                        v-if="state.newText[card.key]"
                        icon="mdi-plus"
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="addCustomItem(card)"
                      >
                        <v-icon></v-icon>
                        <v-tooltip activator="parent" location="top">
                          Add "{{ state.newText[card.key] }}"
                        </v-tooltip>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-card-item>

                <v-card-text 
                  :class="[
                    'flex-grow-1 filter-options-container pa-0', 
                    { 'mt-6': excludedAddText.includes(card.title) || card.type === 'year' }
                  ]"
                >
                  <!-- Tag Filters (Hierarchical) -->
                  <template v-if="card.type === 'tag'">
                    <div v-for="group in card.groups" :key="group.key" class="px-4 mt-2">
                      <!-- Group Header (conditional) -->
                      <v-chip 
                        v-if="shouldShowGroupHeader(card.key, card.groups.length)" 
                        label 
                        size="small" 
                        color="grey-darken-3" 
                        class="my-3"
                      >
                        {{ formatLabel(group.key) }}
                      </v-chip>
                      
                      <!-- Items in 2 columns -->
                      <template v-if="getFilteredGroupItems(card, group).length > 0">
                        <v-row>
                          <v-col 
                            v-for="item in getFilteredGroupItems(card, group)" 
                            :key="item.key" 
                            cols="12" 
                            md="6" 
                            class="py-0"
                          >
                            <div class="d-flex align-center">
                              <v-checkbox 
                                :label="formatLabel(item.value.display)"
                                :model-value="isTagSelected(card.key, group.key, item.key)"
                                @update:modelValue="toggleTag(card.key, group.key, item.key, item.value, $event)"
                                density="compact"
                                hide-details
                                class="flex-grow-1"
                              ></v-checkbox>
                              <v-btn 
                                v-if="item.value.isUserAdded" 
                                icon="mdi-close" 
                                variant="text" 
                                size="x-small" 
                                @click="removeCustomTag(card.key, group.key, item.key)"
                              ></v-btn>
                            </div>
                          </v-col>
                        </v-row>
                      </template>
                      
                      <!-- No Results Message -->
                      <div v-else class="text-center text-caption text-grey pa-4">
                        No matching items
                      </div>
                    </div>
                  </template>

                  <!-- Simple Filters (Others) -->
                  <template v-if="card.type === 'other'">
                    <div class="px-4 mt-6">
                      <v-row v-if="getFilteredOtherValues(card).length > 0">
                        <v-col 
                          v-for="(value, index) in getFilteredOtherValues(card)" 
                          :key="`${value}-${index}`" 
                          cols="12" 
                          md="6" 
                          class="py-0"
                        >
                          <div class="d-flex align-center">
                            <v-checkbox
                              :label="String(value)"
                              :model-value="isOtherSelected(card.key, value)"
                              @update:modelValue="toggleOther(card.key, value, $event)"
                              density="compact"
                              hide-details
                              class="flex-grow-1"
                            ></v-checkbox>
                            <v-btn 
                              v-if="isCustomValue(card.key, value)" 
                              icon="mdi-close" 
                              variant="text" 
                              size="x-small" 
                              @click="removeCustomValue(card.key, value)"
                            ></v-btn>
                          </div>
                        </v-col>
                      </v-row>
                      
                      <!-- No Results Message -->
                      <div v-else class="text-center text-caption text-grey pa-4">
                        No matching items
                      </div>
                    </div>
                  </template>

                  <!-- Year Range Slider -->
                  <template v-if="card.type === 'year'">
                    <div class="px-4 mt-6">
                      <v-range-slider
                        v-model="state.yearRange"
                        :min="card.min"
                        :max="card.max"
                        :step="1"
                        thumb-label="always"
                        color="primary"
                        hide-details
                        class="mt-4"
                      ></v-range-slider>
                      <div class="d-flex justify-space-between mt-2 text-caption">
                        <span>{{ card.min }}</span>
                        <span>{{ card.max }}</span>
                      </div>
                    </div>
                  </template>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Additional Fields & Sorting -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card flat border>
                <v-card-text class="pb-4">
                  <v-row>
                    <v-col cols="12" lg="8">
                      <v-label class="font-weight-bold mb-2">Additional Search Fields</v-label>
                      <div v-for="(field, i) in state.additionalFields" :key="i" class="d-flex ga-2 mb-2">
                        <v-select
                          v-model="field.column"
                          item-title="label"
                          item-value="value"
                          :items="searchableColumns"
                          label="Field"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-select>
                        <v-text-field
                          v-model="field.value"
                          label="Search term"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-text-field>
                        <v-select
                          v-model="field.operator"
                          :items="searchOperators"
                          label="Operator"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-select>
                        <v-btn
                          v-if="i === state.additionalFields.length - 1"
                          color="primary"
                          @click="addAdditionalField"
                          icon="mdi-plus"
                          size="small"
                        ></v-btn>
                        <v-btn
                          v-if="state.additionalFields.length > 1"
                          color="grey"
                          @click="removeAdditionalField(i)"
                          icon="mdi-minus"
                          size="small"
                        ></v-btn>
                      </div>
                    </v-col>
                    <v-col cols="12" lg="4">
                      <v-label class="font-weight-bold mb-2">Sort By</v-label>
                      <div class="d-flex ga-2">
                        <v-select
                          v-model="state.orderBy.column"
                          :items="orderColumns"
                          item-title="label"
                          item-value="value"
                          label="Column"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-select>
                        <v-select
                          v-model="state.orderBy.direction"
                          :items="[{title: 'Ascending', value: 'asc'}, {title: 'Descending', value: 'desc'}]"
                          label="Direction"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-select>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Active Filters Summary -->
          <v-row v-if="selectedCount > 0" class="mt-4">
            <v-col cols="12">
              <v-card flat border color="primary-lighten-5">
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <span class="font-weight-bold">Active Filters:</span>
                      <v-chip
                        v-for="(filter, index) in activeFiltersSummary"
                        :key="index"
                        size="small"
                        closable
                        class="ml-2"
                        @click:close="removeActiveFilter(filter)"
                      >
                        {{ filter.label }}
                      </v-chip>
                    </div>
                    <v-btn
                      color="error"
                      variant="text"
                      size="small"
                      @click="clearAllFilters"
                    >
                      Clear All
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>
      
      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn variant="outlined" @click="resetFilters">Reset</v-btn>
        <v-btn 
          color="primary" 
          variant="flat" 
          @click="submitFilters"
          :loading="state.isApplying"
        >
          Apply Filters ({{ selectedCount }})
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue';
import { mapper } from '@/services/index.js';

// ==========================================
// PROPS & EMITS
// ==========================================

const props = defineProps({ 
  modelValue: Boolean,
  tableName: { type: String, default: 'all_db' }
});

const emit = defineEmits(['update:modelValue', 'apply-filters', 'filters-loaded']);

// ==========================================
// STATE
// ==========================================

const state = reactive({
  isLoading: true,
  isApplying: false,
  error: null,
  filters: { tag_filters: {}, others: {} },
  selectedTags: {},
  selectedOthers: {},
  customTags: {},
  customOthers: {},
  quickSearch: '',
  yearRange: [2011, 2026],
  newText: {},
  searchText: {},
  sortOrder: {},
  additionalFields: [{ column: '', value: '', operator: 'contains' }],
  orderBy: { column: 'year', direction: 'desc' },
});

// ==========================================
// CONSTANTS
// ==========================================

const excludedAddText = ['AMSTAR 2 Rating', 'Year'];
const API_BASE = 'http://localhost:5400/api/v1';
const hiddenCards = ['studies', 'reviews', 'Language'];

const orderColumns = [
  { label: 'ID', value: 'primary_id' },
  { label: 'Title', value: 'title' },
  { label: 'Author', value: 'authors' },
  { label: 'Journal', value: 'journal' },
  { label: 'Year', value: 'year' }
];

const searchableColumns = [
  { label: 'Title', value: 'title' },
  { label: 'Abstract', value: 'abstract' },
  { label: 'Authors', value: 'authors' },
  { label: 'Journal', value: 'journal' },
  { label: 'Keywords', value: 'keywords' },
  { label: 'Year', value: 'year' },
  { label: 'DOI', value: 'doi' }
];

const searchOperators = [
  { title: 'Contains', value: 'contains' },
  { title: 'Exact Match', value: '=' },
  { title: 'Starts With', value: 'starts_with' },
  { title: 'Ends With', value: 'ends_with' }
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatLabel = (label) => {
  if (!label) return '';
  const mapped = mapper[label];
  if (mapped) return mapped;
  return label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const toggleSort = (cardKey) => {
  if (!state.sortOrder[cardKey]) {
    state.sortOrder[cardKey] = 'asc';
  } else {
    state.sortOrder[cardKey] = state.sortOrder[cardKey] === 'asc' ? 'desc' : 'asc';
  }
};

const handleSearchInput = (card) => {
  state.searchText[card.key] = state.newText[card.key]?.toLowerCase() || '';
};

const handleCustomInput = (card) => {
  const text = state.newText[card.key]?.trim();
  if (text) {
    addCustomItem(card);
  }
};

const getFilteredGroupItems = (card, group) => {
  let items = group.items || [];
  
  // Filter by search text
  const searchTerm = state.searchText[card.key];
  if (searchTerm) {
    items = items.filter(item => 
      formatLabel(item.value.display).toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort alphabetically
  const sortOrder = state.sortOrder[card.key] || 'asc';
  items = [...items].sort((a, b) => {
    const labelA = formatLabel(a.value.display).toLowerCase();
    const labelB = formatLabel(b.value.display).toLowerCase();
    return sortOrder === 'asc' 
      ? labelA.localeCompare(labelB)
      : labelB.localeCompare(labelA);
  });
  
  return items;
};

const getFilteredOtherValues = (card) => {
  let values = card.values || [];
  
  // Filter by search text
  const searchTerm = state.searchText[card.key];
  if (searchTerm) {
    values = values.filter(value => 
      String(value).toLowerCase().includes(searchTerm)
    );
  }
  
  // Sort alphabetically
  const sortOrder = state.sortOrder[card.key] || 'asc';
  values = [...values].sort((a, b) => {
    const strA = String(a).toLowerCase();
    const strB = String(b).toLowerCase();
    return sortOrder === 'asc'
      ? strA.localeCompare(strB)
      : strB.localeCompare(strA);
  });
  
  return values;
};

// ==========================================
// DATA LOADING
// ==========================================

const loadFilters = async () => {
  state.isLoading = true;
  state.error = null;
  
  try {
    const response = await fetch(`${API_BASE}/api/filters/tree`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to load filters');
    }
    
    state.filters = result.data;
    
    // Initialize year range
    if (state.filters.others?.Year?.values?.length) {
      const years = state.filters.others.Year.values.map(Number);
      state.yearRange = [Math.min(...years), Math.max(...years)];
    }
    
    // Initialize state for all cards
    Object.keys(state.filters.tag_filters || {}).forEach(key => {
      state.newText[key] = '';
      state.searchText[key] = '';
      state.sortOrder[key] = 'asc';
    });
    Object.keys(state.filters.others || {}).forEach(key => {
      state.newText[key] = '';
      state.searchText[key] = '';
      state.sortOrder[key] = 'asc';
      state.customOthers[key] = new Set();
    });
    
    emit('filters-loaded', state.filters);
    
  } catch (e) {
    console.error('Filter loading error:', e);
    state.error = e.message;
  } finally {
    state.isLoading = false;
  }
};

// ==========================================
// CARD BUILDING
// ==========================================

const cards = computed(() => {
  const result = [];
  const categoryOrder = ['popu', 'intervention', 'outcome', 'topic'];
  
  // Tag filters
  categoryOrder.forEach(key => {
    const data = state.filters.tag_filters?.[key];
    if (!data || hiddenCards.includes(key)) return;
    
    const groups = extractTagGroups(data, key);
    if (groups.length > 0) {
      result.push({
        key,
        title: formatLabel(key),
        type: 'tag',
        column: data.column,
        groups
      });
    }
  });
  
  // Other filters
  Object.entries(state.filters.others || {}).forEach(([key, data]) => {
    if (hiddenCards.includes(key)) return;
    
    if (key === 'Year' && data?.values?.length) {
      const years = data.values.map(Number);
      result.push({
        key,
        title: 'Year',
        type: 'year',
        min: Math.min(...years),
        max: Math.max(...years),
        column: data.column
      });
    } else if (data?.values?.length) {
      result.push({
        key,
        title: key,
        type: 'other',
        values: data.values,
        column: data.column
      });
    }
  });
  
  return result;
});

const extractTagGroups = (data, categoryKey) => {
  const groups = [];
  const popuSortOrder = ['nb_0__1', 'chi_2__9', 'ado_10__17', 'adu_18__64', 'eld_65__10000'];
  
  // ✨ FLATTEN topic and outcome
  if (categoryKey === 'topic' || categoryKey === 'outcome') {
    const allItems = [];
    
    Object.entries(data).forEach(([groupKey, groupData]) => {
      if (groupKey === 'column' || !groupData || typeof groupData !== 'object') return;
      
      Object.entries(groupData).forEach(([itemKey, itemValue]) => {
        if (itemKey === 'column' || !itemValue || typeof itemValue !== 'object') return;
        if (!itemValue.display) return;
        
        allItems.push({ 
          key: itemKey, 
          value: { ...itemValue, originalGroup: groupKey }
        });
      });
    });
    
    if (allItems.length > 0) {
      groups.push({ 
        key: categoryKey,
        items: allItems 
      });
    }
    
    return groups;
  }
  
  // ✨ HIERARCHICAL for popu and intervention
  Object.entries(data).forEach(([groupKey, groupData]) => {
    if (groupKey === 'column' || !groupData || typeof groupData !== 'object') return;
    
    const items = [];
    Object.entries(groupData).forEach(([itemKey, itemValue]) => {
      if (itemKey === 'column' || !itemValue || typeof itemValue !== 'object') return;
      if (!itemValue.display) return;
      
      items.push({ key: itemKey, value: itemValue });
    });
    
    if (categoryKey === 'popu' && groupKey === 'age__group') {
      items.sort((a, b) => {
        const idxA = popuSortOrder.indexOf(a.key);
        const idxB = popuSortOrder.indexOf(b.key);
        return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
      });
    }
    
    if (items.length > 0) {
      groups.push({ key: groupKey, items });
    }
  });
  
  return groups;
};

const filteredCards = computed(() => {
  if (!state.quickSearch) return cards.value;
  const search = state.quickSearch.toLowerCase();
  return cards.value.filter(card => card.title.toLowerCase().includes(search));
});

const shouldShowGroupHeader = (categoryKey, groupsCount) => {
  // Only show for popu and intervention
  return ['popu', 'intervention'].includes(categoryKey);
};

// ==========================================
// SELECTION LOGIC
// ==========================================

const toggleTag = (catKey, groupKey, itemKey, itemValue, checked) => {
  if (!state.selectedTags[catKey]) state.selectedTags[catKey] = {};
  
  // Use originalGroup for topic/outcome backend compatibility
  const actualGroupKey = itemValue?.originalGroup || groupKey;
  
  if (!state.selectedTags[catKey][actualGroupKey]) {
    state.selectedTags[catKey][actualGroupKey] = {};
  }
  
  if (checked) {
    state.selectedTags[catKey][actualGroupKey][itemKey] = itemValue;
  } else {
    delete state.selectedTags[catKey][actualGroupKey][itemKey];
    if (Object.keys(state.selectedTags[catKey][actualGroupKey]).length === 0) {
      delete state.selectedTags[catKey][actualGroupKey];
    }
    if (Object.keys(state.selectedTags[catKey]).length === 0) {
      delete state.selectedTags[catKey];
    }
  }
};

const isTagSelected = (catKey, groupKey, itemKey) => {
  // For flattened topic/outcome, check across all groups
  if (catKey === 'topic' || catKey === 'outcome') {
    return Object.values(state.selectedTags[catKey] || {}).some(group => 
      group[itemKey]
    );
  }
  return !!state.selectedTags[catKey]?.[groupKey]?.[itemKey];
};

const toggleOther = (catKey, value, checked) => {
  if (!state.selectedOthers[catKey]) state.selectedOthers[catKey] = [];
  
  if (checked) {
    if (!state.selectedOthers[catKey].includes(value)) {
      state.selectedOthers[catKey].push(value);
    }
  } else {
    state.selectedOthers[catKey] = state.selectedOthers[catKey].filter(v => v !== value);
    if (state.selectedOthers[catKey].length === 0) {
      delete state.selectedOthers[catKey];
    }
  }
};

const isOtherSelected = (catKey, value) => {
  return state.selectedOthers[catKey]?.includes(value) || false;
};

// ==========================================
// CUSTOM ITEMS
// ==========================================

const addCustomItem = (card) => {
  const text = state.newText[card.key]?.trim();
  if (!text) return;
  
  if (card.type === 'tag') {
    const data = state.filters.tag_filters[card.key];
    
    if (card.key === 'topic' || card.key === 'outcome') {
      if (!data.CustomGroup) data.CustomGroup = { column: data.column };
      
      const customKey = `custom_${Date.now()}`;
      data.CustomGroup[customKey] = {
        display: text,
        synonyms: [text],
        isUserAdded: true,
        column: data.column,
        originalGroup: 'CustomGroup'
      };
    } else {
      if (!data.CustomGroup) data.CustomGroup = { column: data.column };
      
      const customKey = `custom_${Date.now()}`;
      data.CustomGroup[customKey] = {
        display: text,
        synonyms: [text],
        isUserAdded: true,
        column: data.column
      };
    }
  } else if (card.type === 'other') {
    if (!card.values.includes(text)) {
      card.values.push(text);
      state.customOthers[card.key].add(text);
    }
  }
  
  state.newText[card.key] = '';
  state.searchText[card.key] = '';
};

const removeCustomTag = (catKey, groupKey, itemKey) => {
  toggleTag(catKey, groupKey, itemKey, null, false);
  
  if (catKey === 'topic' || catKey === 'outcome') {
    Object.keys(state.filters.tag_filters[catKey] || {}).forEach(grp => {
      if (grp !== 'column' && state.filters.tag_filters[catKey][grp]) {
        delete state.filters.tag_filters[catKey][grp][itemKey];
      }
    });
  } else {
    delete state.filters.tag_filters[catKey]?.[groupKey]?.[itemKey];
  }
};

const removeCustomValue = (catKey, value) => {
  toggleOther(catKey, value, false);
  const card = cards.value.find(c => c.key === catKey);
  if (card?.values) {
    const idx = card.values.indexOf(value);
    if (idx > -1) card.values.splice(idx, 1);
  }
  state.customOthers[catKey]?.delete(value);
};

const isCustomValue = (catKey, value) => {
  return state.customOthers[catKey]?.has(value) || false;
};

// ==========================================
// COUNTS
// ==========================================

const getCardSelectionCount = (card) => {
  if (card.type === 'tag') {
    let count = 0;
    Object.values(state.selectedTags[card.key] || {}).forEach(group => {
      count += Object.keys(group).length;
    });
    return count;
  } else if (card.type === 'other') {
    return state.selectedOthers[card.key]?.length || 0;
  } else if (card.type === 'year') {
    return (state.yearRange[0] !== card.min || state.yearRange[1] !== card.max) ? 1 : 0;
  }
  return 0;
};

const selectedCount = computed(() => {
  let count = 0;
  Object.values(state.selectedTags).forEach(groups => {
    Object.values(groups).forEach(opts => {
      count += Object.keys(opts).length;
    });
  });
  Object.values(state.selectedOthers).forEach(vals => {
    count += vals.length;
  });
  const yearCard = cards.value.find(c => c.type === 'year');
  if (yearCard) count += getCardSelectionCount(yearCard);
  return count;
});

// ==========================================
// ACTIVE FILTERS SUMMARY
// ==========================================

const activeFiltersSummary = computed(() => {
  const summary = [];
  
  Object.entries(state.selectedTags).forEach(([cat, groups]) => {
    Object.entries(groups).forEach(([group, items]) => {
      Object.entries(items).forEach(([item, val]) => {
        summary.push({
          type: 'tag',
          cat,
          group,
          item,
          label: `${formatLabel(cat)}: ${formatLabel(val.display || item)}`
        });
      });
    });
  });
  
  Object.entries(state.selectedOthers).forEach(([cat, vals]) => {
    vals.forEach(val => {
      summary.push({
        type: 'other',
        cat,
        val,
        label: `${cat}: ${val}`
      });
    });
  });
  
  return summary;
});

const removeActiveFilter = (filter) => {
  if (filter.type === 'tag') {
    toggleTag(filter.cat, filter.group, filter.item, null, false);
  } else {
    toggleOther(filter.cat, filter.val, false);
  }
};

// ==========================================
// CONTROL FUNCTIONS
// ==========================================

const addAdditionalField = () => {
  state.additionalFields.push({ column: '', value: '', operator: 'contains' });
};

const removeAdditionalField = (i) => {
  state.additionalFields.splice(i, 1);
};

const clearAllFilters = () => {
  state.selectedTags = {};
  state.selectedOthers = {};
  const yearCard = cards.value.find(c => c.type === 'year');
  if (yearCard) state.yearRange = [yearCard.min, yearCard.max];
};

const resetFilters = () => {
  clearAllFilters();
  state.additionalFields = [{ column: '', value: '', operator: 'contains' }];
  state.orderBy = { column: 'year', direction: 'desc' };
  state.searchText = {};
  state.newText = {};
  loadFilters();
};

const closeDialog = () => {
  emit('update:modelValue', false);
};

// ==========================================
// SUBMIT FILTERS - WITH SYNONYMS SUPPORT
// ==========================================

const submitFilters = async () => {
  state.isApplying = true;
  
  try {
    const conditions = [];
    
    // ✨ Tag filters with SYNONYMS for popu, intervention, outcome, topic
    Object.entries(state.selectedTags).forEach(([cat, groups]) => {
      Object.entries(groups).forEach(([group, items]) => {
        Object.entries(items).forEach(([item, val]) => {
          const column = val.column || state.filters.tag_filters[cat]?.column;
          
          if (column && val.synonyms && val.synonyms.length > 0) {
            // ✨ Use ALL synonyms in IN operator
            conditions.push({
              field: column,
              operator: 'in',
              values: val.synonyms
            });
          } else if (column) {
            // Fallback if no synonyms
            conditions.push({
              field: column,
              operator: 'equals',
              value: val.display || item
            });
          }
        });
      });
    });
    
    // Other filters (non-tag)
    Object.entries(state.selectedOthers).forEach(([cat, vals]) => {
      const column = state.filters.others[cat]?.column;
      if (column && vals.length > 0) {
        conditions.push({
          field: column,
          operator: 'in',
          values: vals
        });
      }
    });
    
    // Year range
    const yearCard = cards.value.find(c => c.type === 'year');
    if (yearCard && (state.yearRange[0] !== yearCard.min || state.yearRange[1] !== yearCard.max)) {
      conditions.push({
        field: yearCard.column || 'year',
        operator: 'between',
        value: state.yearRange
      });
    }
    
    // Additional fields
    state.additionalFields.forEach(f => {
      if (f.column && f.value) {
        conditions.push({
          field: f.column,
          operator: f.operator,
          value: f.value
        });
      }
    });
    
    const payload = {
      search: { conditions, logic: 'AND' },
      sort_by: state.orderBy.column,
      sort_direction: state.orderBy.direction,
      page: 1,
      per_page: 20
    };
    
    console.log('✅ Submitting filters with synonyms:', payload);
    
    emit('apply-filters', payload);
    closeDialog();
    
  } catch (e) {
    console.error('❌ Submit error:', e);
    state.error = 'Failed to apply filters';
  } finally {
    state.isApplying = false;
  }
};

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => loadFilters());

watch(() => props.modelValue, (newVal) => {
  if (newVal && (!state.filters.tag_filters || Object.keys(state.filters.tag_filters).length === 0)) {
    loadFilters();
  }
});

defineExpose({ loadFilters, resetFilters });
</script>

<style scoped>
.filter-options-container {
  max-height: 250px;
  overflow-y: auto;
  flex-grow: 1;
}

.filter-options-container::-webkit-scrollbar {
  width: 6px;
}

.filter-options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.filter-options-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.filter-options-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
