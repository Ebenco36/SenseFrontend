<!-- eslint-disable vue/no-mutating-props -->
<template>
    <div>
        <!-- Toggle for Views -->
        <v-row align="center">
            <v-col :xs="12" :sm="12" :md="4" :lg="4" :xl="4">
                <v-card-title>
                    <v-btn-toggle v-model="currentView" mandatory>
                        <v-btn value="table" color="primary">Table View</v-btn>
                        <v-btn value="list" color="primary">List View</v-btn>
                    </v-btn-toggle>
                </v-card-title>
            </v-col>
            <v-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <v-text-field v-model="searchText" @input="searchItemControl" label="Quick Search" outlined shaped flat class="no-underline no-radius"></v-text-field>
            </v-col>
        </v-row>
        <v-row align="center" justify="center" v-if="items.length > 0" class="ma-2">
            <v-col :xs="4" :sm="1" :md="1" :lg="1" :xl="1">
                <v-btn elevation="8" size="small" @click="donwloadFile('csv')">CSV</v-btn>
            </v-col>

            <v-col :xs="4" :sm="1" :md="1" :lg="1" :xl="1">
                <v-btn elevation="8" size="small" @click="donwloadFile('excel')">Excel</v-btn>
            </v-col>

            <v-col :xs="4" :sm="1" :md="1" :lg="1" :xl="1">
                <v-btn elevation="8" size="small" @click="donwloadFile('json')">Json</v-btn>
            </v-col>

            <v-col :xs="4" :sm="9" :md="9" :lg="9" :xl="9">
                <v-pagination rounded="circle" v-if="pagination.total_pages > 1" v-model="pagination.current_page"
                    :length="pagination.total_pages" class="mt-4 pull-right" @update:model-value="updatePage" />
            </v-col>
        </v-row>

        <!-- Conditional Rendering -->

        <div v-if="currentView === 'table'">
            <!-- Table View -->
            <v-data-table :items="items" :headers="headers" :items-per-page="pagination.page_size"
                item-value="primary_id" dense :footer-props="{
                    itemsPerPageOptions: [5, 10, 25, 50],
                    page: pagination.current_page,
                    itemsPerPage: pagination.page_size,
                    itemsLength: pagination.total_records
                }" @update:page="updatePage" @update:items-per-page="updatePageSize">
                <template v-slot:body="{ items }">
                    <tr v-for="item in items" :key="item.primary_id">
                        <td v-for="header in headers" :key="header.value">
                            <slot :name="header.value" :item="item" :header="header">
                                <!-- Format authors for the table -->
                                <template v-if="header.value === 'Authors'">
                                    {{ formatAuthors(safeParseAuthors(item.Authors)) }}
                                </template>
                                <template v-else-if="header.value === 'Title'">
                                    <a 
                                        :href="`/details/${item.primary_id}`" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        class="text-decoration-none"
                                        @click.prevent="navigateToDetails(item.primary_id)"
                                    >
                                        {{ item.Title }}
                                    </a>
                                </template>
                                <template v-else>
                                    {{ item[header.value] }}
                                </template>
                            </slot>
                        </td>
                    </tr>
                </template>

                <template v-slot:no-data>
                    <v-alert :value="true" type="info" class="ma-3">
                        No data available.
                    </v-alert>
                </template>
            </v-data-table>
        </div>

        <div v-else>
            <!-- List View -->
            <v-row>
                <v-col v-for="(item, i) in items" :key="i" cols="12" md="12">
                    <!-- 'elevated', 'flat', 'tonal', 'outlined' -->
                    <!-- <v-card color="primary" variant="outlined" class="mx-auto">
                        <v-card-item>
                            <div>
                                <div class="text-overline mb-1">
                                    {{ item.Journal }}
                                </div>
                                <div class="text-h6 mb-1">
                                    {{ item.Title }}
                                </div>
                                <div class="text-caption mb-2">
                                    {{ item.Authors }}
                                </div>
                                <div class="text-h6 mb-1">
                                    {{ truncateAbstractText(item.Abstract) }}
                                </div>

                            </div>
                        </v-card-item>

                        <v-card-actions>
                            <v-btn text @click="editItem(item)">View</v-btn>
                        </v-card-actions>
                    </v-card> -->
                    <v-card color="primary" variant="outlined" class="mx-auto mb-4">
                        <v-card-item>
                            <div>
                                <!-- Item Number -->
                                <div class="text-caption text-secondary font-weight-medium mb-2"
                                    style="font-size: 0.9rem;">
                                    {{ i + 1 }}. <!-- Numbering -->
                                </div>
                                <!-- Journal Name -->
                                <div class="text-overline font-weight-medium text-secondary mb-2"
                                    style="font-size: 0.8rem;">
                                    {{ item.Journal }}
                                </div>

                                <!-- Clickable Title -->
                                <div class="text-h5 font-weight-bold mb-2" style="font-size: 1.2rem; color: black;">
                                    <a :href="`/details/${item.primary_id}`" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        class="text-decoration-none"
                                        @click.prevent="navigateToDetails(item.primary_id)"
                                    >
                                        {{ item.Title }}
                                    </a>
                                </div>

                                <!-- Authors -->
                                <div class="text-caption mb-3"
                                    style="font-size: 0.9rem; color: black; font-style: italic;">
                                    {{ item.Authors }}
                                </div>

                                <!-- Abstract -->
                                <div class="text-body-2 mb-3" style="font-size: 1rem; line-height: 1.5; color: black;">
                                    <strong v-if="item.Abstract" class="font-weight-medium">Abstract:</strong>
                                    <span v-if="item.Abstract">{{ truncateAbstractText(item.Abstract) }}</span>
                                    <span v-else class="text-secondary">No abstract available.</span>
                                </div>

                                <!-- Additional Details -->
                                <div class="text-caption mb-2" style="font-size: 0.85rem; color: black;">
                                    <span v-if="item.PMID">PMID: <strong>{{ item.PMID }}</strong></span>
                                    <span v-if="item.DOI"> | DOI: <a :href="`/details/${item.primary_id}`" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        @click.prevent="navigateToDetails(item.primary_id)" class="text-link">{{ item.DOI }}</a></span>
                                    <span v-if="item.PublicationType"> | <em>{{ item.PublicationType }}</em></span>
                                </div>

                                <!-- Open Access Indicator -->
                                <div v-if="item.Open_access" class="text-body-2 text-success font-weight-medium">
                                    {{item.Open_access}} ({{ item.Year }})
                                </div>
                            </div>
                        </v-card-item>

                        <!-- Actions -->
                        <!-- <v-card-actions>
                            <v-btn text color="primary" class="font-weight-bold text-uppercase" @click="editItem(item)" style="font-size: 0.85rem;">
                                View
                            </v-btn>
                            <v-btn text color="error" class="font-weight-bold text-uppercase" @click="deleteItem(item)" style="font-size: 0.85rem;">
                                Delete
                            </v-btn>
                        </v-card-actions> -->
                    </v-card>
                </v-col>
            </v-row>
        </div>
        <!-- Pagination for List View -->
        <v-pagination rounded="circle" v-if="pagination.total_pages > 1" v-model="pagination.current_page"
            :length="pagination.total_pages" class="mt-4" @update:model-value="updatePage" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type PropType } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// Props
const props = defineProps({
    items: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
    headers: {
        type: Array as PropType<{ title: string; value: string }[]>,
        required: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    pagination: {
        type: Object as PropType<{
            total_records: number;
            total_pages: number;
            current_page: number;
            page_size: number;
        }>,
        required: true,
    },
});

// Create a computed property to truncate the text
function truncateAbstractText(text: any, length = 400) {
    return text.length > length ? text.slice(0, length) + "..." : text;
}

// State
const currentView = ref('table');

const searchText = ref("")
// Emit Events for Pagination
const emit = defineEmits([
    'download:file',
    'update:page',
    'search:title',
    'update:items-per-page'
]);


const searchItemControl = (text: string) => {
    emit('search:title', text);
};
// Methods
const donwloadFile = (page: string) => {
    emit('download:file', page);
};
const updatePage = (page: number) => {
    emit('update:page', page);
};
const updatePageSize = (pageSize: number) => {
    emit('update:items-per-page', pageSize);
};



const navigateToDetails = (id: string | undefined) => {
  if (id) {
    console.log(id)
    router.push({ name: 'details', params: { id } });
  } else {
    console.error('Error: ID is missing');
  }
};

// Safely Parse Authors
const safeParseAuthors = (authorsString: string): string[] => {
    try {
        // Step 1: Trim and sanitize the input
        const trimmedString = authorsString.trim();

        // Step 2: Handle JSON-like strings
        if (trimmedString.startsWith('[') && trimmedString.endsWith(']')) {
            const sanitized = trimmedString
                .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
                .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
                .replace(/\\'/g, "'") // Convert improperly escaped single quotes
                .replace(/'/g, '"'); // Convert single quotes to double quotes for JSON compatibility

            try {
                return JSON.parse(sanitized); // Parse the sanitized JSON string
            } catch (jsonError) {
                console.error('Failed to parse JSON-like string:', jsonError, 'Sanitized string:', sanitized);
                throw jsonError; // Re-throw to allow fallback
            }
        }

        // Step 3: Handle semicolon-separated strings
        if (trimmedString.includes(';')) {
            return trimmedString.split(';').map((author) => author.trim());
        }

        // Step 4: Handle comma-separated strings
        if (trimmedString.includes(',')) {
            return trimmedString.split(',').map((author) => author.trim());
        }

        // Step 5: Return single author as an array
        if (trimmedString.length > 0) {
            return [trimmedString];
        }

        // Step 6: Return an empty array for invalid or empty strings
        return [];
    } catch (error) {
        // Log the error and problematic input
        console.error('Error parsing authors:', error, 'Input string:', authorsString);
        return []; // Fallback to an empty array on error
    }
};


// Format Authors
const formatAuthors = (authors: string[]): string => {

    if (authors.length > 3) {
        return `${authors[0]}, ${authors[1]}, ${authors[2]} et al.`; // Show first 3 authors with "et al."
    }
    console.log(authors.length > 3)
    return authors.join(', '); // Comma-separated list for 3 or fewer authors
};

// Placeholder methods for actions
const editItem = (item: any) => console.log('Edit item:', item);
//   const deleteItem = (item: any) => console.log('Delete item:', item);
</script>

<style scoped>
.no-underline .v-input__control {
  border-bottom: none !important;
}
.no-radius .v-input__control {
  border-radius: 0 !important;
}
</style>