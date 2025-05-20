<template>
    <div class="meta-analysis-page">
      <!-- Page Header -->
      <v-toolbar flat color="primary" dark elevate-on-scroll>
        <v-toolbar-title class="text-h5 font-weight-bold">Meta Analysis Tool</v-toolbar-title>
      </v-toolbar>
  
      <v-container fluid class="py-6">
        <!-- Input & Results -->
        <v-row>
          <!-- Input Panel -->
          <v-col cols="12" md="7" class="d-flex align-items-stretch">
            <v-card elevation="3" class="pa-4">
              <v-card-title class="text-h6 font-weight-medium">Input Abstract / Text</v-card-title>
              <v-card-text>
                <v-textarea
                  v-model="form.text"
                  auto-grow
                  rows="10"
                  outlined
                  placeholder="Paste your abstract or full text here..."
                  class="text-body-1"
                />
              </v-card-text>
            </v-card>
          </v-col>
  
          <!-- Results Panel -->
          <v-col cols="12" md="5" class="d-flex align-items-stretch">
            <v-card elevation="3" class="pa-4">
              <v-card-title class="text-h6 font-weight-medium">Results</v-card-title>
              <v-divider class="my-2" />
              <v-card-text class="px-0">
                <div style="">
                  <v-row align="center" justify="center" v-if="loading">
                    <v-progress-circular indeterminate size="48" />
                  </v-row>
                  <pre v-else-if="results" class="text-body-2">{{ results }}</pre>
                  <div v-else class="text-center grey--text text-subtitle-2 mt-8">
                    No results to display.
                  </div>
                </div>
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn icon @click="clearResults" title="Clear results">
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
  
        <!-- Controls & Execute -->
        <v-row class="mt-6" align="center">
          <!-- Quick Toggles -->
          <v-col cols="12" md="8">
            <v-chip-group
              v-model="toggleGroup"
              multiple
              column
              class="d-flex flex-wrap"
            >
              <v-chip
                v-for="(label, key) in quickToggles"
                :key="key"
                outlined
                class="ma-2"
                @click="form.options[key] = !form.options[key]"
                :color="form.options[key] ? 'primary' : 'grey lighten-2'"
                text-color="form.options[key] ? 'white' : 'black'"
              >
                {{ label }}
              </v-chip>
            </v-chip-group>
          </v-col>
  
          <!-- Execute Button -->
          <v-col cols="12" md="4" class="text-right">
            <v-btn
              color="primary"
              large
              class="text-subtitle-1 font-weight-bold"
              @click="executeAnalysis"
            >
              Execute Analysis
            </v-btn>
          </v-col>
        </v-row>

      </v-container>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { VIcon } from 'vuetify/components';
  import { executeSUS } from '@/api/sus_test'
  
  const form = reactive({
    text: '',
    options: {
      lastSearch: false,
      topics: [],
      outcomes: [],
      intervention: false,
      amstarLabel: false,
      amstarFlaws: false,
      others: false
    }
  });
  
  const quickToggles = {
    lastSearch: 'Last Literature Search',
    intervention: 'Intervention',
    amstarLabel: 'AMSTAR Label',
    amstarFlaws: 'AMSTAR Flaws',
    outcomes: 'Outcomes',
    topics: 'Topics'
  };
  const toggleGroup = ref([]);
  
  const topics = [
    'effectiveness', 'safety', 'risk', 'coverage',
    'acceptance', 'administration', 'economic', 'modeling'
  ];
  const outcomes = ['infection', 'hospital', 'ICU', 'death'];
  
  const results = ref(null);
  const loading = ref(false);
  
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function clearResults() {
    results.value = null;
  }
  
  async function executeAnalysis() {
    loading.value = true;
    results.value = null;

    // Transform to FormData for backend compatibility
    const payload = new FormData();
    payload.append('context', form.text);
    Object.entries(form.options).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => payload.append(key, item));
      } else {
        payload.append(key, value);
      }
    });

    try {
      const response = await executeSUS(payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      results.value = response.data;
    } catch (err) {
      console.error('Error executing analysis:', err);
      results.value = { error: err.response?.data?.message || err.message };
    } finally {
      loading.value = false;
    }
  }
  </script>
  
  <style scoped>
  .meta-analysis-page {
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  v-toolbar {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  v-card {
    border-radius: 8px;
  }
  v-card-title {
    padding-bottom: 0;
  }
  v-card-text {
    padding-top: 0;
  }
  </style>
  