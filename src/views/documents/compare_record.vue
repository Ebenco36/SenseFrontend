<template>
  <v-app>
    <v-main class="bg-grey-lighten-5">
      <v-container class="py-8" style="max-width: 1600px;">
        
        <!-- Header Section -->
        <div class="mb-8">
          <div class="d-flex align-center mb-2">
            <v-btn 
              variant="text" 
              icon 
              size="large"
              @click="router.back()"
              class="me-2"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div>
              <h1 class="text-h4 font-weight-bold text-grey-darken-4">Compare Records</h1>
              <p class="text-body-1 text-grey-darken-1 mt-1">
                Comparing {{ recordsToCompare.length }} systematic review{{ recordsToCompare.length !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <v-card v-if="recordsToCompare.length > 0" class="mb-6" elevation="0" rounded="xl">
          <v-card-text class="pa-6">
            <div class="mb-3">
              <div class="d-flex align-center mb-3">
                <v-icon icon="mdi-filter-variant" size="20" color="primary" class="me-2" />
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-3">Filter Attributes</span>
              </div>
              
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="attr in comparisonAttributes"
                  :key="attr.key"
                  :variant="visibleAttributes.includes(attr.key) ? 'flat' : 'outlined'"
                  :color="visibleAttributes.includes(attr.key) ? 'primary' : 'default'"
                  size="small"
                  @click="toggleAttribute(attr.key)"
                  class="filter-chip"
                >
                  <v-icon 
                    v-if="visibleAttributes.includes(attr.key)" 
                    start 
                    size="16"
                  >
                    mdi-check
                  </v-icon>
                  {{ attr.label }}
                </v-chip>
              </div>
            </div>
            
            <div class="d-flex ga-2">
              <v-btn
                variant="text"
                prepend-icon="mdi-checkbox-multiple-marked"
                size="small"
                color="primary"
                @click="selectAllAttributes"
              >
                Select All
              </v-btn>
              <v-btn
                variant="text"
                prepend-icon="mdi-close-box-multiple"
                size="small"
                @click="clearAllAttributes"
              >
                Clear All
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Loading State -->
        <v-card v-if="loading" elevation="0" rounded="xl">
          <v-card-text class="pa-12">
            <v-skeleton-loader 
              type="table-heading, table-row-divider@4" 
              class="skeleton-custom"
            />
          </v-card-text>
        </v-card>

        <!-- Comparison Table -->
        <v-card v-else-if="recordsToCompare.length > 0" elevation="0" rounded="xl" class="comparison-card">
          <div class="table-container">
            <table class="comparison-table">
              <!-- Header -->
              <thead>
                <tr class="header-row">
                  <th class="sticky-header attribute-header">
                    <div class="header-content">
                      <v-icon size="18" class="me-2 text-grey-darken-2">mdi-format-list-bulleted</v-icon>
                      <span class="text-subtitle-2 font-weight-bold">Attribute</span>
                    </div>
                  </th>
                  <th 
                    v-for="(record, index) in recordsToCompare" 
                    :key="record.id" 
                    class="record-header"
                    :style="{ backgroundColor: getHeaderColor(index) }"
                  >
                    <div class="record-header-content">
                      <!-- Title & Authors -->
                      <div class="mb-3">
                        <a 
                          href="#" 
                          class="record-title-link"
                          :class="{ 'title-truncated': !record.isHeaderExpanded }"
                          @click.prevent
                        >
                          {{ record.title }}
                        </a>
                        <div class="text-caption text-grey-darken-1 mt-1">
                          <v-icon size="14" class="me-1">mdi-account</v-icon>
                          {{ record.authors }}
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="d-flex align-center ga-2">
                        <v-btn
                          size="small"
                          variant="text"
                          color="primary"
                          @click="record.isHeaderExpanded = !record.isHeaderExpanded"
                          class="text-none expand-btn"
                        >
                          {{ record.isHeaderExpanded ? 'Show less' : 'Show more' }}
                        </v-btn>
                        <v-spacer />
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="removeRecord(record.id)"
                        >
                          <v-icon size="18">mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>

              <!-- Body -->
              <tbody>
                <!-- Simple Attributes -->
                <tr v-for="(attr, attrIndex) in filteredAttributes" :key="attr.key" class="data-row">
                  <td class="sticky-col attribute-cell">
                    <div class="attribute-label-wrapper">
                      <v-icon 
                        v-if="attr.highlight" 
                        size="16" 
                        class="me-2"
                        :color="attr.highlight === 'max' ? 'success' : 'warning'"
                      >
                        {{ attr.highlight === 'max' ? 'mdi-trending-up' : 'mdi-trending-down' }}
                      </v-icon>
                      <span class="attribute-label">{{ attr.label }}</span>
                    </div>
                  </td>
                  <td 
                    v-for="(record, index) in recordsToCompare" 
                    :key="record.id" 
                    class="data-cell"
                    :class="{ 'alt-row': attrIndex % 2 === 1 }"
                  >
                    <div class="cell-wrapper">
                      <!-- Best Value Highlight -->
                      <v-chip 
                        v-if="attr.highlight && isBestValue(attr.key, record[attr.key])" 
                        color="success" 
                        variant="flat" 
                        size="small"
                        class="best-chip"
                      >
                        <v-icon start size="16">mdi-star</v-icon>
                        {{ record[attr.key] }}
                      </v-chip>
                      
                      <!-- Confidence Badge -->
                      <v-chip 
                        v-else-if="attr.type === 'confidence'" 
                        :color="getConfidenceColor(record[attr.key])" 
                        variant="tonal" 
                        size="small"
                        class="confidence-chip"
                      >
                        {{ record[attr.key] }}
                      </v-chip>
                      
                      <!-- Regular Value -->
                      <span v-else class="regular-value">{{ record[attr.key] || 'N/A' }}</span>
                    </div>
                  </td>
                </tr>

                <!-- Study Types -->
                <tr v-if="isAttributeVisible('studyTypes')" class="data-row">
                  <td class="sticky-col attribute-cell">
                    <div class="attribute-label-wrapper">
                      <v-icon size="16" class="me-2" color="info">mdi-chart-bar</v-icon>
                      <span class="attribute-label">Study Types</span>
                    </div>
                  </td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="data-cell">
                    <div class="cell-wrapper">
                      <div class="study-types-wrapper">
                        <div class="study-type-item">
                          <span class="study-type-label">RCT</span>
                          <v-chip size="x-small" variant="tonal" color="primary">
                            {{ record.studyTypes.rct }}
                          </v-chip>
                        </div>
                        <div class="study-type-item">
                          <span class="study-type-label">NRSI</span>
                          <v-chip size="x-small" variant="tonal" color="secondary">
                            {{ record.studyTypes.nrsi }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Diseases -->
                <tr v-if="isAttributeVisible('diseases')" class="data-row">
                  <td class="sticky-col attribute-cell">
                    <div class="attribute-label-wrapper">
                      <v-icon size="16" class="me-2" color="error">mdi-medical-bag</v-icon>
                      <span class="attribute-label">Diseases</span>
                    </div>
                  </td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="data-cell">
                    <div class="cell-wrapper chip-cell">
                      <v-chip-group v-if="record.diseases.length > 0" column class="chip-group-centered">
                        <v-chip 
                          v-for="disease in record.diseases" 
                          :key="disease" 
                          size="small"
                          variant="tonal"
                          color="blue-grey"
                        >
                          {{ replaceWithMapper(disease) }}
                        </v-chip>
                      </v-chip-group>
                      <span v-else class="empty-value">None</span>
                    </div>
                  </td>
                </tr>

                <!-- Notes -->
                <tr v-if="isAttributeVisible('notes')" class="data-row">
                  <td class="sticky-col attribute-cell">
                    <div class="attribute-label-wrapper">
                      <v-icon size="16" class="me-2" color="warning">mdi-note-text</v-icon>
                      <span class="attribute-label">Notes</span>
                    </div>
                  </td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="data-cell">
                    <div class="cell-wrapper chip-cell">
                      <v-chip-group v-if="record.notes.length > 0" column class="chip-group-centered">
                        <v-chip 
                          v-for="note in record.notes" 
                          :key="note" 
                          size="small"
                          variant="outlined"
                        >
                          {{ replaceWithMapper(note) }}
                        </v-chip>
                      </v-chip-group>
                      <span v-else class="empty-value">None</span>
                    </div>
                  </td>
                </tr>

                <!-- Topics -->
                <tr v-if="isAttributeVisible('topic_notes')" class="data-row">
                  <td class="sticky-col attribute-cell">
                    <div class="attribute-label-wrapper">
                      <v-icon size="16" class="me-2" color="primary">mdi-tag-multiple</v-icon>
                      <span class="attribute-label">Topics</span>
                    </div>
                  </td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="data-cell">
                    <div class="cell-wrapper chip-cell">
                      <v-chip-group v-if="record.topic_notes.length > 0" column class="chip-group-centered">
                        <v-chip 
                          v-for="note in record.topic_notes" 
                          :key="note" 
                          size="small"
                          variant="tonal"
                          color="primary"
                        >
                          {{ replaceWithMapper(note) }}
                        </v-chip>
                      </v-chip-group>
                      <span v-else class="empty-value">None</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card>

        <!-- Empty State -->
        <v-card v-else elevation="0" rounded="xl">
          <v-card-text class="pa-16 text-center">
            <div class="empty-state">
              <v-icon icon="mdi-file-compare" size="80" color="grey-lighten-1" />
              <h2 class="text-h5 mt-6 font-weight-bold text-grey-darken-2">No Records Selected</h2>
              <p class="text-body-1 text-grey mt-3 mb-8" style="max-width: 400px; margin-left: auto; margin-right: auto;">
                Start by selecting records from the dashboard to compare their details side by side
              </p>
              <v-btn 
                color="primary" 
                variant="flat" 
                size="large" 
                prepend-icon="mdi-view-dashboard"
                @click="router.push('/')"
              >
                Go to Dashboard
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface ComparisonRecord {
  id: number;
  title: string;
  authors: string;
  year: number | string;
  country: string;
  publication_date: string;
  date_of_literature_search: string;
  studyTypes: { rct: number; nrsi: number };
  targetPopulation: string;
  notes: string[];
  topic_notes: string[];
  diseases: string[];
  confidence: string;
  isHeaderExpanded: boolean;
  [key: string]: any; // Index signature for dynamic access
}

interface ComparisonAttribute {
  label: string;
  key: string;
  highlight?: 'max' | 'min';
  reason?: string;
  type?: string;
}

// ==========================================
// STATE & ROUTING
// ==========================================

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const recordsToCompare = ref<ComparisonRecord[]>([]);

// ==========================================
// COMPARISON ATTRIBUTES CONFIGURATION
// ==========================================

const comparisonAttributes = ref<ComparisonAttribute[]>([
  { label: 'Publication Year', key: 'year', highlight: 'max', reason: 'Most recent publication' },
  { label: 'Country', key: 'country' },
  { label: 'Publication Date', key: 'publication_date' },
  { label: 'Last Literature Search', key: 'date_of_literature_search' },
  { label: 'Overall Confidence', key: 'confidence', type: 'confidence' },
  { label: 'Study Types', key: 'studyTypes' },
  { label: 'Target Population', key: 'targetPopulation' },
  { label: 'Diseases', key: 'diseases' },
  { label: 'Notes', key: 'notes' },
  { label: 'Topics', key: 'topic_notes' },
]);

const visibleAttributes = ref<string[]>(comparisonAttributes.value.map(a => a.key));

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const replaceWithMapper = (key: string): string => {
  return mapper[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString || typeof authorsString !== 'string') return [];
  try {
    return authorsString
      .trim()
      .split(/[,;]/)
      .map(a => a.trim().replace(/['"\[\]]/g, ''))
      .filter(Boolean);
  } catch { 
    return []; 
  }
};

const formatAuthors = (authors: string[]): string => {
  if (!Array.isArray(authors) || authors.length === 0) return 'Unknown Authors';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return authors.join(' & ');
  return `${authors[0]} et al.`;
};

const stringToList = (str?: string): string[] => {
  if (typeof str !== 'string' || !str) return [];
  return str.split(',').map(item => item.trim()).filter(Boolean);
};

const getHeaderColor = (index: number): string => {
  const colors = [
    'rgba(25, 118, 210, 0.04)',  // Blue
    'rgba(76, 175, 80, 0.04)',   // Green
    'rgba(255, 152, 0, 0.04)',   // Orange
    'rgba(156, 39, 176, 0.04)',  // Purple
  ];
  return colors[index % colors.length];
};

const getConfidenceColor = (confidence: string): string => {
  const mapping: { [key: string]: string } = { 
    'High': 'success', 
    'Moderate': 'warning', 
    'Low': 'error',
    'Critically Low': 'error'
  };
  return mapping[confidence] || 'grey';
};

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const manuallyHandledKeys = ['studyTypes', 'diseases', 'notes', 'topic_notes'];

const filteredAttributes = computed(() => {
  return comparisonAttributes.value.filter(attr => 
    visibleAttributes.value.includes(attr.key) && 
    !manuallyHandledKeys.includes(attr.key)
  );
});

const bestValues = computed(() => {
  if (recordsToCompare.value.length < 2) return {};
  
  const best: { [key: string]: number } = {};
  
  comparisonAttributes.value.forEach(attr => {
    if (attr.highlight) {
      const values = recordsToCompare.value
        .map(r => Number(r[attr.key]))
        .filter(v => !isNaN(v) && v !== 0);
      
      if (values.length > 0) {
        best[attr.key] = attr.highlight === 'max' 
          ? Math.max(...values) 
          : Math.min(...values);
      }
    }
  });
  
  return best;
});

// ==========================================
// UI METHODS
// ==========================================

const isAttributeVisible = (key: string): boolean => {
  return visibleAttributes.value.includes(key);
};

const isBestValue = (key: string, value: any): boolean => {
  const numValue = Number(value);
  return !isNaN(numValue) && bestValues.value[key] === numValue;
};

const toggleAttribute = (key: string): void => {
  const index = visibleAttributes.value.indexOf(key);
  if (index > -1) {
    visibleAttributes.value.splice(index, 1);
  } else {
    visibleAttributes.value.push(key);
  }
};

const selectAllAttributes = (): void => {
  visibleAttributes.value = comparisonAttributes.value.map(a => a.key);
};

const clearAllAttributes = (): void => {
  visibleAttributes.value = [];
};

const removeRecord = (idToRemove: number): void => {
  recordsToCompare.value = recordsToCompare.value.filter(r => r.id !== idToRemove);
  const updatedIds = recordsToCompare.value.map(r => r.id).join(',');
  router.replace({ query: { ids: updatedIds || undefined } });
};

// ==========================================
// DATA FETCHING
// ==========================================

onMounted(async () => {
  const idsQuery = route.query.ids;
  
  // Validate query parameter
  if (typeof idsQuery !== 'string' || !idsQuery) {
    console.warn('⚠️ No IDs in query parameter');
    loading.value = false;
    return;
  }
  
  // Parse IDs
  const ids = idsQuery.split(',').map(Number).filter(id => !isNaN(id));
  
  if (ids.length === 0) {
    console.warn('⚠️ No valid IDs found');
    loading.value = false;
    return;
  }

  console.log('🔍 Fetching comparison data for IDs:', ids);

  try {
    const response = await axios.get('http://0.0.0.0:5400/api/v1/api/compare', { 
      params: { ids: ids.join(',') } 
    });
    
    console.log('📦 API Response:', response.data);
    
    const apiRecords = response.data?.data;

    if (Array.isArray(apiRecords) && apiRecords.length > 0) {
      recordsToCompare.value = apiRecords.map((record: any): ComparisonRecord => ({
        id: record.primary_id,
        title: record.title || 'Untitled',
        authors: formatAuthors(safeParseAuthors(record.authors)),
        year: record.year || 'N/A',
        country: (record.country || 'N/A').replace(/[\[\]']/g, ''),
        publication_date: record.date || 'N/A',
        date_of_literature_search: record.lit_search_dates__hash__dates__hash__dates || 'N/A',
        notes: stringToList(record.notes),
        diseases: stringToList(record.research_notes),
        topic_notes: stringToList(record.topic_notes),
        targetPopulation: record.target_population_in_title || 'N/A',
        studyTypes: { 
          rct: record.total_rct_count || 0, 
          nrsi: record.total_nrsi_count || 0 
        },
        isHeaderExpanded: false,
        confidence: record.amstar_label || 'N/A',
      }));
      
      console.log('✅ Successfully loaded', recordsToCompare.value.length, 'records');
    } else {
      console.warn('⚠️ API returned empty or invalid data');
      recordsToCompare.value = [];
    }
  } catch (error) {
    console.error('❌ Failed to fetch comparison data:', error);
    if (axios.isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    recordsToCompare.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.v-application {
  font-family: 'Inter', sans-serif !important;
}

/* Filter Chips */
.filter-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Table Container */
.comparison-card {
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.table-container {
  overflow-x: auto;
  overflow-y: visible;
}

/* Table */
.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
}

/* Header Row */
.header-row {
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
}

.sticky-header {
  position: sticky;
  left: 0;
  z-index: 20;
  background: linear-gradient(to bottom, #fafafa, #f5f5f5);
}

.attribute-header {
  width: 220px;
  min-width: 220px;
  padding: 24px !important;
  border-right: 2px solid #e0e0e0;
  border-bottom: 2px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: center;
}

.record-header {
  min-width: 320px;
  max-width: 380px;
  padding: 24px !important;
  border-bottom: 2px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
}

.record-header:hover {
  background-color: rgba(0, 0, 0, 0.02) !important;
}

/* Record Header Content */
.record-header-content {
  display: flex;
  flex-direction: column;
}

.record-title-link {
  font-size: 15px;
  font-weight: 600;
  color: #1976d2;
  text-decoration: none;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
}

.title-truncated {
  -webkit-line-clamp: 2;
}

.record-title-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

.expand-btn {
  min-width: auto !important;
}

/* Data Rows */
.data-row {
  transition: background-color 0.15s ease;
}

.data-row:hover {
  background-color: rgba(0, 0, 0, 0.01);
}

.data-row:hover .sticky-col {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Sticky Column */
.sticky-col {
  position: sticky;
  left: 0;
  z-index: 10;
  background: white;
  transition: background-color 0.15s ease;
}

/* Attribute Cell */
.attribute-cell {
  width: 220px;
  min-width: 220px;
  padding: 20px 24px !important;
  border-right: 2px solid #e0e0e0;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.attribute-label-wrapper {
  display: flex;
  align-items: center;
}

.attribute-label {
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  line-height: 1.4;
}

/* Data Cell */
.data-cell {
  min-width: 320px;
  max-width: 380px;
  padding: 20px 24px !important;
  border-bottom: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
  vertical-align: middle;
}

.alt-row {
  background-color: rgba(0, 0, 0, 0.01);
}

/* Cell Wrapper */
.cell-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.chip-cell {
  align-items: flex-start;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Values */
.regular-value {
  font-size: 14px;
  font-weight: 500;
  color: #616161;
  text-align: center;
}

.empty-value {
  font-size: 13px;
  color: #9e9e9e;
  font-style: italic;
}

/* Chips */
.best-chip {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.confidence-chip {
  font-weight: 600;
}

.chip-group-centered {
  justify-content: center;
}

/* Study Types */
.study-types-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.study-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.study-type-label {
  font-size: 13px;
  font-weight: 600;
  color: #616161;
  min-width: 40px;
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
}

/* Scrollbar */
.table-container::-webkit-scrollbar {
  height: 10px;
}

.table-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

/* Skeleton Loader */
.skeleton-custom {
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 1280px) {
  .record-header,
  .data-cell {
    min-width: 280px;
  }
}
</style>
