<script setup lang="ts">
import { ref, shallowRef } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const page = ref({ title: 'Contact' });
const breadcrumbs = shallowRef([
  {
    title: 'Contact',
    disabled: false,
    href: '#'
  }
]);

const formValid = ref(false);
const formData = ref({
  name: '',
  email: '',
  message: ''
});

const rules = {
  required: (value: unknown) => !!value || 'This field is required.',
  email: (value: string) => /.+@.+\..+/.test(value) || 'E-mail must be valid.'
};

const submitForm = () => {
  if (formValid.value) {
    console.log('Form Submitted', formData.value);
    alert('Thank you for contacting us!');
    formData.value = { name: '', email: '', message: '' };
  }
};
</script>

<template>
  <!-- <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="Contact">
        <v-row justify="center">
          <v-col cols="12" md="8">
            <h1 class="mb-4">Contact Us</h1>
            <p class="mb-4">Have any questions? Feel free to reach out to us using the form below!</p>
            <v-form ref="contactForm" v-model="formValid">
              <v-text-field v-model="formData.name" label="Full Name" :rules="[rules.required]" required></v-text-field>
              <v-text-field
                v-model="formData.email"
                label="Email"
                type="email"
                :rules="[rules.required, rules.email]"
                required
              ></v-text-field>
              <v-textarea v-model="formData.message" label="Message" :rules="[rules.required]" required></v-textarea>
              <v-btn :disabled="!formValid" @click="submitForm" class="mt-4" color="primary"> Submit </v-btn>
            </v-form>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<style scoped>
.contact-us {
  padding: 2rem;
}
h1 {
  color: #3f51b5;
}
</style>