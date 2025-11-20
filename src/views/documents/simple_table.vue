<template>
  <v-app>
    <!-- App Bar -->
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
    <v-main>
      <v-container fluid class="py-8 px-4 px-md-8">
        <!-- Header with Results Count -->
        <v-row align="center" class="mb-6">
          <v-col>
            <h2 class="text-h5 font-weight-bold">
              {{ pagination.total_records.toLocaleString() }} results found
            </h2>
            <p v-if="state.searchQuery" class="text-body-2 text-medium-emphasis mt-1">
              Searching in: {{ selectedSearchFieldLabel }}
            </p>
          </v-col>
        </v-row>

        <!-- Active Filters Display -->
        <!-- <v-card v-if="activeFilters.length > 0" variant="outlined" class="mb-4">
          <v-card-text class="d-flex align-center flex-wrap ga-2">
            <span class="text-body-2 font-weight-bold me-2">Active Filters:</span>
            <v-chip 
              v-for="(filter, idx) in activeFilters"
              :key="idx"
              size="small" 
              closable 
              color="primary"
              variant="flat"
              @click:close="removeFilter(filter)"
            >
              {{ filter.label }}
            </v-chip>
            <v-spacer />
            <v-btn 
              size="small" 
              variant="text" 
              color="error"
              @click="clearAllFilters"
            >
              Clear All
            </v-btn>
          </v-card-text>
        </v-card> -->

        <!-- Controls Bar -->
        <v-card elevation="1" class="mb-4">
          <v-card-text class="pa-4">
            <v-row align="center" dense>
              <!-- View Mode Toggle -->
              <v-col cols="12" sm="auto">
                <v-btn-toggle 
                  v-model="state.viewMode" 
                  mandatory 
                  variant="outlined" 
                  density="comfortable"
                  color="primary"
                >
                  <v-btn value="list">
                    <v-icon start>mdi-format-list-bulleted</v-icon>
                    List
                  </v-btn>
                  <v-btn value="table">
                    <v-icon start>mdi-table</v-icon>
                    Table
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              
              <!-- Items Per Page (Table Only) -->
              <v-col cols="12" sm="auto" v-if="state.viewMode === 'table'">
                <v-select 
                  v-model="pagination.page_size" 
                  :items="[10, 25, 50, 100]" 
                  label="Per Page" 
                  density="compact"
                  variant="outlined" 
                  hide-details 
                  style="min-width: 120px;"
                  @update:model-value="performSearch"
                />
              </v-col>
              
              <!-- Sort By -->
              <v-col cols="12" sm="auto">
                <v-select 
                  v-model="state.sortBy" 
                  :items="sortOptions" 
                  item-title="title" 
                  item-value="key"
                  label="Sort By" 
                  density="compact" 
                  variant="outlined" 
                  hide-details
                  style="min-width: 180px;"
                  @update:model-value="performSearch"
                />
              </v-col>
              
              <!-- Sort Direction -->
              <v-col cols="12" sm="auto">
                <v-btn-toggle 
                  v-model="state.sortOrder" 
                  mandatory 
                  variant="outlined" 
                  density="compact"
                  @update:model-value="performSearch"
                >
                  <v-btn value="asc">
                    <v-icon>mdi-arrow-up</v-icon>
                  </v-btn>
                  <v-btn value="desc">
                    <v-icon>mdi-arrow-down</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </v-col>
              
              <v-spacer />
              
              <!-- Export Buttons -->
              <v-col cols="12" sm="auto">
                <div class="d-flex ga-2">
                  <v-btn 
                    variant="tonal" 
                    size="small"
                    @click="downloadData('csv')" 
                    :loading="state.isExporting.csv"
                  >
                    CSV
                  </v-btn>
                  <v-btn 
                    variant="tonal" 
                    size="small"
                    @click="downloadData('excel')" 
                    :loading="state.isExporting.excel"
                  >
                    Excel
                  </v-btn>
                  <v-btn 
                    variant="tonal" 
                    size="small"
                    @click="downloadData('json')" 
                    :loading="state.isExporting.json"
                  >
                    JSON
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Loading State -->
        <div v-if="state.isLoading" class="text-center py-16">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4 text-h6 text-medium-emphasis">Loading results...</p>
        </div>

        <!-- Results Container -->
        <div v-else>
          <!-- LIST VIEW -->
          <div v-if="state.viewMode === 'list'" class="d-flex flex-column ga-4">
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
                     <!-- v-if="item.open_access && item.open_access !== 'N/A' && item.open_access.toLowerCase().includes('open access')" -->
                    <v-chip
                      v-if="item.open_access && item.open_access !== 'N/A' && item.open_access == 'open access'"
                      color="success"
                      size="small"
                      variant="tonal"
                    >
                      Open Access
                    </v-chip>

                    <v-chip
                      v-else
                      color="danger"
                      size="small"
                      variant="tonal"
                    >
                      Not Open Access
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
                    <!-- <span v-if="item.country"> · {{ item.country ? item.country || item.country != 'NULL' : '' }}</span> -->
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
                    <div class="font-weight-bold">{{ item.year || 'N/A' }}</div>
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

            <!-- No Results Message -->
            <v-card v-if="searchResults.length === 0" variant="outlined" class="text-center py-12">
              <v-card-text>
                <v-icon icon="mdi-database-search" size="64" color="grey-lighten-1" class="mb-4" />
                <p class="text-h6 mb-2">No results found</p>
                <p class="text-body-2 text-medium-emphasis">
                  Try adjusting your search query or filters
                </p>
              </v-card-text>
            </v-card>
          </div>

          <!-- TABLE VIEW -->
          <v-card v-else-if="state.viewMode === 'table'" variant="outlined">
            <v-data-table
              :headers="tableHeaders"
              :items="searchResults"
              :items-per-page="pagination.page_size"
              hide-default-footer
              item-value="primary_id"
              show-expand
              class="elevation-0"
            >
              <!-- Expand Button -->
              <template #item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
                <v-btn 
                  :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'" 
                  size="small"
                  variant="text" 
                  @click="toggleExpand(internalItem)"
                />
              </template>

              <!-- Title Column -->
              <template #item.title="{ item }">
                <a 
                  href="#" 
                  @click.prevent="navigateToDetails(item.primary_id)" 
                  class="result-title"
                  :title="item.title"
                >
                  {{ truncateText(item.title, 80) }}
                </a>
              </template>

              <!-- Link Column -->
              <template #item.link="{ item }">
                <v-btn 
                  size="small" 
                  variant="text" 
                  color="primary" 
                  :href="item.link" 
                  target="_blank"
                  icon="mdi-open-in-new"
                />
              </template>

              <!-- Quality Column -->
              <template #item.overallConf="{ item }">
                <v-chip 
                  v-if="item.overallConf && item.overallConf !== 'N/A'"
                  :color="getConfidenceColor(item.overallConf)" 
                  size="small" 
                  variant="tonal"
                >
                  {{ item.overallConf }}
                </v-chip>
                <span v-else class="text-medium-emphasis">N/A</span>
              </template>

              <!-- Expanded Row -->
              <template #expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length" class="pa-0">
                    <v-card flat class="ma-4">
                      <v-card-text>
                        <h4 class="text-subtitle-1 font-weight-bold mb-3">Abstract</h4>
                        <p class="text-body-2 mb-3">
                          {{ item.isAbstractExpanded ? item.abstract : truncateText(item.abstract, 400) }}
                        </p>
                        <a
                          v-if="(item.abstract || '').length > 400"
                          href="#"
                          class="read-more-link text-body-2"
                          @click.prevent="item.isAbstractExpanded = !item.isAbstractExpanded"
                        >
                          {{ item.isAbstractExpanded ? 'Show Less' : 'Show More' }}
                        </a>
                        
                        <v-divider class="my-4" />
                        
                        <v-row>
                          <v-col cols="12" md="6">
                            <div class="mb-3">
                              <span class="text-caption text-medium-emphasis">Diseases:</span>
                              <v-chip-group class="mt-1">
                                <v-chip v-for="note in item.research_notes" :key="note" size="small">
                                  {{ note }}
                                </v-chip>
                              </v-chip-group>
                            </div>
                            <div>
                              <span class="text-caption text-medium-emphasis">Open Access:</span>
                              <!-- && item.open_access == 'open access' -->
                              <v-chip
                                v-if="item.open_access && item.open_access !== 'N/A' && item.open_access == 'open access'"
                                color="success"
                                size="small"
                                variant="tonal"
                                class="ms-2"
                              >
                                Open Access
                              </v-chip>
                              <v-chip
                                v-else
                                color="danger"
                                size="small"
                                variant="tonal"
                                class="ms-2"
                              >
                                Not Open Access
                              </v-chip>
                            </div>
                          </v-col>
                          <v-col cols="12" md="6">
                            <div class="mb-2">
                              <span class="text-caption text-medium-emphasis">Studies Included:</span>
                              <span class="ms-2 font-weight-medium">{{ item.num_of_studies }}</span>
                            </div>
                            <div>
                              <span class="text-caption text-medium-emphasis">Country Focus:</span>
                              <span class="ms-2 font-weight-medium">{{ item.location_in_title || 'N/A' }}</span>
                            </div>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </td>
                </tr>
              </template>

              <!-- No Data -->
              <template #no-data>
                <div class="text-center py-8">
                  <v-icon icon="mdi-database-search" size="48" color="grey-lighten-1" class="mb-2" />
                  <p class="text-body-1">No results found</p>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </div>

        <!-- Pagination -->
        <v-pagination 
          v-if="!state.isLoading && pagination.total_pages > 1" 
          v-model="pagination.current_page"
          :length="pagination.total_pages" 
          :total-visible="7"
          @update:model-value="performSearch"
          class="mt-6"
        />
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
import axios from 'axios';
import { useRouter } from 'vue-router';

// Import components
const AdvancedFilterDialog = defineAsyncComponent(() => 
  import('@/components/AdvancedFilterDialog.vue')
);

const router = useRouter();

// Types
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
  open_access: string;
  location_in_title: string;
  isAbstractExpanded?: boolean;
}

interface Pagination {
  current_page: number;
  page_size: number;
  total_pages: number;
  total_records: number;
}

interface ActiveFilter {
  label: string;
  type: string;
  value: any;
}

interface SearchField {
  value: string;
  label: string;
  icon: string;
  placeholder: string;
}

// Configuration
const API_BASE = 'http://localhost:5400/api/v1';

// Search Fields Configuration
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
  {
    value: 'keywords',
    label: 'Keywords/Topics',
    icon: 'mdi-tag-multiple',
    placeholder: 'Search in keywords and topics...'
  },
  {
    value: 'journal',
    label: 'Journal',
    icon: 'mdi-book-open-page-variant',
    placeholder: 'Search by journal name...'
  }
];

// State
const state = reactive({
  searchQuery: '',
  searchField: 'all',
  sortBy: 'year',
  sortOrder: 'desc',
  viewMode: 'list',
  isLoading: false,
  showAdvancedFilters: false,
  isExporting: {
    csv: false,
    excel: false,
    json: false
  }
});

// Data
const searchResults = ref<SearchResult[]>([]);
const advancedFilterConditions = ref<any[]>([]);

const pagination = reactive<Pagination>({
  current_page: 1,
  page_size: 10,
  total_pages: 1,
  total_records: 0
});

const sortOptions = [
  { title: 'Publication Year', key: 'year' },
  { title: 'Title', key: 'title' },
  { title: 'Quality Score', key: 'overallConf' },
  { title: 'Number of Studies', key: 'num_of_studies' }
];

const tableHeaders = [
  { title: '', key: 'data-table-expand', sortable: false, width: '50px' },
  { title: 'Title', key: 'title', sortable: true, width: '40%' },
  { title: 'Authors', key: 'authors', sortable: false },
  { title: 'Year', key: 'year', sortable: true, width: '100px' },
  { title: 'Quality', key: 'overallConf', sortable: true, width: '120px' },
  { title: 'Link', key: 'link', sortable: false, width: '80px' }
];

// Helper Functions
const truncateText = (text?: string, length = 100): string => {
  if (!text) return 'N/A';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

const createDoiUrl = (textContainingDoi: string): string => {
  if (!textContainingDoi) return '#';
  const doiRegex = /10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = textContainingDoi.match(doiRegex);
  return match ? `https://doi.org/${match[0]}` : '#';
};

const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString || typeof authorsString !== 'string') return [];
  try {
    return authorsString.trim().split(/[,;]/).map(a => a.trim().replace(/['"\[\]]/g, '')).filter(Boolean);
  } catch { return []; }
};

const formatAuthors = (authors: string | string[]): string => {
  const authorArray = typeof authors === 'string' ? safeParseAuthors(authors) : authors;
  if (!Array.isArray(authorArray) || authorArray.length === 0) return 'Unknown Authors';
  if (authorArray.length === 1) return authorArray[0];
  if (authorArray.length === 2) return authorArray.join(' & ');
  return `${authorArray[0]} et al.`;
};

const getConfidenceColor = (confidence?: string): string => {
  switch (confidence?.toLowerCase()) {
    case 'high': return 'success';
    case 'moderate': return 'warning';
    case 'low': return 'error';
    default: return 'grey';
  }
};

// Computed Properties
const selectedSearchFieldLabel = computed(() => {
  const field = searchFields.find(f => f.value === state.searchField);
  return field ? field.label : 'All Fields';
});

const searchPlaceholder = computed(() => {
  const field = searchFields.find(f => f.value === state.searchField);
  return field ? field.placeholder : 'Search...';
});

const activeFilters = computed((): ActiveFilter[] => {
  const filters: ActiveFilter[] = [];
  
  advancedFilterConditions.value.forEach(condition => {
    if (condition.operator === 'between') {
      filters.push({
        label: `Year: ${condition.value[0]} - ${condition.value[1]}`,
        type: 'year_range',
        value: condition
      });
    } else if (condition.operator === 'in') {
      condition.values.forEach((val: string) => {
        filters.push({
          label: `${condition.field}: ${val}`,
          type: 'filter',
          value: condition
        });
      });
    } else {
      filters.push({
        label: `${condition.field}: ${condition.value}`,
        type: 'filter',
        value: condition
      });
    }
  });
  
  return filters;
});

const apiPayload = computed(() => {
  const conditions: any[] = [];
  
  // Handle multi-field search with OR logic
  if (state.searchQuery) {
    if (state.searchField === 'all') {
      // Search across multiple fields with OR logic
      const searchConditions = [
        { field: 'title', operator: 'contains', value: state.searchQuery },
        { field: 'authors', operator: 'contains', value: state.searchQuery },
        { field: 'abstract', operator: 'contains', value: state.searchQuery },
        { field: 'topic_notes', operator: 'contains', value: state.searchQuery },
        { field: 'research_notes', operator: 'contains', value: state.searchQuery },
        { field: 'journal', operator: 'contains', value: state.searchQuery }
      ];
      
      // Group these conditions with OR logic
      conditions.push({
        logic: 'OR',
        conditions: searchConditions
      });
    } else {
      // Search in specific field
      conditions.push({
        field: state.searchField,
        operator: 'contains',
        value: state.searchQuery
      });
    }
  }
  
  // Add advanced filter conditions
  conditions.push(...advancedFilterConditions.value);
  
  return {
    table_name: 'all_db',
    search: {
      conditions: conditions,
      logic: 'AND'
    },
    sort_by: state.sortBy,
    sort_direction: state.sortOrder,
    pagination: {
      page: pagination.current_page,
      page_size: pagination.page_size
    }
  };
});

// Methods
const performSearch = async () => {
  state.isLoading = true;
  
  try {
    const response = await axios.post(`${API_BASE}/filters/search`, apiPayload.value);
    
    if (response.data.success) {
      const apiData = response.data.data;
      searchResults.value = (apiData.records || []).map((record: any): SearchResult => ({
        primary_id: record.primary_id,
        title: record.title || 'Untitled',
        authors: formatAuthors(safeParseAuthors(record.authors)),
        link: createDoiUrl(record.doi),
        abstract: ((record.abstract && record.abstract != 'NULL') ? record.abstract : 'No abstract provided.')|| 'No abstract provided.',
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
        open_access: record.open_access || 'N/A',
        isAbstractExpanded: false,
      }));
      
      pagination.current_page = apiData.pagination.current_page;
      pagination.page_size = apiData.pagination.page_size;
      pagination.total_pages = apiData.pagination.total_pages;
      pagination.total_records = apiData.pagination.total_records;
    }
  } catch (error) {
    console.error('Search error:', error);
    searchResults.value = [];
  } finally {
    state.isLoading = false;
  }
};

const downloadData = async (format: 'csv' | 'excel' | 'json') => {
  state.isExporting[format] = true;
  
  try {
    const payload = {
      ...apiPayload.value,
      export: format,
      pagination: {
        page: 1,
        page_size: pagination.total_records
      }
    };
    
    const response = await axios.post(`${API_BASE}/filters/search`, payload, {
      responseType: 'blob'
    });
    
    const getFileExtension = (type: string) => type === 'excel' ? 'xlsx' : type;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resources_export_${Date.now()}.${getFileExtension(format)}`);
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

const removeFilter = (filter: ActiveFilter) => {
  advancedFilterConditions.value = advancedFilterConditions.value.filter(c => c !== filter.value);
  pagination.current_page = 1;
  performSearch();
};

const clearAllFilters = () => {
  advancedFilterConditions.value = [];
  state.searchQuery = '';
  pagination.current_page = 1;
  performSearch();
};

const handleApplyFilters = (filterData: any) => {
  advancedFilterConditions.value = filterData.search?.conditions || [];
  pagination.current_page = 1;
  state.showAdvancedFilters = false;
  performSearch();
};

const navigateToDetails = (id: number) => {
  router.push({ name: 'record_details_page', params: { id } });
};

// Lifecycle
onMounted(() => {
  performSearch();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

.v-application {
  font-family: 'Inter', sans-serif !important;
}

.search-field-selector {
  border-radius: 0 !important;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
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