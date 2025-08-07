<template>
  <v-app>
    <v-main class="bg-white-lighten-4">
      <v-container class="py-8" style="max-width: 1400px;">
        
        <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-6">
            <div>
                <div class="d-flex align-center">
                    <v-btn variant="text" icon="mdi-arrow-left" @click="router.back()"></v-btn>
                    <h1 class="text-h4 font-weight-bold ms-2">Compare Records</h1>
                </div>
                <p class="text-medium-emphasis ms-12">A side-by-side comparison of selected systematic reviews.</p>
            </div>
            <div style="min-width: 300px;">
                <v-select
                    v-model="visibleAttributes"
                    :items="comparisonAttributes"
                    item-title="label"
                    item-value="key"
                    label="Visible Attributes"
                    multiple
                    chips
                    closable-chips
                    variant="outlined"
                    density="compact"
                    hide-details
                ></v-select>
            </div>
        </div>

        <div v-if="loading">
            <v-skeleton-loader type="table-thead, table-tbody"></v-skeleton-loader>
        </div>

        <v-card v-else-if="recordsToCompare.length > 0" border flat>
          <div class="comparison-table-wrapper">
            <v-table class="comparison-table">
              <thead>
                <tr>
                  <th class="feature-column">
                    <span class="text-subtitle-1 font-weight-bold">Feature</span>
                  </th>
                  <th v-for="record in recordsToCompare" :key="record.id" class="text-center">
                    <div :class="{ 'text-truncate': !record.isHeaderExpanded }">
                      <a href="#" class="text-subtitle-1 font-weight-bold result-title">{{ record.title }}</a>
                      <div class="text-caption text-medium-emphasis">{{ record.authors }}</div>
                    </div>
                    <v-btn
                      size="x-small"
                      variant="text"
                      class="mt-1 text-none"
                      color="primary"
                      @click="record.isHeaderExpanded = !record.isHeaderExpanded"
                    >
                      {{ record.isHeaderExpanded ? 'Show Less' : 'Show More' }}
                    </v-btn>
                    <div>
                      <v-btn
                        icon="mdi-close-circle"
                        variant="text"
                        size="x-small"
                        @click="removeRecord(record.id)"
                      ></v-btn>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attr in filteredAttributes" :key="attr.key">
                  <td class="feature-column"><strong>{{ attr.label }}</strong></td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="text-center">
                    <v-tooltip :text="attr.reason" location="top" :disabled="!isBestValue(attr.key, record[attr.key])">
                      <template v-slot:activator="{ props }">
                        <v-chip v-bind="props" v-if="attr.highlight && isBestValue(attr.key, record[attr.key])" color="success" variant="flat" size="small">
                          {{ record[attr.key] }}
                        </v-chip>
                        <v-chip v-else-if="attr.type === 'confidence'" :color="getConfidenceColor(record[attr.key])" variant="tonal" size="small" class="font-weight-medium">
                          {{ record[attr.key] }}
                        </v-chip>
                        <span v-else class="text-body-2">{{ record[attr.key] || 'N/A' }}</span>
                      </template>
                    </v-tooltip>
                  </td>
                </tr>
                <tr v-if="isAttributeVisible('studyTypes')">
                  <td class="feature-column"><strong>Study Types</strong></td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="text-center">
                    <span class="text-body-2">RCT: {{ record.studyTypes.rct }}, NRSI: {{ record.studyTypes.nrsi }}</span>
                  </td>
                </tr>
                <tr v-if="isAttributeVisible('diseases')">
                  <td class="feature-column"><strong>Diseases</strong></td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="text-center">
                    <v-chip-group center>
                        <v-chip v-for="disease in record.diseases" :key="disease" size="small">{{ replaceWithMapper(disease) }}</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                <tr v-if="isAttributeVisible('notes')">
                  <td class="feature-column"><strong>Notes</strong></td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="text-center">
                    <v-chip-group center>
                        <v-chip v-for="note in record.notes" :key="note" size="small">{{ replaceWithMapper(note) }}</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
                <tr v-if="isAttributeVisible('topic_notes')">
                  <td class="feature-column"><strong>Topic Notes</strong></td>
                  <td v-for="record in recordsToCompare" :key="record.id" class="text-center">
                    <v-chip-group center>
                        <v-chip v-for="note in record.topic_notes" :key="note" size="small">{{ replaceWithMapper(note) }}</v-chip>
                    </v-chip-group>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card>

        <v-sheet v-else height="400" class="d-flex align-center justify-center text-center flex-column" border rounded>
            <v-icon icon="mdi-file-table-box-multiple-outline" size="64" class="text-medium-emphasis"></v-icon>
            <h2 class="text-h6 mt-4">Comparison is Empty</h2>
            <p class="text-medium-emphasis">No records are selected for comparison. Go back to select some.</p>
        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { mapper } from '@/services/index.js';

// --- TYPE DEFINITIONS ---
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
  // amster2Flaws: number | string;
  isHeaderExpanded: boolean;
}

const replaceWithMapper = (key: string): string => {
    return mapper[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// --- STATE & ROUTING ---
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const recordsToCompare = ref<ComparisonRecord[]>([]);

// --- DATA FETCHING ---
onMounted(async () => {
  const idsQuery = route.query.ids;
  if (typeof idsQuery !== 'string' || !idsQuery) {
    loading.value = false;
    return;
  }
  
  const ids = idsQuery.split(',').map(Number).filter(id => !isNaN(id));
  if (ids.length === 0) {
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get('http://0.0.0.0:5400/api/v1/api/compare', { params: { ids: ids.join(',') } });
    const apiRecords = response.data?.data;

    if (Array.isArray(apiRecords)) {
      recordsToCompare.value = apiRecords.map((record: any): ComparisonRecord => ({
        id: record.primary_id,
        title: record.title || 'N/A',
        authors: formatAuthors(safeParseAuthors(record.authors)),
        year: record.year || 'N/A',
        country: (record.country || '').replace(/[\[\]']/g, ''),
        publication_date: record.date || 'N/A',
        date_of_literature_search: record.lit_search_dates__hash__dates__hash__dates || 'N/A',
        notes: stringToList(record.notes),
        diseases: stringToList(record.research_notes),
        topic_notes: stringToList(record.topic_notes, mapper),
        targetPopulation: record.target_population_in_title || 'N/A',
        studyTypes: { rct: 0, nrsi: 0 }, // Placeholder
        isHeaderExpanded: false,
        confidence: record.amstar_label || 'N/A',
        // amster2Flaws: Math.floor(Math.random() * 5),
      }));
    }
  } catch (error) {
    console.error("Failed to fetch comparison data:", error);
    recordsToCompare.value = [];
  } finally {
    loading.value = false;
  }
});


// --- UI LOGIC & HELPERS ---
const removeRecord = (idToRemove: number) => {
    recordsToCompare.value = recordsToCompare.value.filter(r => r.id !== idToRemove);
    const updatedIds = recordsToCompare.value.map(r => r.id).join(',');
    router.replace({ query: { ids: updatedIds || undefined } });
};

// ✅ RESTORED: All attributes are now included for selection
const comparisonAttributes = ref([
  { label: 'Publication Year', key: 'year', highlight: 'max', reason: 'Most recent publication' },
  { label: 'Country', key: 'country' },
  { label: 'Publication Date', key: 'publication_date' },
  { label: 'Date of Last Literature Search', key: 'date_of_literature_search' },
  // { label: 'AMSTAR 2 Flaws', key: 'amster2Flaws', highlight: 'min', reason: 'Fewest methodological flaws' },
  { label: 'Overall Confidence', key: 'confidence', type: 'confidence' },
  { label: 'Study Types', key: 'studyTypes' },
  { label: 'Target Population', key: 'targetPopulation' },
  { label: 'Diseases', key: 'diseases' },
  { label: 'Notes', key: 'notes' },
  { label: 'Topics', key: 'topic_notes' },
]);

const visibleAttributes = ref(comparisonAttributes.value.map(a => a.key));

const manuallyHandledKeys = ['studyTypes', 'diseases', 'notes', 'topic_notes'];
const filteredAttributes = computed(() => {
    return comparisonAttributes.value.filter(attr => 
        visibleAttributes.value.includes(attr.key) && 
        !manuallyHandledKeys.includes(attr.key)
    );
});

const isAttributeVisible = (key: string) => visibleAttributes.value.includes(key);

const bestValues = computed(() => {
  if (recordsToCompare.value.length < 2) return {};
  const best: { [key: string]: number } = {};
  comparisonAttributes.value.forEach(attr => {
    if (attr.highlight) {
      const values = recordsToCompare.value.map(r => Number(r[attr.key])).filter(v => !isNaN(v));
      if (values.length > 0) {
        best[attr.key] = attr.highlight === 'max' ? Math.max(...values) : Math.min(...values);
      }
    }
  });
  return best;
});

const isBestValue = (key: string, value: any) => bestValues.value[key] === Number(value);

const getConfidenceColor = (confidence: string) => {
  const mapping: { [key: string]: string } = { High: 'success', Moderate: 'warning', Low: 'error' };
  return mapping[confidence] || 'grey';
};

const safeParseAuthors = (authorsString?: string): string[] => {
  if (!authorsString) return [];
  try {
    return authorsString.trim().split(/[,;]/).map(a => a.trim().replace(/['"\[\]]/g, '')).filter(Boolean);
  } catch { return []; }
};
const formatAuthors = (authors: string[]): string => {
  if (!Array.isArray(authors) || authors.length === 0) return 'N/A';
  if (authors.length > 1) return `${authors[0]} et al.`;
  return authors[0];
};

const stringToList = (str?: string, valueMapper?: Record<string, string>): string[] => {
  if (typeof str !== 'string' || !str) return [];
  const list = str.split(',').map(item => item.trim()).filter(Boolean);
  return valueMapper ? list.map(key => mapper[key] || key) : list;
};

</script>

<style scoped>
/* Scoped styles remain the same */
.comparison-table-wrapper { overflow-x: auto; }
.comparison-table { table-layout: fixed; width: 100%; }
.feature-column { width: 20%; min-width: 200px; background-color: #f9f9f9; font-weight: 500; text-align: left !important; vertical-align: top; padding: 16px !important; }
.comparison-table th, .comparison-table td { vertical-align: top; padding: 16px !important; text-align: center; word-break: break-word; border-left: 1px solid #e0e0e0; }
.comparison-table th:first-child, .comparison-table td:first-child { border-left: none; }
.text-truncate { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; max-height: 3.2em; line-height: 1.6em; }
.result-title { color: #1565C0; text-decoration: none; white-space: normal; }
.result-title:hover { text-decoration: underline; }
</style>