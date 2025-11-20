<template>
  <div class="meta-analysis-pagesss">
    <v-row>
      <!-- Abstract Section -->
      <v-col cols="12" md="9" class="d-flex">
        <v-card outlined>
          <v-col cols="12" md="12" style="background-color: #1446a1; color: white">
            <h1 class="font-weight-bold" style="color: white">
              {{ journalInformation?.Title }}
            </h1>
            <span style="font-size: 12pt; float: right"
              >Publication year:
              {{ Number(journalInformation?.Year) ? Number(journalInformation?.Year) : Number(journalInformation?.Publication_Date) }}</span
            >
            <v-card-title class="font-weight-bold"> </v-card-title>
          </v-col>
          <v-card-text>
            <v-row>
              <v-col cols="6" md="6">
                <span class="font-weight-bold title">Date of last literature search: </span>
                <br />
                {{ journalInformation?.lit_search_dates__HASH__dates__HASH__dates }}
              </v-col>
              <v-col cols="6" md="6">
                <span class="font-weight-bold title">No. of Database:</span>
                <!-- <br /> -->
                {{ journalInformation?.num_databases }}
                <br />
                <span class="font-weight-bold title">List of Databases:</span>
                <!-- <br /> -->
                {{ journalInformation?.database_list }}
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="6" md="6">
                <span class="font-weight-bold title">Number of studies: </span>
                <br />{{ totalStudies }}
              </v-col>
              <v-col cols="6" md="6">
                <span class="font-weight-bold title">Outcome [Infection]: </span>
                <br />
                Standard QIV
              </v-col>
            </v-row>
            <v-divider thickness="5px" style="padding: 5px"></v-divider>
            <v-row>
              <v-col cols="12" md="12">
                <span class="font-weight-bold title">Characteristics of included studies in review:</span>
                <v-list-item>
                  <v-list-item-content>
                    <div>
                      Study Types: RCT: 0, NRSI: 0
                      <!-- {{ displayKeyValueString(journalInformation?.study_types) }} -->
                    </div>
                  </v-list-item-content>

                  <v-list-item-content>
                    <div>
                      Country Distribution:
                      {{
                        journalInformation?.study_country__HASH__countries__HASH__countries
                          ? journalInformation?.study_country__HASH__countries__HASH__countries
                          : 'Nill'
                      }}
                    </div>
                  </v-list-item-content>
                  <v-list-item-content>
                    <div>Population Focus / Health Status: Pregnant Women</div>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
            <v-divider thickness="2px" style="padding: 5px"></v-divider>
            <v-row>
              <v-col cols="6" md="6">
                <span class="font-weight-bold title">Diseases:</span>
                <v-list-item>
                  <v-list-item-content>
                    <div>
                      {{ journalInformation?.research_notes }}
                      <!-- Influenza -->
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-col>

              <v-col cols="6" md="6">
                <span class="font-weight-bold title">Notes:</span>
                <v-list-item>
                  <v-list-item-content>
                    <div>
                      {{ journalInformation?.notes }}
                      <!-- Influenza -->
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Information Card -->
      <v-col cols="12" md="3" class="d-flex">
        <v-card outlined>
          <v-card-title class="font-weight-bold">Information</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Amstar2 Rating:</v-list-item-title>
                  <v-list-item-subtitle>{{journalInformation?.amstar_label}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Amstar2 Flaws:</v-list-item-title>
                  <v-list-item-subtitle>{{journalInformation?.amstar_flaws}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Authors:</v-list-item-title>
                  <v-list-item-subtitle v-for="author in journalInformation?.Authors.split('., ')" :key="author">
                    {{ author }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Source(s):</v-list-item-title>
                  <v-list-item-subtitle>
                    <a :href="journalInformation?.DOI" target="_blank">
                      {{ journalInformation?.DOI }}
                    </a>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Open access:</v-list-item-title>
                  <v-list-item-subtitle>{{ journalInformation?.open_acc__HASH__opn_access__HASH__op_ac }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Literature search date:</v-list-item-title>
                  <v-list-item-subtitle>{{ journalInformation?.lit_search_dates__HASH__dates__HASH__dates }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Number of studies:</v-list-item-title>
                  <v-list-item-subtitle>{{ totalStudies }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>Publication year:</v-list-item-title>
                  <v-list-item-subtitle>{{
                    Number(journalInformation?.Year) ? Number(journalInformation?.Year) : Number(journalInformation?.Publication_Date)
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- </v-container> -->
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { fetchJournalinformation } from '@/api/journal';
import type { ResponseData } from '@/types/my-types/Journal';
import { ref, onMounted, computed } from 'vue';
import { mapper } from '@/services/index.js';

// Reactive state to hold the fetched journal information
const journalInformation = ref<ResponseData | null>(null);
const groupedData = ref({});
// Extract `id` from the route parameters
const route = useRoute();
const id = route.params.id as string | undefined; // Ensure `id` is typed correctly

function toPascalCase(str: string) {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const totalStudies = computed(() => {
  try {
    // const parsedData = journalInformation.value?.inclusions_exclusions ? JSON.parse(journalInformation.value?.study_types) : null;
    const parsedData2 = journalInformation.value?.study_types ? JSON.parse(journalInformation.value?.study_types) : null;
    // let res = parsedData?.total_studies ?? parsedData?.yielded ?? journalInformation.value?.total_study_count ?? 'N/A';
    let res = journalInformation.value?.total_study_count;
    if (res == 'N/A') {
      return parsedData2?.studies;
    } else {
      return res;
    }
  } catch (error) {
    console.error('Error parsing inclusions_exclusions JSON:', error);
    return journalInformation.value?.total_study_count ?? 'N/A';
  }
});

// Computed value to convert list into comma-separated string
const interventionList = computed(() => {
  const val = groupedData.value?.intervention;
  const raw = Array.isArray(val) ? val.join(', ') : val ?? '';
  return replaceWithMapper(raw);
});

function safeParseJSON(input: string) {
  try {
    if (!input || typeof input !== 'string') return {};

    // Attempt to fix common errors (this is very basic and limited)
    const fixed = input
      .replace(/([{,]\s*)["']?([^"':]+)["']?\s*:/g, '$1"$2":') // fix unquoted keys
      .replace(/:\s*([^"{}\[\],]+)(?=[,}])/g, (m, val) => {
        // Wrap unquoted values (if not a number or null/true/false)
        if (/^\d+(\.\d+)?$/.test(val) || ['true', 'false', 'null'].includes(val)) {
          return `: ${val}`;
        }
        return `: "${val.trim()}"`;
      });

    return JSON.parse(fixed);
  } catch (e) {
    console.error('Failed to parse/repair JSON:', e, '\nInput:', input);
    return {};
  }
}

function displayKeyValueString(input: any) {
  const obj = safeParseJSON(input);
  return Object.entries(obj)
    .map(([k, v]) => `${toPascalCase(k)}: ${v}`)
    .join(', ');
}

const loadInformation = async () => {
  if (!id) {
    console.error('Error: ID parameter is missing');
    return;
  }

  try {
    // Call the API to fetch journal information
    const response = await fetchJournalinformation(id);

    if (response.status === 'success') {
      // Store the fetched data in the `journalInformation` state
      journalInformation.value = response.data;
      if (journalInformation.value) {
        groupedData.value = groupKeysWithHash(journalInformation.value);
      }
    } else {
      // Handle API error responses
      console.error('Failed to fetch journal information:', response.message);
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Error loading journal information:', error);
  }
};

const replaceWithMapper = (key: string): string => {
  return mapper[key as keyof typeof mapper] ?? key.replace(/_/g, ' ');
};

interface GroupedData {
  [group: string]: { [key: string]: string | null }; // Group name maps to key-value pairs
}

// Function to group keys containing "_HASH_"
const groupKeysWithHash = (data: ResponseData) => {
  const excludedKeys = ['particip__HASH__group__HASH__members', 'studies__HASH__studie__no__HASH__sty'];

  const grouped: GroupedData = {};
  Object.keys(data).forEach((key) => {
    if (key.includes('_HASH_') && !excludedKeys.includes(key) && data[key] !== null && data[key] !== 'NaN') {
      const groupName = key.split('__HASH__')[0]; // Extract group prefix
      if (!grouped[groupName]) {
        grouped[groupName] = {};
      }
      grouped[groupName][key] = data[key] as string; // Safe cast since null and "NaN" are filtered
    }
  });

  // Further transform the grouped data
  type TransformedGrouped = {
    [key: string]: string[]; // or Set<string> if the values are sets
  };

  const transformedGrouped: TransformedGrouped = {};
  Object.entries(grouped).forEach(([groupName, values]) => {
    const extractedValues = Object.keys(values).map((key) => {
      const parts = key.split('__HASH__');
      return parts[parts.length - 1]; // Extract the last part
    });

    // Convert `Set` to an array for JSON compatibility
    if (groupName === 'topic') {
      transformedGrouped[groupName] = extractedValues;
    } else {
      transformedGrouped[groupName] = Array.from(new Set(extractedValues)); // Convert Set to array
    }
  });

  console.log(transformedGrouped);
  return transformedGrouped;
};

// Load journal information when the component is mounted
onMounted(() => {
  loadInformation();
});
</script>
<style scoped>
.meta-analysis-page {
  background-color: #f4f6fa;
}

h1 {
  color: #003e7e;
}

a {
  color: #153a9d;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
