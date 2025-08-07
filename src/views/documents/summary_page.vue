<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <h1 class="text-h4 font-weight-bold mb-2">Visual Summary</h1>
        <p class="text-medium-emphasis mb-6">An interactive overview of systematic review papers.</p>

        <v-card border flat class="mb-6">
          <v-skeleton-loader v-if="isLoadingFilters" type="actions,actions"></v-skeleton-loader>
          <v-row v-else align="center" class="pa-4">
            <v-col cols="12" md="12">
              <v-label class="font-weight-medium mb-1">Filter by Publication Year</v-label>
              <v-range-slider v-model="yearRange" :min="minYear" :max="maxYear" :step="1" thumb-label="always"
                hide-details></v-range-slider>
            </v-col>
            <!-- <v-col cols="12" md="4">
               <v-label class="font-weight-medium mb-1">Filter by Topic</v-label>
               <v-select
                v-model="selectedTopic"
                :items="formattedTopics"
                item-title="title"
                item-value="value"
                density="compact"
                placeholder="All Topics"
                clearable
                hide-details
              ></v-select>
            </v-col> -->
            <!-- <v-col cols="12" md="2">
                <v-btn block color="primary" variant="flat" @click="applyFilters" :loading="isLoadingData" class="mt-5">Apply</v-btn>
             </v-col> -->
          </v-row>
        </v-card>

        <v-skeleton-loader v-if="isLoadingData" type="card@4, image, image"></v-skeleton-loader>
        <div v-else>
          <v-row>
            <v-col v-for="stat in stats" :key="stat.title" cols="12" md="4">
              <v-card border flat>
                <v-card-text>
                  <div class="text-medium-emphasis">{{ stat.title }}</div>
                  <div class="text-h4 font-weight-bold">{{ stat.value?.toLocaleString() }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div class="mt-6">
            <h2 class="text-h5 font-weight-bold mb-4">Database & Source Overview</h2>
            <v-row>
              <v-col v-for="card in databaseCards" :key="card.title" cols="12" sm="6" md="3">
                <v-card border flat class="h-100">
                  <v-card-item>
                    <template v-slot:prepend>
                      <v-avatar color="primary" variant="tonal" rounded="lg">
                        <v-icon :icon="card.icon"></v-icon>
                      </v-avatar>
                    </template>
                    <v-card-title class="font-weight-bold">{{ card.title }}</v-card-title>
                    <!-- <v-card-subtitle v-if="card.subtitle">{{ card.subtitle }}</v-card-subtitle> -->
                  </v-card-item>
                  <v-card-text>
                    <div class="text-h4 font-weight-bold mb-2">
                      {{ card.count.toLocaleString() }}
                    </div>
                    <v-list v-if="card.distribution.length" density="compact" class="bg-transparent">
                      <v-list-item v-for="dist in card.distribution" :key="dist.name" class="px-0" min-height="20">
                        <span class="text-body-2 text-medium-emphasis">{{ dist.name }}:</span>
                        <template v-slot:append>
                          <span class="font-weight-medium">{{ dist.count.toLocaleString() }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <v-row class="mt-2">
            <v-col cols="12" lg="12">
              <v-card border flat class="pa-2">
                <v-card-item><v-card-title>Publications Over Time</v-card-title></v-card-item>
                <v-card-text>
                  <apexchart type="area" height="350" :options="publicationsChart.chartOptions"
                    :series="publicationsChart.series"></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
            <!-- <v-col cols="12" lg="4">
              <v-card border flat class="pa-2">
                <v-card-item><v-card-title>Reviews by Quality</v-card-title><v-card-subtitle>AMSTAR 2 Rating (Dummy
                    Data)</v-card-subtitle></v-card-item>
                <v-card-text>
                  <apexchart type="donut" height="350" :options="qualityChart.chartOptions"
                    :series="qualityChart.series">
                  </apexchart>
                </v-card-text>
              </v-card>
            </v-col> -->

            <!-- <v-col cols="12" lg="6">
               <v-card border flat class="pa-2">
                <v-card-item><v-card-title>Top 5 Topics</v-card-title></v-card-item>
                 <v-card-text><apexchart type="bar" height="300" :options="topicsChart.chartOptions" :series="topicsChart.series"></apexchart></v-card-text>
              </v-card>
            </v-col> -->

            <v-col cols="12" lg="6">
              <v-card border flat class="pa-2">
                <v-card-item><v-card-title>Top 5 Countries by Lead Author</v-card-title></v-card-item>
                <v-card-text>
                  <apexchart type="bar" height="300" :options="countriesChart.chartOptions"
                    :series="countriesChart.series">
                  </apexchart>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="6">
              <v-card border flat class="pa-2">
                <v-card-text>
              <div class="mt-1">
                <h2 class="text-h5 font-weight-bold mb-4">Database Duplicates By DOI</h2>
                <v-row>
                  <v-col v-for="item in duplicateByDoi" :key="item.source" cols="12" sm="6" md="4">
                    <v-card border flat class="h-100">
                      <v-card-item>
                        <template v-slot:prepend>
                          <v-avatar color="primary" variant="tonal" rounded="lg">
                            <v-icon></v-icon>
                          </v-avatar>
                        </template>
                        <v-card-title class="font-weight-bold">{{ item.source }}</v-card-title>
                      </v-card-item>
                      <v-card-text>
                        <div class="text-h4 font-weight-bold mb-2">
                          {{ item.count.toLocaleString() }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <div class="mt-1">
                <h2 class="text-h5 font-weight-bold mb-4">Database Duplicates By Verification ID</h2>
                <v-row>
                  <v-col v-for="item in duplicateByVerifier" :key="item.source" cols="12" sm="6" md="4">
                    <v-card border flat class="h-100">
                      <v-card-item>
                        <template v-slot:prepend>
                          <v-avatar color="primary" variant="tonal" rounded="lg">
                            <v-icon></v-icon>
                          </v-avatar>
                        </template>
                        <v-card-title class="font-weight-bold">{{ item.source }}</v-card-title>
                      </v-card-item>
                      <v-card-text>
                        <div class="text-h4 font-weight-bold mb-2">
                          {{ item.count.toLocaleString() }}
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
              </v-card-text>
              </v-card>
            </v-col>

          </v-row>

          <div class="mt-6">
            <h2 class="text-h5 font-weight-bold mb-4">Database Duplicates By Verification ID</h2>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <GraphView v-if="otherCharts?.charts.country_map" id="year_source_chart"
                  :summary="otherCharts?.charts.country_map" label="" :show_loading="true" />
              </v-col>
            </v-row>
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
import GraphView from '@/components/GraphView.vue'

// --- TYPE DEFINITIONS ---
interface ChartData {
  country: { country: string; record_count: number }[];
  journal: { journal: string; record_count: number }[];
  year_source: { year: number | null; source: string; record_count: number }[];
  ovid_grouping: { database: string; record_count: number }[];
  source: { source: string; record_count: number }[];
}

interface DuplicateData {
  source: string; count: number
}

// --- STATE MANAGEMENT ---
const isLoadingFilters = ref(true);
const isLoadingData = ref(true);
const minYear = ref(2010);
const maxYear = ref(new Date().getFullYear());
const allTopics = ref<string[]>([]);
const yearRange = ref([minYear.value, maxYear.value]);
const selectedTopic = ref<string | null>(null);
const chartData = ref<ChartData | null>(null);
let yearSliderDebounceTimer: number | undefined;
const duplicateByDoi = ref<DuplicateData | null>(null);
const duplicateByVerifier = ref<DuplicateData | null>(null);
const otherCharts = ref<any>({});

// --- API & DATA LOGIC ---
const loadFilterOptions = async () => {
  isLoadingFilters.value = true;
  try {
    const response = await axios.get('http://0.0.0.0:5400/api/v1/api/v1/visualizations/filters');
    const data = response.data.data;
    minYear.value = data.minYear;
    maxYear.value = data.maxYear;
    allTopics.value = data.allTopics;
    yearRange.value = [data.minYear, data.maxYear];
  } catch (error) {
    console.error("Failed to load filter options:", error);
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
    if (selectedTopic.value) {
      params.append('topic', selectedTopic.value);
    }
    const response = await axios.get(`http://0.0.0.0:5400/api/v1/api/v1/visualizations/data?${params.toString()}`);
    chartData.value = response.data.data?.data || null;
    duplicateByDoi.value = response.data.data?.doi_duplicates || {};
    duplicateByVerifier.value = response.data.data?.verification_duplicates || {};
    otherCharts.value = response.data.data?.summary_statistics || {};
  } catch (error) {
    console.error("Failed to load chart data:", error);
    chartData.value = null;
  } finally {
    isLoadingData.value = false;
  }
};

onMounted(() => {
  loadFilterOptions();
  // loadChartData();
});

const applyFilters = () => {
  clearTimeout(yearSliderDebounceTimer);
  loadChartData();
};

// --- WATCHERS ---
watch(yearRange, () => {
  clearTimeout(yearSliderDebounceTimer);
  yearSliderDebounceTimer = window.setTimeout(() => {
    loadChartData();
  }, 800);
});

// --- COMPUTED PROPERTIES ---
const formattedTopics = computed(() => {
  return allTopics.value.map(topicKey => ({
    title: mapper[topicKey] || topicKey.replace(/__/g, ' '),
    value: topicKey
  }));
});

const stats = computed(() => {
  if (!chartData.value) {
    return [
      { title: 'Total Reviews Analyzed', value: 0 },
      { title: 'Total Sources', value: 0 },
      { title: 'Total Databases', value: 0 },
    ];
  }
  const totalReviews = chartData.value.year_source.reduce((sum, item) => sum + item.record_count, 0);
  return [
    { title: 'Total Reviews Analyzed', value: totalReviews },
    { title: 'Total Sources', value: chartData.value?.source?.length },
    { title: 'Total Databases', value: chartData.value?.ovid_grouping?.length },
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
    { title: 'EMBASE', subtitle: 'From Ovid Grouping', icon: 'mdi-database', count: embaseCount, distribution: [] },
    {
      title: 'Medline', subtitle: 'Combined Sources', icon: 'mdi-database-search', count: ovidMedlineCount + pubmedCount,
      distribution: [
        { name: 'Ovid MEDLINE', count: ovidMedlineCount },
        { name: 'Pubmed', count: pubmedCount }
      ]
    },
    { title: 'Cochrane', subtitle: 'Data not available', icon: 'mdi-database-off', count: cochraneCount, distribution: [] },
    { title: 'LOVE', subtitle: 'From L·OVE Platform', icon: 'mdi-heart-outline', count: loveCount, distribution: [] }
  ];
});



const publicationsChart = computed(() => {
  const yearlyCounts: { [key: number]: number } = {};
  if (chartData.value) {
    chartData.value.year_source.forEach(item => {
      if (item.year) {
        yearlyCounts[item.year] = (yearlyCounts[item.year] || 0) + item.record_count;
      }
    });
  }
  const sortedYears = Object.keys(yearlyCounts).map(Number).sort((a, b) => a - b);
  const seriesData = sortedYears.map(year => yearlyCounts[year]);
  return {
    series: [{ name: 'Publications', data: seriesData }],
    chartOptions: {
      chart: { type: 'area', height: 350, toolbar: { show: false } },
      xaxis: { categories: sortedYears },
      dataLabels: { enabled: false }, stroke: { curve: 'smooth' }, colors: ['#153a9d'],
    },
  };
});

const qualityChart = computed(() => {
  return {
    series: [65, 25, 10], // Dummy
    chartOptions: {
      chart: { type: 'donut', height: 350 },
      labels: ['High', 'Moderate', 'Low'],
      colors: ['#43A047', '#FB8C00', '#E53935'],
      legend: { position: 'bottom' },
    },
  };
});

const topicsChart = computed(() => {
  const topTopics = allTopics.value.slice(0, 5);
  const seriesData = topTopics.map(() => Math.floor(Math.random() * 100) + 20); // Dummy
  return {
    series: [{ name: 'Reviews', data: seriesData }],
    chartOptions: {
      chart: { type: 'bar', height: 300, toolbar: { show: false } },
      xaxis: { categories: topTopics.map(t => mapper[t] || t.replace(/__/g, ' ')) },
      plotOptions: { bar: { horizontal: true } }, colors: ['#00897B'],
    },
  };
});

const countriesChart = computed(() => {
  if (!chartData.value?.country) return { series: [], chartOptions: {} };
  const topCountries = chartData.value.country
    .filter(c => c.country && c.country.trim() !== '' && c.country !== '[]')
    .slice(0, 5);
  return {
    series: [{ name: 'Reviews', data: topCountries.map(c => c.record_count) }],
    chartOptions: {
      chart: { type: 'bar', height: 300, toolbar: { show: false } },
      xaxis: { categories: topCountries.map(c => c.country) },
      plotOptions: { bar: { horizontal: true } }, colors: ['#8E24AA'],
    },
  };
});
</script>