<template>
  <v-card 
    variant="outlined" 
    hover
    class="result-card"
  >
    <v-card-text class="pa-6">
      <!-- Header Info -->
      <div class="mb-4">
        <div class="d-flex align-center flex-wrap ga-2 mb-2">
          <!-- Year Chip -->
          <v-chip 
            v-if="item.year" 
            size="small" 
            variant="tonal"
          >
            {{ item.year }}
          </v-chip>
          
          <!-- Confidence/Quality Chip -->
          <v-chip 
            v-if="item.overallConf && item.overallConf !== 'N/A'"
            :color="getConfidenceColor(item.overallConf)" 
            size="small" 
            variant="tonal"
          >
            {{ item.overallConf }}
          </v-chip>
          
          <!-- Open Access Chip -->
          <v-chip
            v-if="showOpenAccess"
            :color="isOpenAccess ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ isOpenAccess ? 'Open Access' : 'Not Open Access' }}
          </v-chip>
          
          <!-- Custom Chips Slot -->
          <slot name="chips" :item="item"></slot>
        </div>
        
        <!-- Title -->
        <component
          :is="titleTag"
          class="text-h6 font-weight-bold result-title d-block mb-2"
          :class="titleClickable ? 'result-title-link' : ''"
          @click="handleTitleClick"
        >
          {{ item.title }}
        </component>
        
        <!-- Authors & Metadata -->
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ formattedAuthors }}
          <span v-if="item.country"> · {{ item.country }}</span>
          <span v-if="item.journal"> · <em>{{ item.journal }}</em></span>
        </p>
      </div>

      <!-- Abstract -->
      <div v-if="item.abstract && showAbstract" class="mb-4">
        <p class="text-body-2">
          {{ displayedAbstract }}
          <a
            v-if="item.abstract.length > abstractLimit"
            href="#"
            class="read-more-link ms-1"
            @click.prevent="toggleAbstract"
          >
            {{ isExpanded ? 'Show Less' : 'Show More' }}
          </a>
        </p>
      </div>

      <!-- Custom Content Slot -->
      <slot name="content" :item="item"></slot>

      <v-divider v-if="showMetadata || showTags" class="my-4" />

      <!-- Metadata Grid -->
      <v-row v-if="showMetadata" dense class="mb-4">
        <v-col 
          v-for="field in visibleMetadataFields" 
          :key="field.key"
          :cols="field.cols || 6" 
          :sm="field.sm || 3"
        >
          <div class="text-caption text-medium-emphasis">{{ field.label }}</div>
          <div class="font-weight-bold">{{ getFieldValue(field.key) }}</div>
        </v-col>
      </v-row>

      <!-- Tags Section -->
      <div v-if="showTags && hasTags" class="mb-4">
        <v-chip-group>
          <!-- Research Notes -->
          <v-chip 
            v-for="(note, index) in safeArray(item.research_notes)" 
            :key="`rn-${note}-${index}`" 
            size="small" 
            color="blue-grey-lighten-4"
          >
            {{ formatLabel(note) }}
          </v-chip>
          
          <!-- Notes -->
          <v-chip 
            v-for="(note, index) in safeArray(item.notes)" 
            :key="`n-${note}-${index}`" 
            size="small" 
            variant="outlined"
          >
            {{ formatLabel(note) }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Custom Footer Slot -->
      <slot name="footer" :item="item"></slot>

      <!-- Action Buttons -->
      <div class="d-flex ga-2 flex-wrap">
        <v-btn 
          v-if="item.link && showViewButton && item.link != '#'"
          variant="tonal" 
          color="primary" 
          size="small"
          :href="item.link" 
          target="_blank"
          rel="noopener noreferrer"
          prepend-icon="mdi-open-in-new"
        >
          {{ viewButtonText }}
        </v-btn>
        
        <!-- Custom Actions Slot -->
        <slot name="actions" :item="item"></slot>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { mapper } from '@/services/index.js';

// ==========================================
// PROPS
// ==========================================

const props = defineProps({
  // The result item data
  item: {
    type: Object,
    required: true
  },
  
  // Visibility toggles
  showAbstract: {
    type: Boolean,
    default: true
  },
  
  showMetadata: {
    type: Boolean,
    default: true
  },
  
  showTags: {
    type: Boolean,
    default: true
  },
  
  showOpenAccess: {
    type: Boolean,
    default: true
  },
  
  showViewButton: {
    type: Boolean,
    default: true
  },
  
  // Customization
  abstractLimit: {
    type: Number,
    default: 300
  },
  
  authorsLimit: {
    type: Number,
    default: 3
  },
  
  viewButtonText: {
    type: String,
    default: 'View Article'
  },
  
  // Title behavior
  titleClickable: {
    type: Boolean,
    default: true
  },
  
  titleTag: {
    type: String,
    default: 'a',
    validator: (value: string) => ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(value)
  },
  
  // Metadata fields to display
  metadataFields: {
    type: Array,
    default: () => [
      { key: 'num_of_studies', label: 'Studies', cols: 6, sm: 3 },
      { key: 'date_of_literature_search', label: 'Last Search', cols: 6, sm: 3 },
      { key: 'year', label: 'Published', cols: 6, sm: 3 },
      { key: 'publication_type', label: 'Type', cols: 6, sm: 3 }
    ]
  }
});

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits(['title-click', 'view-details']);

// ==========================================
// STATE
// ==========================================

const isExpanded = ref(false);

// ==========================================
// COMPUTED
// ==========================================

const isOpenAccess = computed(() => {
  return props.item.open_access && 
         props.item.open_access !== 'N/A' && 
         props.item.open_access.toLowerCase() === 'open access';
});

const formattedAuthors = computed(() => {
  if (!props.item.authors) return 'Unknown Authors';
  
  const authors = props.item.authors.split(',').map((a: string) => a.trim());
  
  if (authors.length <= props.authorsLimit) {
    return authors.join(', ');
  }
  
  return `${authors.slice(0, props.authorsLimit).join(', ')} et al.`;
});

const displayedAbstract = computed(() => {
  if (!props.item.abstract) return '';
  
  if (isExpanded.value || props.item.abstract.length <= props.abstractLimit) {
    return props.item.abstract;
  }
  
  return props.item.abstract.substring(0, props.abstractLimit) + '...';
});

const hasTags = computed(() => {
  const researchNotes = safeArray(props.item.research_notes);
  const notes = safeArray(props.item.notes);
  return researchNotes.length > 0 || notes.length > 0;
});

const visibleMetadataFields = computed(() => {
  return props.metadataFields.filter((field: any) => {
    const value = props.item[field.key];
    return value !== undefined && value !== null && value !== '';
  });
});

// ==========================================
// METHODS
// ==========================================

/**
 * Safely convert value to array
 */
const safeArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    // Handle comma-separated strings
    return value.split(',').map((v: string) => v.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Format label using mapper or humanize
 */
const formatLabel = (key: string | undefined): string => {
  if (!key) return '';
  
  try {
    // Check if mapper exists and has this key
    const mapped = (mapper as Record<string, string> | undefined)?.[key];
    if (mapped) return mapped;
    
    // Fallback: humanize the key
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } catch {
    // Final fallback
    return key.replace(/_/g, ' ');
  }
};

/**
 * Get confidence color
 */
const getConfidenceColor = (confidence: string) => {
  const colorMap: Record<string, string> = {
    'High': 'success',
    'Moderate': 'warning',
    'Low': 'error',
    'Critically Low': 'error'
  };
  return colorMap[confidence] || 'grey';
};

/**
 * Get field value with fallback
 */
const getFieldValue = (key: string) => {
  const value = props.item[key];
  return value !== undefined && value !== null && value !== '' ? value : 'N/A';
};

/**
 * Toggle abstract expansion
 */
const toggleAbstract = () => {
  isExpanded.value = !isExpanded.value;
};

/**
 * Handle title click
 */
const handleTitleClick = () => {
  if (props.titleClickable) {
    emit('title-click', props.item);
    emit('view-details', props.item.primary_id);
  }
};
</script>

<style scoped>
.result-card {
  transition: all 0.3s ease;
}

.result-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-title-link {
  color: #1976d2;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;
}

.result-title-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

.read-more-link {
  color: #1976d2;
  font-weight: 500;
  text-decoration: none;
}

.read-more-link:hover {
  text-decoration: underline;
}
</style>
