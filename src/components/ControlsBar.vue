<template>
  <v-card :flat="flat" :elevation="elevation" class="mb-4">
    <v-card-text :class="['pa-4', contentClass]">
      <v-row align="center" dense>
        <!-- View Mode Toggle -->
        <v-col v-if="showViewMode" cols="12" :sm="responsiveCols">
          <v-btn-toggle 
            :model-value="viewMode"
            @update:model-value="$emit('update:viewMode', $event)"
            mandatory 
            variant="outlined" 
            :density="density"
            :color="viewModeColor"
          >
            <v-btn 
              v-for="mode in viewModes" 
              :key="mode.value"
              :value="mode.value"
            >
              <v-icon v-if="mode.icon" :start="!!mode.label">{{ mode.icon }}</v-icon>
              <span v-if="mode.label">{{ mode.label }}</span>
            </v-btn>
          </v-btn-toggle>
        </v-col>
        
        <!-- Items Per Page -->
        <v-col v-if="showPerPage" cols="12" :sm="responsiveCols">
          <v-select 
            :model-value="pageSize"
            @update:model-value="handlePageSizeChange"
            :items="perPageOptions" 
            :label="perPageLabel"
            :density="density"
            variant="outlined" 
            hide-details 
            :style="{ minWidth: perPageWidth }"
          />
        </v-col>
        
        <!-- Sort By -->
        <v-col v-if="showSortBy" cols="12" :sm="responsiveCols">
          <v-select 
            :model-value="sortBy"
            @update:model-value="handleSortByChange"
            :items="sortOptions" 
            item-title="title" 
            item-value="key"
            :label="sortByLabel"
            :density="density"
            variant="outlined" 
            hide-details
            :style="{ minWidth: sortByWidth }"
          />
        </v-col>
        
        <!-- Sort Direction -->
        <v-col v-if="showSortDirection" cols="12" :sm="responsiveCols">
          <v-btn-toggle 
            :model-value="sortOrder"
            @update:model-value="handleSortOrderChange"
            mandatory 
            variant="outlined" 
            :density="density"
          >
            <v-btn value="asc" :title="ascendingLabel">
              <v-icon>{{ ascendingIcon }}</v-icon>
              <span v-if="showSortDirectionLabels" class="ms-1">{{ ascendingLabel }}</span>
            </v-btn>
            <v-btn value="desc" :title="descendingLabel">
              <v-icon>{{ descendingIcon }}</v-icon>
              <span v-if="showSortDirectionLabels" class="ms-1">{{ descendingLabel }}</span>
            </v-btn>
          </v-btn-toggle>
        </v-col>
        
        <!-- Custom Left Slot -->
        <v-col v-if="$slots.left" cols="12" :sm="responsiveCols">
          <slot name="left"></slot>
        </v-col>
        
        <v-spacer v-if="showSpacer" />
        
        <!-- Custom Center Slot -->
        <v-col v-if="$slots.center" cols="12" :sm="responsiveCols">
          <slot name="center"></slot>
        </v-col>
        
        <!-- Export Buttons -->
        <v-col v-if="showExport" cols="12" :sm="responsiveCols">
          <div :class="['d-flex', exportAlignment]">
            <v-btn 
              v-for="format in enabledExportFormats" 
              :key="format.value"
              :variant="exportVariant"
              :size="exportSize"
              :prepend-icon="format.icon"
              :loading="exportLoading[format.value]"
              @click="handleExport(format.value)"
              class="me-2"
            >
              {{ format.label }}
            </v-btn>
          </div>
        </v-col>
        
        <!-- Custom Right Slot -->
        <v-col v-if="$slots.right" cols="12" :sm="responsiveCols">
          <slot name="right"></slot>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';

// ==========================================
// PROPS
// ==========================================

const props = defineProps({
  // View Mode
  showViewMode: {
    type: Boolean,
    default: false
  },
  viewMode: {
    type: String,
    default: 'list'
  },
  viewModes: {
    type: Array,
    default: () => [
      { value: 'list', label: 'List', icon: 'mdi-format-list-bulleted' },
      { value: 'table', label: 'Table', icon: 'mdi-table' }
    ]
  },
  viewModeColor: {
    type: String,
    default: 'primary'
  },
  
  // Items Per Page
  showPerPage: {
    type: Boolean,
    default: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  perPageOptions: {
    type: Array,
    default: () => [10, 25, 50, 100]
  },
  perPageLabel: {
    type: String,
    default: 'Per Page'
  },
  perPageWidth: {
    type: String,
    default: '120px'
  },
  conditionalPerPage: {
    type: Boolean,
    default: false
  },
  perPageCondition: {
    type: Boolean,
    default: true
  },
  
  // Sort By
  showSortBy: {
    type: Boolean,
    default: true
  },
  sortBy: {
    type: String,
    default: 'year'
  },
  sortOptions: {
    type: Array,
    default: () => [
      { title: 'Year', key: 'year' },
      { title: 'Title', key: 'title' },
      { title: 'Authors', key: 'authors' }
    ]
  },
  sortByLabel: {
    type: String,
    default: 'Sort By'
  },
  sortByWidth: {
    type: String,
    default: '180px'
  },
  
  // Sort Direction
  showSortDirection: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: String,
    default: 'desc'
  },
  showSortDirectionLabels: {
    type: Boolean,
    default: false
  },
  ascendingLabel: {
    type: String,
    default: 'Ascending'
  },
  descendingLabel: {
    type: String,
    default: 'Descending'
  },
  ascendingIcon: {
    type: String,
    default: 'mdi-arrow-up'
  },
  descendingIcon: {
    type: String,
    default: 'mdi-arrow-down'
  },
  
  // Export
  showExport: {
    type: Boolean,
    default: true
  },
  exportFormats: {
    type: Array,
    default: () => ['csv', 'excel', 'json']
  },
  exportLoading: {
    type: Object,
    default: () => ({ csv: false, excel: false, json: false })
  },
  exportVariant: {
    type: String,
    default: 'outlined'
  },
  exportSize: {
    type: String,
    default: 'default'
  },
  exportAlignment: {
    type: String,
    default: 'ga-2',
    validator: (value) => ['ga-2', 'justify-end', 'justify-start', 'justify-center'].includes(value)
  },
  
  // Layout
  flat: {
    type: Boolean,
    default: false
  },
  elevation: {
    type: [Number, String],
    default: 1
  },
  density: {
    type: String,
    default: 'compact',
    validator: (value) => ['default', 'comfortable', 'compact'].includes(value)
  },
  responsiveCols: {
    type: String,
    default: 'auto'
  },
  showSpacer: {
    type: Boolean,
    default: true
  },
  contentClass: {
    type: String,
    default: ''
  }
});

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits([
  'update:viewMode',
  'update:pageSize',
  'update:sortBy',
  'update:sortOrder',
  'export',
  'change'
]);

// ==========================================
// COMPUTED
// ==========================================

const availableExportFormats = {
  csv: { value: 'csv', label: 'CSV', icon: 'mdi-file-delimited' },
  excel: { value: 'excel', label: 'Excel', icon: 'mdi-file-excel' },
  json: { value: 'json', label: 'JSON', icon: 'mdi-code-json' }
};

const enabledExportFormats = computed(() => {
  return props.exportFormats.map(format => availableExportFormats[format]).filter(Boolean);
});

// ==========================================
// METHODS
// ==========================================

const handlePageSizeChange = (value) => {
  emit('update:pageSize', value);
  emit('change', { type: 'pageSize', value });
};

const handleSortByChange = (value) => {
  emit('update:sortBy', value);
  emit('change', { type: 'sortBy', value });
};

const handleSortOrderChange = (value) => {
  emit('update:sortOrder', value);
  emit('change', { type: 'sortOrder', value });
};

const handleExport = (format) => {
  emit('export', format);
};
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 600px) {
  .d-flex.ga-2 {
    flex-wrap: wrap;
  }
}
</style>
