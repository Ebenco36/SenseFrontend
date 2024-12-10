<template>
    <div class="meta-analysis-page">
        <!-- Header -->
        <v-container class="py-4">
            <v-row>
                <v-col>
                    <v-breadcrumbs class="mb-2">
                        <v-breadcrumbs-item href="#">
                            Resources
                        </v-breadcrumbs-item>
                        <v-breadcrumbs-item href="#">{{ journalInformation?.Publication_type }}</v-breadcrumbs-item>
                    </v-breadcrumbs>
                    <h1 class="font-weight-bold">
                        {{ journalInformation?.Title }}
                    </h1>
                </v-col>
            </v-row>
        </v-container>

        <!-- Main Content -->
        <v-container>
            <v-row>
                <!-- Information Card -->
                <v-col cols="12" md="3">
                    <v-card outlined>
                        <v-card-title class="font-weight-bold">Information</v-card-title>
                        <v-card-text>
                            <v-list dense>
                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Rating:</v-list-item-title>
                                        <v-list-item-subtitle>Low</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Authors:</v-list-item-title>
                                        <v-list-item-subtitle>{{ journalInformation?.Authors }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Disease:</v-list-item-title>
                                        <v-list-item-subtitle>Influenza</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Source(s):</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <a :href="journalInformation?.DOI" target="_blank">
                                                {{ journalInformation?.DOI }}
                                            </a>
                                        </v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Open access:</v-list-item-title>
                                        <v-list-item-subtitle>{{journalInformation?.Open_access}}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Date of last literature search:</v-list-item-title>
                                        <v-list-item-subtitle>Apr 2022</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Number of studies:</v-list-item-title>
                                        <v-list-item-subtitle>10</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>

                                <v-list-item>
                                    <v-list-item-content>
                                        <v-list-item-title>Publication year:</v-list-item-title>
                                        <v-list-item-subtitle>{{ journalInformation?.Year }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Abstract Section -->
                <v-col cols="12" md="9">
                    <v-card outlined>
                        <v-card-title class="font-weight-bold">Abstract</v-card-title>
                        <v-card-text>
                            <p>{{ journalInformation?.Abstract }}</p>
                            
                        </v-card-text>
                        <v-card-actions>
                            <v-chip-group>
                                <v-chip class="ma-1" outlined>Older adults</v-chip>
                                <v-chip class="ma-1" outlined>Efficacy/effectiveness</v-chip>
                                <v-chip class="ma-1" outlined>Administration</v-chip>
                                <v-chip class="ma-1" outlined>Influenza</v-chip>
                            </v-chip-group>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { fetchJournalinformation } from '@/api/journal';
import type { ResponseData } from '@/types/my-types/Journal';
import { ref, onMounted } from 'vue';

// Reactive state to hold the fetched journal information
const journalInformation = ref<ResponseData | null>(null);

// Extract `id` from the route parameters
const route = useRoute();
const id = route.params.id as string | undefined; // Ensure `id` is typed correctly

const loadInformation = async () => {
    if (!id) {
        console.error('Error: ID parameter is missing');
        return;
    }

    try {
        // Call the API to fetch journal information
        const response = await fetchJournalinformation(id);

        if (response.status === 'success') {
            // Store the fetched data in the `journalInformation` state
            journalInformation.value = response.data;
        } else {
            // Handle API error responses
            console.error('Failed to fetch journal information:', response.message);
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('Error loading journal information:', error);
    }
};

// Load journal information when the component is mounted
onMounted(() => {
    loadInformation();
});
</script>
<style scoped>
.meta-analysis-page {
    background-color: #f4f6fa;
}

h1 {
    color: #003e7e;
}

a {
    color: #1e88e5;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>