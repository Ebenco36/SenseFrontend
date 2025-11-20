<template>
  <v-app>
    <!-- App Bar with Search -->
    <v-app-bar flat color="#153a9d" height="120">
      <v-container class="h-100 d-flex align-center ga-4">
        <h1 class="text-h4 font-weight-bold text-white me-4 d-none d-md-block">
          Resources
        </h1>
        
        <!-- Search Bar with Field Selector -->
        <div class="d-flex flex-grow-1 align-center">
          <div class="d-flex flex-grow-1">
            <!-- Search Field Selector -->
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="flat"
                  color="white"
                  height="48"
                  class="search-field-selector"
                  append-icon="mdi-chevron-down"
                >
                  {{ selectedSearchFieldLabel }}
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item
                  v-for="field in searchFields"
                  :key="field.value"
                  :value="field.value"
                  @click="state.searchField = field.value"
                >
                  <v-list-item-title>
                    <v-icon :icon="field.icon" size="small" class="me-2" />
                    {{ field.label }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            
            <!-- Search Input -->
            <v-text-field 
              v-model="state.searchQuery" 
              variant="solo" 
              label="Search..."
              :placeholder="searchPlaceholder"
              density="comfortable" 
              hide-details 
              rounded="0" 
              flat 
              class="search-input"
              @keydown.enter="performSearch"
            />
            
            <!-- Search Button -->
            <v-btn 
              height="48" 
              color="#D95D45" 
              variant="flat" 
              class="find-btn font-weight-bold text-white"
              @click="performSearch" 
              :loading="state.isLoading"
            >
              Find
            </v-btn>
          </div>
          
          <!-- Advanced Filter Button -->
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn 
                v-bind="props" 
                size="large" 
                icon="mdi-filter-variant" 
                variant="text" 
                color="white"
                class="ms-2" 
                @click="state.showAdvancedFilters = true"
              />
            </template>
            <span>Advanced Filtering</span>
          </v-tooltip>
        </div>
      </v-container>
    </v-app-bar>


    <!-- Main Content -->
    <!-- <v-main class="bg-grey-lighten-4"> -->
    <v-main >
      <v-container fluid class="py-8 px-md-8">
        <v-row>
          <!-- Sidebar Filters -->
          <v-col cols="12" md="3">
            <div class="d-flex flex-column ga-6">
              <!-- Selected Filters Card -->
              <v-card variant="outlined" flat>
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Selected Filters
                </v-card-title>
                <v-divider />
                
                <v-card-text v-if="selectedFilters.length > 0" class="filter-chips-container">
                  <v-chip 
                    v-for="(filter, idx) in selectedFilters" 
                    :key="idx" 
                    size="small" 
                    closable 
                    color="primary"
                    class="ma-1" 
                    @click:close="removeFilter(filter)"
                  >
                    {{ filter.label }}
                  </v-chip>
                </v-card-text>
                                
                <v-card-text v-else class="text-center text-medium-emphasis py-4">
                  No filters selected
                </v-card-text>
                
                <div class="px-4 pb-4">
                  <v-btn 
                    variant="outlined" 
                    color="error" 
                    block 
                    @click="clearAllFilters"
                    :disabled="!selectedFilters.length"
                  >
                    Clear All
                  </v-btn>
                </div>
              </v-card>
              
              <!-- Filter Groups -->
              <v-card 
                v-for="group in sidebarFilterGroups"
                :key="group.title"
                variant="outlined"
              >
                <v-card-title class="d-flex align-center justify-space-between pa-3">
                  <span class="text-subtitle-1 font-weight-bold">{{ formatLabel(group.title) }}</span>
                  
                  <!-- Sort Toggle Button -->
                  <v-btn
                    :icon="group.sortMode === 'alphabetical' ? 'mdi-sort-alphabetical-ascending' : 'mdi-sort-numeric-descending'"
                    size="small"
                    variant="text"
                    @click="toggleGroupSort(group)"
                  >
                    <v-icon />
                    <v-tooltip activator="parent" location="top">
                      {{ group.sortMode === 'alphabetical' ? 'Sort by count' : 'Sort alphabetically' }}
                    </v-tooltip>
                  </v-btn>
                </v-card-title>
                <v-divider />
                
                <v-list density="compact" class="py-0 filter-options-container">
                  <template v-for="option in getSortedOptions(group)" :key="option.label">
                    <!-- Group Header -->
                    <v-list-subheader 
                      v-if="option.isHeader" 
                      class="font-weight-bold"
                    >
                      {{ formatLabel(option.label) }}
                    </v-list-subheader>
                    
                    <!-- Filter Option -->
                    <v-list-item 
                      v-else
                      @click="toggleFilter(option, group)"
                    >
                      <template #prepend>
                        <v-checkbox-btn :model-value="option.selected" />
                      </template>
                      <v-list-item-title class="text-body-2">
                        {{ formatLabel(option.label) }}
                      </v-list-item-title>
                      <template #append>
                        <span class="text-caption text-medium-emphasis">
                          ({{ option.count?.toLocaleString() ?? 0 }})
                        </span>
                      </template>
                    </v-list-item>
                  </template>
                </v-list>
              </v-card>
            </div>
          </v-col>

          <!-- Search Results -->
          <v-col cols="12" md="9">
            <h2 class="text-h6 font-weight-bold mb-6">
              {{ pagination.total_records.toLocaleString() }} results found
            </h2>

            <!-- Controls Bar -->
            <v-card flat class="mb-4 pa-4">
              <v-row align="center" dense>
                <v-col cols="auto">
                  <v-select 
                    v-model="pagination.page_size" 
                    :items="[10, 25, 50, 100]" 
                    label="Per Page" 
                    density="compact"
                    variant="outlined" 
                    hide-details 
                    style="width: 120px;"
                    @update:model-value="handlePageSizeChange"
                  />
                </v-col>
                
                <v-col cols="auto">
                  <v-select 
                    v-model="state.sortBy" 
                    :items="sortOptions" 
                    item-title="title" 
                    item-value="key"
                    label="Sort By" 
                    density="compact" 
                    variant="outlined" 
                    hide-details
                    style="width: 180px;"
                    @update:model-value="triggerSearch"
                  />
                </v-col>
                
                <v-col cols="auto">
                  <v-btn-toggle 
                    v-model="state.sortOrder" 
                    mandatory 
                    variant="outlined" 
                    density="compact"
                    @update:model-value="triggerSearch"
                  >
                    <v-btn value="asc" icon="mdi-arrow-up" title="Ascending" />
                    <v-btn value="desc" icon="mdi-arrow-down" title="Descending" />
                  </v-btn-toggle>
                </v-col>
                
                <v-spacer />
                
                <v-col cols="auto">
                  <div class="d-flex ga-2">
                    <v-btn 
                      variant="outlined" 
                      prepend-icon="mdi-download"
                      @click="downloadData('csv')" 
                      :loading="state.isExporting.csv"
                    >
                      CSV
                    </v-btn>
                    <v-btn 
                      variant="outlined" 
                      prepend-icon="mdi-download"
                      @click="downloadData('excel')" 
                      :loading="state.isExporting.excel"
                    >
                      Excel
                    </v-btn>
                    <v-btn 
                      variant="outlined" 
                      prepend-icon="mdi-download"
                      @click="downloadData('json')" 
                      :loading="state.isExporting.excel"
                    >
                      Json
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <!-- Loading State -->
            <div v-if="state.isLoading" class="text-center py-16">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-medium-emphasis">Searching...</p>
            </div>

            <!-- Results List -->
            <div v-else class="d-flex flex-column ga-4">
              <!-- <v-card 
                v-for="item in searchResults" 
                :key="item.primary_id" 
                variant="outlined" 
                hover
              >
                <v-card-text class="pa-6">
                  <div class="mb-3">
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      {{ item.year }} · {{ item.authors }}
                      <span v-if="item.country"> · {{ item.country }}</span>
                    </p>
                    <a 
                      href="#" 
                      @click.prevent="navigateToDetails(item.primary_id)"
                      class="text-h6 font-weight-bold text-primary result-title"
                    >
                      {{ item.title }}
                    </a>
                  </div>

                  <v-divider class="my-4" />

                  <v-row dense>
                    <v-col cols="12" sm="4">
                      <div class="text-caption text-medium-emphasis">Studies</div>
                      <div class="font-weight-medium">{{ item.num_of_studies || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <div class="text-caption text-medium-emphasis">Last Search</div>
                      <div class="font-weight-medium">{{ item.date_of_literature_search || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <div class="text-caption text-medium-emphasis">Publication</div>
                      <div class="font-weight-medium">{{ item.publication_date || 'N/A' }}</div>
                    </v-col>
                  </v-row>

                  <div v-if="item.publication_type" class="mt-3">
                    <v-chip size="small" color="primary" variant="tonal">
                      {{ item.publication_type }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card> -->
              
              <v-card 
                v-for="item in searchResults"
                :key="item.primary_id" 
                variant="outlined" 
                hover
                class="result-card"
              >
                <v-card-text class="pa-6">
                  <!-- Header Info -->
                  <div class="mb-4">
                    <div class="d-flex align-center flex-wrap ga-2 mb-2">
                      <v-chip 
                        v-if="item.year" 
                        size="small" 
                        variant="tonal"
                      >
                        {{ item.year }}
                      </v-chip>
                      <v-chip 
                        v-if="item.overallConf && item.overallConf !== 'N/A'"
                        :color="getConfidenceColor(item.overallConf)" 
                        size="small" 
                        variant="tonal"
                      >
                        {{ item.overallConf }}
                      </v-chip>
                      <v-chip
                        v-if="item.openAccess && item.openAccess !== 'N/A' && item.openAccess.toLowerCase().includes('open access')"
                        color="success"
                        size="small"
                        variant="tonal"
                      >
                        OA
                      </v-chip>
                    </div>
                    
                    <!-- Title -->
                    <a 
                      href="#"
                      @click.prevent="navigateToDetails(item.primary_id)"
                      class="text-h6 font-weight-bold result-title d-block mb-2"
                    >
                      {{ item.title }}
                    </a>
                    
                    <!-- Authors -->
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ formatAuthors(item.authors) }}
                      <span v-if="item.country"> · {{ item.country }}</span>
                    </p>
                  </div>

                  <!-- Abstract -->
                  <div v-if="item.abstract" class="mb-4">
                    <p class="text-body-2">
                      {{ item.isAbstractExpanded ? item.abstract : truncateText(item.abstract, 300) }}
                      <a
                        v-if="item.abstract.length > 300"
                        href="#"
                        class="read-more-link ms-1"
                        @click.prevent="item.isAbstractExpanded = !item.isAbstractExpanded"
                      >
                        {{ item.isAbstractExpanded ? 'Show Less' : 'Show More' }}
                      </a>
                    </p>
                  </div>

                  <v-divider class="my-4" />

                  <!-- Metadata Grid -->
                  <v-row dense class="mb-4">
                    <v-col cols="6" sm="3">
                      <div class="text-caption text-medium-emphasis">Studies</div>
                      <div class="font-weight-bold">{{ item.num_of_studies || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <div class="text-caption text-medium-emphasis">Last Search</div>
                      <div class="font-weight-bold">{{ item.date_of_literature_search || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <div class="text-caption text-medium-emphasis">Published</div>
                      <div class="font-weight-bold">{{ item.publication_date || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <div class="text-caption text-medium-emphasis">Type</div>
                      <div class="font-weight-bold">{{ item.publication_type || 'N/A' }}</div>
                    </v-col>
                  </v-row>

                  <!-- Tags Section -->
                  <div v-if="(item.research_notes && item.research_notes.length > 0) || (item.notes && item.notes.length > 0)" class="mb-4">
                    <v-chip-group>
                      <v-chip v-for="note in item.research_notes" :key="`rn-${note}`" size="small" color="blue-grey-lighten-4">
                        {{ note }}
                      </v-chip>
                      <v-chip v-for="note in item.notes" :key="`n-${note}`" size="small" variant="outlined">
                        {{ note }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <!-- Action Button -->
                  <v-btn 
                    variant="tonal" 
                    color="primary" 
                    size="small"
                    :href="item.link" 
                    target="_blank"
                    prepend-icon="mdi-open-in-new"
                  >
                    View Article
                  </v-btn>
                </v-card-text>
              </v-card>



              <!-- No Results -->
              <div v-if="searchResults.length === 0" class="text-center py-12">
                <v-icon icon="mdi-database-search" size="64" color="grey" />
                <p class="text-h6 mt-4">No results found</p>
                <p class="text-body-2 text-medium-emphasis">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>

            <!-- Pagination -->
            <v-pagination 
              v-if="!state.isLoading && pagination.total_pages > 1" 
              v-model="pagination.current_page"
              :length="pagination.total_pages" 
              @update:model-value="handlePageChange" 
              class="mt-8"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- Advanced Filter Dialog -->
    <AdvancedFilterDialog 
      v-model="state.showAdvancedFilters"
      @apply-filters="handleApplyFilters" 
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';

// Components
const AdvancedFilterDialog = defineAsyncComponent(() => 
  import('@/components/AdvancedFilterDialog.vue')
);

const router = useRouter();

// Types
interface FilterOption {
  label: string;
  selected: boolean;
  count: number;
  isHeader?: boolean;
  column?: string;
  synonyms?: string[];
  code?: string;
}

interface FilterGroup {
  title: string;
  key?: string;
  options: FilterOption[];
  sortMode: 'alphabetical' | 'count';
}

interface SearchResult {
  primary_id: number;
  title: string;
  authors: string;
  year: number | string;
  country: string;
  publication_type: string;
  notes: string[];
  research_notes: string[];
  date_of_literature_search: string;
  num_of_studies: number;
  publication_date: string;
  link: string;
  abstract: string;
  overallConf: string;
  openAccess: string;
  location_in_title: string;
  isAbstractExpanded?: boolean;
}

interface Pagination {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}
// Search Fields Configuration
interface SearchField {
  value: string;
  label: string;
  icon: string;
  placeholder: string;
}

const searchFields: SearchField[] = [
  {
    value: 'all',
    label: 'All Fields',
    icon: 'mdi-text-search',
    placeholder: 'Search across title, authors, abstract, keywords...'
  },
  {
    value: 'title',
    label: 'Title Only',
    icon: 'mdi-format-title',
    placeholder: 'Search in titles...'
  },
  {
    value: 'authors',
    label: 'Authors',
    icon: 'mdi-account-multiple',
    placeholder: 'Search by author names...'
  },
  {
    value: 'abstract',
    label: 'Abstract',
    icon: 'mdi-text-box',
    placeholder: 'Search in abstracts...'
  },
  // {
  //   value: 'keywords',
  //   label: 'Keywords/Topics',
  //   icon: 'mdi-tag-multiple',
  //   placeholder: 'Search in keywords and topics...'
  // },
  // {
  //   value: 'journal',
  //   label: 'Journal',
  //   icon: 'mdi-book-open-page-variant',
  //   placeholder: 'Search by journal name...'
  // }
];

// Configuration
const API_BASE = 'http://localhost:5400/api/v1';

// State
const state = reactive({
  searchQuery: '',
  searchField: 'all', // ← ADD THIS
  sortBy: 'year',
  sortOrder: 'desc',
  isLoading: false,
  showAdvancedFilters: false,
  isExporting: {
    csv: false,
    excel: false,
    json: false
  }
});

// Add these computed properties
const selectedSearchFieldLabel = computed(() => {
  const field = searchFields.find(f => f.value === state.searchField);
  return field ? field.label : 'All Fields';
});

const searchPlaceholder = computed(() => {
  const field = searchFields.find(f => f.value === state.searchField);
  return field ? field.placeholder : 'Search...';
});

// Data
const sidebarFilterGroups = ref<FilterGroup[]>([]);
const searchResults = ref<SearchResult[]>([]);
const advancedFilterConditions = ref<any[]>([]);

const pagination = reactive<Pagination>({
  current_page: 1,
  page_size: 10,
  total_pages: 1,
  total_records: 0
});

const sortOptions = [
  { title: 'Relevance', key: 'primary_id' },
  { title: 'Publication Year', key: 'year' },
  { title: 'Title', key: 'title' },
  { title: 'Authors', key: 'authors' }
];

// Computed Properties
// const selectedFilters = computed(() => {
//   const filters: string[] = [];
  
//   // Sidebar selections
//   sidebarFilterGroups.value.forEach(group => {
//     group.options.forEach(option => {
//       if (option.selected && !option.isHeader) {
//         filters.push(`${group.title}: ${option.label}`);
//       }
//     });
//   });
  
//   // Advanced filters
//   advancedFilterConditions.value.forEach(condition => {
//     if (condition.operator === 'between') {
//       filters.push(`Year: ${condition.value[0]} - ${condition.value[1]}`);
//     } else if (condition.operator === 'in') {
//       filters.push(`${condition.field}: ${condition.values.join(', ')}`);
//     } else {
//       filters.push(`${condition.field}: ${condition.value}`);
//     }
//   });
  
//   return filters;
// });


// const selectedFilters = computed(() => {
//   const filters: Array<{ label: string; raw: string; group: string; option: FilterOption }> = [];
  
//   // Sidebar selections
//   sidebarFilterGroups.value.forEach(group => {
//     group.options.forEach(option => {
//       if (option.selected && !option.isHeader) {
//         // Format the display text nicely
//         const formattedLabel = `${group.title}: ${option.label}`;
        
//         filters.push({
//           label: formattedLabel,
//           raw: `${group.title}: ${option.label}`,
//           group: group.title,
//           option: option
//         });
//       }
//     });
//   });
  
//   // Advanced filters
//   advancedFilterConditions.value.forEach(condition => {
//     let formattedLabel = '';
    
//     if (condition.operator === 'between') {
//       formattedLabel = `Year: ${condition.value[0]} - ${condition.value[1]}`;
//     } else if (condition.operator === 'in') {
//       formattedLabel = `${formatFieldName(condition.field)}: ${condition.values.join(', ')}`;
//     } else {
//       formattedLabel = `${formatFieldName(condition.field)}: ${condition.value}`;
//     }
    
//     filters.push({
//       label: formattedLabel,
//       raw: formattedLabel,
//       group: 'advanced',
//       option: null as any
//     });
//   });
  
//   return filters;
// });

const selectedFilters = computed(() => {
  const filters: Array<{ label: string; raw: string; group: string; option: FilterOption | null }> = [];
  
  // Sidebar selections
  sidebarFilterGroups.value.forEach((group) => {
    group.options.forEach((option) => {
      if (option.selected && !option.isHeader) {
        console.log(option)
        // ✨ Use clean display label (e.g., "Infection" instead of "inf, infection:inf")
        const displayLabel = option.label;
        const formattedLabel = `${group.title}: ${displayLabel}`;
        
        filters.push({
          label: formattedLabel,
          raw: `${group.title}: ${displayLabel}`,
          group: group.title,
          option: option
        });
      }
    });
  });
  
  // Advanced filters
  advancedFilterConditions.value.forEach((condition) => {
    let formattedLabel = '';
    
    if (condition.operator === 'between') {
      formattedLabel = `Year: ${condition.value[0]} - ${condition.value[1]}`;
    } else if (condition.operator === 'in' && condition.values) {
      // ✨ For IN operator, show the values cleanly
      // If it's from tag filters with synonyms, extract clean display names
      const cleanValues = condition.values.map((val: string) => {
        // Extract clean name from "infection:inf" format
        const parts = val.split(':');
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      });
      
      // Show first 2 items, then "+ X more" if needed
      if (cleanValues.length === 1) {
        formattedLabel = `${formatFieldName(condition.field)}: ${cleanValues[0]}`;
      } else if (cleanValues.length <= 2) {
        formattedLabel = `${formatFieldName(condition.field)}: ${cleanValues.join(', ')}`;
      } else {
        const preview = cleanValues.slice(0, 2).join(', ');
        const remaining = cleanValues.length - 2;
        formattedLabel = `${formatFieldName(condition.field)}: ${preview} +${remaining} more`;
      }
    } else {
      formattedLabel = `${formatFieldName(condition.field)}: ${condition.value}`;
    }
    
    filters.push({
      label: formattedLabel,
      raw: formattedLabel,
      group: 'advanced',
      option: null as any
    });
  });
  
  return filters;
});




// const apiPayload = computed(() => {
//   const conditions: any[] = [];
  
//   // Add search query (search across multiple fields)
//   if (state.searchQuery) {
//     conditions.push({
//       field: 'title',
//       operator: 'contains',
//       value: state.searchQuery
//     });
//   }
  
//   // Add sidebar selections
//   sidebarFilterGroups.value.forEach(group => {
//     const selectedOptions = group.options
//       .filter(opt => opt.selected && !opt.isHeader);
    
//     if (selectedOptions.length > 0) {
//       selectedOptions.forEach(opt => {
//         const column = opt.column || group.title.toLowerCase();
//         conditions.push({
//           field: column,
//           operator: 'equals',
//           value: opt.label
//         });
//       });
//     }
//   });
  
//   // Add advanced conditions
//   conditions.push(...advancedFilterConditions.value);
  
//   return {
//     table_name: 'all_db',
//     search: {
//       conditions: conditions,
//       logic: 'AND'
//     },
//     sort_by: state.sortBy,
//     sort_direction: state.sortOrder,
//     page: pagination.current_page,
//     per_page: pagination.page_size
//   };
// });



const apiPayload = computed(() => {
  const conditions: any[] = [];
  
  // Handle multi-field search with OR logic
  if (state.searchQuery) {
    if (state.searchField === 'all') {
      conditions.push({
        logic: 'OR',
        conditions: [
          { field: 'title', operator: 'contains', value: state.searchQuery },
          { field: 'authors', operator: 'contains', value: state.searchQuery },
          { field: 'abstract', operator: 'contains', value: state.searchQuery },
          // { field: 'topic_notes', operator: 'contains', value: state.searchQuery },
          // { field: 'research_notes', operator: 'contains', value: state.searchQuery },
          // { field: 'journal', operator: 'contains', value: state.searchQuery }
        ]
      });
    } else {
      conditions.push({
        field: state.searchField,
        operator: 'contains',
        value: state.searchQuery
      });
    }
  }
  
  // Add sidebar selections with OR within groups
  sidebarFilterGroups.value.forEach(group => {
    const selectedOptions = group.options
      .filter(opt => opt.selected && !opt.isHeader);
    
    if (selectedOptions.length > 0) {
      const column = selectedOptions[0].column || group.title.toLowerCase();
      
      if (selectedOptions.length === 1) {
        conditions.push({
          field: column,
          operator: 'equals',
          value: selectedOptions[0].code || selectedOptions[0].label
        });
      } else {
        conditions.push({
          logic: 'OR',
          conditions: selectedOptions.map(opt => ({
            field: opt.column || column,
            operator: 'equals',
            value: opt.code || opt.label
          }))
        });
      }
    }
  });
  
  // Add advanced conditions
  conditions.push(...advancedFilterConditions.value);
  
  return {
    table_name: 'all_db',
    search: {
      conditions: conditions,
      logic: 'AND'
    },
    sort_by: state.sortBy,
    sort_direction: state.sortOrder,
    pagination: {                    // ← Use 'pagination' object
      page: pagination.current_page,
      page_size: pagination.page_size  // ← Keep as page_size (your backend reads this)
    }
  };
});



// Methods - HELPER FUNCTION (NOT A COMPUTED PROPERTY)
const getSortedOptions = (group: FilterGroup): FilterOption[] => {
  // Separate headers and regular options
  const headers = group.options.filter(opt => opt.isHeader);
  const regularOptions = group.options.filter(opt => !opt.isHeader);
  
  // Sort regular options based on current mode
  let sortedRegular: FilterOption[];
  if (group.sortMode === 'alphabetical') {
    sortedRegular = [...regularOptions].sort((a, b) => 
      a.label.localeCompare(b.label)
    );
  } else {
    // Sort by count (descending)
    sortedRegular = [...regularOptions].sort((a, b) => 
      (b.count || 0) - (a.count || 0)
    );
  }
  
  // Combine headers and sorted options
  return [...headers, ...sortedRegular];
};

const loadFilters = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/filters/tree`);
    
    if (response.data.success) {
      buildSidebarFilters(response.data.data);
    }
  } catch (error) {
    console.error('Error loading filters:', error);
  }
};


const formatFieldName = (fieldName: string): string => {
  // Handle hash paths - extract last segment
  if (fieldName.includes('__hash__')) {
    const parts = fieldName.split('__');
    fieldName = parts[parts.length - 1];
  }
  
  // Handle topic_ prefix
  if (fieldName.startsWith('topic_')) {
    return 'Topic';
  }
  
  // Handle intervention_ prefix
  if (fieldName.startsWith('intervention_')) {
    return 'Intervention';
  }
  
  // Handle outcome_ prefix
  if (fieldName.startsWith('outcome_')) {
    return 'Outcome';
  }
  
  // Handle popu_ prefix
  if (fieldName.startsWith('popu_')) {
    return 'Population';
  }
  
  // Special cases
  const specialCases: Record<string, string> = {
    'amstar_label': 'AMSTAR Rating',
    'region': 'Region',
    'country': 'Country',
    'year': 'Year',
    'language': 'Language'
  };
  
  if (specialCases[fieldName]) {
    return specialCases[fieldName];
  }
  
  // Default: capitalize and replace underscores
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


const HIDDEN_SIDEBAR_FILTERS = ['Region', 'Language', 'Population']; // Add any filters you want to hide
const buildSidebarFilters = (availableFilters: any) => {
  const categories = [
    { key: 'topic', title: 'Topics', type: 'tag' },
    { key: 'intervention', title: 'Interventions', type: 'tag' },
    { key: 'outcome', title: 'Outcomes', type: 'tag' },
    { key: 'popu', title: 'Population', type: 'tag' },
    { key: 'Country', title: 'Country', type: 'other' },
    { key: 'Region', title: 'Region', type: 'other' },
    { key: 'Year', title: 'Year', type: 'other' },
    { key: 'Amstar_Label', title: 'AMSTAR 2 Rating', type: 'other' }
  ].filter(cat => !HIDDEN_SIDEBAR_FILTERS.includes(cat.title));
  
  const groups: FilterGroup[] = [];
  
  categories.forEach(category => {
    const tagData = availableFilters.tag_filters?.[category.key];
    const otherData = availableFilters.others?.[category.title] || availableFilters.others?.[category.key];
    
    if (category.type === 'tag' && tagData) {
      const options: FilterOption[] = [];
      
      Object.entries(tagData).forEach(([groupKey, groupValue]: [string, any]) => {
        if (groupKey === 'column') return;
        
        // Add header for Population groups
        if (category.key === 'popu' && Object.keys(tagData).length > 2) {
          options.push({
            label: formatLabel(groupKey),
            selected: false,
            count: 0,
            isHeader: true
          });
        }
        
        // Extract items
        Object.entries(groupValue).forEach(([itemKey, itemValue]: [string, any]) => {
          if (itemKey === 'column' || !itemValue || typeof itemValue !== 'object') return;
          
          if (itemValue.display) {
            options.push({
              label: itemValue.display,
              selected: false,
              count: 0,
              column: itemValue.column || tagData.column,
              synonyms: itemValue.synonyms || [itemValue.display],
              code: itemKey,  // Backend key for matching
              key: itemKey
            });
          }
        });
      });
      
      if (options.length > 0) {
        groups.push({ 
          title: category.title,
          key: category.key,  // ← ADD THIS: Store the backend key
          options,
          sortMode: 'alphabetical'
        });
      }
    } else if (category.type === 'other' && otherData) {
      const values = otherData.values || [];
      const options: FilterOption[] = values.map((value: any) => ({
        label: String(value),
        selected: false,
        count: 0,
        column: otherData.column,
        code: String(value),  // ← For 'other' types, code = the actual value
        key: String(value)
      }));
      
      if (options.length > 0) {
        groups.push({ 
          title: category.title,
          key: category.key,  // ← ADD THIS: Store the backend key (e.g., 'amstar_label', 'country')
          options,
          sortMode: 'alphabetical'
        });
      }
    }
  });
  
  sidebarFilterGroups.value = groups;
};

const createDoiUrl = (textContainingDoi: string): string => {
  if (!textContainingDoi) return '#';
  const doiRegex = /10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = textContainingDoi.match(doiRegex);
  return match ? `https://doi.org/${match[0]}` : '#';
};



const performSearch = async () => {
  state.isLoading = true;
  
  try {
    const response = await axios.post(`${API_BASE}/filters/search`, apiPayload.value);
    
    if (response.data.success) {
      const apiData = response.data.data;
      searchResults.value = (apiData.records || []).map((record: any): SearchResult => ({
        primary_id: record.primary_id,
        title: record.title || 'Untitled',
        authors: formatAuthors(record.authors),
        link: createDoiUrl(record.doi),
        abstract: record.abstract || '',
        year: record.year,
        country: (record.country || '').replace(/[\[\]']/g, ''),
        date_of_literature_search: record.lit_search_dates__hash__dates__hash__dates || 'N/A',
        num_of_studies: record.total_study_count || 0,
        publication_date: record.date || 'N/A',
        publication_type: record.publication_type || 'N/A',
        notes: Array.isArray(record.notes) ? record.notes : [],
        research_notes: Array.isArray(record.research_notes) ? record.research_notes : [],
        location_in_title: record.location_in_title || '',
        overallConf: record.amstar_label || 'N/A',
        openAccess: record.open_access || 'N/A',
        isAbstractExpanded: false,  // ← Initialize
      }));
      
      pagination.current_page = apiData.pagination.current_page;
      pagination.page_size = apiData.pagination.page_size;
      pagination.total_pages = apiData.pagination.total_pages;
      pagination.total_records = apiData.pagination.total_records;
      updateFilterCounts(apiData.filter_counts);
    }
  } catch (error) {
    console.error('Search error:', error);
    searchResults.value = [];
  } finally {
    state.isLoading = false;
  }
};


const updateFilterCounts = (counts: any) => {
  if (!counts) return;
  
  console.log('Filter counts received from backend:', counts);
  
  Object.entries(counts).forEach(([filterName, filterCounts]: [string, any]) => {
    // Try to match by title or by key
    const group = sidebarFilterGroups.value.find(g =>
      g.title.toLowerCase() === filterName.toLowerCase() ||
      g.key?.toLowerCase() === filterName.toLowerCase()
    );
    
    if (group && Array.isArray(filterCounts)) {
      console.log(`Updating counts for group: ${group.title} (key: ${group.key})`);
      
      group.options.forEach(option => {
        if (option.isHeader) return;
        
        // Try matching with multiple identifiers for robustness
        const countData = filterCounts.find((c: any) => {
          const countValue = String(c.value).toLowerCase().trim();
          const optionLabel = String(option.label).toLowerCase().trim();
          const optionCode = String(option.code || '').toLowerCase().trim();
          const optionKey = String(option.key || '').toLowerCase().trim();
          
          // Match by code/key first (most reliable), then label as fallback
          return countValue === optionCode || 
                 countValue === optionKey || 
                 countValue === optionLabel;
        });
        
        if (countData) {
          option.count = countData.count;
          console.log(`  ✓ Matched "${option.label}" -> count: ${countData.count}`);
        } else {
          option.count = 0;
          console.log(`  ✗ No match for "${option.label}" (code: ${option.code})`);
        }
      });
    } else {
      console.log(`⚠️  Could not find group for filter: ${filterName}`);
    }
  });
};

const toggleGroupSort = (group: FilterGroup) => {
  // Toggle between alphabetical and count sorting
  group.sortMode = group.sortMode === 'alphabetical' ? 'count' : 'alphabetical';
};

const downloadData = async (format: 'csv' | 'excel' | 'json') => {
  state.isExporting[format] = true;
  
  try {
    const payload = {
      ...apiPayload.value,
      export: format,
      page: 1,
      per_page: pagination.total_records
    };
    
    const response = await axios.post(`${API_BASE}/filters/search`, payload, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Export error:`, error);
  } finally {
    state.isExporting[format] = false;
  }
};

const toggleFilter = (option: FilterOption, group: FilterGroup) => {
  if (!option.isHeader) {
    option.selected = !option.selected;
    pagination.current_page = 1;
    performSearch();
  }
};

// const removeFilter = (label: string) => {
//   const [groupName, filterName] = label.split(': ');
  
//   sidebarFilterGroups.value.forEach(group => {
//     if (group.title === groupName) {
//       group.options.forEach(option => {
//         if (option.label === filterName) {
//           option.selected = false;
//         }
//       });
//     }
//   });
  
//   advancedFilterConditions.value = advancedFilterConditions.value.filter(c =>
//     !label.includes(`${c.field}:`)
//   );
  
//   pagination.current_page = 1;
//   performSearch();
// };

const removeFilter = (filter: { label: string; raw: string; group: string; option: FilterOption }) => {
  if (filter.group === 'advanced') {
    // Remove from advanced filters
    const filterText = filter.raw;
    advancedFilterConditions.value = advancedFilterConditions.value.filter(c => {
      if (c.operator === 'between') {
        return `Year: ${c.value[0]} - ${c.value[1]}` !== filterText;
      } else if (c.operator === 'in') {
        return `${formatFieldName(c.field)}: ${c.values.join(', ')}` !== filterText;
      } else {
        return `${formatFieldName(c.field)}: ${c.value}` !== filterText;
      }
    });
  } else {
    // Remove from sidebar filters
    sidebarFilterGroups.value.forEach(group => {
      if (group.title === filter.group) {
        group.options.forEach(option => {
          if (option === filter.option) {
            option.selected = false;
          }
        });
      }
    });
  }
  
  pagination.current_page = 1;
  performSearch();
};


const clearAllFilters = () => {
  sidebarFilterGroups.value.forEach(group => {
    group.options.forEach(option => {
      option.selected = false;
    });
  });
  
  advancedFilterConditions.value = [];
  state.searchQuery = '';
  pagination.current_page = 1;
  performSearch();
};

const triggerSearch = () => {
  pagination.current_page = 1;
  performSearch();
};

const handleApplyFilters = (filterData: any) => {
  advancedFilterConditions.value = filterData.search?.conditions || [];
  
  if (filterData.sort_by) {
    state.sortBy = filterData.sort_by;
    state.sortOrder = filterData.sort_direction || 'desc';
  }
  
  pagination.current_page = filterData.page || 1;
  pagination.page_size = filterData.per_page || 10;
  
  state.showAdvancedFilters = false;
  performSearch();
};

const handlePageChange = (page: number) => {
  pagination.current_page = page;
  performSearch();
};

const handlePageSizeChange = () => {
  pagination.current_page = 1;
  performSearch();
};

const navigateToDetails = (id: number) => {
  router.push({ name: 'record_details_page', params: { id } });
};

const formatAuthors = (authors: string): string => {
  if (!authors) return 'N/A';
  
  try {
    const list = authors.split(/[,;]/).map(a => a.trim()).filter(Boolean);
    if (list.length === 0) return 'N/A';
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} & ${list[1]}`;
    return `${list[0]} et al.`;
  } catch {
    return authors;
  }
};


const truncateText = (text?: string, length = 100): string => {
  if (!text) return 'N/A';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

// Helper function to safely parse authors
const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString || typeof authorsString !== 'string') return [];
  try {
    return authorsString.trim().split(/[,;]/).map(a => a.trim().replace(/['"\[\]]/g, '')).filter(Boolean);
  } catch { return []; }
};

// Helper function for confidence color
const getConfidenceColor = (confidence?: string): string => {
  switch (confidence?.toLowerCase()) {
    case 'high': return 'success';
    case 'moderate': return 'warning';
    case 'low': return 'error';
    default: return 'grey';
  }
};

const formatLabel = (key: string | undefined): string => {
  if (!key) return '';
  // Prefer mapped label when available, otherwise humanize the key
  try {
    const mapped = (mapper as Record<string, string> | undefined)?.[key];
    return mapped ?? key.replace(/_/g, ' ');
  } catch {
    return key.replace(/_/g, ' ');
  }
};
// const formatLabel = (label: string): string => {
//   // Use mapper if available
//   if (mapper && mapper[label]) {
//     return mapper[label];
//   }
  
//   // Fallback to standard formatting
//   return label
//     .replace(/_/g, ' ')
//     .replace(/\b\w/g, c => c.toUpperCase());
// };

// Lifecycle
onMounted(() => {
  loadFilters();
  performSearch();
});
</script>

<style scoped>
.result-title {
  text-decoration: none;
  display: inline-block;
  line-height: 1.4;
}

.result-title:hover {
  text-decoration: underline;
}

.filter-options-container {
  max-height: 300px;
  overflow-y: auto;
}

.filter-options-container::-webkit-scrollbar {
  width: 6px;
}

.filter-options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.filter-options-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.filter-options-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.filter-chips-container {
  max-height: 200px;
  overflow-y: auto;
}

.search-field-selector {
  border-radius: 0 !important;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 150px;
}

.search-input :deep(.v-field) {
  border-radius: 0 !important;
}

.find-btn {
  border-radius: 0;
}

.result-title {
  text-decoration: none;
  color: #153a9d;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s ease;
  line-height: 1.4;
}

.result-title:hover {
  color: #D95D45;
  text-decoration: underline;
}

.result-card {
  transition: all 0.2s ease;
}

.result-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.read-more-link {
  color: #1565C0;
  text-decoration: none;
  font-weight: 500;
}

.read-more-link:hover {
  text-decoration: underline;
}
</style>
