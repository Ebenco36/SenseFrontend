<template>
  <RouterView></RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
/* Import the 'Inter' font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

/* Apply the new font to the entire application */
.v-application, * {
  font-family: 'Inter', sans-serif !important;
}

*:not(.v-text-field):not(.v-text-field *):not(.v-chip__content) {
  font-size: 1.0rem !important;
}

.v-chip__content {
    font-size: 7pt;
    font-weight: 800;
}
/* Add custom styles for better readability */
.readable-body {
  line-height: 1.75;
}
</style>
