<template>
  <v-app>
    <v-main class="bg-white-lighten-4">
      <v-container v-if="loading" class="d-flex justify-center align-center fill-height">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-container>

      <v-container v-else-if="record" class="py-10" style="max-width: 1280px;">

        <div class="mb-8">
          <h1 class="text-h4 text-md-h2 font-weight-bold text-blue-darken-4">{{ record.title }}</h1>
          <p class="text-h6 text-medium-emphasis mt-2">{{ record.authors }} ({{ record.year }})</p>
          <p class="text-body-2 text-grey-darken-1">{{ record.journal }}</p>

          <div class="mt-6 d-flex flex-wrap ga-2">
            <v-btn :href="record.documentUrl" target="_blank" color="primary" variant="flat"
              prepend-icon="mdi-link">View Document</v-btn>
            <v-btn :href="toFullUrl(record.pdfUrl)" target="_blank" color="primary" variant="flat"
              prepend-icon="mdi-download">Download PDF</v-btn>
            <v-btn variant="tonal" @click="comparisonModal = true" prepend-icon="mdi-compare-horizontal">Add to
              Compare</v-btn>
            <ComparisonModal v-model="comparisonModal" />
          </div>
        </div>

        <v-row>
          <v-col cols="12" md="8">
            <div class="d-flex flex-column ga-6">
              <v-card variant="outlined">
                <v-card-text class="pa-6">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <span class="detail-label">Date of last literature search:</span>
                        <span class="detail-value">{{ record.literatureSearch }}</span>
                      </div>
                      <div class="detail-item mt-4">
                        <span class="detail-label">Number of studies:</span>
                        <span class="detail-value">{{ record.numberOfStudies }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <!-- <div class="detail-item">
                        <span class="detail-label">No. of Database:</span>
                        <span class="detail-value">{{ record.dbCount }}</span>
                      </div>
                      <div class="detail-item mt-4">
                        <span class="detail-label">List of Databases:</span>
                        <span class="detail-value">{{ record.dbList.join(', ') }}</span>
                      </div> -->
                      <div class="detail-item mt-4">
                        <span class="detail-label">Outcome [Infection]:</span>
                        <span class="detail-value">{{ record.outcome }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text class="pa-6">
                  <h2 class="text-h6 font-weight-bold mb-4">Characteristics of included studies in review:</h2>
                  <div class="detail-item">
                    <span class="detail-label">Study Types:</span>
                    <span class="detail-value">RCT: {{ record.studyTypes.rct }}, NRSI: {{ record.studyTypes.nrsi }}</span>
                  </div>
                  <div class="detail-item mt-4">
                    <span class="detail-label">Country Distribution:</span>
                    <span class="detail-value">{{ record.countryDistribution }}</span>
                  </div>
                  <div class="detail-item mt-4">
                    <span class="detail-label">Population Focus / Health Status:</span>
                    <span class="detail-value">{{ record.population }}</span>
                  </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text class="pa-6">
                  <h2 class="text-h6 font-weight-bold mb-4">Diseases:</h2>
                  <v-chip-group>
                    <v-chip
                      size="small"
                      v-for="diseaseName in record.diseases"
                      :key="diseaseName"
                      color="blue-lighten-5"
                      text-color="blue-darken-2"
                    >{{ diseaseName }}</v-chip>
                  </v-chip-group>
                </v-card-text>
              </v-card>

              <v-card border flat>
                <v-card-title>Abstract</v-card-title>
                <v-card-text class="text-body-1" style="line-height: 1.75;">
                  <span>{{ displayedAbstract }}</span>
                  
                  <a 
                    v-if="isAbstractLong" 
                    href="#" 
                    class="read-more-link"
                    @click.prevent="isAbstractExpanded = !isAbstractExpanded"
                  >
                    {{ isAbstractExpanded ? 'Read Less' : 'Read More' }}
                  </a>
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="d-flex flex-column ga-6">
              <v-card border flat>
                <v-list>
                  <v-list-item title="Primary Topic" :subtitle="record.topic || 'N/A'"></v-list-item><v-divider></v-divider>
                  <v-list-item title="Publication Country" :subtitle="record.country || 'N/A'"></v-list-item><v-divider></v-divider>
                  <v-list-item title="Citation Count" :subtitle="record.studies || 'N/A'"></v-list-item><v-divider></v-divider>
                  <v-list-item title="Publication Date" :subtitle="record.publicationDate || 'N/A'"></v-list-item>
                  <v-divider></v-divider>
                  <v-list-item>
                    <v-list-item-title>Open Access</v-list-item-title>

                    <template v-slot:append>
                      <v-chip
                        v-if="record.openAccess && record.openAccess !== 'N/A'"
                        :color="getOpenAccessColor(record.openAccess)"
                        :text="record.openAccess == 'Open Access' ? 'OA' : 'N/A'"
                        size="small"
                        variant="tonal"
                        class="font-weight-bold"
                      ></v-chip>
                      <span v-else class="text-medium-emphasis text-body-2">N/A</span>
                    </template>
                  </v-list-item>

                </v-list>
              </v-card>

              <v-card border flat>
                <v-card-item>
                  <v-card-title>AMSTAR 2 Quality Assessment</v-card-title>
                  <v-card-subtitle>
                    Overall Confidence:
                    <v-chip :color="getConfidenceColor(record.confidence)" size="small" variant="tonal"
                      class="font-weight-bold ms-1">{{ record.confidence }}</v-chip>
                  </v-card-subtitle>
                </v-card-item>
                <v-divider></v-divider>
                <v-list lines="two" density="compact">
                  <div v-for="item in amstar2Questions" :key="item.id">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon :icon="getAmstarRating(item.id).icon" :color="getAmstarRating(item.id).color"
                          class="me-3"></v-icon>
                      </template>
                      <v-list-item-title>{{ item.text }}</v-list-item-title>
                      <v-list-item-subtitle>{{ getAmstarRating(item.id).rating }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-divider></v-divider>
                  </div>
                </v-list>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <v-container v-else class="text-center py-10">
        <v-icon size="80" color="grey-lighten-1">mdi-alert-circle-outline</v-icon>
        <h2 class="text-h5 mt-4">Record Not Found</h2>
        <p class="text-medium-emphasis">The requested record could not be loaded.</p>
        <v-btn to="/" color="primary" class="mt-6">Go Home</v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ComparisonModal from '@/components/ComparisonModal.vue';

// --- TYPE DEFINITIONS ---
interface Record {
  title: string; authors: string; year: number | string; journal: string; abstract: string;
  documentUrl: string; pdfUrl: string; topic: string; country: string; studies: number | string;
  publicationDate: string; literatureSearch: string; numberOfStudies: number | string;
  dbCount: number | string; dbList: string[]; outcome: string; studyTypes: { rct: number; nrsi: number };
  countryDistribution: string; population: string; diseases: string[]; openAccess: string;
  confidence: string; amstarRatings: Record<string, string>;
}

// --- STATE MANAGEMENT ---
const route = useRoute();
const loading = ref(true);
const comparisonModal = ref(false);
const record = ref<Record | null>(null);
const API_BASE_URL = 'http://0.0.0.0:5400';
const TRUNCATION_LENGTH = 400;
const isAbstractExpanded = ref(false);

const getOpenAccessColor = (status:any) => {
  // Add more keywords if your data has other "yes" values
  if (String(status).toLowerCase().includes('open access')) {
    return 'success';
  }
  return 'grey'; // Default color for other statuses
};

const isAbstractLong = computed(() => {
  return (record.value.abstract || '').length > TRUNCATION_LENGTH;
});

// Returns either the full or truncated abstract based on the expanded state
const displayedAbstract = computed(() => {
  const text = record.value.abstract || '';
  if (isAbstractLong.value && !isAbstractExpanded.value) {
    return `${text.substring(0, TRUNCATION_LENGTH)}... `;
  }
  return text;
});

// --- DATA FETCHING ---
const fetchRecord = async (id: string | string[]) => {
  loading.value = true;
  record.value = null; 
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/api/details/${id}`);
    const apiRecord = response.data.data;

    if (apiRecord) {
      record.value = {
        title: apiRecord.title || 'Title not available',
        authors: safeParseAuthors(apiRecord.authors),
        year: apiRecord.year || 'N/A',
        journal: apiRecord.journal || 'N/A',
        abstract: apiRecord.abstract || 'No abstract provided.',
        documentUrl: createDoiUrl(apiRecord.doi_only),
        pdfUrl: apiRecord.pdf_url || '#',
        country: apiRecord.country || 'N/A',
        studies: apiRecord.citation_count ?? 'N/A',
        publicationDate: apiRecord.date || 'N/A',
        numberOfStudies: apiRecord.citation_count ?? 'N/A',
        openAccess: apiRecord.open_access || 'N/A',
        literatureSearch: apiRecord.date || 'N/A',
        
        // --- Dummy data for fields not in API ---
        diseases: ['Influenza'],
        dbCount: 'N/A', dbList: [], outcome: 'Standard QIV', studyTypes: { rct: 0, nrsi: 0 },
        countryDistribution: apiRecord.Country || 'Nill',
        population: apiRecord.Cochrane_patient_population || 'Pregnant Women',
        topic: 'Influenza', confidence: 'Moderate',
        amstarRatings: {
          '1': 'Yes', '2': 'Yes', '3': 'No', '4': 'Partial Yes', '5': 'No', '6': 'Yes', '7': 'No', '8': 'Yes', 
          '9': 'Partial Yes', '10': 'Yes', '11': 'Yes', '12': 'No', '13': 'Yes', '14': 'Yes', '15': 'Not Applicable', '16': 'Yes'
        },
      };
    } else {
      throw new Error('Record not found in API response');
    }
  } catch (error) {
    console.error('Failed to fetch record details:', error);
    record.value = null;
  } finally {
    loading.value = false;
  }
};

// --- LIFECYCLE & WATCHERS ---
// This watcher correctly handles both the initial load and subsequent navigations.
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchRecord(newId);
  }
}, { immediate: true });


// --- STATIC & HELPER FUNCTIONS ---
function toFullUrl(pathOrUrl: string | null | undefined, baseUrl = 'https://www.cochranelibrary.com'): string {
  if (!pathOrUrl) return '#';
  if (pathOrUrl.toLowerCase().startsWith('http')) return pathOrUrl;
  try {
    return new URL(pathOrUrl, baseUrl).href;
  } catch (error) {
    return '#';
  }
}

const amstar2Questions = ref([
  { id: 1, text: 'PICO included?' }, { id: 2, text: 'Protocol registered?' }, { id: 3, text: 'Study designs explained?' },
  { id: 4, text: 'Comprehensive search?' }
]);

const getAmstarRating = (id: number): { rating: string; icon: string; color: string } => {
  const rating = record.value?.amstarRatings[id.toString()] || 'N/A';
  switch (rating) {
    case 'Yes': return { rating, icon: 'mdi-check-circle', color: 'success' };
    case 'Partial Yes': return { rating, icon: 'mdi-alert-circle', color: 'warning' };
    case 'No': return { rating, icon: 'mdi-close-circle', color: 'error' };
    default: return { rating, icon: 'mdi-help-circle', color: 'grey' };
  }
};

const getConfidenceColor = (confidence: string): string => {
  const mapping: { [key: string]: string } = { High: 'success', Moderate: 'warning', Low: 'error' };
  return mapping[confidence] || 'grey';
};

const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString) return [];
  try {
    return authorsString.trim().split(',').map(a => a.trim());
  } catch {
    return [];
  }
};

const formatAuthors = (authors: string[]): string => {
  if (!authors || authors.length === 0) return 'N/A';
  if (authors.length > 2) return `${authors[0]} et al.`;
  return authors.join(', ');
};

function createDoiUrl(doiOrUrl: string): string {
  if (!doiOrUrl) return '#';
  const doiRegex = /10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = doiOrUrl.match(doiRegex);
  return match ? `https://doi.org/${match[0]}` : '#';
}
</script>

<style scoped>
.detail-item { display: flex; flex-wrap: wrap; gap: 8px; }
.detail-label { font-weight: 600; }
.detail-value { color: #555; }
.read-more-link {
  color: #153a9d;
  font-weight: bold;
  text-decoration: none;
}
.read-more-link:hover {
  text-decoration: underline;
}
</style>