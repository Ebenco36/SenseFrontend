<script setup lang="ts">
import { computed } from 'vue';
import iconCard from '@/assets/images/icons/icon-card.svg';
const props = defineProps({
    text: {
        type: String,
        default: "false",
    },
    value: {
        type: Number,
        default: 0,
    },
    baseClass: {
      type: String,
      default: 'bubble-shape',
    },
    shapeClass: {
      type: String,
      default: 'bubble-secondary-shape',
    },
    backgroundClass: {
      type: String,
      default: 'bg-secondary',
    },
    btnColor: {
      type: String,
      default: 'darksecondary',
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
        <v-btn icon rounded="sm" :color="btnColor" variant="flat">
          <img :src="iconCard" width="25" />
        </v-btn>
      </div>
      <h2 class="text-h1 font-weight-medium">
        {{value}} <a href="#"><CircleArrowUpRightIcon stroke-width="1.5" width="28" class="text-white" /> </a>
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">{{text}}</span>
    </v-card-text>
  </v-card>
</template>
