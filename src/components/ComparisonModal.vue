<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="1200px"
    persistent
  >
    <v-card class="d-flex flex-column" style="height: 80vh;">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h5">Build Your Comparison</span>
        <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)"></v-btn>
      </v-card-title>
      
      <v-divider></v-divider>

      <v-card-text class="flex-grow-1" style="height: 80vh;">
        <v-row class="h-100">
          <v-col cols="12" md="7" class="d-flex flex-column h-100" style="overflow-y:hidden;">
            <v-text-field
              v-model="search"
              label="Search for records to add..."
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
              class="mb-2 flex-shrink-0"
            ></v-text-field>
            
            <div v-if="isLoading" class="flex-grow-1 pa-2">
                <v-skeleton-loader
                    v-for="n in 7"
                    :key="n"
                    type="list-item-two-line"
                    class="mb-1"
                ></v-skeleton-loader>
            </div>

            <div v-else class="flex-grow-1" style="overflow-y: auto;">
              <v-list>
                <div v-if="!serverItems.length && search" class="text-center text-medium-emphasis mt-10">
                    <p>No records found for "{{ search }}".</p>
                </div>
                <v-list-item
                  v-for="item in serverItems"
                  :key="item.primary_id"
                  :subtitle="item.authors"
                >
                  <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
                  <template v-slot:append>
                    <v-btn
                      :disabled="isSelected(item.primary_id) || selectedRecords.length >= MAX_COMPARE_ITEMS"
                      size="small"
                      variant="tonal"
                      @click="addRecord(item)"
                    >
                    {{ isSelected(item.primary_id) ? 'Selected' : 'Add' }}
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
              <div v-if="hasMorePages" class="text-center pa-4">
                <v-btn :loading="isLoadingMore" variant="tonal" @click="loadMoreRecords">Load More</v-btn>
              </div>
            </div>
          </v-col>
          
          <v-divider vertical></v-divider>

          <v-col cols="12" md="5" class="d-flex flex-column h-100">
            <div class="d-flex justify-space-between align-center mb-2 flex-shrink-0">
                <div class="text-subtitle-1 font-weight-bold">
                    Selected for Comparison ({{ selectedRecords.length }}/{{ MAX_COMPARE_ITEMS }})
                </div>
                 <v-btn variant="text" size="small" @click="clearSelection">Clear All</v-btn>
            </div>
            
            <div v-if="!selectedRecords.length" class="text-center text-medium-emphasis mt-10">
                <v-icon size="48" class="mb-2">mdi-format-list-bulleted-type</v-icon>
                <p>Select records from the list to begin comparison.</p>
            </div>
            
            <v-list v-else class="flex-grow-1" style="overflow-y: auto;">
                <v-slide-y-transition group>
                    <v-list-item
                        v-for="item in selectedRecords"
                        :key="item.primary_id"
                        class="mb-2"
                        border
                        rounded
                    >
                      <v-list-item-title class="font-weight-medium text-wrap">{{ item.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.authors }}</v-list-item-subtitle>
                      <template v-slot:append>
                        <v-btn icon="mdi-close" variant="text" size="small" @click="removeRecord(item.primary_id)"></v-btn>
                      </template>
                    </v-list-item>
                </v-slide-y-transition>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" size="large" :disabled="selectedRecords.length < 2" @click="initiateComparison">
          Compare Now
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// --- TYPE DEFINITIONS & PROPS ---
interface ServerItem {
  primary_id: number;
  title: string;
  authors: string;
}
interface AdditionalField { 
  column: string; 
  value: any; 
  type: string; 
}
interface ApiPayload {
  table: string;
  page: number;
  page_size: number;
  additional_fields: AdditionalField[];
}

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits(['update:modelValue']);
const router = useRouter();

// --- STATE MANAGEMENT ---
const MAX_COMPARE_ITEMS = 4;
const search = ref('');
const serverItems = ref<ServerItem[]>([]);
const selectedRecords = ref<ServerItem[]>([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
let searchTimeout: number | undefined;

// --- COMPUTED PROPERTIES ---
const hasMorePages = computed(() => !isLoading.value && currentPage.value < totalPages.value);

const apiPayload = computed<ApiPayload>(() => {
  const payload: ApiPayload = {
    table: "all_db",
    page: currentPage.value,
    page_size: 20,
    additional_fields: [],
  };

  if (search.value) {
    payload.additional_fields.push({
      column: "Title",
      value: search.value,
      type: "orlikewhere"
    });
  }
  return payload;
});

// --- API LOGIC ---
const fetchRecords = async (isLoadMore = false) => {
  if (isLoadMore) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
  }
  
  try {
    const response = await axios.post('http://0.0.0.0:5400/api/v1/api/user-selection-process', apiPayload.value);
    // ✅ FIX: Corrected the path to access the API data
    const apiData = response.data?.data?.data;

    if (apiData && apiData.pagination && Array.isArray(apiData.records)) {
      const newItems = apiData.records.map((record: any) => ({
        primary_id: record.primary_id,
        title: record.title,
        authors: formatAuthors(safeParseAuthors(record.authors)),
      }));
      
      if (isLoadMore) {
        serverItems.value.push(...newItems);
      } else {
        serverItems.value = newItems;
      }
      totalPages.value = apiData.pagination.total_pages;
    }
  } catch (error) {
    console.error("Failed to fetch records:", error);
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

// --- WATCHERS ---
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        serverItems.value = [];
        currentPage.value = 1;
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

// --- HELPER FUNCTIONS ---
const isSelected = (id: number) => selectedRecords.value.some(r => r.primary_id === id);
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
const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString) return [];
  try {
    const trimmed = authorsString.trim();
    if (trimmed.includes(',')) return trimmed.split(',').map(a => a.trim());
    return trimmed ? [trimmed] : [];
  } catch {
    return [];
  }
};
const formatAuthors = (authors: string[]): string => {
  if (!authors || authors.length === 0) return 'N/A';
  if (authors.length > 2) return `${authors[0]} et al.`;
  return authors.join(', ');
};
</script>