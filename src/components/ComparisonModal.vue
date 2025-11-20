<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="1400px"
    persistent
    scrollable
  >
    <v-card class="comparison-builder-card">
      <!-- Header -->
      <v-card-title class="comparison-header">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon size="28" class="mr-3" color="primary">mdi-compare</v-icon>
            <div>
              <h2 class="text-h5 font-weight-bold">Build Your Comparison</h2>
              <p class="text-caption text-medium-emphasis ma-0">Select up to {{ MAX_COMPARE_ITEMS }} records to compare side-by-side</p>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            @click="$emit('update:modelValue', false)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Main Content -->
      <v-card-text class="comparison-content pa-0">
        <v-row no-gutters class="h-100">
          <!-- Left Panel: Search & Results -->
          <v-col cols="12" md="8" class="search-panel">
            <div class="pa-6">
              <!-- Search Bar -->
              <div class="search-bar-container mb-4">
                <v-text-field
                  v-model="search"
                  label="Search publications by title..."
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-magnify"
                  hide-details
                  clearable
                  class="search-input"
                  @click:clear="handleClearSearch"
                >
                  <template v-slot:append-inner>
                    <v-chip
                      v-if="totalRecords > 0"
                      size="small"
                      variant="tonal"
                      color="primary"
                    >
                      {{ totalRecords }} found
                    </v-chip>
                  </template>
                </v-text-field>
              </div>

              <!-- Loading State -->
              <div v-if="isLoading" class="results-container">
                <v-skeleton-loader
                  v-for="n in 5"
                  :key="n"
                  type="list-item-three-line"
                  class="mb-3"
                ></v-skeleton-loader>
              </div>

              <!-- Results List -->
              <div v-else class="results-container">
                <!-- Empty State -->
                <div v-if="!serverItems.length" class="empty-state">
                  <v-icon size="64" color="grey-lighten-1">
                    {{ search ? 'mdi-file-search-outline' : 'mdi-magnify' }}
                  </v-icon>
                  <h3 class="text-h6 mt-4 mb-2">
                    {{ search ? 'No results found' : 'Start searching' }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis">
                    {{ search 
                      ? `No publications match "${search}". Try a different search term.`
                      : 'Enter keywords to search for publications to compare.'
                    }}
                  </p>
                </div>

                <!-- Results -->
                <v-list v-else class="results-list" lines="three">
                  <v-list-item
                    v-for="(item, index) in serverItems"
                    :key="item.primary_id"
                    :class="['result-item', { 'selected': isSelected(item.primary_id) }]"
                    :disabled="isSelected(item.primary_id)"
                    rounded="lg"
                  >
                    <template v-slot:prepend>
                      <div class="item-number">
                        {{ index + 1 }}
                      </div>
                    </template>

                    <v-list-item-title class="text-wrap font-weight-medium mb-1">
                      {{ item.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="text-wrap">
                      <v-icon size="14" class="mr-1">mdi-account-outline</v-icon>
                      {{ item.authors }}
                    </v-list-item-subtitle>

                    <template v-slot:append>
                      <v-btn
                        :disabled="isSelected(item.primary_id) || selectedRecords.length >= MAX_COMPARE_ITEMS"
                        :color="isSelected(item.primary_id) ? 'success' : 'primary'"
                        :variant="isSelected(item.primary_id) ? 'tonal' : 'elevated'"
                        size="small"
                        class="add-button"
                        @click="addRecord(item)"
                      >
                        <v-icon start>
                          {{ isSelected(item.primary_id) ? 'mdi-check' : 'mdi-plus' }}
                        </v-icon>
                        {{ isSelected(item.primary_id) ? 'Added' : 'Add' }}
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>

                <!-- Load More -->
                <div v-if="hasMorePages" class="text-center pa-4">
                  <v-btn
                    :loading="isLoadingMore"
                    variant="outlined"
                    color="primary"
                    @click="loadMoreRecords"
                  >
                    <v-icon start>mdi-chevron-down</v-icon>
                    Load More Results
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>

          <v-divider vertical></v-divider>

          <!-- Right Panel: Selected Items -->
          <v-col cols="12" md="4" class="selection-panel">
            <div class="pa-6">
              <!-- Selection Header -->
              <div class="selection-header mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6 font-weight-bold">
                    Selected Publications
                  </h3>
                  <v-btn
                    v-if="selectedRecords.length > 0"
                    variant="text"
                    size="small"
                    color="error"
                    @click="clearSelection"
                  >
                    <v-icon start size="small">mdi-delete-outline</v-icon>
                    Clear All
                  </v-btn>
                </div>

                <!-- Progress Indicator -->
                <div class="selection-progress">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-caption text-medium-emphasis">
                      {{ selectedRecords.length }} of {{ MAX_COMPARE_ITEMS }} selected
                    </span>
                    <span class="text-caption" :class="progressColor">
                      {{ progressPercentage }}%
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="progressPercentage"
                    :color="progressBarColor"
                    height="6"
                    rounded
                  ></v-progress-linear>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!selectedRecords.length" class="empty-selection">
                <v-icon size="80" color="grey-lighten-2">mdi-playlist-check</v-icon>
                <h4 class="text-subtitle-1 mt-4 mb-2 font-weight-medium">
                  No publications selected
                </h4>
                <p class="text-body-2 text-medium-emphasis text-center px-4">
                  Browse and add publications from the search results to begin your comparison
                </p>
              </div>

              <!-- Selected Items List -->
              <div v-else class="selected-list">
                <v-slide-y-transition group>
                  <v-card
                    v-for="(item, index) in selectedRecords"
                    :key="item.primary_id"
                    :elevation="1"
                    class="selected-item mb-3"
                    rounded="lg"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex align-start">
                        <v-chip
                          size="x-small"
                          color="primary"
                          variant="flat"
                          class="mr-2 mt-1"
                        >
                          {{ index + 1 }}
                        </v-chip>
                        
                        <div class="flex-grow-1">
                          <p class="text-body-2 font-weight-medium mb-1 text-wrap">
                            {{ item.title }}
                          </p>
                          <p class="text-caption text-medium-emphasis text-wrap">
                            {{ item.authors }}
                          </p>
                        </div>

                        <v-btn
                          icon
                          variant="text"
                          size="x-small"
                          color="error"
                          @click="removeRecord(item.primary_id)"
                        >
                          <v-icon size="18">mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-slide-y-transition>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Footer Actions -->
      <v-card-actions class="comparison-footer pa-6">
        <div class="d-flex align-center w-100">
          <div class="flex-grow-1">
            <p class="text-caption text-medium-emphasis ma-0">
              <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
              Select at least 2 publications to start comparison
            </p>
          </div>
          
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            :disabled="selectedRecords.length < 2"
            class="compare-button"
            @click="initiateComparison"
          >
            <v-icon start>mdi-compare</v-icon>
            Compare {{ selectedRecords.length }} Publication{{ selectedRecords.length !== 1 ? 's' : '' }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// --- CONSTANTS ---
const API_BASE = 'http://0.0.0.0:5400/api/v1';
const MAX_COMPARE_ITEMS = 4;

// --- TYPE DEFINITIONS ---
interface ServerItem {
  primary_id: number;
  title: string;
  authors: string;
}

interface Props {
  modelValue: boolean;
  initialSelection?: ServerItem | null;
}

// --- PROPS & EMITS ---
const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
const router = useRouter();

// --- STATE ---
const search = ref('');
const serverItems = ref<ServerItem[]>([]);
const selectedRecords = ref<ServerItem[]>([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const totalRecords = ref(0);
let searchTimeout: number | undefined;

// --- COMPUTED ---
const hasMorePages = computed(() => 
  !isLoading.value && currentPage.value < totalPages.value
);

const progressPercentage = computed(() => 
  Math.round((selectedRecords.value.length / MAX_COMPARE_ITEMS) * 100)
);

const progressColor = computed(() => {
  const pct = progressPercentage.value;
  if (pct < 50) return 'text-warning';
  if (pct < 100) return 'text-info';
  return 'text-success';
});

const progressBarColor = computed(() => {
  const pct = progressPercentage.value;
  if (pct < 50) return 'warning';
  if (pct < 100) return 'info';
  return 'success';
});

const apiPayload = computed(() => {
  const payload: any = {
    table_name: "all_db",
    sort_by: "year",
    sort_direction: "desc",
    pagination: {
      page: currentPage.value,
      page_size: 20
    }
  };

  if (search.value) {
    payload.search = {
      conditions: [
        {
          field: "title",
          operator: "contains",
          value: search.value
        }
      ],
      logic: "AND"
    };
  } else {
    payload.search = {
      conditions: [],
      logic: "AND"
    };
  }

  return payload;
});

// --- METHODS ---
const fetchRecords = async (isLoadMore = false) => {
  if (isLoadMore) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
  }
  
  try {
    const response = await axios.post(`${API_BASE}/filters/search`, apiPayload.value);
    
    if (response.data.success) {
      const apiData = response.data.data;
      
      const newItems = (apiData.records || []).map((record: any) => ({
        primary_id: record.primary_id,
        title: record.title || 'Untitled',
        authors: formatAuthors(record.authors),
      }));
      
      if (isLoadMore) {
        serverItems.value.push(...newItems);
      } else {
        serverItems.value = newItems;
      }
      
      totalPages.value = apiData.pagination.total_pages;
      totalRecords.value = apiData.pagination.total_records || serverItems.value.length;
    }
  } catch (error) {
    console.error('Failed to fetch records:', error);
    serverItems.value = [];
    totalRecords.value = 0;
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadMoreRecords = () => {
  if (hasMorePages.value && !isLoadingMore.value) {
    currentPage.value++;
    fetchRecords(true);
  }
};

const handleClearSearch = () => {
  search.value = '';
  serverItems.value = [];
  currentPage.value = 1;
  fetchRecords();
};

const isSelected = (id: number) => 
  selectedRecords.value.some(r => r.primary_id === id);

const addRecord = (record: ServerItem) => {
  if (selectedRecords.value.length < MAX_COMPARE_ITEMS && !isSelected(record.primary_id)) {
    selectedRecords.value.push(record);
  }
};

const removeRecord = (id: number) => {
  selectedRecords.value = selectedRecords.value.filter(r => r.primary_id !== id);
};

const clearSelection = () => {
  selectedRecords.value = [];
};

const initiateComparison = () => {
  const selectedIds = selectedRecords.value.map(record => record.primary_id);
  emit('update:modelValue', false);
  router.push({
    name: 'compare_record',
    query: {
      ids: selectedIds.join(',') 
    }
  });
};

const formatAuthors = (authorsData: any): string => {
  if (!authorsData) return 'N/A';
  
  if (typeof authorsData === 'string') {
    try {
      const trimmed = authorsData.trim();
      if (trimmed.includes(',')) {
        const authors = trimmed.split(',').map(a => a.trim()).filter(a => a);
        if (authors.length === 0) return 'N/A';
        if (authors.length > 2) return `${authors[0]} et al.`;
        return authors.join(', ');
      }
      return trimmed || 'N/A';
    } catch {
      return 'N/A';
    }
  }
  
  if (Array.isArray(authorsData)) {
    if (authorsData.length === 0) return 'N/A';
    if (authorsData.length > 2) return `${authorsData[0]} et al.`;
    return authorsData.join(', ');
  }
  
  return 'N/A';
};

// --- WATCHERS ---
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    serverItems.value = [];
    currentPage.value = 1;
    totalRecords.value = 0;

    if (props.initialSelection) {
      const recordToAdd = {
        primary_id: props.initialSelection.primary_id || (props.initialSelection as any).id,
        title: props.initialSelection.title,
        authors: props.initialSelection.authors
      };
      addRecord(recordToAdd);
    }
    
    fetchRecords();
  } else {
    selectedRecords.value = [];
    search.value = '';
  }
});

watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(() => {
    serverItems.value = [];
    currentPage.value = 1;
    fetchRecords();
  }, 500);
});
</script>

<style scoped>
.comparison-builder-card {
  display: flex;
  flex-direction: column;
  height: 85vh;
  max-height: 900px;
}

.comparison-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  padding: 24px 28px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.comparison-content {
  flex: 1;
  overflow: hidden;
  height: calc(85vh - 180px);
}

.search-panel,
.selection-panel {
  height: 100%;
  overflow-y: auto;
}

.search-bar-container {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  padding-bottom: 8px;
}

.search-input :deep(.v-field) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.results-container {
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
}

.results-list {
  background: transparent !important;
}

.result-item {
  margin-bottom: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-item:hover:not(.selected) {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-2px);
}

.result-item.selected {
  background: rgba(var(--v-theme-success), 0.05);
  border-color: rgba(var(--v-theme-success), 0.3);
}

.item-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
}

.add-button {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.selection-panel {
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}

.selection-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
  padding-bottom: 16px;
}

.selection-progress :deep(.v-progress-linear) {
  border-radius: 4px;
}

.empty-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.selected-list {
  max-height: calc(85vh - 380px);
  overflow-y: auto;
  padding-right: 4px;
}

.selected-item {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.2s ease;
}

.selected-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateX(-4px);
}

.comparison-footer {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.compare-button {
  text-transform: none;
  letter-spacing: 0.5px;
  font-weight: 600;
  padding: 0 32px !important;
  height: 48px !important;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.compare-button:hover {
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-2px);
}

/* Scrollbar Styling */
.search-panel::-webkit-scrollbar,
.selection-panel::-webkit-scrollbar,
.selected-list::-webkit-scrollbar {
  width: 8px;
}

.search-panel::-webkit-scrollbar-track,
.selection-panel::-webkit-scrollbar-track,
.selected-list::-webkit-scrollbar-track {
  background: transparent;
}

.search-panel::-webkit-scrollbar-thumb,
.selection-panel::-webkit-scrollbar-thumb,
.selected-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.search-panel::-webkit-scrollbar-thumb:hover,
.selection-panel::-webkit-scrollbar-thumb:hover,
.selected-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
