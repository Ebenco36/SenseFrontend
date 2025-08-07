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
            <v-btn :href="record.doi_url" target="_blank" color="primary" variant="flat"
              prepend-icon="mdi-link">View Document</v-btn>
            <v-btn v-if="record.pdfUrl" :href="toFullUrl(record.pdfUrl)" target="_blank" color="primary" variant="flat"
              prepend-icon="mdi-download">Download PDF</v-btn>
            <v-btn variant="tonal" @click="comparisonModal = true" prepend-icon="mdi-compare-horizontal">Add to
              Compare</v-btn>
            <ComparisonModal v-model="comparisonModal" :initial-selection="record" />
          </div>
        </div>

        <v-row>
          <v-col cols="12" md="8">
            <div class="d-flex flex-column ga-6">
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

              <v-card variant="outlined">
                <v-card-text class="pa-6">
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <span class="detail-label">Last Literature Search:</span>
                        <span class="detail-value detail-value-modal" @click="openDialog('Date of Last Literature Search', record.search_date_bert)">{{ record.dateOfLiteratureSearch }}</span>
                      </div>
                      <div class="detail-item mt-4">
                        <span class="detail-label">Number of Studies:</span>
                        <span class="detail-value detail-value-modal" @click="openDialog('Study Count', record.study_count_bert)">{{ record.numberOfStudies }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="detail-item">
                        <span class="detail-label">Databases Searched:</span>
                        <span class="detail-value detail-value-modal" @click="openDialog('Databases Searched', record.dbList)">{{ record.dbList.join(', ') }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>


                <!-- Dialog for list items -->
                    <v-dialog v-model="dialogVisible">
                      <v-card>
                        <v-card-title class="text-h6">
                          {{ dialogTitle }}
                        </v-card-title>
                        <v-card-text>
                          <v-list dense>
                            <v-list-item
                              v-for="(item, index) in dialogItems"
                              :key="index"
                            >
                              <v-list-item-content>
                                <v-list-item-title>{{ item }}</v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn text @click="dialogVisible = false">Close</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>

                <v-divider></v-divider>
                <v-card-text class="pa-6">
                  <h2 class="text-h6 font-weight-bold mb-4">Characteristics of Included Studies:</h2>
                  <div class="detail-item">
                    <span class="detail-label">Study Types:</span>
                    <span class="detail-value">{{ record.studyTypes }}</span>
                  </div>
                  <div class="detail-item mt-4">
                    <span class="detail-label">Country:</span>
                    <span class="detail-value">{{ record.countryDistribution }}</span>
                  </div>
                  <div class="detail-item mt-4">
                    <span class="detail-label">Population Focus:</span>
                    <span class="detail-value">{{ record.population }}</span>
                  </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text class="pa-6">
                  <h2 class="text-h6 font-weight-bold mb-4">Topics:</h2>
                  <v-chip-group>
                    <v-chip
                      size="small"
                      v-for="topicName in record.topic"
                      :key="topicName"
                    >{{ topicName }}</v-chip>
                  </v-chip-group>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-text class="pa-6">
                  <h2 class="text-h6 font-weight-bold mb-4">Diseases:</h2>
                  <v-chip-group>
                    <v-chip
                      size="small"
                      v-for="diseaseName in record.diseases"
                      :key="diseaseName"
                    >{{ replaceWithMapper(diseaseName) }}</v-chip>
                  </v-chip-group>
                </v-card-text>

                <v-divider></v-divider>
                <v-card-text class="pa-6">
                  <h2 class="text-h6 font-weight-bold mb-4">Notes:</h2>
                  <v-chip-group>
                    <v-chip
                      size="small"
                      v-for="note in record.notes"
                      :key="note"
                    >{{ replaceWithMapper(note) }}</v-chip>
                  </v-chip-group>
                </v-card-text>
              </v-card>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="d-flex flex-column ga-6">
              <v-card border flat>
                <v-list>
                  <v-list-item title="Publication Country" :subtitle="record.country || 'N/A'"></v-list-item>
                  <v-divider></v-divider>
                  <v-list-item title="Publication Date" :subtitle="record.publicationDate || 'N/A'"></v-list-item>
                  <v-divider></v-divider>
                  <v-list-item title="Open Access">
                    <template v-slot:append>
                      <v-chip
                        v-if="record.openAccess"
                        :color="getOpenAccessColor(record.openAccess)"
                        :text="record.openAccess"
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
                      <br />
                      <span v-if="record.amstar_met" class="text-body-2 ms-2">
                        AMSTAR 2 Met: {{ record.amstar_met }}
                      </span>
                  </v-card-subtitle>
                </v-card-item>
                <v-divider></v-divider>
                <v-list lines="two" density="compact" class="filter-options-container">
                  <div v-for="item in amstar2Questions" :key="item.id">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon :icon="getAmstarRating(item.id).icon" :color="getAmstarRating(item.id).color" class="me-3"></v-icon>
                      </template>
                      <v-list-item-title>{{ item.text }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <span>{{ getAmstarRating(item.id).rating }}</span>
                        <v-btn
                          v-if="record.amstarDetails[item.id]"
                          size="x-small"
                          variant="text"
                          color="primary"
                          class="ms-2 text-none"
                          @click="showDetails(item.id)"
                        >
                          Show Details
                        </v-btn>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <!-- <v-divider></v-divider> -->
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

    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title class="text-h6">
          Item {{ selectedDetails?.id }} Details
        </v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item
              v-for="([question, answer], i) in Object.entries(selectedDetails?.details || {})"
              :key="i"
            >
              <v-list-item-title class="text-body-2 font-weight-medium">{{ question }}</v-list-item-title>
              <template v-slot:append>
                <v-chip :color="answer === 'Yes' ? 'success' : 'grey'" size="small" variant="tonal">{{ answer }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';
import ComparisonModal from '@/components/ComparisonModal.vue';

// --- TYPE DEFINITIONS ---
interface Record {
  primary_id: number; title: string; authors: string; year: number | string; journal: string; abstract: string;
  documentUrl: string; pdfUrl: string | null; topic: string[]; country: string; numberOfStudies: number | string;
  publicationDate: string; dateOfLiteratureSearch: string; publicationType: string; openAccess: string;
  notes: string[]; researchNotes: string[]; diseases: string[]; confidence: string;
  amstarRatings: Record<string, string>; amstarDetails: Record<string, any>; dbList: string[]; studyTypes: string;
  countryDistribution: string; population: string; doi_url?: string; amstar_met?: string | number;
  participants_bert?: string; study_count_bert?: string; study_design_bert?: string; search_date_bert?: string;
}
interface AmstarQuestion { id: number; text: string; }


const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogItems = ref([])


function openDialog(title: string, items: any[]) {
  dialogTitle.value = title
  dialogItems.value = items
  dialogVisible.value = true
}

// --- STATE MANAGEMENT ---
const route = useRoute();
const loading = ref(true);
const comparisonModal = ref(false);
const record = ref<Record | null>(null);
const amstar2Questions = ref<AmstarQuestion[]>([]);
const API_BASE_URL = 'http://0.0.0.0:5400';
const isAbstractExpanded = ref(false);
const detailsDialog = ref(false);
const selectedDetails = ref<{ id: number, details: any } | null>(null);

// --- COMPUTED PROPERTIES ---
const isAbstractLong = computed(() => (record.value?.abstract || '').length > 400);
const displayedAbstract = computed(() => {
  const text = record.value?.abstract || '';
  if (isAbstractLong.value && !isAbstractExpanded.value) {
    return `${text.substring(0, 400)}... `;
  }
  return text;
});

// --- API & DATA LOGIC ---
const fetchRecord = async (id: string | string[]) => {
  loading.value = true;
  record.value = null; 
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/api/details/${id}`);
    const apiRecord = response.data.data;

    if (apiRecord) {
      const ratings: Record<string, string> = {};
      const questions: AmstarQuestion[] = [];
      const details: Record<string, any> = {};
      
      for (const key in apiRecord) {
        const match = key.match(/^item_(\d+)_(.*)/);
        if (match && match[1] && match[2]) {
          const questionId = parseInt(match[1], 10);
          if (match[2].endsWith('details')) {
            try { details[questionId.toString()] = JSON.parse(apiRecord[key]); }
            catch { console.error(`Failed to parse AMSTAR details for key: ${key}`); }
          } else {
            let questionText = match[2].replace(/_[a-f0-9]{8,}$/, '').replace(/_/g, ' ');
            questionText = questionText.charAt(0).toUpperCase() + questionText.slice(1) + '?';
            questions.push({ id: questionId, text: questionText });
            ratings[questionId.toString()] = apiRecord[key];
          }
        }
      }
      questions.sort((a, b) => a.id - b.id);
      amstar2Questions.value = questions;

      const topicKeys = stringToList(apiRecord.topic_notes);
      const mappedTopics = topicKeys.map(key => replaceWithMapper(key));

      record.value = {
        primary_id: apiRecord.primary_id,
        doi_url: "https://doi.org/" + apiRecord.doi || '',
        title: apiRecord.title || 'Title not available',
        authors: formatAuthors(safeParseAuthors(apiRecord.authors)),
        year: apiRecord.year || 'N/A',
        journal: apiRecord.journal || 'N/A',
        abstract: apiRecord.abstract || 'No abstract provided.',
        documentUrl: createDoiUrl(apiRecord.doi_only),
        pdfUrl: apiRecord.pdf_url !== 'NULL' ? apiRecord.pdf_url : null,
        country: (apiRecord.country || '').replace(/[\[\]']/g, ''),
        numberOfStudies: apiRecord.included_studies_qa || 'N/A',
        publicationDate: apiRecord.date || 'N/A',
        dateOfLiteratureSearch: apiRecord.lit_search_dates__hash__dates__hash__dates || 'N/A',
        publicationType: getLastItem(apiRecord.publication_type) || 'N/A',
        openAccess: apiRecord.open_access || 'N/A',
        notes: stringToList(apiRecord.notes),
        researchNotes: stringToList(apiRecord.research_notes),
        topic: mappedTopics,
        diseases: stringToList(apiRecord.research_notes),
        confidence: apiRecord.amstar_label || 'N/A',
        amstarRatings: ratings,
        amstarDetails: details,
        dbList: stringToList(apiRecord.databases_lists_qa),
        studyTypes: `RCT: ${apiRecord.rct_count_qa || 0}, NRSI: ${apiRecord.nrsi_count_qa || 0}`,
        countryDistribution: apiRecord.countries_of_study_qa || 'N/A',
        population: apiRecord.target_population_in_title || 'N/A',
        amstar_met: apiRecord?.amstar_met ? toList(apiRecord?.amstar_met)?.length : 0 || 'N/A',
        participants_bert: apiRecord.participants_bert ? toList(apiRecord.participants_bert) : [] || 'N/A',
        study_count_bert: apiRecord.study_count_bert ? toList(apiRecord.study_count_bert) : [] || 'N/A',
        study_design_bert: apiRecord.study_design_bert ? toList(apiRecord.study_design_bert) : [] || 'N/A',
        search_date_bert: apiRecord.search_date_bert ? toList(apiRecord.search_date_bert) : [] || 'N/A',
      };
    } else {
      throw new Error('Record not found');
    }
  } catch (error) {
    console.error('Failed to fetch record details:', error);
    record.value = null;
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
// --- LIFECYCLE & WATCHERS ---
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchRecord(newId as string);
  }
}, { immediate: true });


// --- HELPER FUNCTIONS ---
function toFullUrl(pathOrUrl?: string, baseUrl = 'http://0.0.0.0:5400'): string {
  if (!pathOrUrl || pathOrUrl.toLowerCase().startsWith('http')) return pathOrUrl || '#';
  try { return new URL(pathOrUrl, baseUrl).href; }
  catch (error) { return '#'; }
}

function createDoiUrl(doiOrUrl?: string): string {
  if (!doiOrUrl) return '#';
  const doiRegex = /10.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
  const match = doiOrUrl.match(doiRegex);
  return match ? `https://doi.org/${match[0]}` : '#';
}

function stringToList(str?: string, valueMapper?: Record<string, string>): string[] {
  if (typeof str !== 'string' || !str) return [];
  const list = str.split(/[,;]/).map(item => item.trim()).filter(Boolean);
  return valueMapper ? list.map(key => valueMapper[key] || key) : list;
}

function getLastItem(inputString?: string): string | undefined {
  if (typeof inputString !== 'string' || !inputString) return undefined;
  const items = inputString.split(';');
  const lastItem = items.pop();
  return lastItem ? lastItem.trim() : undefined;
}

const getOpenAccessColor = (status?: string): string => {
  return (status && String(status).toLowerCase().includes('open access')) ? 'success' : 'grey';
};

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

const getConfidenceColor = (confidence: string): string => {
  const normConfidence = (confidence || '').toLowerCase();
  if (normConfidence.includes('high')) return 'success';
  if (normConfidence.includes('moderate')) return 'warning';
  if (normConfidence.includes('low')) return 'error';
  return 'grey';
};

const getAmstarRating = (id: number): { rating: string; icon: string; color: string } => {
  if (!record.value) return { rating: 'N/A', icon: 'mdi-help-circle', color: 'grey' };
  const rating = record.value.amstarRatings[id.toString()] || 'N/A';
  const normalizedRating = (rating || '').toLowerCase();
  
  if (normalizedRating.includes('yes')) return { rating, icon: 'mdi-check-circle', color: 'success' };
  if (normalizedRating.includes('partial')) return { rating, icon: 'mdi-alert-circle', color: 'warning' };
  if (normalizedRating.includes('no')) return { rating, icon: 'mdi-close-circle', color: 'error' };
  return { rating, icon: 'mdi-help-circle', color: 'grey' };
};

const replaceWithMapper = (key: string): string => {
  return mapper[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const showDetails = (id: number) => {
  if (record.value?.amstarDetails[id]) {
    selectedDetails.value = { id, details: record.value.amstarDetails[id] };
    detailsDialog.value = true;
  }
};
</script>

<style scoped>
.detail-item { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.detail-label { font-weight: 600; color: #333; }
.detail-value { color: #555; }
.read-more-link { color: #1565C0; font-weight: bold; text-decoration: none; padding-left: 4px; }
.read-more-link:hover { text-decoration: underline; }
.filter-options-container {
  max-height: 400px;
  overflow-y: auto;
}
.detail-value-modal {
  cursor: pointer;
  color: #1976d2;
  text-decoration: underline;
}

</style>