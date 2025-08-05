<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8" max-width="1000px">
        <h1 class="text-h4 font-weight-bold">Submit a New Record</h1>
        <p class="text-medium-emphasis mb-6">Contribute a new systematic review to the database.</p>

        <v-stepper v-model="step" :items="stepperItems" alt-labels>
          <template v-slot:item.1>
            <v-card title="Citation Details" flat>
              <v-card-text class="d-flex flex-column ga-4">
                <v-text-field label="Title of Systematic Review" v-model="newRecord.title" variant="outlined"></v-text-field>
                <v-combobox label="Authors (e.g., Smith J, Doe A)" v-model="newRecord.authors" multiple chips closable-chips variant="outlined" hint="Press Enter to add a new author"></v-combobox>
                <v-row>
                  <v-col cols="12" md="4"><v-text-field label="Publication Year" v-model="newRecord.year" type="number" variant="outlined"></v-text-field></v-col>
                  <v-col cols="12" md="8"><v-text-field label="Journal or Source" v-model="newRecord.journal" variant="outlined"></v-text-field></v-col>
                </v-row>
                <v-text-field label="DOI or Source URL" v-model="newRecord.doi" variant="outlined"></v-text-field>
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card title="Classification" flat>
               <v-card-text class="d-flex flex-column ga-4">
                  <v-autocomplete label="Topics" v-model="newRecord.topics" :items="['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'COVID-19']" multiple chips closable-chips variant="outlined"></v-autocomplete>
                  <v-autocomplete label="Countries of Lead Authors" v-model="newRecord.countries" :items="['USA', 'UK', 'Germany', 'Canada', 'China']" multiple chips closable-chips variant="outlined"></v-autocomplete>
                  <v-textarea label="Abstract" v-model="newRecord.abstract" variant="outlined" rows="5"></v-textarea>
               </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.3>
            <v-card title="Quality Assessment (AMSTAR 2)" flat>
              <v-card-subtitle>Rate the following domains for the review.</v-card-subtitle>
              <v-list lines="two" class="py-0">
                <div v-for="item in amstarItems" :key="item.id">
                  <v-divider></v-divider>
                  <v-list-item>
                     <v-list-item-title class="font-weight-medium">{{ item.id }}. {{ item.text }}</v-list-item-title>
                      <template v-slot:append>
                        <v-radio-group v-model="newRecord.amstar[item.id]" inline hide-details class="ms-4">
                          <v-radio label="Yes" value="Yes" color="success"></v-radio>
                          <v-radio label="No" value="No" color="error"></v-radio>
                           <v-radio label="Partial" value="Partial Yes" color="warning"></v-radio>
                        </v-radio-group>
                      </template>
                  </v-list-item>
                </div>
              </v-list>
            </v-card>
          </template>

          <template v-slot:item.4>
            <v-card title="Upload & Review" flat>
                <v-card-text>
                  <v-label class="font-weight-medium mb-2">Upload Full Text (PDF)</v-label>
                  <v-file-input v-model="newRecord.file" label="Select PDF file" variant="outlined" accept=".pdf"></v-file-input>
                  
                  <v-divider class="my-6"></v-divider>

                  <h3 class="text-h6 mb-2">Final Summary</h3>
                  <p class="mb-4">Please review all information before submitting.</p>
                  <div class="summary-grid">
                    <strong>Title:</strong> <p>{{ newRecord.title || '...' }}</p>
                    <strong>Authors:</strong> <p>{{ newRecord.authors.join(', ') || '...' }}</p>
                    <strong>Year:</strong> <p>{{ newRecord.year || '...' }}</p>
                    <strong>Topics:</strong> <p>{{ newRecord.topics.join(', ') || '...' }}</p>
                  </div>

                  <v-alert type="info" variant="tonal" class="mt-6">
                    Your submission will be reviewed by a moderator before being published. Thank you for your contribution!
                  </v-alert>
                </v-card-text>
            </v-card>
          </template>
        </v-stepper>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const step = ref(1);
const stepperItems = ref(['Citation', 'Classification', 'Quality', 'Submit']);

const newRecord = ref({
  title: '',
  authors: [],
  year: new Date().getFullYear(),
  journal: '',
  doi: '',
  topics: [],
  countries: [],
  abstract: '',
  amstar: {},
  file: null,
});

// A subset of AMSTAR 2 questions for demonstration
const amstarItems = ref([
  { id: 2, text: 'Did the report of the review contain an explicit statement that the review methods were established prior to the conduct of the review...?' },
  { id: 4, text: 'Did the review authors use a comprehensive literature search strategy?' },
  { id: 7, text: 'Did the review authors provide a list of excluded studies and justify the exclusions?' },
  { id: 9, text: 'Did the review authors use a satisfactory technique for assessing the risk of bias (RoB) in individual studies...?' },
  { id: 11, text: 'If meta-analysis was performed, did the review authors use appropriate methods for statistical combination of results?' },
]);
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  align-items: center;
}
.summary-grid p {
  margin: 0;
}
</style>