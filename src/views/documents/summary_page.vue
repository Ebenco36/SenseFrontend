<template>
  <v-app>
    <v-main >
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-h4 font-weight-bold mb-2">Visual Summary</h1>
          <p class="text-medium-emphasis">An interactive overview of systematic review papers.</p>
        </div>

        <!-- Year Range Filter -->
        <v-card border flat class="mb-6">
          <v-skeleton-loader v-if="isLoadingFilters" type="actions"></v-skeleton-loader>
          <v-card-text v-else>
            <v-label class="font-weight-medium mb-3">Filter by Publication Year</v-label>
            <v-range-slider 
              v-model="yearRange" 
              :min="minYear" 
              :max="maxYear" 
              :step="1" 
              thumb-label="always"
              color="primary"
              hide-details
            ></v-range-slider>
          </v-card-text>
        </v-card>

        <!-- Loading State -->
        <v-skeleton-loader v-if="isLoadingData" type="card@4, image, image"></v-skeleton-loader>

        <!-- Main Content -->
        <div v-else>
          <!-- Summary Statistics Cards -->
          <v-row class="mb-6">
            <v-col v-for="stat in summaryStats" :key="stat.title" cols="12" md="4">
              <v-card border flat class="h-100">
                <v-card-text>
                  <div class="text-caption text-medium-emphasis mb-1">{{ stat.title }}</div>
                  <div class="text-h4 font-weight-bold text-primary">{{ stat.value.toLocaleString() }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Database & Source Overview -->
          <div class="mb-6">
            <h2 class="text-h5 font-weight-bold mb-4">Database & Source Overview</h2>
            <v-row>
              <v-col v-for="card in databaseCards" :key="card.title" cols="12" sm="6" md="3">
                <v-card border flat class="h-100">
                  <v-card-item>
                    <template #prepend>
                      <v-avatar color="primary" variant="tonal" rounded="lg">
                        <v-icon :icon="card.icon"></v-icon>
                      </v-avatar>
                    </template>
                    <v-card-title class="font-weight-bold">{{ card.title }}</v-card-title>
                  </v-card-item>
                  <v-card-text>
                    <div class="text-h4 font-weight-bold mb-2">
                      {{ card.count.toLocaleString() }}
                    </div>
                    <v-list v-if="card.distribution.length" density="compact" class="bg-transparent">
                      <v-list-item 
                        v-for="dist in card.distribution" 
                        :key="dist.name" 
                        class="px-0" 
                        min-height="20"
                      >
                        <span class="text-body-2 text-medium-emphasis">{{ dist.name }}:</span>
                        <template #append>
                          <span class="font-weight-medium">{{ dist.count.toLocaleString() }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                    <!-- <div v-else class="text-caption text-medium-emphasis">
                      No breakdown available
                    </div> -->
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Charts Section -->
          <v-row class="mb-6">
            <!-- Publications Over Time -->
            <v-col cols="12">
              <v-card border flat>
                <v-card-item>
                  <v-card-title class="font-weight-bold">Publications Over Time</v-card-title>
                  <v-card-subtitle v-if="hasYearData">
                    {{ yearRange[0] }} - {{ yearRange[1] }}
                  </v-card-subtitle>
                </v-card-item>
                <v-card-text>
                  <div v-if="hasYearData">
                    <apexchart 
                      type="area" 
                      height="350" 
                      :options="publicationsChart.chartOptions"
                      :series="publicationsChart.series"
                    ></apexchart>
                  </div>
                  <v-alert v-else type="info" variant="tonal" class="mb-0">
                    No publication data available for the selected year range.
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Top Countries -->
            <v-col cols="12" lg="12">
              <v-card border flat class="h-100">
                <v-card-item>
                  <v-card-title class="font-weight-bold">Top 5 Countries by Lead Author</v-card-title>
                </v-card-item>
                <v-card-text>
                  <div v-if="hasCountryData">
                    <apexchart 
                      type="bar" 
                      height="300" 
                      :options="countriesChart.chartOptions"
                      :series="countriesChart.series"
                    ></apexchart>
                  </div>
                  <v-alert v-else type="info" variant="tonal" class="mb-0">
                    No country data available.
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Duplicates Overview -->
            <!-- <v-col cols="12" lg="6">
              <v-card border flat class="h-100">
                <v-card-item>
                  <v-card-title class="font-weight-bold">Database Duplicates Overview</v-card-title>
                </v-card-item>
                <v-card-text> -->
                  <!-- Duplicates by DOI -->
                  <!-- <div class="mb-6">
                    <h3 class="text-subtitle-1 font-weight-medium mb-3">By DOI</h3>
                    <v-row v-if="duplicateByDoi && duplicateByDoi.length > 0">
                      <v-col v-for="item in duplicateByDoi" :key="item.source" cols="6">
                        <v-card border flat color="error" variant="tonal">
                          <v-card-text class="text-center">
                            <div class="text-h5 font-weight-bold">{{ item.count.toLocaleString() }}</div>
                            <div class="text-caption">{{ item.source }}</div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-alert v-else type="info" variant="tonal" density="compact">
                      No DOI duplicates found
                    </v-alert>
                  </div> -->

                  <!-- Duplicates by Verification ID -->
                  <!-- <div>
                    <h3 class="text-subtitle-1 font-weight-medium mb-3">By Verification ID</h3>
                    <v-row v-if="duplicateByVerifier && duplicateByVerifier.length > 0">
                      <v-col v-for="item in duplicateByVerifier" :key="item.source" cols="6">
                        <v-card border flat color="warning" variant="tonal">
                          <v-card-text class="text-center">
                            <div class="text-h5 font-weight-bold">{{ item.count.toLocaleString() }}</div>
                            <div class="text-caption">{{ item.source }}</div>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-alert v-else type="info" variant="tonal" density="compact">
                      No verification ID duplicates found
                    </v-alert>
                  </div> -->
                <!-- </v-card-text>
              </v-card>
            </v-col> -->
          </v-row>

          <!-- Country Map (if available) -->
          <div v-if="otherCharts?.charts?.country_map && hasCountryMapData" class="mb-6">
            <h2 class="text-h5 font-weight-bold mb-4">Geographic Distribution</h2>
            <v-card border flat>
              <v-card-text>
                <GraphView 
                  id="country_map_chart"
                  :summary="otherCharts.charts.country_map" 
                  label="" 
                  :show_loading="true" 
                />
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Apexchart from 'vue3-apexcharts';
import axios from 'axios';
import { mapper } from '@/services/index.js';
import GraphView from '@/components/GraphView.vue';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface YearSourceData {
  year: number | null;
  source: string | null;
  record_count: number;
}

interface CountryData {
  country: string;
  record_count: number;
}

interface SourceData {
  source: string;
  record_count: number;
}

interface OvidData {
  database: string;
  record_count: number;
}

interface ChartData {
  year_source: YearSourceData[];
  country: CountryData[];
  journal: any[];
  source: SourceData[];
  ovid_grouping: OvidData[];
}

interface DuplicateData {
  source: string;
  count: number;
}

// ==========================================
// STATE MANAGEMENT
// ==========================================

const isLoadingFilters = ref(true);
const isLoadingData = ref(true);
const minYear = ref(2010);
const maxYear = ref(new Date().getFullYear());
const yearRange = ref([minYear.value, maxYear.value]);
const chartData = ref<ChartData | null>(null);
const duplicateByDoi = ref<DuplicateData[]>([]);
const duplicateByVerifier = ref<DuplicateData[]>([]);
const otherCharts = ref<any>({});

let yearSliderDebounceTimer: number | undefined;

const API_BASE = 'http://0.0.0.0:5400/api/v1';

// ==========================================
// API CALLS
// ==========================================

const loadFilterOptions = async () => {
  isLoadingFilters.value = true;
  try {
    const response = await axios.get(`${API_BASE}/api/filters/tree`);
    const data = response.data.data;
    
    minYear.value = data.minYear || 2010;
    maxYear.value = data.maxYear || new Date().getFullYear();
    yearRange.value = [minYear.value, maxYear.value];
    
    console.log('✅ Filters loaded:', { minYear: minYear.value, maxYear: maxYear.value });
  } catch (error) {
    console.error('❌ Failed to load filter options:', error);
  } finally {
    isLoadingFilters.value = false;
  }
};

const loadChartData = async () => {
  isLoadingData.value = true;
  try {
    const params = new URLSearchParams({
      startYear: yearRange.value[0].toString(),
      endYear: yearRange.value[1].toString(),
    });
    
    const response = await axios.get(`${API_BASE}/api/v1/visualizations/data?${params.toString()}`);
    const responseData = response.data.data;
    
    chartData.value = responseData?.data || null;
    duplicateByDoi.value = responseData?.doi_duplicates || [];
    duplicateByVerifier.value = responseData?.verification_duplicates || [];
    otherCharts.value = responseData?.summary_statistics || {};
    
    console.log('✅ Chart data loaded:', {
      yearSource: chartData.value?.year_source?.length,
      countries: chartData.value?.country?.length,
      sources: chartData.value?.source?.length,
    });
  } catch (error) {
    console.error('❌ Failed to load chart data:', error);
    chartData.value = null;
  } finally {
    isLoadingData.value = false;
  }
};

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  loadFilterOptions();
  loadChartData();
});

// ==========================================
// WATCHERS
// ==========================================

watch(yearRange, () => {
  clearTimeout(yearSliderDebounceTimer);
  yearSliderDebounceTimer = window.setTimeout(() => {
    loadChartData();
  }, 800);
});

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

const hasYearData = computed(() => {
  return chartData.value?.year_source && chartData.value.year_source.length > 0;
});

const hasCountryData = computed(() => {
  return chartData.value?.country && 
         chartData.value.country.length > 0 &&
         chartData.value.country.some(c => c.country && c.country.trim() !== '' && c.country !== '[]');
});

const hasCountryMapData = computed(() => {
  const map = otherCharts.value?.charts?.country_map;
  return map && map.mark !== 'text'; // Check if it's not an empty placeholder
});

const summaryStats = computed(() => {
  if (!chartData.value) {
    return [
      { title: 'Total Reviews Analyzed', value: 0 },
      { title: 'Unique Sources', value: 0 },
      { title: 'Databases Searched', value: 0 },
    ];
  }
  
  const totalReviews = chartData.value.year_source.reduce((sum, item) => sum + item.record_count, 0);
  const uniqueSources = chartData.value.source?.length || 0;
  const totalDatabases = chartData.value.ovid_grouping?.length || 0;
  
  return [
    { title: 'Total Reviews Analyzed', value: totalReviews },
    { title: 'Unique Sources', value: uniqueSources },
    { title: 'Databases Searched', value: totalDatabases },
  ];
});

const databaseCards = computed(() => {
  if (!chartData.value) return [];

  const ovidData = chartData.value.ovid_grouping || [];
  const sourceData = chartData.value.source || [];

  const embaseCount = ovidData.find(db => db.database === 'Embase')?.record_count || 0;
  const ovidMedlineCount = ovidData.find(db => db.database === 'Ovid MEDLINE(R) ALL')?.record_count || 0;
  const pubmedCount = sourceData.find(s => s.source === 'Medline')?.record_count || 0;
  const loveCount = sourceData.find(s => s.source === 'LOVE')?.record_count || 0;
  const cochraneCount = sourceData.find(s => s.source === 'Cochrane')?.record_count || 0;

  return [
    {
      title: 'EMBASE',
      icon: 'mdi-database',
      count: embaseCount,
      distribution: []
    },
    {
      title: 'Medline',
      icon: 'mdi-database-search',
      count: ovidMedlineCount + pubmedCount,
      distribution: [
        { name: 'Ovid MEDLINE', count: ovidMedlineCount },
        { name: 'PubMed', count: pubmedCount }
      ]
    },
    {
      title: 'Cochrane',
      icon: 'mdi-library',
      count: cochraneCount,
      distribution: []
    },
    {
      title: 'LOVE',
      icon: 'mdi-heart-outline',
      count: loveCount,
      distribution: []
    }
  ];
});

const publicationsChart = computed(() => {
  if (!chartData.value) {
    return { series: [], chartOptions: {} };
  }

  const yearlyCounts: { [key: number]: number } = {};
  
  chartData.value.year_source.forEach(item => {
    if (item.year !== null) {
      yearlyCounts[item.year] = (yearlyCounts[item.year] || 0) + item.record_count;
    }
  });

  const sortedYears = Object.keys(yearlyCounts).map(Number).sort((a, b) => a - b);
  const seriesData = sortedYears.map(year => yearlyCounts[year]);

  return {
    series: [{ name: 'Publications', data: seriesData }],
    chartOptions: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      xaxis: {
        categories: sortedYears,
        title: { text: 'Year' }
      },
      yaxis: {
        title: { text: 'Number of Publications' }
      },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        }
      },
      colors: ['#153a9d'],
      tooltip: {
        x: { format: 'yyyy' }
      }
    },
  };
});

const countriesChart = computed(() => {
  if (!chartData.value?.country || chartData.value.country.length === 0) {
    return { series: [], chartOptions: {} };
  }

  const topCountries = chartData.value.country
    .filter(c => c.country && c.country.trim() !== '' && c.country !== '[]')
    .slice(0, 5);

  return {
    series: [{ name: 'Reviews', data: topCountries.map(c => c.record_count) }],
    chartOptions: {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false }
      },
      xaxis: {
        categories: topCountries.map(c => c.country)
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4
        }
      },
      colors: ['#8E24AA'],
      dataLabels: { enabled: false }
    },
  };
});
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>

