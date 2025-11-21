<template>
  <v-data-table
    :headers="computedHeaders"
    :items="items"
    :items-per-page="itemsPerPage"
    :hide-default-footer="hideDefaultFooter"
    :item-value="itemValue"
    :show-expand="showExpand"
    :class="['custom-data-table', tableClass]"
    hover
    v-bind="$attrs"
  >
    <!-- Expand Button -->
    <template v-if="showExpand" #item.data-table-expand="{ internalItem, isExpanded, toggleExpand }">
      <v-btn 
        :icon="isExpanded(internalItem) ? expandedIcon : collapsedIcon" 
        size="small"
        variant="text" 
        color="primary"
        @click="toggleExpand(internalItem)"
      />
    </template>

    <!-- Title Column (Clickable) -->
    <template v-for="header in titleHeaders" :key="`title-${header.key}`" #[`item.${header.key}`]="{ item }">
      <div class="title-cell">
        <a 
          href="#" 
          @click.prevent="handleTitleClick(item)" 
          class="title-link"
          :title="item[header.key]"
        >
          {{ truncateText(item[header.key], header.truncate || 80) }}
        </a>
      </div>
    </template>

    <!-- Link Column (External Link with Tooltip) -->
    <template v-for="header in linkHeaders" :key="`link-${header.key}`" #[`item.${header.key}`]="{ item }">
      <div class="link-cell">
        <v-tooltip v-if="item[header.key] && item[header.key] != '#'" location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn 
              v-bind="tooltipProps"
              size="small" 
              variant="text" 
              color="primary" 
              :href="item[header.key]" 
              target="_blank"
              rel="noopener noreferrer"
              icon="mdi-open-in-new"
              class="external-link-btn"
            />
          </template>
          <span>Open article in new tab</span>
        </v-tooltip>
        <span v-else class="text-medium-emphasis">—</span>
      </div>
    </template>

    <!-- Chip Column (Colored Tags) -->
    <template v-for="header in chipHeaders" :key="`chip-${header.key}`" #[`item.${header.key}`]="{ item }">
      <div class="chip-cell">
        <v-chip 
          v-if="item[header.key] && item[header.key] !== 'N/A'"
          :color="getChipColor(header.key, item[header.key])" 
          size="small" 
          variant="tonal"
          class="font-weight-medium"
        >
          {{ item[header.key] }}
        </v-chip>
        <span v-else class="text-medium-emphasis">{{ header.naText || 'N/A' }}</span>
      </div>
    </template>

    <!-- Custom Column Slots -->
    <template v-for="(_, name) in filteredSlots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>

    <!-- Expanded Row -->
    <template v-if="showExpand" #expanded-row="{ columns, item }">
      <tr class="expanded-row">
        <td :colspan="columns.length" class="pa-0">
          <div class="expanded-content">
            <v-card flat class="ma-4 elevation-0" color="grey-lighten-5">
              <v-card-text class="pa-6">
                <slot name="expanded-content" :item="item">
                  <!-- Default Expanded Content -->
                  <div class="mb-4">
                    <h4 class="text-subtitle-1 font-weight-bold mb-3 text-primary">
                      {{ expandedTitle }}
                    </h4>
                    <p class="text-body-2 text-grey-darken-1 line-height-relaxed">
                      {{ getExpandedText(item) }}
                    </p>
                    <a
                      v-if="shouldShowReadMore(item)"
                      href="#"
                      class="read-more-link text-body-2"
                      @click.prevent="toggleExpandedText(item)"
                    >
                      {{ item.isAbstractExpanded ? 'Show Less' : 'Show More' }}
                      <v-icon size="small" class="ms-1">
                        {{ item.isAbstractExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </a>
                  </div>
                  
                  <v-divider v-if="expandedFields.length > 0" class="my-4" />
                  
                  <!-- Expanded Details Grid -->
                  <v-row v-if="expandedFields.length > 0" dense>
                    <v-col 
                      v-for="field in expandedFields" 
                      :key="field.key"
                      :cols="field.cols || 12" 
                      :md="field.md || 6"
                    >
                      <div :class="['expanded-field', field.class]">
                        <div class="field-label text-caption text-medium-emphasis mb-1">
                          {{ field.label }}
                        </div>
                        
                        <!-- Chip Group -->
                        <v-chip-group v-if="field.type === 'chips' && getArrayValue(item[field.key]).length > 0" class="mt-1">
                          <v-chip 
                            v-for="(tag, index) in getArrayValue(item[field.key])" 
                            :key="`${field.key}-${tag}-${index}`" 
                            size="small"
                            :color="field.chipColor || 'blue-grey-lighten-4'"
                            variant="tonal"
                          >
                            {{ formatLabel(tag) }}
                          </v-chip>
                        </v-chip-group>
                        
                        <!-- Single Chip -->
                        <v-chip
                          v-else-if="field.type === 'chip'"
                          :color="getFieldChipColor(field, item[field.key])"
                          size="small"
                          variant="tonal"
                          class="font-weight-medium"
                        >
                          {{ getFieldChipLabel(field, item[field.key]) }}
                        </v-chip>
                        
                        <!-- Text Value -->
                        <div v-else class="field-value font-weight-medium text-body-2">
                          {{ item[field.key] || field.naText || 'N/A' }}
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </slot>
              </v-card-text>
            </v-card>
          </div>
        </td>
      </tr>
    </template>

    <!-- No Data -->
    <template #no-data>
      <slot name="no-data">
        <div class="no-data-container text-center py-12">
          <v-icon :icon="noDataIcon" size="64" color="grey-lighten-2" class="mb-4" />
          <p class="text-h6 text-grey-darken-1 mb-2">{{ noDataText }}</p>
          <p class="text-body-2 text-medium-emphasis">{{ noDataSubtext }}</p>
        </div>
      </slot>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { mapper } from '@/services/index.js';

const slots = useSlots();

// ==========================================
// TYPES
// ==========================================

interface Header {
  title: string;
  key: string;
  type?: 'title' | 'link' | 'chip';
  truncate?: number;
  naText?: string;
  sortable?: boolean;
}

interface ExpandedField {
  key: string;
  label: string;
  type?: 'chips' | 'chip' | 'text';
  cols?: number;
  md?: number;
  class?: string;
  chipColor?: string;
  chipColorMap?: Record<string, string>;
  chipCondition?: (value: any) => boolean;
  chipColorTrue?: string;
  chipColorFalse?: string;
  chipLabelTrue?: string;
  chipLabelFalse?: string;
  chipLabelMap?: Record<string, string>;
  naText?: string;
}

// ==========================================
// PROPS
// ==========================================

const props = defineProps({
  items: {
    type: Array as () => any[],
    required: true
  },
  headers: {
    type: Array as () => Header[],
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  itemValue: {
    type: String,
    default: 'primary_id'
  },
  hideDefaultFooter: {
    type: Boolean,
    default: true
  },
  showExpand: {
    type: Boolean,
    default: false
  },
  tableClass: {
    type: String,
    default: ''
  },
  expandedIcon: {
    type: String,
    default: 'mdi-chevron-up'
  },
  collapsedIcon: {
    type: String,
    default: 'mdi-chevron-down'
  },
  expandedTitle: {
    type: String,
    default: 'Abstract'
  },
  expandedTextField: {
    type: String,
    default: 'abstract'
  },
  expandedTextLimit: {
    type: Number,
    default: 400
  },
  expandedFields: {
    type: Array as () => ExpandedField[],
    default: () => []
  },
  chipColorMap: {
    type: Object as () => Record<string, Record<string, string>>,
    default: () => ({
      overallConf: {
        'High': 'success',
        'Moderate': 'warning',
        'Low': 'error',
        'Critically Low': 'error'
      }
    })
  },
  noDataIcon: {
    type: String,
    default: 'mdi-database-search'
  },
  noDataText: {
    type: String,
    default: 'No results found'
  },
  noDataSubtext: {
    type: String,
    default: 'Try adjusting your search or filters'
  }
});

// ==========================================
// EMITS
// ==========================================

const emit = defineEmits<{
  'title-click': [item: any]
}>();

// ==========================================
// COMPUTED
// ==========================================

const computedHeaders = computed(() => props.headers);

const titleHeaders = computed(() => props.headers.filter(h => h.type === 'title'));
const linkHeaders = computed(() => props.headers.filter(h => h.type === 'link'));
const chipHeaders = computed(() => props.headers.filter(h => h.type === 'chip'));

const filteredSlots = computed(() => {
  const filtered: Record<string, any> = {};
  for (const name in slots) {
    if (!name.startsWith('item.') || 
        !titleHeaders.value.some(h => name === `item.${h.key}`) &&
        !linkHeaders.value.some(h => name === `item.${h.key}`) &&
        !chipHeaders.value.some(h => name === `item.${h.key}`)) {
      filtered[name] = slots[name];
    }
  }
  return filtered;
});

// ==========================================
// METHODS
// ==========================================

/**
 * Truncate text to specified length
 */
const truncateText = (text: string | undefined, length: number): string => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Handle title click event
 */
const handleTitleClick = (item: any): void => {
  emit('title-click', item);
};

/**
 * Get chip color from color map
 */
const getChipColor = (key: string, value: string): string => {
  const colorMap = props.chipColorMap[key];
  return colorMap?.[value] || 'grey';
};

/**
 * Get expanded text with truncation
 */
const getExpandedText = (item: any): string => {
  const text = item[props.expandedTextField] || '';
  if (item.isAbstractExpanded || text.length <= props.expandedTextLimit) {
    return text;
  }
  return truncateText(text, props.expandedTextLimit);
};

/**
 * Check if "Read More" should be shown
 */
const shouldShowReadMore = (item: any): boolean => {
  const text = item[props.expandedTextField] || '';
  return text.length > props.expandedTextLimit;
};

/**
 * Toggle expanded text state
 */
const toggleExpandedText = (item: any): void => {
  item.isAbstractExpanded = !item.isAbstractExpanded;
};

/**
 * Safely convert value to array
 */
const getArrayValue = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value.split(',').map((v: string) => v.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Get chip color for expanded field
 */
const getFieldChipColor = (field: ExpandedField, value: any): string => {
  if (field.chipColorMap) {
    return field.chipColorMap[value] || field.chipColor || 'grey';
  }
  if (field.chipCondition) {
    return field.chipCondition(value) ? (field.chipColorTrue || 'success') : (field.chipColorFalse || 'error');
  }
  return field.chipColor || 'grey';
};

/**
 * Get chip label for expanded field
 */
const getFieldChipLabel = (field: ExpandedField, value: any): string => {
  if (field.chipLabelMap) {
    return field.chipLabelMap[value] || value;
  }
  if (field.chipCondition) {
    return field.chipCondition(value) ? (field.chipLabelTrue || 'Yes') : (field.chipLabelFalse || 'No');
  }
  return value;
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
</script>

<style scoped>
/* ========================================== */
/* TABLE STYLING */
/* ========================================== */

.custom-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-data-table :deep(thead) {
  background-color: rgb(var(--v-theme-surface));
}

.custom-data-table :deep(th) {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgb(var(--v-theme-on-surface)) !important;
  padding: 16px !important;
}

.custom-data-table :deep(td) {
  padding: 16px !important;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08) !important;
}

.custom-data-table :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

/* ========================================== */
/* CELL STYLING */
/* ========================================== */

.title-cell,
.link-cell,
.chip-cell {
  display: flex;
  align-items: center;
  min-height: 48px;
}

.title-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-block;
  line-height: 1.5;
}

.title-link:hover {
  color: rgb(var(--v-theme-primary-darken-1));
  text-decoration: underline;
}

.external-link-btn {
  transition: all 0.2s ease;
}

.external-link-btn:hover {
  transform: scale(1.1);
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.external-link-btn:active {
  transform: scale(0.95);
}

/* ========================================== */
/* EXPANDED ROW STYLING */
/* ========================================== */

.expanded-row {
  background-color: rgb(var(--v-theme-surface));
}

.expanded-content {
  animation: expandAnimation 0.3s ease-out;
}

@keyframes expandAnimation {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-height-relaxed {
  line-height: 1.7;
}

.read-more-link {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.read-more-link:hover {
  color: rgb(var(--v-theme-primary-darken-1));
  text-decoration: underline;
}

/* ========================================== */
/* EXPANDED FIELDS */
/* ========================================== */

.expanded-field {
  margin-bottom: 16px;
}

.field-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.field-value {
  color: rgb(var(--v-theme-on-surface));
}

/* ========================================== */
/* NO DATA STATE */
/* ========================================== */

.no-data-container {
  padding: 60px 20px;
}

/* ========================================== */
/* DARK MODE ADJUSTMENTS */
/* ========================================== */

@media (prefers-color-scheme: dark) {
  .custom-data-table :deep(td) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
}
</style>
