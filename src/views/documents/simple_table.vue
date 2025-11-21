<template>
  <v-app>
    <SearchBar
      v-model="state.searchQuery"
      v-model:search-field="state.searchField"
      title="Resources"
      :search-fields="searchFields"
      :loading="state.isLoading"
      :placeholder="searchPlaceholder"
      @search="performSearch"
      @advanced-filter="state.showAdvancedFilters = true"
    />

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

        <ControlsBar
          v-model:view-mode="state.viewMode"
          v-model:page-size="pagination.page_size"
          v-model:sort-by="state.sortBy"
          v-model:sort-order="state.sortOrder"
          :sort-options="sortOptions"
          :export-loading="state.isExporting"
          :export-variant="'tonal'"
          :export-size="'small'"
          show-view-mode
          :conditional-per-page="true"
          :per-page-condition="state.viewMode === 'table'"
          elevation="1"
          @update:view-mode="performSearch"
          @update:page-size="performSearch"
          @update:sort-by="performSearch"
          @update:sort-order="performSearch"
          @export="downloadData"
        />

        <!-- Loading State -->
        <div v-if="state.isLoading" class="text-center py-16">
          <v-progress-circular indeterminate color="primary" size="64" />
          <p class="mt-4 text-h6 text-medium-emphasis">Loading results...</p>
        </div>

        <!-- Results Container -->
        <div v-else>
          <!-- LIST VIEW -->
          <div v-if="state.viewMode === 'list'" class="d-flex flex-column ga-4">
            
            <ResultCard
                v-for="item in searchResults"
                :key="item.primary_id"
                :item="item"
                @title-click="navigateToDetails"
            />
            

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
            <DataTable
              :items="searchResults"
              :headers="tableHeaders"
              :items-per-page="pagination.page_size"
              show-expand
              expanded-title="Abstract"
              expanded-text-field="abstract"
              :expanded-fields="expandedFields"
              @title-click="navigateToDetails"
            />
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
import SearchBar from '@/components/SearchBar.vue';
import ResultCard from '@/components/ResultCard.vue';
import ControlsBar from '@/components/ControlsBar.vue';
import DataTable from '@/components/DataTable.vue';

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


const expandedFields = [
  {
    key: 'research_notes',
    label: 'Diseases',
    type: 'chips',
    cols: 12,
    md: 6
  },
  {
    key: 'open_access',
    label: 'Open Access',
    type: 'chip',
    cols: 12,
    md: 6,
    chipCondition: (val) => val === 'open access',
    chipColorTrue: 'success',
    chipColorFalse: 'error',
    chipLabelTrue: 'Open Access',
    chipLabelFalse: 'Not Open Access'
  },
  {
    key: 'num_of_studies',
    label: 'Studies Included',
    cols: 12,
    md: 6
  },
  {
    key: 'location_in_title',
    label: 'Country Focus',
    cols: 12,
    md: 6,
    naText: 'N/A'
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
  { title: 'Title', key: 'title', sortable: true,  type: 'title', truncate: 80},
  { title: 'Authors', key: 'authors', sortable: false },
  { title: 'Year', key: 'year', sortable: true, width: '100px' },
  { title: 'Quality', key: 'overallConf', sortable: true, width: '120px', type: 'chip' },
  // { title: 'Link', key: 'link', sortable: false, width: '80px' },
  { title: 'Link', key: 'link', type: 'link', sortable: false }
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
        openAccess: record.open_access || 'N/A',
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

// const navigateToDetails = (id: number) => {
//   router.push({ name: 'record_details_page', params: { id } });
// };

const navigateToDetails = (item:object) => {
  // Navigate using item object
  router.push({
    name: 'record_details_page',  // Route name
    params: { id: item.primary_id }
  });
  
  // Or using path
  // router.push(`/articles/${item.primary_id}`);
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