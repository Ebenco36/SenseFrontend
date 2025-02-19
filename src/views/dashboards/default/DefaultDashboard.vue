<script setup lang="ts">
// imported components
import JournalMetrics from './components/JournalMetrics.vue';
import JournalSubMetrics from './components/JournalSubMetrics.vue';
import { ref, onMounted, computed } from 'vue';
import type { ApiResponse, DataStructure } from '@/types/my-types/dashboard';
import { fetchDashboard } from '@/api/dashboard';
import GraphView from '@/components/GraphView.vue'
import Loader from '@/components/shared/PageLoader.vue';
import numeral from 'numeral';

const loading = ref(false);
const data_structure = ref<DataStructure>();
const data_structure_charts = ref()
const fetchData = async () => {
  loading.value = true;
  try {
    const response: ApiResponse = await fetchDashboard();
    data_structure.value = response.data.data;
    data_structure_charts.value = response.data.charts;
    console.log(data_structure.value);
  } catch (err: unknown) {
    console.error('Error fetching data:', (err as Error).message || 'Unknown error');
  } finally {
    loading.value = false;
  }
};

const formattedRecordsHtml = computed(() => {
  return data_structure.value?.ovid_grouping
    ?.map(
      (item) =>
        `<div class="list-item">
          <strong>${item.Database}</strong>: ${item.record_count} records
        </div>`
    )
    .join("");
});

const formatNumber = (number: number): string => {
  if (typeof number !== 'number') {
    throw new TypeError('Input must be a number.');
  }
  return numeral(number).format('0,0');
};

// Fetch the data when the component is mounted
onMounted(fetchData);
</script>

<template>
  <v-row>
    <Loader :isLoading="loading"></Loader>
    <!-- -------------------------------------------------------------------- -->
    <!-- Metrics -->
    <!-- -------------------------------------------------------------------- -->
    <v-col v-for="(item, index) in data_structure?.source" :key="index" cols="12" md="3">
      <JournalMetrics v-if="index % 2 == 0" :summary_text="formattedRecordsHtml" baseClass="bubble-shape" shapeClass="bubble-primary-shape"
        backgroundClass="bg-primary" btnColor="darkprimary" :text="item.Source"
        :value="formatNumber(item.record_count)" />
      <JournalMetrics v-else :summary_text="formattedRecordsHtml" baseClass="bubble-shape" shapeClass="bubble-secondary-shape" backgroundClass="bg-secondary"
        btnColor="darksecondary" :text="item.Source" :value="formatNumber(item.record_count)" />
    </v-col>
  </v-row>

  <!-- -------------------------------------------------------------------- -->
  <!-- Metrics -->
  <!-- -------------------------------------------------------------------- -->
  <h4 class="mt-5 mb-5 text-h4 font-weight-bold">Journals</h4>
  <v-row>
    <v-col cols="12" md="4" v-for="(item, index) in data_structure?.journal" :key="index">
      <JournalSubMetrics :text="item.Journal" :value="formatNumber(item.record_count)" />
    </v-col>
  </v-row>

  <!-- -------------------------------------------------------------------- -->
  <!-- JournalSubMetrics -->
  <!-- -------------------------------------------------------------------- -->
  <v-row>
    <v-col cols="12" lg="12">
      <GraphView v-if="data_structure_charts?.year_source" id="year_source_chart"
        :summary="data_structure_charts?.year_source" label="" :show_loading="false" />

    </v-col>
  </v-row>

  <v-row>
    <v-col cols="6" lg="6">
      <GraphView v-if="data_structure_charts?.source" id="source_chart" :summary="data_structure_charts?.source"
        label="" :show_loading="false" />
    </v-col>

    <v-col cols="6" lg="6">
      <GraphView v-if="data_structure_charts?.country" id="country_chart" :summary="data_structure_charts?.country"
        label="" :show_loading="false" />
    </v-col>

  </v-row>
</template>
