<script 
  setup 
  lang="ts"
>
import { ref, shallowRef, onMounted, computed, reactive } from 'vue';
import CustomTable from '@/components/CustomTable.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { postUserSelectionProcess } from '@/api/userSelection';
import FilterForm from '@/components/shared/FilterForm.vue';
import Loader from '@/components/shared/PageLoader.vue';
import type { ApiResponse, StudyData } from '@/types/my-types/Journals';

const page = ref({ title: 'Journals' });
const breadcrumbs = shallowRef([
  { title: 'Journal', disabled: false, href: '#' },
  { title: 'Views', disabled: true, href: '#' }
]);

// State Variables
const loading = ref(false);
const items = ref<StudyData[]>([]);
const headers = ref([
  { title: 'Title', value: 'Title', align: 'start', sortable: true },
  { title: 'Authors', value: 'Authors', align: 'start', sortable: true },
  { title: 'Link', value: 'link', align: 'start', sortable: true },
  { title: 'Overall Conf.', value: 'overall_conf', align: 'start', sortable: true },
  { title: 'Num. Studies', value: 'no_o_stud', align: 'start', sortable: true },
  { title: 'Lit Search Date', value: 'date_o_ll_search', align: 'start', sortable: true },
  { title: 'Appraisal Date', value: 'date_o_qa', align: 'start', sortable: true },
  { title: 'Country', value: 'Country', align: 'start', sortable: true },
  { title: 'Disease', value: 'Disease', align: 'start', sortable: true },
  { title: 'Notes', value: 'Notes', align: 'start', sortable: true },
  { title: 'Amster 2 Flaws', value: 'amster_flaws', align: 'start', sortable: true },
]);

const snackbar = ref({
  visible: false,
  message: '',
  color: 'error',
  timeout: 3000
});

const additionalFields = reactive<Array<{ column: string; value: string; type: string }>>([]);

const appliedFilters = ref<Record<string, string[]>>({});

// Pagination Control
const pagination = ref<ApiResponse['data']['pagination']>({
  current_page: 1,
  page: 1,
  page_size: 10,
  total_pages: 0,
  total_records: 0
});

// Computed property for filter
const filter = computed(() => {
  if (Object.keys(appliedFilters.value).length === 0) {
    return {
      user_selections: [],
      additional_fields: [] as { column: string; value: string; type: string }[],
      pagination: {
        current_page: pagination.value.current_page,
        page: pagination.value.current_page,
        page_size: pagination.value.page_size,
        total_pages: pagination.value.total_pages,
        total_records: pagination.value.total_records
      },
      order_by: ['primary_id', 'ASC'],
      export: null as string | null
    };
  } else {
    return {
      ...appliedFilters.value,
      export: null
    };
  }
});

// Fetch Data Using `postUserSelectionProcess`
const fetchData = async () => {
  loading.value = true;
  const payload = filter.value;
  filter.value['export'] = null;
  try {
    const response = await postUserSelectionProcess(payload);

    // Assign `data` array to `items`
    console.log(response);
    items.value = response.data.data;

    // Update pagination
    pagination.value = response.data.pagination;
  } catch (err: unknown) {
    console.error('Error fetching data:', (err as Error).message || 'Unknown error');
  } finally {
    loading.value = false;
  }
};

// Download Data
const download = async (file_type: string) => {
  loading.value = true;
  filter.value['export'] = file_type;

  const payload = filter.value;
  try {
    // Send the request
    const response = await postUserSelectionProcess(payload);

    // Process the file response
    const blob = new Blob([response], { type: getFileMimeType(file_type) });
    const fileExtension = getFileExtension(file_type);
    const fileName = `exported_data.${fileExtension}`;

    // Create a link to download the file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke the URL to free memory
    window.URL.revokeObjectURL(url);
  } catch (err: unknown) {
    console.error('Error fetching data:', (err as Error).message || 'Unknown error');
  } finally {
    loading.value = false;
  }
};

// Helper functions
const getFileMimeType = (file_type: string): string => {
  switch (file_type) {
    case 'csv':
      return 'text/csv';
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json':
      return 'application/json';
    default:
      throw new Error('Unsupported file type');
  }
};

const getFileExtension = (file_type: string): string => {
  switch (file_type) {
    case 'csv':
      return 'csv';
    case 'excel':
      return 'xlsx';
    case 'json':
      return 'json';
    default:
      throw new Error('Unsupported file type');
  }
};

// Handle Pagination Changes
const handlePageChange = (page: number) => {
  pagination.value.current_page = page;
  if (filter.value && Object.keys(filter.value).length > 0) {
    pagination.value.page = page;
  }
  fetchData();
};

const showToast = (message: string, color = 'success', timeout = 3000) => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.timeout = timeout;
  snackbar.value.visible = true;
};

const addField = (column: string, value: string) => {
  additionalFields.push({ column, value, type: 'likewhere' });
};

const handleTitleSearch = (searchText: Event) => {
  const text = (searchText.target as HTMLInputElement).value;
  if (text.length <= 2) {
    showToast('Search text must be more than 2 characters.', 'error');
  } else {
    showToast('Search successful!', 'success');
    addField('Title', text);
    filter.value.additional_fields = additionalFields;
    fetchData();
  }
};

const handlePageSizeChange = (pageSize: number) => {
  pagination.value.page_size = pageSize;
  pagination.value.current_page = pagination.value.current_page ? pagination.value.current_page : 1;
  if (filter.value && Object.keys(filter.value).length > 0) {
    pagination.value.page_size = pageSize;
  }
  fetchData();
};

const handleUpdateFilters = (filters: Record<string, string[]>) => {
  appliedFilters.value = filters;
  fetchData();
};

// Fetch Data on Component Mount
onMounted(fetchData);
</script>

<template>
  <!-- <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
  <Loader :isLoading="loading"></Loader>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="Records">
        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" :timeout="snackbar.timeout">
          {{ snackbar.message }}
        </v-snackbar>
        <FilterForm @updateFilters="handleUpdateFilters" style="float: right" />
        <!-- Custom Table -->
        <CustomTable
          title="Search Items"
          :items="items"
          :headers="headers"
          :loading="loading"
          :pagination="pagination"
          @update:page="handlePageChange"
          @search:title="handleTitleSearch"
          @update:items-per-page="handlePageSizeChange"
          @download:file="download"
          :tabs="['multiple-view']"
        >
        </CustomTable>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
