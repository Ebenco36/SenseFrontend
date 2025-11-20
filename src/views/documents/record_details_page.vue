<template>
  <v-app>
    <v-main class="bg-grey-lighten-5">
      <!-- Loading State -->
      <v-container v-if="state.isLoading" class="d-flex justify-center align-center" style="min-height: 80vh;">
        <div class="text-center">
          <v-progress-circular indeterminate color="primary" :size="64" :width="6" />
          <p class="mt-6 text-h6 text-grey-darken-1">Loading record...</p>
        </div>
      </v-container>

      <!-- Record Content -->
      <v-container v-else-if="record" class="py-8" style="max-width: 1400px;">
        <!-- Back Button -->
        <v-btn
          to="/"
          variant="text"
          prepend-icon="mdi-arrow-left"
          class="mb-6"
          color="grey-darken-2"
        >
          Back to Dashboard
        </v-btn>

        <!-- Header Section -->
        <v-card class="mb-6" elevation="0" rounded="lg">
          <v-card-text class="pa-8">
            <!-- Title & Meta -->
            <div class="mb-6">
              <h1 class="text-h4 font-weight-bold text-grey-darken-4 mb-3" style="line-height: 1.3;">
                {{ record.title }}
              </h1>
              <div class="d-flex align-center flex-wrap ga-3 text-body-1">
                <span class="text-grey-darken-2">
                  <v-icon icon="mdi-account-multiple" size="20" class="me-1" />
                  {{ record.authors }}
                </span>
                <v-divider vertical class="mx-2" style="height: 20px;" />
                <span class="text-grey-darken-2">
                  <v-icon icon="mdi-calendar" size="20" class="me-1" />
                  {{ record.year }}
                </span>
                <v-divider v-if="record.journal" vertical class="mx-2" style="height: 20px;" />
                <span v-if="record.journal" class="text-grey-darken-2">
                  <v-icon icon="mdi-book-open-page-variant" size="20" class="me-1" />
                  {{ record.journal }}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap ga-3">
              <v-btn 
                v-if="record.doiUrl && record.doiUrl !== '#'"
                :href="record.doiUrl" 
                target="_blank" 
                color="primary" 
                variant="flat"
                prepend-icon="mdi-open-in-new"
                size="large"
              >
                View Document
              </v-btn>
              <v-btn 
                v-if="record.pdfUrl" 
                :href="record.pdfUrl" 
                target="_blank" 
                color="primary" 
                variant="tonal"
                prepend-icon="mdi-download"
                size="large"
              >
                Download PDF
              </v-btn>
              <v-btn 
                variant="outlined" 
                prepend-icon="mdi-compare-horizontal"
                size="large"
                @click="state.showComparisonModal = true"
              >
                Compare
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-row>
          <!-- Left Column - Main Content -->
          <v-col cols="12" lg="8">
            <div class="d-flex flex-column ga-6">
              <!-- Abstract Card -->
              <v-card elevation="0" rounded="lg">
                <v-card-text class="pa-8">
                  <h2 class="text-h6 font-weight-bold mb-4">Abstract</h2>
                  <p class="text-body-1 text-grey-darken-2" style="line-height: 1.8;">
                    {{ displayedAbstract }}
                    <a 
                      v-if="isAbstractLong" 
                      href="#" 
                      class="read-more-link ms-1"
                      @click.prevent="state.isAbstractExpanded = !state.isAbstractExpanded"
                    >
                      {{ state.isAbstractExpanded ? 'Show less' : 'Show more' }}
                    </a>
                  </p>
                </v-card-text>
              </v-card>

              <!-- Study Details Card -->
              <v-card elevation="0" rounded="lg">
                <v-card-text class="pa-8">
                  <!-- Quick Stats -->
                  <div class="mb-6">
                    <h2 class="text-h6 font-weight-bold mb-4">Study Overview</h2>
                    <v-row>
                      <v-col cols="6" sm="3">
                        <div class="stat-box">
                          <div class="stat-value">{{ record.numberOfStudies }}</div>
                          <div class="stat-label">Studies</div>
                        </div>
                      </v-col>
                      <v-col cols="6" sm="3">
                        <div class="stat-box">
                          <div class="stat-value">{{ record.databases.length }}</div>
                          <div class="stat-label">
                            <span 
                              class="clickable-label"
                              @click="openListDialog('Databases Searched', record.databases)"
                            >
                              Databases
                            </span>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="6" sm="3">
                        <div class="stat-box">
                          <div class="stat-value">{{ record.year }}</div>
                          <div class="stat-label">Published</div>
                        </div>
                      </v-col>
                      <v-col cols="6" sm="3">
                        <div class="stat-box">
                          <div class="stat-value">{{ record.dateOfLiteratureSearch }}</div>
                          <div class="stat-label">Last Search</div>
                        </div>
                      </v-col>
                    </v-row>
                  </div>

                  <v-divider class="my-6" />

                  <!-- Characteristics -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-4">Study Characteristics</h3>
                    <v-row dense>
                      <v-col cols="12" sm="6">
                        <div class="info-item">
                          <span class="info-label">Study Types</span>
                          <span class="info-value">{{ record.studyTypes }}</span>
                        </div>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <div class="info-item">
                          <span class="info-label">Countries</span>
                          <span class="info-value">{{ record.countryDistribution }}</span>
                        </div>
                      </v-col>
                      <v-col cols="12">
                        <div class="info-item">
                          <span class="info-label">Population Focus</span>
                          <span class="info-value">{{ record.population }}</span>
                        </div>
                      </v-col>
                    </v-row>
                  </div>

                  <v-divider class="my-6" />

                  <!-- Topics -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">Topics</h3>
                    <v-chip-group v-if="record.topics.length > 0">
                      <v-chip 
                        v-for="topic in record.topics" 
                        :key="topic" 
                        size="default"
                        variant="tonal"
                        color="primary"
                      >
                        {{ topic }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-body-2 text-grey">No topics specified</p>
                  </div>

                  <v-divider class="my-6" />

                  <!-- Diseases -->
                  <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">Diseases</h3>
                    <v-chip-group v-if="record.diseases.length > 0">
                      <v-chip 
                        v-for="disease in record.diseases" 
                        :key="disease" 
                        size="default"
                        variant="tonal"
                        color="blue-grey"
                      >
                        {{ formatLabel(disease) }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-body-2 text-grey">No diseases specified</p>
                  </div>

                  <v-divider class="my-6" />

                  <!-- Notes -->
                  <div>
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">Notes</h3>
                    <v-chip-group v-if="record.notes.length > 0">
                      <v-chip 
                        v-for="note in record.notes" 
                        :key="note" 
                        size="default"
                        variant="outlined"
                      >
                        {{ formatLabel(note) }}
                      </v-chip>
                    </v-chip-group>
                    <p v-else class="text-body-2 text-grey">No notes available</p>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <!-- Right Column - Sidebar -->
          <v-col cols="12" lg="4">
            <div class="d-flex flex-column ga-6 sticky-sidebar">
              <!-- Publication Info Card -->
              <v-card elevation="0" rounded="lg">
                <v-card-text class="pa-6">
                  <h3 class="text-subtitle-1 font-weight-bold mb-4">Publication Details</h3>
                  
                  <div class="info-row">
                    <span class="info-row-label">Country</span>
                    <span class="info-row-value">{{ record.country || 'N/A' }}</span>
                  </div>
                  
                  <v-divider class="my-3" />
                  
                  <div class="info-row">
                    <span class="info-row-label">Date</span>
                    <span class="info-row-value">{{ record.publicationDate || 'N/A' }}</span>
                  </div>
                  
                  <v-divider class="my-3" />
                  
                  <div class="info-row">
                    <span class="info-row-label">Open Access</span>
                    <v-chip
                      v-if="record.openAccess && record.openAccess !== 'N/A'"
                      :color="getOpenAccessColor(record.openAccess)"
                      size="small"
                      variant="tonal"
                    >
                      {{ record.openAccess }}
                    </v-chip>
                    <span v-else class="info-row-value">N/A</span>
                  </div>
                </v-card-text>
              </v-card>

              <!-- AMSTAR 2 Quality Card -->
              <v-card elevation="0" rounded="lg">
                <v-card-text class="pa-6">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-subtitle-1 font-weight-bold">AMSTAR 2 Quality</h3>
                    <v-chip 
                      :color="getConfidenceColor(record.confidence)" 
                      size="default" 
                      variant="tonal"
                    >
                      {{ record.confidence }}
                    </v-chip>
                  </div>
                  
                  <p v-if="record.amstarMet" class="text-body-2 text-grey-darken-1 mb-4">
                    {{ record.amstarMet }} items met
                  </p>

                  <!-- AMSTAR Items -->
                  <div v-if="amstarQuestions.length > 0" class="amstar-items">
                    <div
                      v-for="item in amstarQuestions"
                      :key="item.id"
                      class="amstar-item"
                    >
                      <div class="d-flex align-start ga-3">
                        <v-icon 
                          :icon="getAmstarRating(item.id).icon" 
                          :color="getAmstarRating(item.id).color"
                          size="20"
                          class="mt-1"
                        />
                        <div class="flex-grow-1">
                          <p class="text-body-2 mb-1">{{ item.text }}</p>
                          <div class="d-flex align-center ga-2">
                            <span class="text-caption text-grey">{{ getAmstarRating(item.id).rating }}</span>
                            <v-btn
                              v-if="record.amstarDetails[item.id]"
                              size="x-small"
                              variant="text"
                              color="primary"
                              class="text-none px-1"
                              style="min-width: auto;"
                              @click="showAmstarDetails(item.id)"
                            >
                              Details
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p v-else class="text-center text-grey py-4 text-body-2">
                    No AMSTAR data available
                  </p>
                </v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Error State -->
      <v-container v-else class="text-center" style="min-height: 80vh; display: flex; align-items: center; justify-content: center;">
        <div>
          <v-icon size="80" color="grey">mdi-alert-circle-outline</v-icon>
          <h2 class="text-h5 mt-4 text-grey-darken-2">Record Not Found</h2>
          <p class="text-body-1 text-grey mt-2">The requested record could not be loaded.</p>
          <v-btn to="/" color="primary" class="mt-6" variant="flat" size="large">
            Go Back to Dashboard
          </v-btn>
        </div>
      </v-container>
    </v-main>

    <!-- List Dialog -->
    <v-dialog v-model="state.listDialog.visible" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="pa-6 text-h6 font-weight-bold">
          {{ state.listDialog.title }}
        </v-card-title>
        <v-divider />
        <v-list density="comfortable" class="py-0">
          <v-list-item
            v-for="(item, index) in state.listDialog.items"
            :key="index"
          >
            <v-list-item-title class="text-body-1">{{ item }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="state.listDialog.visible = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- AMSTAR Details Dialog -->
    <v-dialog v-model="state.amstarDialog.visible" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="pa-6 text-h6 font-weight-bold">
          Item {{ state.amstarDialog.id }} Details
        </v-card-title>
        <v-divider />
        <v-list density="comfortable" class="py-0">
          <v-list-item
            v-for="([question, answer], i) in Object.entries(state.amstarDialog.details)"
            :key="i"
          >
            <v-list-item-title class="text-body-2">
              {{ question }}
            </v-list-item-title>
            <template #append>
              <v-chip 
                :color="answer === 'Yes' ? 'success' : 'grey'" 
                size="small" 
                variant="tonal"
              >
                {{ answer }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="primary" variant="text" @click="state.amstarDialog.visible = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Comparison Modal -->
    <ComparisonModal 
      v-model="state.showComparisonModal" 
      :initial-selection="record"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';
import ComparisonModal from '@/components/ComparisonModal.vue';

// Types
interface Record {
  primaryId: number;
  title: string;
  authors: string;
  year: number | string;
  journal: string;
  abstract: string;
  doiUrl: string;
  pdfUrl: string | null;
  topics: string[];
  country: string;
  numberOfStudies: number | string;
  publicationDate: string;
  dateOfLiteratureSearch: string;
  publicationType: string;
  openAccess: string;
  notes: string[];
  diseases: string[];
  confidence: string;
  amstarRatings: Record<string, string>;
  amstarDetails: Record<string, any>;
  databases: string[];
  studyTypes: string;
  countryDistribution: string;
  population: string;
  amstarMet?: string | number;
}

interface AmstarQuestion {
  id: number;
  text: string;
}

// Configuration
const API_BASE = 'http://127.0.0.1:5400/api/v1';
const route = useRoute();

// State
const state = reactive({
  isLoading: true,
  isAbstractExpanded: false,
  showComparisonModal: false,
  listDialog: {
    visible: false,
    title: '',
    items: [] as string[]
  },
  amstarDialog: {
    visible: false,
    id: 0,
    details: {} as Record<string, any>
  }
});

const record = ref<Record | null>(null);
const amstarQuestions = ref<AmstarQuestion[]>([]);

// Helper Functions
const formatLabel = (label: string): string => {
  if (!label) return '';
  const mapped = mapper[label];
  if (mapped) return mapped;
  return label.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
};

const createDoiUrl = (doi: string): string => {
  if (!doi) return '#';
  const doiRegex = /10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = doi.match(doiRegex);
  return match ? `https://doi.org/${match[0]}` : '#';
};

const stringToList = (str?: string): string[] => {
  if (typeof str !== 'string' || !str) return [];
  return str.split(/[,;]/).map(item => item.trim()).filter(Boolean);
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

const getOpenAccessColor = (status: string): string => {
  return String(status).toLowerCase().includes('open access') ? 'success' : 'grey';
};

const getConfidenceColor = (confidence: string): string => {
  const normalized = (confidence || '').toLowerCase();
  if (normalized.includes('high')) return 'success';
  if (normalized.includes('moderate')) return 'warning';
  if (normalized.includes('low')) return 'error';
  return 'grey';
};

const getAmstarRating = (id: number): { rating: string; icon: string; color: string } => {
  if (!record.value) return { rating: 'N/A', icon: 'mdi-help-circle', color: 'grey' };
  
  const rating = record.value.amstarRatings[id.toString()] || 'N/A';
  const normalized = (rating || '').toLowerCase();
  
  if (normalized.includes('yes')) return { rating, icon: 'mdi-check-circle', color: 'success' };
  if (normalized.includes('partial')) return { rating, icon: 'mdi-alert-circle', color: 'warning' };
  if (normalized.includes('no')) return { rating, icon: 'mdi-close-circle', color: 'error' };
  return { rating, icon: 'mdi-help-circle', color: 'grey' };
};

// Computed Properties
const isAbstractLong = computed(() => (record.value?.abstract || '').length > 400);

const displayedAbstract = computed(() => {
  const text = record.value?.abstract || '';
  if (isAbstractLong.value && !state.isAbstractExpanded) {
    return `${text.substring(0, 400)}... `;
  }
  return text;
});

// Methods
const fetchRecord = async (id: string | string[]) => {
  state.isLoading = true;
  record.value = null;
  
  try {
    const response = await axios.get(`${API_BASE}/api/all_db/${id}`);
    const apiRecord = response.data.data;

    if (apiRecord && Object.keys(apiRecord).length > 0) {
      // Process AMSTAR ratings and details
      const ratings: Record<string, string> = {};
      const questions: AmstarQuestion[] = [];
      const details: Record<string, any> = {};
      
      for (const key in apiRecord) {
        const match = key.match(/^item_(\d+)_(.*)/);
        if (match && match[1] && match[2]) {
          const questionId = parseInt(match[1], 10);
          
          if (match[2].endsWith('details')) {
            try {
              details[questionId.toString()] = JSON.parse(apiRecord[key]);
            } catch (error) {
              console.error(`Failed to parse AMSTAR details for key: ${key}`, error);
            }
          } else {
            let questionText = match[2].replace(/_[a-f0-9]{8,}$/, '').replace(/_/g, ' ');
            questionText = questionText.charAt(0).toUpperCase() + questionText.slice(1) + '?';
            questions.push({ id: questionId, text: questionText });
            ratings[questionId.toString()] = apiRecord[key];
          }
        }
      }
      
      questions.sort((a, b) => a.id - b.id);
      amstarQuestions.value = questions;

      // Process topics with mapper
      const topicKeys = stringToList(apiRecord.topic_notes);
      const mappedTopics = topicKeys.map(key => formatLabel(key));

      // Build record object
      record.value = {
        primaryId: apiRecord.primary_id,
        title: apiRecord.title || 'Title not available',
        authors: formatAuthors(safeParseAuthors(apiRecord.authors)),
        year: apiRecord.year || 'N/A',
        journal: apiRecord.journal || 'N/A',
        abstract: apiRecord.abstract || 'No abstract provided.',
        doiUrl: createDoiUrl(apiRecord.doi),
        pdfUrl: apiRecord.pdf_url !== 'NULL' ? apiRecord.pdf_url : null,
        country: (apiRecord.country || '').replace(/[\[\]']/g, ''),
        numberOfStudies: apiRecord.total_study_count || 'N/A',
        publicationDate: apiRecord.date || 'N/A',
        dateOfLiteratureSearch: apiRecord.lit_search_dates__hash__dates__hash__dates || 'N/A',
        publicationType: apiRecord.publication_type || 'N/A',
        openAccess: apiRecord.open_access || 'N/A',
        notes: stringToList(apiRecord.notes),
        topics: mappedTopics,
        diseases: stringToList(apiRecord.research_notes),
        confidence: apiRecord.amstar_label || 'N/A',
        amstarRatings: ratings,
        amstarDetails: details,
        databases: apiRecord.database_count ? stringToList(apiRecord.database_count) : [],
        studyTypes: `RCT: ${apiRecord.total_rct_count || 0}, NRSI: ${apiRecord.total_nrsi_count || 0}`,
        countryDistribution: apiRecord.study_country__hash__countries__hash__countries || 'N/A',
        population: apiRecord.target_population_in_title || 'N/A',
        amstarMet: apiRecord.amstar_met ? stringToList(apiRecord.amstar_met).length : 0
      };
    } else {
      throw new Error('Record not found');
    }
  } catch (error) {
    console.error('Failed to fetch record details:', error);
    record.value = null;
  } finally {
    state.isLoading = false;
  }
};

const openListDialog = (title: string, items: string[]) => {
  state.listDialog.title = title;
  state.listDialog.items = items;
  state.listDialog.visible = true;
};

const showAmstarDetails = (id: number) => {
  if (record.value?.amstarDetails[id]) {
    state.amstarDialog.id = id;
    state.amstarDialog.details = record.value.amstarDetails[id];
    state.amstarDialog.visible = true;
  }
};

// Watchers
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchRecord(newId as string);
  }
}, { immediate: true });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.v-application {
  font-family: 'Inter', sans-serif !important;
}

/* Stat Box Styling */
.stat-box {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clickable-label {
  cursor: pointer;
  color: #1976d2;
  text-decoration: underline;
}

.clickable-label:hover {
  color: #1565c0;
}

/* Info Item Styling */
.info-item {
  padding: 12px 0;
}

.info-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Info Row Styling (Sidebar) */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-row-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.info-row-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Read More Link */
.read-more-link {
  color: #1976d2;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.read-more-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

/* AMSTAR Items */
.amstar-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.amstar-item {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.amstar-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* Scrollbar Styling */
.amstar-items::-webkit-scrollbar {
  width: 6px;
}

.amstar-items::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.amstar-items::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.amstar-items::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Sticky Sidebar */
.sticky-sidebar {
  position: sticky;
  top: 24px;
}

@media (max-width: 1279px) {
  .sticky-sidebar {
    position: static;
  }
}
</style>