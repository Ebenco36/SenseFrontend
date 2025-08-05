<template>
  <v-app>
    <v-app-bar flat color="#153a9d" height="120">
      <v-container class="h-100 d-flex align-center ga-4">
        <h1 class="text-h4 font-weight-bold text-white me-4 d-none d-md-block">Resources</h1>
        <div class="d-flex flex-grow-1 align-center">
          <div class="d-flex flex-grow-1">
            <v-text-field
              v-model="searchQuery"
              variant="solo"
              label="Keywords, authors, titles, ..."
              density="comfortable"
              hide-details
              rounded="0"
              flat
              class="search-input"
              @keydown.enter="triggerSearch"
            ></v-text-field>
            <v-btn
              height="48"
              color="#D95D45"
              variant="flat"
              class="find-btn font-weight-bold text-white"
              @click="triggerSearch"
              :loading="isSearchLoading"
            >
              Find
            </v-btn>
          </div>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon="mdi-tune-variant" variant="text" class="ms-2" @click="dialog = true"></v-btn>
            </template>
            <span>Advanced Filtering</span>
          </v-tooltip>
        </div>
      </v-container>
    </v-app-bar>

    <v-main class="bg-white-lighten-2">
      <v-container fluid class="py-8 px-md-8">
        <v-row>
          <!-- Sidebar -->
          <v-col cols="12" md="3">
            <div class="d-flex flex-column ga-6">
              <v-card variant="outlined" flat>
                <v-card-title class="text-subtitle-1 font-weight-bold">Selected Filters</v-card-title>
                <v-divider></v-divider>
                <v-card-text v-if="selectedChips.length > 0">
                  <v-chip
                    size="small"
                    v-for="chip in selectedChips"
                    :key="chip"
                    closable
                    color="blue-lighten-1"
                    class="font-weight-medium ma-1"
                    @click:close="removeFilter(chip)"
                  >
                    {{ chip }}
                  </v-chip>
                </v-card-text>
                <div class="px-4 pb-4">
                  <v-btn variant="outlined" color="#D95D45" block @click="clearAllFilters" :disabled="!selectedChips.length">Clear All</v-btn>
                </div>
              </v-card>
              
              <v-card v-if="sidebarFilterGroups.length" variant="outlined" v-for="group in sidebarFilterGroups" :key="group.title">
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ group.title }}</v-card-title>
                <v-divider></v-divider>
                <v-list density="compact" class="py-0 filter-options-container">
                  <template v-for="option in group.options" :key="option.label">
                    <!-- Render a subheader for group titles -->
                    <v-list-subheader 
                      v-if="option.isHeader" 
                      class="font-weight-bold text-primary"
                    >
                      {{ option.label }}
                    </v-list-subheader>
                    <!-- Render a clickable list item for actual filters -->
                    <v-list-item v-else class="px-1" @click="toggleFilterSelection(option)">
                      <template v-slot:prepend>
                        <v-checkbox-btn :model-value="option.selected"></v-checkbox-btn>
                      </template>
                      <v-list-item-title class="text-body-2 font-weight-medium">
                        {{ replaceWithMapper(option.label) }}
                      </v-list-item-title>
                      <template v-slot:append>
                        <span class="text-black text-body-1">({{ option.count.toLocaleString() }})</span>
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
            <div v-if="isSearchLoading" class="text-center py-16">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-medium-emphasis">Searching for resources...</p>
            </div>
            <div v-else class="d-flex flex-column ga-4">
              <v-card v-for="item in searchResults" :key="item.primary_id" variant="outlined" hover flat>
                <v-card-text class="pa-6">
                    <div>
                      <p class="text-body-2 text-medium-emphasis mb-1">
                        {{ item.year }} &middot; {{ item.authors }} {{ item.country ? `(${item.country})` : "" }}
                      </p>
                      <a href="#" @click.prevent="navigateToDetails(item.primary_id)" class="text-h6 font-weight-bold text-blue-darken-4 result-title d-block mb-3">
                        {{ item.title }}
                      </a>
                    </div>
                    <div class="d-flex justify-space-between align-center">
                      <v-chip-group>
                          <v-chip v-if="item.publication_type" color="blue-lighten-4" size="small" variant="tonal">{{ item.publication_type }}</v-chip>
                      </v-chip-group>
                      <!-- <div class="d-flex align-center ga-2 flex-shrink-0">
                        <span class="text-body-2 d-none d-sm-block">Download:</span>
                        <v-chip v-if="item.pdf_url" :href="`http://0.0.0.0:5400${item.pdf_url}`" target="_blank" color="indigo-lighten-5" text-color="indigo-darken-2" class="font-weight-bold">PDF</v-chip>
                      </div> -->
                    </div>
                </v-card-text>
              </v-card>
            </div>
             <v-pagination
                v-if="!isSearchLoading && pagination.total_pages > 1"
                v-model="pagination.current_page"
                :length="pagination.total_pages"
                @update:modelValue="handlePageChange"
                class="mt-8"
            ></v-pagination>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <AdvancedFilterModal 
      v-show="dialog" 
      v-model="dialog" 
      :initial-filters="currentAdvancedFilters"
      @apply-filters="handleApplyFilters"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';

// --- TYPE DEFINITIONS ---
interface ServerItem { primary_id: number; title: string; authors: string; year: number | string; publication_type: string; country: string; pdf_url: string; }
interface FilterOption { label: string; selected: boolean; count: number; filterType: 'tag' | 'other'; synonyms: string[]; isHeader?: boolean; }
interface FilterGroup { title: string; options: FilterOption[]; }
interface Pagination { current_page: number; page_size: number; total_pages: number; total_records: number; }
interface AdditionalField { column: string; value: any; type: string; }
interface FilterPayload { user_selections?: string[]; additional_fields?: AdditionalField[]; }
type FilterCounts = Record<string, { count: number; value: string }[]>;

// --- COMPONENT IMPORTS & STATE ---
const AdvancedFilterModal = defineAsyncComponent(() => import('@/components/AdvancedFilterModal.vue'));
const router = useRouter();
const dialog = ref(false);
const searchQuery = ref('');
const isSearchLoading = ref(false);
const searchResults = ref<ServerItem[]>([]);
const sidebarFilterGroups = ref<FilterGroup[]>([]);
const pagination = ref<Pagination>({ current_page: 1, page_size: 10, total_pages: 1, total_records: 0 });
const filterCounts = ref<FilterCounts>({}); 
let searchDebounceTimer: number | undefined;
const currentAdvancedFilters = ref<FilterPayload>({ user_selections: [], additional_fields: [] });

// --- COMPUTED PROPERTIES ---
const selectedChips = computed(() => {
    const sidebarSelected = sidebarFilterGroups.value.flatMap(g => g.options).filter(o => o.selected && !o.isHeader).map(o => {
      o.label = replaceWithMapper(o.label); return o.label;
    });
    const advancedSelected = currentAdvancedFilters.value.user_selections || [];
    return [...new Set([...sidebarSelected, ...advancedSelected])];
});

// --- API & DATA LOGIC ---
const loadSidebarFilters = async () => {
  try {
    const response = await axios.get('http://0.0.0.0:5400/api/v1/api/record/filters');
    if (response.data?.data) buildSidebarFilters(response.data.data);
  } catch (error) {
    console.error('Failed to load sidebar filters:', error);
  }
};

const runSearch = async () => {
  isSearchLoading.value = true;
  
  const sidebarSelections = sidebarFilterGroups.value.flatMap(group => 
      group.options.filter(opt => opt.selected && !opt.isHeader)
  );
  const sidebarUserSelections = sidebarSelections.filter(s => s.filterType === 'tag').flatMap(s => s.synonyms);
  const sidebarAdditionalFields = sidebarSelections.filter(s => s.filterType === 'other').map(s => ({ column: s.groupTitle, value: s.label, type: 'where' }));

  const payload: any = {
    table_name: "all_db",
    pagination: { page: pagination.value.current_page, page_size: pagination.value.page_size },
    additional_fields: [...(currentAdvancedFilters.value.additional_fields || []), ...sidebarAdditionalFields],
    user_selections: [...new Set([...(currentAdvancedFilters.value.user_selections || []), ...sidebarUserSelections])]
  };
  if (searchQuery.value) {
    payload.additional_fields.push({ column: "title", value: searchQuery.value, type: "orlikewhere" });
  }
  
  try {
    const response = await axios.post('http://0.0.0.0:5400/api/v1/api/user-selection-process', payload);
    const apiData = response.data?.data?.data;
    searchResults.value = (apiData?.records || []).map((record: any): ServerItem => ({
      primary_id: record.primary_id,
      title: record.title || 'No title provided',
      authors: formatAuthors(safeParseAuthors(record.authors)),
      year: record.year || 'N/A',
      publication_type: record.publication_type || '',
      country: (record.country || '').replace(/[\[\]']/g, ''),
      pdf_url: record.pdf_url || ''
    }));
    pagination.value = apiData?.pagination || { current_page: 1, page_size: 10, total_pages: 1, total_records: 0 };
    const filterCountsResponse = response.data?.data?.filter_counts_response;
    if (filterCountsResponse?.data) {
      filterCounts.value = filterCountsResponse.data;
      updateFilterCounts();
    }
  } catch (error) {
    console.error('Search failed:', error);
    searchResults.value = [];
    pagination.value = { current_page: 1, page_size: 10, total_pages: 1, total_records: 0 };
  } finally {
    isSearchLoading.value = false;
  }
};

const updateFilterCounts = () => {
  if (!filterCounts.value) return;
  sidebarFilterGroups.value.forEach(group => {
    const countsForGroup = filterCounts.value[group.title];
    if (Array.isArray(countsForGroup)) {
      group.options.forEach(option => {
        if (!option.isHeader) {
          const match = countsForGroup.find(c => String(c.value) === String(option.label) && c.value && c.value !== "[]");
          option.count = match ? match.count : 0;
        }
      });
    } else {
      group.options.forEach(option => { if (!option.isHeader) option.count = 0; });
    }
  });
};

onMounted(() => {
  runSearch();
  loadSidebarFilters();
});

// --- EVENT HANDLERS ---
const debouncedSearch = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(() => {
    pagination.value.current_page = 1;
    runSearch();
  }, 500);
};
const handleApplyFilters = (filterData: FilterPayload) => {
  pagination.value.current_page = 1;
  currentAdvancedFilters.value = filterData;
  dialog.value = false;
  runSearch();
};
const handlePageChange = (page: number) => {
  pagination.value.current_page = page;
  runSearch();
};
const triggerSearch = () => {
  pagination.value.current_page = 1;
  runSearch();
};
const toggleFilterSelection = (option: FilterOption) => {
  option.selected = !option.selected;
  debouncedSearch();
};

// --- SIDEBAR LOGIC ---
const buildSidebarFilters = (availableFilters: any) => {
  const categories = [
    { key: 'topic', title: 'Topics', type: 'tag', column: 'topic' }, 
    { key: 'intervention', title: 'Interventions', type: 'tag', column: 'intervention' },
    { key: 'country', title: 'Country', type: 'other', column: 'country' }, 
    { key: 'year', title: 'Year', type: 'other', column: 'year' }
  ];
  
  const allGroups: FilterGroup[] = [];

  categories.forEach(category => {
    const tagFilterData = availableFilters.tag_filters?.[category.key];
    const otherFilterData = availableFilters.others?.[category.title] || availableFilters.others?.[category.key];

    if (category.key === 'topic' && tagFilterData) {
      const options: FilterOption[] = Object.entries(tagFilterData).map(([subCatKey, subCatValue]: [string, any]) => {
        const item = Object.values(subCatValue)[0] as any;
        return {
          label: subCatKey,
          selected: false,
          count: item.count || 0,
          filterType: 'tag',
          synonyms: item.synonyms || [item.display]
        };
      });
      if (options.length > 0) {
        allGroups.push({ title: category.title, options });
      }
    } 
    else if (tagFilterData) {
      const mainGroupOptions: FilterOption[] = [];
      Object.entries(tagFilterData).forEach(([subGroupKey, subGroupValue]) => {
        mainGroupOptions.push({ label: replaceWithMapper(subGroupKey), isHeader: true, selected: false, count: 0, filterType: 'tag', synonyms: [] });
        const options: FilterOption[] = Object.entries(subGroupValue as object).map(([itemKey, itemValue]: [string, any]) => ({
          label: itemValue.display, selected: false, count: itemValue.count || 0,
          filterType: 'tag', synonyms: itemValue.synonyms || [itemValue.display]
        }));
        mainGroupOptions.push(...options);
      });
      if (mainGroupOptions.length > 0) {
        allGroups.push({ title: category.title, options: mainGroupOptions });
      }
    } else if (otherFilterData) {
      const options = otherFilterData.map((opt: any) => ({ 
          label: String(opt.name || opt), selected: false, count: opt.count || 0,
          filterType: 'other', synonyms: [], groupTitle: category.key
      }));
      if (options.length > 0) {
        allGroups.push({ title: category.title, options });
      }
    }
  });
  sidebarFilterGroups.value = allGroups;
};

const clearAllFilters = () => {
  sidebarFilterGroups.value.forEach(group => group.options.forEach(option => option.selected = false));
  currentAdvancedFilters.value = { user_selections: [], additional_fields: [] };
  searchQuery.value = '';
  runSearch();
};
const removeFilter = (labelToRemove: string) => {
  let changed = false;
  for (const group of sidebarFilterGroups.value) {
    const option = group.options.find(opt => opt.label === labelToRemove);
    if (option && option.selected) {
      option.selected = false;
      changed = true;
      break;
    }
  }
  const selections = new Set(currentAdvancedFilters.value.user_selections || []);
  if (selections.has(labelToRemove)) {
    selections.delete(labelToRemove);
    currentAdvancedFilters.value.user_selections = Array.from(selections);
    changed = true;
  }
  if (changed) runSearch();
};

// --- WATCHERS ---
watch(currentAdvancedFilters, (newFilters) => {
  const selections = new Set(newFilters.user_selections || []);
  sidebarFilterGroups.value.forEach(group => {
    group.options.forEach(option => {
      if (option.filterType === 'tag') {
        option.selected = option.synonyms.some(syn => selections.has(syn));
      }
    });
  });
}, { deep: true });

// --- GENERAL HELPERS ---
const navigateToDetails = (id: number) => router.push({ name: 'record_details_page', params: { id } });
const replaceWithMapper = (key: string) => key ? (mapper[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) : '';
const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString) return [];
  try {
    return authorsString.trim().split(/[,;]/).map(a => a.trim().replace(/['"\[\]]/g, '')).filter(Boolean);
  } catch { return []; }
};
const formatAuthors = (authors: string[]): string => {
  if (!Array.isArray(authors) || authors.length === 0) return 'N/A';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(' & ');
  return `${authors[0]} et al.`;
};
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
.v-application { font-family: 'Inter', sans-serif !important; }
.search-input .v-field { border-radius: 0!important; }
.find-btn { border-radius: 0; }
.result-title { text-decoration: none; line-height: 1.3; display: inline-block; }
.result-title:hover { text-decoration: underline; }
.filter-options-container {
  max-height: 250px;
  overflow-y: auto;
}
</style>