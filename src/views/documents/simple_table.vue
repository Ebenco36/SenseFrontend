<template>
  <v-app>
    <AdvancedFilterModal v-show="dialog" v-model="dialog" :initial-filters="currentAdvancedFilters"
      @apply-filters="handleApplyFilters" />

    <v-main class="bg-white-lighten-4">
      <v-container fluid class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-4">Records</h1>

        <v-card border flat>
          <v-card-text class="pa-4">
            <v-row align="center" class="g-2">
              <v-col cols="12" sm="auto">
                <v-btn-toggle v-model="viewMode" mandatory variant="outlined" density="comfortable">
                  <v-btn value="table"><v-icon start>mdi-table</v-icon>Table View</v-btn>
                  <v-btn value="list"><v-icon start>mdi-format-list-bulleted</v-icon>List View</v-btn>
                </v-btn-toggle>
              </v-col>
              <v-col cols="12" sm="auto">
                <div class="d-flex ga-2">
                  <v-btn variant="tonal" @click="download('csv')" :loading="isDownloading.csv">CSV</v-btn>
                  <v-btn variant="tonal" @click="download('excel')" :loading="isDownloading.excel">Excel</v-btn>
                  <v-btn variant="tonal" @click="download('json')" :loading="isDownloading.json">Json</v-btn>
                </div>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="12" sm="4" md="3">
                <v-text-field v-model="searchQuery" label="Quick Search..." density="compact" variant="outlined"
                  hide-details clearable></v-text-field>
              </v-col>
              <v-col cols="12" sm="auto">
                <v-btn color="primary" flat prepend-icon="mdi-filter-variant" @click="dialog = true">
                  Filter
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>

          <v-data-table-server v-if="viewMode === 'table'" v-model:items-per-page="pagination.page_size"
            :headers="headers" :items-length="pagination.total_records" :items="serverItems" :loading="loading"
            class="elevation-0" item-value="primary_id" @update:options="updateTableOptions" show-expand>
            <template v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
              <v-btn :icon="isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small"
                variant="text" @click="toggleExpand(internalItem)"></v-btn>
            </template>

            <template v-slot:item.title="{ item }">
              <a href="#" @click.prevent="navigateToDetails(item.primary_id)" class="font-weight-medium result-title"
                :title="item.title">
                {{ truncateText(item.title, 100) }}
              </a>
            </template>

            <template v-slot:item.link="{ item }">
              <v-btn size="small" variant="text" color="primary" :href="item.link" target="_blank"
                @click.stop>Link</v-btn>
            </template>

            <template v-slot:item.overallConf="{ item }">
              <v-chip :color="getConfidenceColor(item.overallConf)" size="small" variant="tonal"
                class="font-weight-bold">{{ item.overallConf }}</v-chip>
            </template>

            <template v-slot:expanded-row="{ columns, item }">
              <tr>
                <td :colspan="columns.length">
                  <v-card class="ma-2 pa-10" flat>
                    <h3 class="text-subtitle-1 font-weight-bold mb-2">Abstract</h3>
                    <p class="text-body-2 text-medium-emphasis mb-1">
                      {{ item.isAbstractExpanded ? item.abstract : truncateText(item.abstract, 400) }}
                    </p>
                    
                    <a
                      v-if="(item.abstract || '').length > 200"
                      href="#"
                      class="text-caption read-more-link"
                      @click.prevent="item.isAbstractExpanded = !item.isAbstractExpanded"
                    >
                      {{ item.isAbstractExpanded ? 'Show Less' : 'Show More' }}
                    </a>
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="detail-item"><span class="detail-label">Diseases:</span>
                          <!-- <span class="detail-value">{{ item.research_notes }}</span> -->
                            <v-chip v-for="note in [...item.research_notes]" :key="note" size="small">
                              {{ note }}
                            </v-chip>
                        </div>
                        <div class="detail-item mt-2"><span class="detail-label">Open Access:</span>
                          <!-- <span class="detail-value">{{ item.openAccess }}</span> -->
                            <v-chip
                              v-if="item.openAccess && item.openAccess !== 'N/A'"
                              :color="getOpenAccessColor(item.openAccess)"
                              :text="item.openAccess == 'Open Access' ? 'OA' : 'N/A'"
                              size="small"
                              variant="tonal"
                              class="font-weight-bold"
                            ></v-chip>
                            <span v-else class="text-medium-emphasis text-body-2">N/A</span>
                        </div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="detail-item"><span class="detail-label">Studies Included:</span><span
                            class="detail-value">{{ item.num_of_studies }}</span></div>
                        <div class="detail-item mt-2"><span class="detail-label">Country Focus:</span><span
                            class="detail-value">{{ item.location_in_title || "N/A" }}</span></div>
                      </v-col>
                    </v-row>
                  </v-card>
                </td>
              </tr>
            </template>
          </v-data-table-server>

          <div v-if="viewMode === 'list'">
            <v-container v-if="loading" class="d-flex justify-center pa-10">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-container>
            <div v-else>
              <div style="max-width: 900px; margin: auto;">
                <v-list lines="three" class="bg-transparent">
                  <v-list-item v-for="item in serverItems" :key="item.primary_id" class="list-item-link mb-4 bg-white"
                    elevation="1">
                    <v-list-item-title class="text-h6 font-weight-bold text-blue-darken-4 result-title"
                      @click="navigateToDetails(item.primary_id)">
                      {{ item.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-2 text-medium-emphasis my-2">
                      {{ item.authors }} ({{ item.year }})
                    </v-list-item-subtitle>
                    <p class="text-caption text-grey-darken-1 mt-1 mb-3">
                      {{ truncateText(item.abstract, 400) }}
                    </p>

                    <v-divider></v-divider>

                    <div class="py-3">
                      <v-row dense>
                        <v-col cols="12" sm="auto" class="me-6">
                          <div class="text-caption text-medium-emphasis">Studies Included</div>
                          <div class="font-weight-bold">{{ item.num_of_studies }}</div>
                        </v-col>
                        <v-col cols="12" sm="auto" class="me-6">
                          <div class="text-caption text-medium-emphasis">Last Literature Search</div>
                          <div class="font-weight-bold">{{ item.date_of_literature_search }}</div>
                        </v-col>
                        <v-col cols="12" sm="auto">
                          <div class="text-caption text-medium-emphasis">Publication Date</div>
                          <div class="font-weight-bold">{{ item.publication_date }}</div>
                        </v-col>
                      </v-row>
                    </div>

                    <v-chip-group>
                      <v-chip v-if="item.publication_type" size="small" color="blue-lighten-5"
                        text-color="blue-darken-2" variant="flat">
                        {{ item.publication_type }}
                      </v-chip>
                      <v-chip v-for="note in [...item.notes, ...item.research_notes]" :key="note" size="small">
                        {{ note }}
                      </v-chip>
                    </v-chip-group>

                    <template v-slot:append>
                      <div class="d-flex flex-column align-end ga-2">
                        <v-chip :color="getConfidenceColor(item.overallConf)" size="small" variant="tonal"
                          class="font-weight-bold">{{ item.overallConf }}</v-chip>
                        <v-btn size="small" variant="tonal" color="primary" :href="item.link" target="_blank"
                          @click.stop>Details</v-btn>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              <v-pagination v-if="pagination.total_pages > 1" v-model="pagination.current_page"
                :length="pagination.total_pages" :total-visible="7" class="my-4"></v-pagination>
            </div>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AdvancedFilterModal from '@/components/AdvancedFilterModal.vue';
import { stringToList, getLastItem } from '@/utils/helpers';
import { mapper } from '@/services';

// --- TYPE DEFINITIONS ---
type FileType = 'csv' | 'excel' | 'json';
type SortItem = { key: string; order: 'asc' | 'desc' };
type Pagination = { current_page: number; page_size: number; total_pages: number; total_records: number; };
interface FilterPayload { user_selections?: string[]; additional_fields?: any[]; }
interface ServerItem {
  primary_id: number; title: string; authors: string; link: string; abstract: string;
  year: number | string; country: string; num_of_studies: number | string;
  publication_type: string; pdf_url: string; openAccess: string; disease: string; overallConf: string;
  amster2Met: string | number; notes: string[]; research_notes: string[];
  date_of_literature_search: string; publication_date: string; isAbstractExpanded?: boolean;
  location_in_title: string;
}

// --- STATE MANAGEMENT ---
const router = useRouter();
const viewMode = ref<'table' | 'list'>('table');
const searchQuery = ref('');
const serverItems = ref<ServerItem[]>([]);
const loading = ref(false); // Start false, as the table's initial event will set it to true
const dialog = ref(false);
const currentAdvancedFilters = ref<FilterPayload>({ user_selections: [], additional_fields: [] });
const currentSortBy = ref<SortItem[]>([{ key: 'primary_id', order: 'asc' }]);
const pagination = ref<Pagination>({ current_page: 1, page_size: 10, total_pages: 0, total_records: 0 });
const isDownloading = ref({ csv: false, excel: false, json: false });
let searchDebounceTimer: number | undefined;

// --- COMPUTED PAYLOAD ---
const apiPayload = computed(() => {
  const payload: any = {
    table_name: "all_db",
    pagination: { page: pagination.value.current_page, page_size: pagination.value.page_size },
    ...currentAdvancedFilters.value
  };
  if (currentSortBy.value.length > 0) {
    const sortItem = currentSortBy.value[0];
    payload.order_by = [sortItem.key, sortItem.order.toUpperCase() as 'ASC' | 'DESC'];
  }
  if (searchQuery.value) {
    if (!payload.additional_fields) payload.additional_fields = [];
    payload.additional_fields.push({ column: "title", value: searchQuery.value, type: "orlikewhere" });
  }
  return payload;
});

// --- DATA FETCHING & EVENT HANDLING ---
const loadItems = async () => {
  loading.value = true;
  try {
    const response = await axios.post('http://0.0.0.0:5400/api/v1/api/user-selection-process', apiPayload.value);
    const apiData = response.data?.data?.data;
    pagination.value = apiData?.pagination || { current_page: 1, page_size: 10, total_pages: 0, total_records: 0 };
    serverItems.value = (apiData?.records || []).map((record: any): ServerItem => ({
      primary_id: record.primary_id,
      title: record.title || 'N/A',
      authors: formatAuthors(safeParseAuthors(record.authors)),
      link: createDoiUrl(record.doi),
      abstract: record.abstract,
      year: record.year,
      country: (record.country || '').replace(/[\[\]']/g, ''),
      date_of_literature_search: record.lit_search_dates__hash__dates__hash__dates || '',
      num_of_studies: record.numStudies || 0,
      publication_date: record.date || '',
      publication_type: getLastItem(record.publication_type) || 'N/A',
      pdf_url: record.pdf_url || '',
      openAccess: record.open_access,
      notes: stringToList(record.notes || '', mapper) || '',
      research_notes: stringToList(record.research_notes || '', mapper),
      location_in_title: record.location_in_title || '',
      disease: 'N/A',
      overallConf: record.amstar_label || 'N/A',
      amster2Met: record?.amstar_met ? toList(record?.amstar_met)?.length : 0 || 'N/A',
      isAbstractExpanded: false,
    }));
  } catch (error) {
    console.error("Failed to load records:", error);
    serverItems.value = [];
  } finally {
    loading.value = false;
  }
};


function toList(input:string): string[] {
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

const updateTableOptions = ({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy: SortItem[] }) => {
  pagination.value.current_page = page;
  pagination.value.page_size = itemsPerPage;
  currentSortBy.value = sortBy;
  loadItems();
};

const handleApplyFilters = (filters: FilterPayload) => {
  pagination.value.current_page = 1;
  currentAdvancedFilters.value = filters;
  dialog.value = false;
  loadItems();
};

// --- WATCHERS ---
watch(searchQuery, () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(() => {
    pagination.value.current_page = 1;
    loadItems();
  }, 500);
});

watch(() => pagination.value.current_page, (newPage, oldPage) => {
  if (viewMode.value === 'list' && newPage !== oldPage) {
    loadItems();
  }
});

// --- HEADERS & HELPERS ---
const headers = [
  { title: '', key: 'data-table-expand', align: 'start', sortable: false, width: '1%' },
  { title: 'Title', key: 'title', align: 'start', sortable: true, width: '40%' },
  { title: 'Authors', key: 'authors', align: 'start', sortable: false },
  { title: 'Link', key: 'link', align: 'center', sortable: false },
  { title: 'Date of Search', key: 'date_of_literature_search', align: 'start', sortable: true },
  { title: 'Quality', key: 'overallConf', align: 'start', sortable: true },
  { title: 'AMSTAR 2 Met', key: 'amster2Met', align: 'start', sortable: true },
];

const navigateToDetails = (id?: number) => {
  if (id) router.push({ name: 'record_details_page', params: { id } });
};

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

const formatAuthors = (authors: string[]): string => {
  if (!Array.isArray(authors) || authors.length === 0) return 'N/A';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(' & ');
  return `${authors[0]} et al.`;
};

const openLink = (url: string) => window.open(url, '_blank');

// const truncateText = (text: string, length: number): string => {
//   if (!text) return '';
//   return text.length > length ? text.slice(0, length) + '...' : text;
// };

const getConfidenceColor = (confidence?: string): string => {
  switch (confidence) {
    case 'High': return 'success';
    case 'Moderate': return 'warning';
    case 'Low': return 'error';
    default: return 'grey';
  }
};

const getOpenAccessColor = (status:any) => {
  // Add more keywords if your data has other "yes" values
  if (String(status).toLowerCase().includes('open access')) {
    return 'success';
  }
  return 'grey'; // Default color for other statuses
};

// --- Download Logic ---
const getFileMimeType = (file_type: FileType): string => {
  switch (file_type) {
    case 'csv': return 'text/csv';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json': return 'application/json';
  }
};

const getFileExtension = (file_type: FileType): string => {
  switch (file_type) {
    case 'csv': return 'csv';
    case 'excel': return 'xlsx';
    case 'json': return 'json';
  }
};

const download = async (file_type: FileType) => {
  isDownloading.value[file_type] = true;
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
.result-title {
  color: #153a9d;
  text-decoration: none;
  cursor: pointer;
}

.result-title:hover {
  text-decoration: underline;
}

.list-item-link:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.detail-item {
  display: flex;
  gap: 8px;
}

.detail-label {
  font-weight: 600;
}

.detail-value {
  color: #555;
}

.read-more-link {
  color: #1565C0;
  text-decoration: none;
}
.read-more-link:hover {
  text-decoration: underline;
}
</style>