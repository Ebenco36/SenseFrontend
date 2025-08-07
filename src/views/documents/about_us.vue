<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: 'About Us' });
const breadcrumbs = shallowRef([
  {
    title: 'About Us',
    disabled: false,
    href: '#'
  }
]);
</script>

<template>
  <!-- <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="About Us">
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="mb-4">About Us</h1>
            <p>
              In progress...
            </p>
            <v-img src="/about-us-image.jpg" max-width="500" class="mt-4 rounded" alt="About Us" />
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
