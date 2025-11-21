<template>
  <v-app-bar flat :color="barColor" :height="height">
    <v-container class="h-100 d-flex align-center ga-4">
      <!-- Title (optional) -->
      <h1 
        v-if="title" 
        class="text-h4 font-weight-bold text-white me-4 d-none d-md-block"
      >
        {{ title }}
      </h1>
      
      <!-- Search Bar with Field Selector -->
      <div class="d-flex flex-grow-1 align-center">
        <div class="d-flex flex-grow-1">
          <!-- Search Field Selector -->
          <v-menu v-if="searchFields.length > 1">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                variant="flat"
                color="white"
                height="48"
                class="search-field-selector"
                append-icon="mdi-chevron-down"
              >
                {{ selectedSearchFieldLabel }}
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="field in searchFields"
                :key="field.value"
                :value="field.value"
                @click="handleFieldChange(field.value)"
              >
                <v-list-item-title>
                  <v-icon v-if="field.icon" :icon="field.icon" size="small" class="me-2" />
                  {{ field.label }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          
          <!-- Search Input -->
          <v-text-field 
            :model-value="modelValue" 
            variant="solo" 
            label="Search..."
            :placeholder="placeholder"
            density="comfortable" 
            hide-details 
            rounded="0" 
            flat 
            class="search-input"
            @update:model-value="handleInput"
            @keydown.enter="handleSearch"
          />
          
          <!-- Search Button -->
          <v-btn 
            height="48" 
            :color="buttonColor" 
            variant="flat" 
            class="find-btn font-weight-bold text-white"
            @click="handleSearch" 
            :loading="loading"
          >
            {{ buttonText }}
          </v-btn>
        </div>
        
        <!-- Advanced Filter Button (optional) -->
        <v-tooltip v-if="showAdvancedButton" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn 
              v-bind="tooltipProps" 
              size="large" 
              icon="mdi-filter-variant" 
              variant="text" 
              color="white"
              class="ms-2" 
              @click="$emit('advanced-filter')"
            />
          </template>
          <span>{{ advancedButtonTooltip }}</span>
        </v-tooltip>
        
        <!-- Custom Slot for Additional Buttons -->
        <slot name="actions"></slot>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue';

// ==========================================
// PROPS
// ==========================================

const props = defineProps({
  // Search query (v-model)
  modelValue: {
    type: String,
    default: ''
  },
  
  // Selected search field
  searchField: {
    type: String,
    default: 'all'
  },
  
  // Available search fields
  searchFields: {
    type: Array,
    default: () => [
      { label: 'All Fields', value: 'all', icon: 'mdi-magnify' },
      { label: 'Title', value: 'title', icon: 'mdi-format-title' },
      { label: 'Authors', value: 'authors', icon: 'mdi-account-multiple' },
      { label: 'Abstract', value: 'abstract', icon: 'mdi-text' }
    ]
  },
  
  // Visual customization
  title: {
    type: String,
    default: ''
  },
  
  placeholder: {
    type: String,
    default: 'Search articles, authors, keywords...'
  },
  
  barColor: {
    type: String,
    default: '#153a9d'
  },
  
  buttonColor: {
    type: String,
    default: '#D95D45'
  },
  
  buttonText: {
    type: String,
    default: 'Find'
  },
  
  height: {
    type: [String, Number],
    default: 120
  },
  
  // Advanced filter button
  showAdvancedButton: {
    type: Boolean,
    default: true
  },
  
  advancedButtonTooltip: {
    type: String,
    default: 'Advanced Filtering'
  },
  
  // Loading state
  loading: {
    type: Boolean,
    default: false
  },
  
  // Auto-clean input
  sanitizeInput: {
    type: Boolean,
    default: true
  }
});

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits([
  'update:modelValue',
  'update:searchField', 
  'search',
  'advanced-filter'
]);

// ==========================================
// COMPUTED
// ==========================================

const selectedSearchFieldLabel = computed(() => {
  const field = props.searchFields.find(f => f.value === props.searchField);
  return field?.label || 'All Fields';
});

// ==========================================
// METHODS
// ==========================================

const sanitizeSearchInput = (input) => {
  if (!input || !props.sanitizeInput) return input;
  
  return String(input)
    .replace(/<[^>]*>/g, '')                    // Remove HTML
    .replace(/[^\w\s\-.,;:'"()&]/g, '')        // Remove special chars
    .replace(/\s+/g, ' ')                       // Normalize spaces
    .trim()                                     // Trim
    .substring(0, 200);                         // Limit length
};

const handleInput = (value) => {
  const cleaned = sanitizeSearchInput(value);
  emit('update:modelValue', cleaned);
};

const handleFieldChange = (value) => {
  emit('update:searchField', value);
};

const handleSearch = () => {
  emit('search', {
    query: props.modelValue,
    field: props.searchField
  });
};
</script>

<style scoped>
.search-field-selector {
  border-radius: 4px 0 0 4px !important;
  min-width: 140px;
}

.search-input {
  flex-grow: 1;
}

.search-input :deep(.v-field) {
  border-radius: 0 !important;
}

.find-btn {
  border-radius: 0 4px 4px 0 !important;
  min-width: 100px;
}
</style>
