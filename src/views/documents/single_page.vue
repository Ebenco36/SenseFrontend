<template>
  <v-app>
    <v-sheet
      tag="header"
      color="#153a9d"
      class="py-8"
      theme="dark"
    >
      <v-container class="mx-auto" max-width="1200">
        <div class="text-deep-orange-accent-4 font-weight-bold mb-2 text-subtitle-1">
          Resources / SAGE documentation
        </div>

        <h1 class="text-h4 font-weight-bold my-1">
          Meeting of the Strategic Advisory Group of Experts on Immunization, March 2025: Conclusions and recommendations
        </h1>

        <div class="d-flex align-center ga-3 mt-6">
          <span class="font-weight-medium">Download:</span>
          <v-btn
            variant="flat"
            color="white"
            density="comfortable"
            class="font-weight-bold"
          >
            EN
          </v-btn>
        </div>
      </v-container>
    </v-sheet>

    <v-main class="bg-white-lighten-4">
      <v-container fluid class="my-8">
        <v-card
          class="mx-auto"
        >
          <v-row no-gutters>
            <v-col
              cols="12"
              md="3"
              class="pa-6 bg-grey-lighten-5"
            >
              <h2 class="text-h3 font-weight-bold">Information</h2>
              <v-divider class="my-4"></v-divider>

              <div class="d-flex flex-column ga-4">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Author(s):</div>
                  <div class="text-body-2">{{ info.author }}</div>
                </div>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">Disease:</div>
                  <div
                    v-for="disease in info.diseases"
                    :key="disease"
                    class="text-body-2"
                  >
                    {{ disease }}
                  </div>
                </div>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">Source(s):</div>
                  <a
                    :href="info.sourceUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-body-2 text-blue-darken-2"
                  >
                    {{ info.sourceUrl }}
                  </a>
                </div>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">Document source(s):</div>
                  <p class="text-body-2">{{ info.documentSource }}</p>
                </div>

                <div>
                  <div class="text-subtitle-1 font-weight-bold">Publication year:</div>
                  <p class="text-body-2">{{ info.publicationYear }}</p>
                </div>
              </div>
            </v-col>

            <v-col
              cols="12"
              md="9"
              class="pa-6"
            >
              <h1 class="text-h3 font-weight-bold mb-4">Abstract</h1>
              
              <div class="text-body-1 d-flex flex-column ga-4">
                <p>
                  The Strategic Advisory Group of Experts on Immunization (SAGE) met on 10–13 March 2025. This report summarizes their discussions, conclusions, and recommendations. All SAGE recommendations are made using evidence-based methods, the details of which are included in the background materials of the meeting.
                </p>
                <p>
                  It covered the following items:
                </p>
              </div>

              <ul class="pl-5 my-4 text-body-1">
                <li
                  v-for="item in abstractItems"
                  :key="item"
                  class="mb-1"
                >
                  {{ item }}
                </li>
              </ul>

              <v-divider class="my-4"></v-divider>

              <v-chip-group>
                <v-chip
                  v-for="tag in tags"
                  :key="tag"
                  variant="flat"
                  color="#FCE4EC" 
                  text-color="#AD1457"
                  size="small"
                  class="font-weight-medium"
                >
                  {{ tag }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

// Reactive data object for the information panel
const info = ref({
  author: 'SAGE',
  diseases: ['Pneumococcal disease', 'Mpox', 'Herpes zoster', 'Poliomyelitis'],
  sourceUrl: 'https://www.who.int/publications/i/item/who-wer-10023-219-238',
  documentSource: 'WHO/WER Weekly Epidemiological Record',
  publicationYear: 2025,
});

// Reactive array for the abstract list items
const abstractItems = ref([
  'Global and regional Reports',
  'IA2030: Country-led data',
  'Pneumococcus vaccination',
  'Mpox',
  'Varicella Herpes Zoster vaccination',
  'Global progress in National Immunization Technical Advisory Group (NITAG) strengthening',
  'Prioritization of new vaccine introductions',
  'Polio',
]);

// Reactive array for the tags
const tags = ref([
  'Meeting report',
  'Pneumococcal disease',
  'Mpox',
  'Herpes zoster',
  'Poliomyelitis',
]);
</script>

<style scoped>


a {
  word-break: break-all;
  text-decoration: none;
  transition: opacity 0.2s ease-in-out;
}

a:hover {
  text-decoration: underline;
  opacity: 0.8;
}
</style>