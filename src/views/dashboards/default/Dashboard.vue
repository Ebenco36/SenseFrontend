<template>
  <v-app>
    <v-app-bar flat color="#153a9d" height="120">
      <v-container class="h-100 d-flex align-center ga-4">
        <h1 class="text-h4 font-weight-bold text-white me-4 d-none d-md-block">Resources</h1>
        <div class="d-flex flex-grow-1 align-center">
          <div class="d-flex flex-grow-1">
            <v-text-field v-model="searchQuery" variant="solo" label="Keywords, authors, titles, ..."
              density="comfortable" hide-details rounded="0" flat class="search-input"
              @keydown.enter="triggerSearch"></v-text-field>
            <v-btn height="48" color="#D95D45" variant="flat" class="find-btn font-weight-bold text-white"
              @click="triggerSearch" :loading="isSearchLoading">
              Find
            </v-btn>
          </div>
          <v-tooltip location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" size="large" icon="mdi-filter-variant" variant="text" class="ms-2" @click="dialog = true"></v-btn>
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
                <v-card-text v-if="selectedChips.length > 0" class="filter-options-container">
                  <v-chip size="small" v-for="chip in selectedChips" :key="chip" closable color="blue-lighten-1"
                    class="font-weight-medium ma-1" @click:close="removeFilter(chip)">
                    {{ chip }}
                  </v-chip>
                </v-card-text>
                <div class="px-4 pb-4">
                  <v-btn variant="outlined" color="#D95D45" block @click="clearAllFilters"
                    :disabled="!selectedChips.length">Clear All</v-btn>
                </div>
              </v-card>
              
              <v-card v-if="sidebarFilterGroups.length" variant="outlined" v-for="group in sidebarFilterGroups"
                :key="group.title">
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ group.title }}</v-card-title>
                <v-divider></v-divider>
                <v-list density="compact" class="py-0 filter-options-container">
                  <template v-for="option in group.options" :key="option.label" >
                    <!-- Render a subheader for group titles -->
                     <div >
                    <v-list-subheader v-if="option.isHeader" class="font-weight-bold text-primary">
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
                      <template v-slot:append v-if="group.title !== 'Topics'">
                        <span class="text-black text-body-1">({{ option.count.toLocaleString() }})</span>
                      </template>
                    </v-list-item>
                  </div>
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

            <v-card elevation="2" class="my-4 pa-2 bg-transparent">
              <v-row align="center" dense>
                <v-col cols="12" sm="auto">
                  <v-select v-model="pagination.page_size" :items="[10, 25, 50, 100]" label="Per Page" density="compact"
                    variant="outlined" hide-details style="max-width: 120px;"></v-select>
                </v-col>
                <v-col cols="12" sm="auto">
                  <v-select v-model="sortByField" :items="sortOptions" item-title="title" item-value="key"
                    label="Order By" density="compact" variant="outlined" hide-details
                    style="max-width: 200px;"></v-select>
                </v-col>
                <v-col cols="12" sm="auto">
                  <v-btn-toggle v-model="sortByOrder" mandatory variant="outlined" density="compact">
                    <v-btn value="ASC" icon="mdi-arrow-up"></v-btn>
                    <v-btn value="DESC" icon="mdi-arrow-down"></v-btn>
                  </v-btn-toggle>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" sm="auto">
                  <div class="d-flex ga-2">
                    <v-btn variant="tonal" @click="download('csv')" :loading="isDownloading.csv">CSV</v-btn>
                    <v-btn variant="tonal" @click="download('excel')" :loading="isDownloading.excel">Excel</v-btn>
                    <v-btn variant="tonal" @click="download('json')" :loading="isDownloading.json">Json</v-btn>
                  </div>
                </v-col>
                <!-- <v-col cols="12" sm="auto">
                  <div class="d-flex align-center ga-1">
                    <span class="text-body-2 text-medium-emphasis me-1">Download:</span>
                    <v-tooltip location="top" text="Download CSV">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-file-csv-outline" variant="text" @click="download('csv')"
                          :loading="isDownloading.csv"></v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip location="top" text="Download Excel">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-file-excel-outline" variant="text" @click="download('excel')"
                          :loading="isDownloading.excel"></v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </v-col> -->
              </v-row>
            </v-card>

            <div v-if="isSearchLoading" class="text-center py-16">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4 text-medium-emphasis">Searching for resources...</p>
            </div>
            <div v-else class="d-flex flex-column ga-4">
              <!-- <v-card v-for="item in searchResults" :key="item.primary_id" variant="outlined" hover flat>
                <v-card-text class="pa-6">
                  <div>
                    <p class="text-body-2 text-medium-emphasis mb-1">
                      {{ item.year }} &middot; {{ item.authors }} {{ item.country ? `(${item.country})` : "" }}
                    </p>
                    <a href="#" @click.prevent="navigateToDetails(item.primary_id)"
                      class="text-h6 font-weight-bold text-blue-darken-4 result-title d-block mb-3">
                      {{ item.title }}
                    </a>
                  </div>
                  
                  <div class="d-flex align-center ga-4">
    
                    <div style="flex-grow: 1; flex-basis: 80%; min-width: 0;">
                      <v-chip-group v-if="item.notes">
                        <v-chip v-for="note in item.notes" :key="note" color="blue-lighten-4" size="small" variant="tonal">
                          {{ note }}
                        </v-chip>
                      </v-chip-group>
                    </div>

                    <div style="flex-shrink: 0; flex-basis: 20%; text-align: right;">
                      <v-chip-group v-if="item.notes">
                        <v-chip v-for="note in item.research_notes" :key="note" color="blue-lighten-4" size="small" variant="tonal">
                          {{ note }}
                        </v-chip>
                      </v-chip-group>
                    </div>

                  </div>
                </v-card-text>
              </v-card> -->
              <v-card v-for="item in searchResults" :key="item.primary_id" variant="outlined" hover elevation="1">
                <v-card-text class="pa-6">
                  <div>
                    <p class="text-body-2 text-medium-emphasis mb-1">
                      {{ item.year }} &middot; {{ item.authors }} {{ item.country ? `(${item.country})` : "" }}
                    </p>
                    <a href="#" @click.prevent="navigateToDetails(item.primary_id)"
                      class="text-h6 font-weight-bold text-blue-darken-4 result-title d-block mb-3">
                      {{ item.title }}
                    </a>
                  </div>

                  <v-divider class="my-4"></v-divider>

                  <div>
                    <v-row dense>
                      <v-col cols="12" sm="4">
                        <div class="text-caption text-medium-emphasis">Number of Studies</div>
                        <div class="font-weight-bold">{{ item.num_of_studies }}</div>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <div class="text-caption text-medium-emphasis">Last Literature Search</div>
                        <div class="font-weight-bold">{{ item.date_of_literature_search }}</div>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <div class="text-caption text-medium-emphasis">Publication Date</div>
                        <div class="font-weight-bold">{{ item.publication_date }}</div>
                      </v-col>
                    </v-row>
                    <div v-if="item.publication_type" class="mt-3">
                      <v-chip size="small" color="blue-lighten-5" text-color="blue-darken-2" variant="flat">
                        {{ item.publication_type }}
                      </v-chip>
                    </div>
                  </div>

                  <v-divider class="my-4" v-if="item.notes.length > 0"></v-divider>

                  <div v-if="item.notes.length > 0">
                    <div class="text-caption text-medium-emphasis">Notes</div>
                    <v-chip-group>
                      <v-chip v-for="note in [...item.notes]" :key="note" size="small">
                        {{ note }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <v-divider class="my-4" v-if="item.research_notes.length > 0"></v-divider>

                  <div v-if="item.research_notes.length > 0">
                    <div class="text-caption text-medium-emphasis">Diseases:</div>
                    <v-chip-group>
                      <v-chip v-for="note in [...item.research_notes]" :key="note" size="small">
                        {{ note }}
                      </v-chip>
                    </v-chip-group>
                  </div>
                </v-card-text>
              </v-card>
            </div>
            <v-pagination v-if="!isSearchLoading && pagination.total_pages > 1" v-model="pagination.current_page"
              :length="pagination.total_pages" @update:modelValue="handlePageChange" class="mt-8"></v-pagination>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <AdvancedFilterModal v-show="dialog" v-model="dialog" :initial-filters="currentAdvancedFilters"
      @apply-filters="handleApplyFilters" />
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';
import { stringToList, getLastItem } from '@/utils/helpers.js';

// --- TYPE DEFINITIONS ---
interface ServerItem { 
  primary_id: number; title: string; authors: string; year: number | string; 
  publication_type: string; country: string; pdf_url: string; 
  research_notes: string[]; notes: string[];
  date_of_literature_search: string; num_of_studies: number; publication_date: string;
}
interface FilterOption { label: string; selected: boolean; count: number; filterType: 'tag' | 'other'; synonyms: string[]; isHeader?: boolean; }
interface FilterGroup { title: string; options: FilterOption[]; }
interface Pagination { current_page: number; page_size: number; total_pages: number; total_records: number; }
interface AdditionalField { column: string; value: any; type: string; }
interface FilterPayload { user_selections?: string[]; additional_fields?: AdditionalField[]; }
type FilterCounts = Record<string, { count: number; value: string }[]>;

type FileType = 'csv' | 'excel' | 'json' | 'pdf';

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
const isDownloading = ref({ csv: false, excel: false, json: false, pdf: false });


// const sortByField = ref('primary_id');
// const sortByOrder = ref('ASC');
const sortOptions = ref([
  { title: 'Relevance', key: 'primary_id' },
  { title: 'Publication Year', key: 'year' },
  { title: 'Title', key: 'title' },
]);
const currentSortBy = ref([{ key: 'primary_id', order: 'asc' }]);

// --- COMPUTED PROPERTIES ---
const selectedChips = computed(() => {
  const sidebarSelected = sidebarFilterGroups.value.flatMap(g => g.options).filter(o => o.selected && !o.isHeader).map(o => {
    o.label = replaceWithMapper(o.label); return o.label;
  });
  const advancedSelected = currentAdvancedFilters.value.user_selections || [];
  const advancedAdditionalSelected = currentAdvancedFilters.value.additional_fields || [];
  return [...new Set([...sidebarSelected, ...advancedAdditionalSelected.map(a => `${a.column}: ${a.value}`)])];
  // return [...new Set([...sidebarSelected, ...advancedSelected, ...advancedAdditionalSelected])];
});


const apiPayload = computed(() => {
  const sidebarSelections = sidebarFilterGroups.value.flatMap(group =>
    group.options.filter(opt => opt.selected && !opt.isHeader)
  );
  const sidebarUserSelections = sidebarSelections.filter(s => s.filterType === 'tag').flatMap(s => s.synonyms);
  const sidebarAdditionalFields = sidebarSelections.filter(s => s.filterType === 'other').map(s => ({ column: s.column, value: s.label, type: 'where' }));

  const payload: any = {
    table_name: "all_db",
    pagination: { page: pagination.value.current_page, page_size: pagination.value.page_size },
    additional_fields: [...(currentAdvancedFilters.value.additional_fields || []), ...sidebarAdditionalFields],
    user_selections: [...new Set([...(currentAdvancedFilters.value.user_selections || []), ...sidebarUserSelections])]
  };
  if (currentSortBy.value.length > 0) {
    const sortItem = currentSortBy.value[0];
    payload.order_by = [sortItem.key, sortItem.order.toUpperCase() as 'ASC' | 'DESC'];
  }
  if (searchQuery.value) {
    payload.additional_fields.push({ column: "title", value: searchQuery.value, type: "orlikewhere" });
  }
  return payload;
});


const sortByField = computed({
  get: () => currentSortBy.value[0]?.key || 'primary_id',
  set: (newKey) => {
    const currentOrder = currentSortBy.value[0]?.order || 'asc';
    currentSortBy.value = [{ key: newKey, order: currentOrder }];
  }
});
const sortByOrder = computed({
  get: () => (currentSortBy.value[0]?.order || 'asc').toUpperCase() as 'ASC' | 'DESC',
  set: (newOrder) => {
    const currentKey = currentSortBy.value[0]?.key || 'primary_id';
    currentSortBy.value = [{ key: currentKey, order: newOrder.toLowerCase() as 'asc' | 'desc' }];
  }
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

  // const sidebarSelections = sidebarFilterGroups.value.flatMap(group => 
  //     group.options.filter(opt => opt.selected && !opt.isHeader)
  // );
  // const sidebarUserSelections = sidebarSelections.filter(s => s.filterType === 'tag').flatMap(s => s.synonyms);
  // const sidebarAdditionalFields = sidebarSelections.filter(s => s.filterType === 'other').map(s => ({ column: s.groupTitle, value: s.label, type: 'where' }));

  // const payload: any = {
  //   table_name: "all_db",
  //   pagination: { page: pagination.value.current_page, page_size: pagination.value.page_size },
  //   additional_fields: [...(currentAdvancedFilters.value.additional_fields || []), ...sidebarAdditionalFields],
  //   user_selections: [...new Set([...(currentAdvancedFilters.value.user_selections || []), ...sidebarUserSelections])]
  // };
  // if (searchQuery.value) {
  //   payload.additional_fields.push({ column: "title", value: searchQuery.value, type: "orlikewhere" });
  // }

  try {
    const response = await axios.post('http://0.0.0.0:5400/api/v1/api/user-selection-process', apiPayload.value);
    const apiData = response.data?.data?.data;
    if (apiData && Array.isArray(apiData.records) && apiData.records.length > 0) {
      searchResults.value = apiData.records.map((record: any): ServerItem => ({
        primary_id: record.primary_id,
        title: record.title || 'No title provided',
        authors: formatAuthors(safeParseAuthors(record.authors)),
        year: record.year || 'N/A',
        publication_type: record.publication_type || '',
        country: (record.country || '').replace(/[\[\]']/g, ''),
        pdf_url: record.pdf_url || '',
        notes: stringToList(record.notes || '', mapper) || '',
        research_notes: stringToList(record.research_notes || '', mapper),
        date_of_literature_search: record.lit_search_dates__hash__dates__hash__dates || '',
        num_of_studies: record.study_country__hash__study_count__hash__count || 0,
        publication_date: record.date || '',
      }));
      pagination.value = apiData.pagination || { current_page: 1, page_size: 10, total_pages: 1, total_records: 0 };
      const filterCountsResponse = response.data?.data?.filter_counts_response;
      if (filterCountsResponse?.data) {
        filterCounts.value = filterCountsResponse.data;
        updateFilterCounts();
      }
    } else {
      searchResults.value = [];
      pagination.value = { current_page: 1, page_size: 10, total_pages: 1, total_records: 0 };
    }
    searchResults.value = (apiData?.records || []).map((record: any): ServerItem => ({
      primary_id: record.primary_id,
      title: record.title || 'No title provided',
      authors: formatAuthors(safeParseAuthors(record.authors)),
      year: record.year || 'N/A',
      publication_type: getLastItem(record.publication_type) || '',
      country: (record.country || '').replace(/[\[\]']/g, ''),
      pdf_url: record.pdf_url || '',
      notes: stringToList(record.notes || '', mapper) || '',
      research_notes: stringToList(record.research_notes || '', mapper),
      date_of_literature_search: record.lit_search_dates__hash__dates__hash__dates || '',
      num_of_studies: record.study_country__hash__study_count__hash__count || 0,
      publication_date: record.date || '',
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

// const updateFilterCounts = () => {
//   if (!filterCounts.value) return;
//   sidebarFilterGroups.value.forEach(group => {
//     const countsForGroup = filterCounts.value[group.title];
//     if (Array.isArray(countsForGroup)) {
//       group.options.forEach(option => {
//         if (!option.isHeader) {
//           const match = countsForGroup.find(c => String(c.value) === String(option.label) && c.value && c.value !== "[]");
//           option.count = match ? match.count : 0;
//         }
//       });
//     } else {
//       group.options.forEach(option => { if (!option.isHeader) option.count = 0; });
//     }
//   });
// };

const updateFilterCounts = () => {
  if (!filterCounts.value || Object.keys(filterCounts.value).length === 0) return;

  sidebarFilterGroups.value.forEach(group => {
    group.options.forEach(option => {
      if (option.isHeader) return; // Skip headers

      let totalCount = 0;
      if (option.filterType === 'tag') {
        const countsForTag = filterCounts.value[option.code];
        if (Array.isArray(countsForTag)) {
          totalCount = countsForTag
            .filter(c => c.value !== 'nan')
            .reduce((sum, current) => sum + current.count, 0);
        }
      } else { // 'other' type
        const countsForGroup = filterCounts.value[group.title];
        if (Array.isArray(countsForGroup)) {
          const match = countsForGroup.find(c => String(c.value) === String(option.label));
          totalCount = match ? match.count : 0;
        }
      }
      option.count = totalCount;
    });

    // 🔽 Sort options by count descending (headers stay on top)
    group.options.sort((a, b) => {
      if (a.isHeader) return -1;
      if (b.isHeader) return 1;
      return b.count - a.count;
    });
  });
};

// const updateFilterCounts = () => {
//   if (!filterCounts.value || Object.keys(filterCounts.value).length === 0) return;

//   sidebarFilterGroups.value.forEach(group => {
//     group.options.forEach(option => {
//       if (option.isHeader) return; // Skip headers

//       let totalCount = 0;
//       if (option.filterType === 'tag') {
//         const countsForTag = filterCounts.value[option.code];
//         if (Array.isArray(countsForTag)) {
//           totalCount = countsForTag
//             .filter(c => c.value !== 'nan')
//             .reduce((sum, current) => sum + current.count, 0);
//         }
//       } else { // 'other' type
//         const countsForGroup = filterCounts.value[group.title];
//         if (Array.isArray(countsForGroup)) {
//           const match = countsForGroup.find(c => String(c.value) === String(option.label));
//           totalCount = match ? match.count : 0;
//         }
//       }
//       option.count = totalCount;
//     });
//   });
// };

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
// const buildSidebarFilters = (availableFilters: any) => {
//   const categories = [
//     { key: 'topic', title: 'Topics', type: 'tag', column: 'topic' },
//     { key: 'intervention', title: 'Interventions', type: 'tag', column: 'intervention' },
//     { key: 'country', title: 'Country', type: 'other', column: 'country' },
//     { key: 'year', title: 'Year', type: 'other', column: 'year' }
//   ];

//   const allGroups: FilterGroup[] = [];

//   categories.forEach(category => {
//     const tagFilterData = availableFilters.tag_filters?.[category.key];
//     const otherFilterData = availableFilters.others?.[category.title] || availableFilters.others?.[category.key];

//     if (category.key === 'topic' && tagFilterData) {
//       const options: FilterOption[] = Object.entries(tagFilterData).map(([subCatKey, subCatValue]: [string, any]) => {
//         const item = Object.values(subCatValue)[0] as any;
//         return {
//           label: subCatKey,
//           selected: false,
//           count: item.count || 0,
//           filterType: 'tag',
//           synonyms: item.synonyms || [item.display]
//         };
//       });
//       if (options.length > 0) {
//         allGroups.push({ title: category.title, options });
//       }
//     }
//     else if (tagFilterData) {
//       const mainGroupOptions: FilterOption[] = [];
//       Object.entries(tagFilterData).forEach(([subGroupKey, subGroupValue]) => {
//         mainGroupOptions.push({ label: replaceWithMapper(subGroupKey), isHeader: true, selected: false, count: 0, filterType: 'tag', synonyms: [] });
//         const options: FilterOption[] = Object.entries(subGroupValue as object).map(([itemKey, itemValue]: [string, any]) => ({
//           label: itemValue.display, selected: false, count: itemValue.count || 0,
//           filterType: 'tag', synonyms: itemValue.synonyms || [itemValue.display]
//         }));
//         mainGroupOptions.push(...options);
//       });
//       if (mainGroupOptions.length > 0) {
//         allGroups.push({ title: category.title, options: mainGroupOptions });
//       }
//     } else if (otherFilterData) {
//       const options = otherFilterData.map((opt: any) => ({
//         label: String(opt.name || opt), selected: false, count: opt.count || 0,
//         filterType: 'other', synonyms: [], groupTitle: category.key
//       }));
//       if (options.length > 0) {
//         allGroups.push({ title: category.title, options });
//       }
//     }
//   });
//   sidebarFilterGroups.value = allGroups;
// };


const buildSidebarFilters = (availableFilters: any) => {
  const categories = [
    { key: 'topic', title: 'Topics', type: 'tag', column: 'topic' }, 
    { key: 'intervention', title: 'Interventions', type: 'tag', column: 'intervention' },
    { key: 'Country', title: 'Country', type: 'other', column: 'country' }, 
    { key: 'Year', title: 'Year', type: 'other', column: 'year' }
  ];
  const allGroups: FilterGroup[] = [];

  categories.forEach(category => {
    const tagFilterData = availableFilters.tag_filters?.[category.key];
    const otherFilterData = availableFilters.others?.[category.title] || availableFilters.others?.[category.key];

    // ✅ FIX: Special handling for 'topic' to create a flat list
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
        mainGroupOptions.push({ 
          label: replaceWithMapper(subGroupKey), isHeader: true, selected: false, 
          count: 0, filterType: 'tag', synonyms: [], column: '', code: '' 
        });
        const subOptions: FilterOption[] = Object.entries(subGroupValue as object).map(([itemKey, itemValue]: [string, any]) => ({
          label: itemValue.display, selected: false, count: 0,
          filterType: 'tag', synonyms: itemValue.synonyms || [], column: category.column, code: itemKey
        }));
        mainGroupOptions.push(...subOptions);
      });
      if (mainGroupOptions.length > 0) allGroups.push({ title: category.title, options: mainGroupOptions });
    } 
    // Logic for 'other' filters like Year and Country
    else if (otherFilterData) {
      const options = otherFilterData.map((opt: any) => ({ 
          label: String(opt.name || opt), selected: false, count: 0,
          filterType: 'other', synonyms: [], column: category.column, code: ''
      }));
      if (options.length > 0) allGroups.push({ title: category.title, options });
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


// When the sort field or order changes, reset to page 1 and run a search
watch([sortByField, sortByOrder], () => {
  pagination.value.current_page = 1;
  runSearch();
});

// When the page size changes, reset to page 1 and run a search
watch(() => pagination.value.page_size, () => {
  pagination.value.current_page = 1;
  runSearch();
});


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

// --- DOWNLOAD LOGIC ---
const getFileMimeType = (file_type: FileType): string => {
  switch (file_type) {
    case 'csv': return 'text/csv';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json': return 'application/json';
    case 'pdf': return 'application/pdf';
  }
};
const getFileExtension = (file_type: FileType): string => {
  switch (file_type) {
    case 'csv': return 'csv';
    case 'excel': return 'xlsx';
    case 'json': return 'json';
    case 'pdf': return 'pdf';
  }
};

const download = async (file_type: FileType) => {
  isDownloading.value[file_type] = true;
  // This payload requests all records that match the current filters
  const payload = { ...apiPayload.value, export: file_type, pagination: { page: 1, page_size: pagination.value.total_records } };

  try {
    const response = await axios.post('http://0.0.0.0:5400/api/v1/api/user-selection-process', payload, { responseType: 'blob' });
    const blob = new Blob([response.data], { type: getFileMimeType(file_type) });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `records_export.${getFileExtension(file_type)}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Download failed for ${file_type}:`, error);
  } finally {
    isDownloading.value[file_type] = false;
  }
};

</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

.v-application {
  font-family: 'Inter', sans-serif !important;
}

.search-input .v-field {
  border-radius: 0 !important;
}

.find-btn {
  border-radius: 0;
}

.result-title {
  text-decoration: none;
  line-height: 1.4;
  display: inline-block;
}

.result-title:hover {
  text-decoration: underline;
}

.filter-options-container {
  max-height: 250px;
  overflow-y: auto;
}
</style>