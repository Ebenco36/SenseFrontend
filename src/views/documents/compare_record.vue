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
          <v-table class="comparison-table">
            <thead>
              <tr>
                <th class="feature-column">
                  <span class="text-subtitle-1 font-weight-bold">Feature</span>
                </th>
                <th v-for="record in recordsToCompare" :key="record.id" class="text-center">
                  <div class="d-flex align-center justify-center">
                    <a href="#" class="text-subtitle-1 font-weight-bold result-title">{{ record.title }}</a>
                    <v-btn
                      icon="mdi-close-circle"
                      variant="text"
                      size="x-small"
                      class="ms-1"
                      @click="removeRecord(record.id)"
                    ></v-btn>
                  </div>
                  <div class="text-caption text-medium-emphasis">{{ record.authors }}</div>
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
              <tr v-if="isAttributeVisible('tags')">
                <td class="feature-column"><strong>Tags</strong></td>
                <td v-for="record in recordsToCompare" :key="record.id" class="text-center">
                   <v-chip-group center>
                    <v-chip v-for="tag in record.tags" :key="tag.text" :color="tag.color" size="small" variant="tonal">{{ tag.text }}</v-chip>
                  </v-chip-group>
                </td>
              </tr>
            </tbody>
          </v-table>
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

// --- TYPE DEFINITIONS ---
interface ComparisonRecord {
  id: number;
  title: string;
  authors: string;
  year: number | string;
  country: string;
  topic: string;
  quality: string;
  studies: number | string;
  confidence: string;
  amster2Flaws: number | string;
  tags: { text: string, color: string }[];
}

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
  
  // Ensure we have a valid string of IDs to send
  const ids = idsQuery.split(',').map(Number).filter(id => !isNaN(id));
  if (ids.length === 0) {
    loading.value = false;
    return;
  }

  try {
    // ✅ FIX: Changed to a GET request with IDs in the params
    const response = await axios.get('http://0.0.0.0:5400/api/v1/api/compare', {
      params: {
        ids: ids.join(',') // Axios will format this as ?ids=1,2,3
      }
    });
    const apiRecords = response.data?.data;

    if (Array.isArray(apiRecords)) {
      recordsToCompare.value = apiRecords.map((record: any) => ({
        id: record.primary_id,
        title: record.title,
        authors: formatAuthors(safeParseAuthors(record.authors)),
        year: record.year || 'N/A',
        country: record.country || 'N/A',
        studies: record.citation_count ?? 'N/A',
        // Dummy data for fields not in API
        topic: 'Influenza',
        quality: 'High',
        confidence: 'High',
        amster2Flaws: 1,
        tags: [ { text: 'Systematic Review', color: 'blue-lighten-4' }, { text: 'API Data', color: 'green-lighten-4' }]
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

const comparisonAttributes = ref([
  { label: 'Publication Year', key: 'year', highlight: 'max', reason: 'Most recent publication' },
  { label: 'Lead Country', key: 'country' },
  { label: 'Primary Topic', key: 'topic' },
  { label: 'Citation Count', key: 'studies', highlight: 'max', reason: 'Highest citation count' },
  { label: 'AMSTAR 2 Rating', key: 'quality', type: 'confidence' },
  { label: 'AMSTAR 2 Flaws', key: 'amster2Flaws', highlight: 'min', reason: 'Fewest methodological flaws' },
  { label: 'Overall Confidence', key: 'confidence', type: 'confidence' },
  { label: 'Tags', key: 'tags'},
]);

const visibleAttributes = ref(comparisonAttributes.value.map(a => a.key));

const filteredAttributes = computed(() => {
    return comparisonAttributes.value.filter(attr => visibleAttributes.value.includes(attr.key) && attr.key !== 'tags');
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

<style scoped>
.comparison-table th, .comparison-table td {
  vertical-align: top;
  padding: 16px !important;
  text-align: center;
}
.feature-column {
  width: 15%;
  min-width: 180px;
  background-color: #f9f9f9;
  font-weight: 500;
  text-align: left !important;
}
.result-title {
  color: #153a9d;
  text-decoration: none;
}
.result-title:hover {
  text-decoration: underline;
}
</style>