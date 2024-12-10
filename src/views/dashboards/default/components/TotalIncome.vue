<script setup lang="ts">
import { computed } from 'vue';
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
      default: 'bubble-shape-sm',
    },
    backgroundClass: {
      type: String,
      default: 'bubble-warning',
    },
    btnColor: {
      type: String,
      default: '',
      // lightwarning, darkprimary, darksecondary
    },
    textColor: {
      type: String,
      default: 'text-subtitle-2 text-disabled font-weight-medium',
      // text-subtitle-2 text-medium-emphasis text-white
    }

});

// Compute the dynamic class
const dynamicClass = computed(() => {
  return `${props.backgroundClass} overflow-hidden ${props.baseClass} ${props.shapeClass}`;
});

</script>

<template>
  <v-card elevation="0" :class="dynamicClass">
    <v-card-text class="pa-5">
      <div class="d-flex align-center ga-4">
        <v-btn :color="btnColor" icon rounded="sm" variant="flat">
          <TableIcon stroke-width="1.5" width="25" />
        </v-btn>
        <div>
          <h4 class="text-h4 font-weight-medium">{{ value }}</h4>
          <span :class="textColor">{{(text != "") ? text : "Not Set"}}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>

</template>
