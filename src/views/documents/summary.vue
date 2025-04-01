<script setup lang="ts">
// imported components
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

// Fetch the data when the component is mounted
onMounted(fetchData);
</script>

<template>
  <v-row>
    <Loader :isLoading="loading"></Loader>
  </v-row>



  <!-- -------------------------------------------------------------------- -->
  <!-- JournalSubMetrics -->
  <!-- -------------------------------------------------------------------- -->
  <v-row>
    <v-col cols="12" lg="12">
      <GraphView v-if="data_structure_charts?.country_map" id="year_source_chart"
        :summary="data_structure_charts?.country_map" label="" :show_loading="false" />

    </v-col>
  </v-row>
</template>
