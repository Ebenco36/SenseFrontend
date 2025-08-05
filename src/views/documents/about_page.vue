<template>
  <v-app>
    <v-main class="bg-white-lighten-4">
      <v-container class="py-8" max-width="960px">
        <div class="text-center mb-10">
          <h1 class="text-h3 font-weight-bold">About Our Platform</h1>
          <p class="text-h6 font-weight-light text-medium-emphasis mt-2">
            Fostering transparency and accessibility in evidence-based research.
          </p>
        </div>

        <v-card border flat class="mb-6">
          <v-card-item>
            <v-card-title>Our Mission</v-card-title>
          </v-card-item>
          <v-card-text class="text-body-1">
            Our goal is to create a living, open, and accessible database of systematic reviews on critical health topics. We aim to empower researchers, clinicians, and policymakers by providing them with the tools to efficiently find, appraise, and synthesize the highest quality evidence. By combining a comprehensive database with powerful visualization and analysis tools, we hope to accelerate the pace of scientific discovery and improve decision-making.
          </v-card-text>
        </v-card>

        <v-card border flat class="mb-6">
          <v-card-item>
            <v-card-title>Data Sources and Curation</v-card-title>
          </v-card-item>
          <v-card-text class="text-body-1">
            <p>Our database is populated through two primary channels:</p>
            <ul class="ms-5 my-4">
              <li><strong>Automated Searches:</strong> We run regular, automated searches of major academic databases such as PubMed, MEDLINE, and the Cochrane Library using a comprehensive set of keywords.</li>
              <li><strong>Community Submissions:</strong> We rely on our community of users to submit new and relevant systematic reviews through our submission portal. Every community submission is vetted by a team of moderators to ensure it meets our inclusion criteria and is accurately classified.</li>
            </ul>
            <p>This hybrid approach ensures our database remains both broad in scope and high in quality.</p>
          </v-card-text>
        </v-card>

        <v-card border flat class="mb-6">
          <v-card-item>
            <v-card-title>Understanding Our Quality Score: AMSTAR 2</v-card-title>
          </v-card-item>
          <v-card-text class="text-body-1">
            <p>To ensure a standardized assessment of methodological quality, every review in our database is appraised using the <a href="#">AMSTAR 2 (A MeaSurement Tool to Assess systematic Reviews)</a> tool. AMSTAR 2 is a 16-item checklist used to critically appraise systematic reviews of randomized and non-randomized studies.</p>
            <p class="mt-2">The final rating of <strong>High, Moderate, Low, or Critically Low</strong> confidence is based on the weaknesses identified across the 16 domains, with particular emphasis on 7 critical domains.</p>
            
            <v-expansion-panels class="mt-4">
              <v-expansion-panel title="View the 16 AMSTAR 2 Domains">
                <v-expansion-panel-text>
                  <v-list density="compact">
                    <v-list-item v-for="(item, index) in amstar2Domains" :key="index" :title="`${index + 1}. ${item}`"></v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';

const amstar2Domains = ref([
  'Did the research questions and inclusion criteria for the review include the components of PICO?',
  'Did the report of the review contain an explicit statement that the review methods were established prior to the conduct of the review...?',
  'Did the review authors explain their selection of the study designs for inclusion in the review?',
  'Did the review authors use a comprehensive literature search strategy?',
  'Did the review authors perform study selection in duplicate?',
  'Did the review authors perform data extraction in duplicate?',
  'Did the review authors provide a list of excluded studies and justify the exclusions?',
  'Did the review authors describe the included studies in adequate detail?',
  'Did the review authors use a satisfactory technique for assessing the risk of bias (RoB) in individual studies...?',
  'Did the review authors report on the sources of funding for the studies included in the review?',
  'If meta-analysis was performed, did the review authors use appropriate methods for statistical combination of results?',
  'If meta-analysis was performed, did the review authors assess the potential impact of RoB in individual studies on the results of the meta-analysis...?',
  'Did the review authors account for RoB in individual studies when interpreting/discussing the results of the review?',
  'Did the review authors provide a satisfactory explanation for, and discussion of, any heterogeneity observed in the results of the review?',
  'If they performed a meta-analysis, did the review authors carry out an investigation of publication bias...?',
  'Did the review authors report any potential sources of conflict of interest...?',
]);
</script>