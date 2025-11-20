<template>
  <v-app>
    <v-main >
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-h3 font-weight-bold mb-2">About Us</h1>
          <p class="text-body-1 text-medium-emphasis">Learn more about our mission and vision</p>
        </div>

        <!-- Main Content -->
        <v-row justify="center">
          <v-col >
            <!-- Hero Section -->
            <v-card border flat class="mb-6">
              <v-card-text class="pa-8 text-center">
                <v-icon icon="mdi-information-outline" size="64" color="primary" class="mb-4"></v-icon>
                <h2 class="text-h4 font-weight-bold mb-4">Who We Are</h2>
                <p class="text-body-1 text-medium-emphasis mx-auto" >
                  We are a dedicated team of researchers and data scientists committed to advancing systematic review 
                  methodologies and evidence-based research. Our platform provides comprehensive tools for analyzing, 
                  visualizing, and managing systematic review data from multiple sources.
                </p>
              </v-card-text>
            </v-card>

            <!-- Mission & Vision -->
            <v-row class="mb-6">
              <v-col cols="12" md="6">
                <v-card border flat class="h-100">
                  <v-card-item>
                    <template #prepend>
                      <v-avatar color="primary" variant="tonal" rounded="lg" size="56">
                        <v-icon icon="mdi-target" size="32"></v-icon>
                      </v-avatar>
                    </template>
                  </v-card-item>
                  <v-card-text>
                    <h3 class="text-h5 font-weight-bold mb-3">Our Mission</h3>
                    <p class="text-body-1">
                      To empower researchers worldwide with cutting-edge tools and insights that streamline the 
                      systematic review process, enhance research quality, and accelerate evidence-based decision making.
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card border flat class="h-100">
                  <v-card-item>
                    <template #prepend>
                      <v-avatar color="primary" variant="tonal" rounded="lg" size="56">
                        <v-icon icon="mdi-eye-outline" size="32"></v-icon>
                      </v-avatar>
                    </template>
                  </v-card-item>
                  <v-card-text>
                    <h3 class="text-h5 font-weight-bold mb-3">Our Vision</h3>
                    <p class="text-body-1">
                      To become the leading platform for systematic review analytics, fostering a global community 
                      of researchers who leverage data-driven insights to advance scientific knowledge and improve 
                      healthcare outcomes.
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Key Features -->
            <v-card border flat class="mb-6">
              <v-card-item>
                <v-card-title class="text-h5 font-weight-bold">What We Offer</v-card-title>
              </v-card-item>
              <v-card-text>
                <v-row>
                  <v-col v-for="feature in features" :key="feature.title" cols="12" sm="6" md="4">
                    <div class="text-center pa-4">
                      <v-avatar color="primary" variant="tonal" size="72" class="mb-3">
                        <v-icon :icon="feature.icon" size="40"></v-icon>
                      </v-avatar>
                      <h4 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h4>
                      <p class="text-body-2 text-medium-emphasis">{{ feature.description }}</p>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Statistics -->
            <v-row class="mb-6">
              <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
                <v-card border flat color="primary" variant="tonal" class="text-center">
                  <v-card-text class="pa-6">
                    <div class="text-h3 font-weight-bold text-primary mb-2">{{ stat.value }}</div>
                    <div class="text-body-2 text-medium-emphasis">{{ stat.title }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Team Section -->
            <v-card border flat class="mb-6">
              <v-card-item>
                <v-card-title class="text-h5 font-weight-bold">Our Team</v-card-title>
                <v-card-subtitle>Meet the people behind the platform</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <v-row>
                  <v-col v-for="member in team" :key="member.name" cols="12" sm="6" md="4">
                    <v-card border flat hover>
                      <v-card-text class="text-center">
                        <v-avatar color="primary" variant="tonal" size="100" class="mb-3">
                          <v-icon icon="mdi-account" size="56"></v-icon>
                        </v-avatar>
                        <h4 class="text-h6 font-weight-bold mb-1">{{ member.name }}</h4>
                        <p class="text-body-2 text-primary mb-2">{{ member.role }}</p>
                        <p class="text-caption text-medium-emphasis">{{ member.bio }}</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Contact CTA -->
            <v-card border flat color="primary" variant="tonal">
              <v-card-text class="pa-8 text-center">
                <h3 class="text-h5 font-weight-bold mb-3">Get In Touch</h3>
                <p class="text-body-1 mb-4">
                  Have questions or want to learn more? We'd love to hear from you.
                </p>
                <v-btn color="primary" size="large" variant="flat" prepend-icon="mdi-email" href="contact">
                  Contact Us
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Features data
const features = ref([
  {
    icon: 'mdi-chart-line',
    title: 'Data Visualization',
    description: 'Interactive charts and graphs to explore systematic review trends and patterns'
  },
  {
    icon: 'mdi-database-search',
    title: 'Multi-Source Integration',
    description: 'Aggregate data from OVID, PubMed, Cochrane, and other major databases'
  },
  {
    icon: 'mdi-filter',
    title: 'Advanced Filtering',
    description: 'Powerful search and filter capabilities to refine your research scope'
  },
  {
    icon: 'mdi-file-chart',
    title: 'Report Generation',
    description: 'Automated reports and exports for documentation and publication'
  },
  {
    icon: 'mdi-quality-high',
    title: 'Quality Assessment',
    description: 'AMSTAR 2 integration for systematic review quality evaluation'
  },
  {
    icon: 'mdi-account-group',
    title: 'Collaboration Tools',
    description: 'Share insights and collaborate with research teams worldwide'
  }
]);

// Statistics data
const stats = ref([
  { title: 'Reviews Analyzed', value: '10K+' },
  { title: 'Data Sources', value: '15+' },
  { title: 'Researchers', value: '500+' },
  { title: 'Countries', value: '50+' }
]);

// Team data
const team = ref([
  {
    name: 'Dr. Jane Smith',
    role: 'Lead Researcher',
    bio: 'PhD in Epidemiology with 15 years of systematic review experience'
  },
  {
    name: 'John Doe',
    role: 'Data Scientist',
    bio: 'Expert in data analytics and machine learning for healthcare research'
  },
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    bio: 'Full-stack developer specializing in research data platforms'
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Clinical Advisor',
    bio: 'Medical doctor and evidence-based medicine specialist'
  },
  {
    name: 'Emma Wilson',
    role: 'UX Designer',
    bio: 'Creating intuitive interfaces for complex research workflows'
  },
  {
    name: 'David Brown',
    role: 'Project Manager',
    bio: 'Coordinating research initiatives and platform development'
  }
]);
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-avatar {
  transition: transform 0.2s ease-in-out;
}

.v-avatar:hover {
  transform: scale(1.1);
}
</style>
