<template>
  <div class="steam">
    <div class="steam__form">
      <FloatLabel>
        <InputText id="appId" v-model="appId" />
        <label for="appId">App ID</label>
      </FloatLabel>
      <FloatLabel>
        <AutoComplete 
          v-model="selectedItem" 
          :suggestions="filteredItems" 
          @complete="searchItems"
          :virtualScrollerOptions="{ itemSize: 38 }" 
          optionLabel="label" 
          dropdown 
        />
        <label for="language">Idioma (ex: english)</label>
      </FloatLabel>
      <FloatLabel>
        <InputText id="num" v-model="numPerPage" />
        <label for="num">Reviews</label>
      </FloatLabel>
      <Button
        label="Buscar Reviews"
        icon="pi pi-search"
        @click="fetchReviews"
      />
    </div>
    <div class="steam__list">
        <DataTable
          v-if="reviews.length"
          :value="reviews"
          paginator
          :rows="10"
          tableStyle="min-width: 60rem"
          class="mt-5"
        >
          <Column field="author.steamid" header="Steam ID"></Column>
          <Column field="review" header="Review"></Column>
          <Column field="language" header="Idioma" sortable></Column>
          <Column
            header="Playtime"
            sortable
            sortField="author.playtime_at_review"
          >
            <template #body="slotProps">
              {{ playtimeBody(slotProps.data.author.playtime_at_review) }}
            </template>
          </Column>
          <Column
            header="Purchase"
            sortable
            sortField="steam_purchase"
          >
            <template #body="slotProps">
              {{ steamPurchaseBody(slotProps.data) }}
            </template>
          </Column>
          <Column
            header="Date"
            sortable
            sortField="timestamp_created"
          >
            <template #body="slotProps">
              {{ dateBody(slotProps.data) }}
            </template>
          </Column>
        </DataTable>
        <p v-else-if="loading">Carregando reviews...</p>
        <p v-else-if="error" class="text-red-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// PrimeVue
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

import AutoComplete from 'primevue/autocomplete';
const appId = ref('413150') 
const numPerPage = ref(10)
const reviews = ref([])
const loading = ref(false)
const error = ref('')

function steamPurchaseBody(row) {
  return row.steam_purchase ? '✅' : '❌';
}

function playtimeBody(row) {
  return (row / 60).toFixed(1) + 'h';
}

function dateBody(row) {
  const date = new Date(row.timestamp_created * 1000);
  return date.toLocaleDateString('pt-BR');
}
const selectedItem = ref(null)     
const filteredItems = ref([])  

function searchItems(event) {
  const query = event.query.toLowerCase()
  const languages = [
    { label: 'todos', value: 'all' },
    { label: 'english', value: 'english' },
    { label: 'portuguese', value: 'portuguese' },
    { label: 'spanish', value: 'spanish' },
    { label: 'french', value: 'french' },
    { label: 'german', value: 'german' },
    { label: 'chinese', value: 'schinese' },
    { label: 'turkish', value: 'turkish' },
    { label: 'russian', value: 'russian' },
    { label: 'korean', value: 'koreana' },
  ]

  filteredItems.value = languages.filter(lang =>
    lang.label.toLowerCase().includes(query)
  )
}

async function fetchReviews() {
  loading.value = true
  error.value = ''
  reviews.value = []

  try {
    if (!selectedItem.value) {
      error.value = 'Selecione um idioma antes de buscar'
      loading.value = false
      return
    }

    // Use a configuração existente do proxy
    const baseUrl = import.meta.env.DEV 
      ? '/steamapi'  // Usa proxy no desenvolvimento
      : '/api/steam'  // No Vercel usa a API route
    
    const url = `${baseUrl}/appreviews/${appId.value}?json=1&language=${selectedItem.value.value}&filter=recent&review_type=all&purchase_type=all&num_per_page=${numPerPage.value}`

    console.log('Fetching from:', url)

    const { data } = await axios.get(url)

    if (data && data.reviews) {
      reviews.value = data.reviews
    } else {
      error.value = 'Nenhum dado encontrado para esse App ID.'
    }
  } catch (err) {
    console.error('Erro detalhado:', err)
    error.value = 'Erro ao buscar reviews. Verifique o App ID ou tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">

.steam {
  padding: 3rem;
  background: #f8fafc;
  overflow-y: scroll;
  &__form{
    display: flex;
    justify-content: initial;
    align-items: initial;
    gap: 1rem;
  }
}

</style>
