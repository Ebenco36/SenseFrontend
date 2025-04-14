<script setup lang="ts">
import { computed } from 'vue';
import iconCard from '@/assets/images/icons/icon-card.svg';
const props = defineProps({
  text: {
    type: String,
    default: 'false'
  },
  summary_text: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: '0'
  },
  baseClass: {
    type: String,
    default: 'bubble-shape'
  },
  shapeClass: {
    type: String,
    default: 'bubble-secondary-shape'
  },
  backgroundClass: {
    type: String,
    default: 'bg-secondary'
  },
  btnColor: {
    type: String,
    default: 'darksecondary'
  }
});

// Compute the dynamic class
const dynamicClass = computed(() => {
  return `${props.backgroundClass} overflow-hidden ${props.baseClass} ${props.shapeClass}`;
});
</script>

<template>
  <v-card elevation="0" :class="dynamicClass">
    <v-card-text>
      <div class="d-flex align-start mb-6">
      </div>
      <h2 class="text-h1 font-weight-medium">
        {{ value }} <small style="font-size:12pt;" class="pull-right">Records</small>
        <!-- <a href="#"><CircleArrowUpRightIcon stroke-width="1.5" width="28" class="text-white" /> 
        </a> -->
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">{{ text }}</span>
      <!-- <small class="pull-right" v-if="text == 'OVID'" v-html="summary_text"></small> -->
    </v-card-text>
  </v-card>
</template>
