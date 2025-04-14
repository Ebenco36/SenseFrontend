<template>
  <v-row>
    <v-col cols="12" lg="12">
      <UiParentCard title="User Evaluation" height="100%">
        <div class="upload-container">
          <h2>Upload CSV File</h2>
          <form @submit.prevent="uploadFile">
            <input type="file" @change="handleFileChange" accept=".csv" />
            <button type="submit" :disabled="!file || isLoading">Upload</button>
          </form>

          <div v-if="isLoading" class="loading">Processing file, please wait...</div>

          <div v-if="response" class="response">
            <h3>Response</h3>
            <p v-if="response.status === 'success'">{{ response.message }}</p>
            <p v-if="response.status === 'error'" class="error">{{ response.message }}</p>
            <div v-if="response.data && response.data.output_file">
              <p>Processed file saved at:</p>
              <a :href="response.data.output_file" target="_blank">{{ response.data.output_file }}</a>
            </div>
          </div>
          <div class="download-link">
            <h5>Download Test CSV File

              <a href="/test2_complete.csv" download>Click here to download the test CSV file</a>
            </h5>
            
          </div>
        </div>
      </UiParentCard>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue';
import { uploadProcessing } from '@/api/test'; // Ensure this points to the correct API call
import UiParentCard from '@/components/shared/UiParentCard.vue';

const file = ref(null);
const response = ref(null);
const isLoading = ref(false);

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];

  if (!selectedFile) {
    file.value = null;
    console.error('No file selected');
    return;
  }

  if (selectedFile.type !== 'text/csv') {
    alert('Please select a valid CSV file.');
    file.value = null;
    console.error('Invalid file type:', selectedFile.type);
    return;
  }

  file.value = selectedFile;
  console.log('Selected file:', file.value);
};

const uploadFile = async () => {
  if (!file.value) {
    alert('Please select a file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file.value);

  isLoading.value = true;
  response.value = null;

  try {
    console.log('Uploading file...');
    const res = await uploadProcessing(formData); // API call
    response.value = res.data;
    console.log('Upload successful:', response.value);
  } catch (error) {
    console.error('Upload failed:', error);
    response.value = error.response?.data || {
      status: 'error',
      message: 'An error occurred while uploading the file.',
    };
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.upload-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  margin-top: 10px;
  color: #007bff;
}

.response {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f1f1f1;
}

.response .error {
  color: red;
}

a {
  color: #007bff;
  text-decoration: underline;
}
</style>