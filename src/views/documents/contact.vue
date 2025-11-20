<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-h3 font-weight-bold mb-2">Contact Us</h1>
          <p class="text-body-1 text-medium-emphasis">Get in touch with our team</p>
        </div>

        <v-row>
          <!-- Contact Form -->
          <v-col cols="12" lg="8">
            <v-card border flat>
              <v-card-item>
                <v-card-title class="text-h5 font-weight-bold">Send us a message</v-card-title>
                <v-card-subtitle>We'll get back to you as soon as possible</v-card-subtitle>
              </v-card-item>
              
              <v-card-text class="pa-6">
                <!-- Success Alert -->
                <v-alert
                  v-if="showSuccess"
                  type="success"
                  variant="tonal"
                  closable
                  @click:close="showSuccess = false"
                  class="mb-4"
                >
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-check-circle" class="mr-2"></v-icon>
                    <div>
                      <div class="font-weight-bold">Message sent successfully!</div>
                      <div class="text-body-2">We'll get back to you soon.</div>
                    </div>
                  </div>
                </v-alert>

                <!-- Error Alert -->
                <v-alert
                  v-if="showError"
                  type="error"
                  variant="tonal"
                  closable
                  @click:close="showError = false"
                  class="mb-4"
                >
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-alert-circle" class="mr-2"></v-icon>
                    <div>
                      <div class="font-weight-bold">Failed to send message</div>
                      <div class="text-body-2">{{ errorMessage }}</div>
                    </div>
                  </div>
                </v-alert>

                <v-form ref="contactForm" v-model="formValid" @submit.prevent="submitForm">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.name"
                        label="Full Name"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        prepend-inner-icon="mdi-account-outline"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="formData.email"
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required, rules.email]"
                        prepend-inner-icon="mdi-email-outline"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-text-field
                        v-model="formData.subject"
                        label="Subject"
                        variant="outlined"
                        density="comfortable"
                        :rules="[rules.required]"
                        prepend-inner-icon="mdi-text-box-outline"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="formData.message"
                        label="Message"
                        variant="outlined"
                        rows="6"
                        :rules="[rules.required, rules.minLength]"
                        prepend-inner-icon="mdi-message-text-outline"
                        hint="Minimum 10 characters"
                        counter
                        required
                      ></v-textarea>
                    </v-col>

                    <v-col cols="12">
                      <v-btn
                        type="submit"
                        color="primary"
                        size="large"
                        :disabled="!formValid"
                        :loading="isSubmitting"
                        block
                      >
                        <v-icon icon="mdi-send" class="mr-2"></v-icon>
                        Send Message
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
           <!-- Contact Information -->
          <v-col cols="12" lg="4">
            <v-card border flat class="mb-4">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-map-marker"></v-icon>
                  </v-avatar>
                </template>
                <v-card-title class="font-weight-bold">Address</v-card-title>
              </v-card-item>
              <v-card-text>
                <p class="text-body-2">
                  20 Robert Koch Institute<br>
                  Nordufer<br>
                  Berlin, 13353<br>
                  Germany
                </p>
              </v-card-text>
            </v-card>

            <v-card border flat class="mb-4">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-email"></v-icon>
                  </v-avatar>
                </template>
                <v-card-title class="font-weight-bold">Email</v-card-title>
              </v-card-item>
              <v-card-text>
                <p class="text-body-2">
                  <a href="mailto:contact@rki.de" class="text-primary text-decoration-none">
                    contact@rki.de
                  </a><br>
                  <a href="mailto:support@rki.de" class="text-primary text-decoration-none">
                    support@rki.de
                  </a>
                </p>
              </v-card-text>
            </v-card>

            <v-card border flat class="mb-4">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-phone"></v-icon>
                  </v-avatar>
                </template>
                <v-card-title class="font-weight-bold">Phone</v-card-title>
              </v-card-item>
              <v-card-text>
                <p class="text-body-2">
                  +49 (0) XX XXXX XXXX<br>
                  Mon-Fri, 9am-6pm CET
                </p>
              </v-card-text>
            </v-card>

            <v-card border flat>
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" rounded="lg">
                    <v-icon icon="mdi-clock-outline"></v-icon>
                  </v-avatar>
                </template>
                <v-card-title class="font-weight-bold">Office Hours</v-card-title>
              </v-card-item>
              <v-card-text>
                <p class="text-body-2">
                  Monday - Friday<br>
                  9:00 AM - 6:00 PM CET<br>
                  <span class="text-medium-emphasis">Closed on weekends</span>
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>


        <!-- FAQ Section -->
        <v-row class="mt-6">
          <v-col cols="12">
            <v-card border flat>
              <v-card-item>
                <v-card-title class="text-h5 font-weight-bold">Frequently Asked Questions</v-card-title>
                <v-card-subtitle>Quick answers to common questions</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <v-expansion-panels variant="accordion">
                  <v-expansion-panel v-for="(faq, index) in faqs" :key="index">
                    <v-expansion-panel-title>
                      <div class="d-flex align-center">
                        <v-icon icon="mdi-help-circle-outline" class="mr-3 text-primary"></v-icon>
                        <span class="font-weight-medium">{{ faq.question }}</span>
                      </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <p class="text-body-2 text-medium-emphasis">{{ faq.answer }}</p>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
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

// Form state
const formValid = ref(false);
const isSubmitting = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// Validation rules
const rules = {
  required: (value: string) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Please enter a valid email address';
  },
  minLength: (value: string) => {
    return value.length >= 10 || 'Message must be at least 10 characters';
  }
};

// Submit form
const submitForm = async () => {
  if (!formValid.value) return;

  isSubmitting.value = true;
  showSuccess.value = false;
  showError.value = false;

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Replace with actual API call
    const response = await fetch('http://localhost:5400/api/v1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    });
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to send message');
    }

    // Success
    showSuccess.value = true;
    formData.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };

    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error: any) {
    showError.value = true;
    errorMessage.value = error.message || 'Please try again later';
  } finally {
    isSubmitting.value = false;
  }
};

// FAQs data
const faqs = ref([
  {
    question: 'How long does it take to get a response?',
    answer: 'We typically respond to all inquiries within 24-48 hours during business days. For urgent matters, please call our office directly.'
  },
  {
    question: 'Can I schedule a demo of the platform?',
    answer: 'Yes! We offer personalized demos for research teams and institutions. Please mention "Demo Request" in the subject line and include your preferred time slots.'
  },
  {
    question: 'Do you provide technical support?',
    answer: 'Absolutely. Our technical support team is available during office hours. For existing users, please use the support portal in your dashboard for faster assistance.'
  },
  {
    question: 'How can I collaborate with your team?',
    answer: 'We welcome collaboration opportunities with research institutions, universities, and healthcare organizations. Please provide details about your project in the message.'
  },
  {
    question: 'Is there a user guide or documentation?',
    answer: 'Yes, comprehensive documentation is available in the Help section of the platform. For specific questions, our support team is happy to assist.'
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

.v-form .v-text-field,
.v-form .v-textarea {
  margin-bottom: 0;
}

a {
  transition: color 0.2s ease-in-out;
}

a:hover {
  color: var(--v-primary-darken1) !important;
}
</style>
