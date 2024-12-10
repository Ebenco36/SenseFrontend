<script setup lang="ts">
// imported components
import TotalEarning from './components/TotalEarning.vue';
import TotalOrder from './components/TotalOrder.vue';
import TotalIncome from './components/TotalIncome.vue';
import TotalGrowth from './components/TotalGrowth.vue';
import { ref, onMounted } from 'vue';
import type { ApiResponse, DataStructure } from '@/types/my-types/dashboard';
import { fetchDashboard } from '@/api/dashboard';

const loading = ref(false);
const data_structure = ref<DataStructure>();
const fetchData = async () => {
  loading.value = true;
  try {
    const response: ApiResponse = await fetchDashboard();
    data_structure.value = response.data.data
    console.log(data_structure.value)
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
    <!-- -------------------------------------------------------------------- -->
    <!-- Total Earning -->
    <!-- -------------------------------------------------------------------- -->
    <v-col v-for="(item, index) in data_structure?.source" :key="index" cols="12" md="3">
      <TotalEarning v-if="(index % 2) == 0" baseClass="bubble-shape" shapeClass="bubble-primary-shape"
        backgroundClass="bg-primary" btnColor="darkprimary" :text="item.Source" :value="item.record_count" />
      <TotalEarning v-else baseClass="bubble-shape" shapeClass="bubble-secondary-shape" backgroundClass="bg-secondary"
        btnColor="darksecondary" :text="item.Source" :value="item.record_count" />
    </v-col>
  </v-row>

  <!-- -------------------------------------------------------------------- -->
  <!-- Total Income -->
  <!-- -------------------------------------------------------------------- -->
  <h4 class="mt-5 mb-5 text-h4 font-weight-bold">Journals</h4>
  <v-row>

    <v-col cols="12" md="4" v-for="(item, index) in data_structure?.journal" :key="index">
      <TotalIncome :text="item.Journal" :value="item.record_count" />
    </v-col>
  </v-row>

  <!-- -------------------------------------------------------------------- -->
  <!-- Total Growth -->
  <!-- -------------------------------------------------------------------- -->
  <v-row>
    <v-col cols="12" lg="12">
      <TotalGrowth />
    </v-col>
  </v-row>
</template>
