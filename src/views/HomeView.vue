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
        </FloatLabel>
        <FloatLabel>
          <InputText id="num" v-model="reviewQuantity" placeholder="Número de Reviews"/>
        </FloatLabel>
        <Button
          label="Buscar por ID"
          icon="pi pi-search"
          @click="fetchReviews"
        />
      </div>
      <div class="steam__games">
        <!-- Campo de busca por nome -->
        <FloatLabel>
          <InputText 
            id="gameSearch" 
            v-model="gameSearch" 
            placeholder="Digite o nome do jogo"
            @keyup.enter="searchGame"
          />
          <label for="gameSearch">Buscar por Nome</label>
        </FloatLabel>
        
        <Button
          label="Buscar por Nome"
          icon="pi pi-search"
          @click="searchGame"
          :loading="searching"
        />
      </div>
      <div class="steam__list-games top-to-bottom--effect" v-if="searchResults">
            <Card style="width: 18%; height: 300px;" v-for="game in searchResults" :key="game.id">
                <template #header>
                    <img class="steam__list-games--image" alt="user header" :src="game.tiny_image" />
                </template>
                <template #title>{{ game.name }}</template>
                <template #subtitle>ID: {{ game.id }}</template>
                <template #content>
                    <p class="m-0" v-if="game.price">
                        Preço: {{ game.price?.final }} {{ game.price?.currency }}
                    </p>
                </template>
                <template #footer>
                    <div class="flex gap-4 mt-1">
                        <Button label="Ver Reviews" @click="findReviewById(game.id)"/>
                    </div>
                </template>
            </Card>
      </div>
      <div class="steam__loading" v-if="loading">
        <ProgressSpinner />
      </div>
      <div class="steam__list" v-else>
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
              header="Tempo"
              sortable
              sortField="author.playtime_at_review"
            >
              <template #body="slotProps">
                {{ playtimeBody(slotProps.data.author.playtime_at_review) }}
              </template>
            </Column>
            <Column
              header="Comprado"
              sortable
              sortField="steam_purchase"
            >
              <template #body="slotProps">
                {{ steamPurchaseBody(slotProps.data) }}
              </template>
            </Column>
            <Column
              header="Data"
              sortable
              sortField="timestamp_created"
            >
              <template #body="slotProps">
                {{ dateBody(slotProps.data) }}
              </template>
            </Column>
            <Column
              header="Analise"
              sortField="timestamp_created"
            >
              <template #body="slotProps">
                <Button label="Analisar" icon="pi pi-wave-pulse" />
              </template>
            </Column>
            <Column
              header="More"
              sortField="timestamp_created"
            >
              <template #body="slotProps">
                <Button label="Info" icon="pi pi-plus-circle" @click="visible = true" />
              </template>
            </Column>
          </DataTable>
      </div>

      <Dialog v-model:visible="visible" maximizable modal header="Header" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
          <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
      </Dialog>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'

  // PrimeVue
  import FloatLabel from 'primevue/floatlabel'
  import InputText from 'primevue/inputtext'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import ProgressSpinner from 'primevue/progressspinner';
  import Button from 'primevue/button';
  import AutoComplete from 'primevue/autocomplete';
  import Dialog from 'primevue/dialog';
  import Card from 'primevue/card';



const appId = ref('413150') 
const reviewQuantity = ref(100) 
const reviews = ref([])
const loading = ref(false)
const error = ref('')
const visible = ref(false);

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

const selectedItem = ref({ label: 'Todos', value: 'all' }) 
const filteredItems = ref([])

function searchItems(event) {
  const query = event.query.toLowerCase()
  const languages = [
    { label: 'Todos', value: 'all' },
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

    const baseUrl = import.meta.env.DEV 
      ? '/steamapi/appreviews' 
      : '/.netlify/functions/steam'

    let allReviews = []
    let cursor = '*'
    let hasMore = true
    let requestCount = 0
    const maxRequests = 50 // Limite de requisições para não exagerar

    while (hasMore && requestCount < maxRequests && allReviews.length < reviewQuantity.value) {
      let url
      if (import.meta.env.DEV) {
        url = `${baseUrl}/${appId.value}?json=1&language=${selectedItem.value.value}&filter=recent&review_type=all&purchase_type=all&num_per_page=100&cursor=${encodeURIComponent(cursor)}`
      } else {
        const params = new URLSearchParams({
          appId: appId.value,
          language: selectedItem.value.value,
          num_per_page: '100', // 100 por página (máximo da Steam)
          cursor: cursor
        })
        url = `${baseUrl}?${params.toString()}`
      }

      const { data } = await axios.get(url)
      requestCount++

      if (data && data.reviews && data.reviews.length > 0) {
        // Calcular quantas reviews ainda podemos adicionar
        const remainingSlots = reviewQuantity.value - allReviews.length
        const reviewsToAdd = data.reviews.slice(0, remainingSlots)
        
        // Adicionar reviews à lista
        allReviews = [...allReviews, ...reviewsToAdd]
        
        // Verificar se atingimos a quantidade desejada
        if (allReviews.length >= reviewQuantity.value) {
          hasMore = false
        } 
        // Verificar se há mais páginas usando o cursor
        else if (data.cursor && data.cursor !== cursor) {
          cursor = data.cursor
          // Pequena pausa para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 300))
        } else {
          hasMore = false
        }
      } else {
        hasMore = false
      }
    }

    if (allReviews.length > 0) {
      reviews.value = allReviews
      console.log(`✅ ${allReviews.length} reviews carregadas`)
    } else {
      error.value = 'Nenhum dado encontrado para esse App ID.'
    }
  } catch (err) {
    console.error('Erro:', err)
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = 'Erro ao buscar reviews. Verifique o App ID ou tente novamente.'
    }
  } finally {
    loading.value = false
  }
}

const gameSearch = ref('')
const searching = ref(false)
const searchResults = ref([])

async function searchGame() {
  if (!gameSearch.value.trim()) return

  searching.value = true
  try {
    const result = await searchAppByName(gameSearch.value)
    
    if (result.found) {
      appId.value = ''
      // Opcional: buscar reviews automaticamente
      // fetchReviews()
    } else {
      error.value = 'Jogo não encontrado. Tente outro nome.'
    }
  } catch (err) {
    error.value = 'Erro ao buscar jogo.'
  } finally {
    searching.value = false
  }
}

async function findReviewById(gameId) {
  appId.value = gameId
  fetchReviews()
}


// Nova função para buscar App ID por nome
async function searchAppByName(gameName) {
  try {
    const searchUrl = import.meta.env.DEV 
      ? `/steamapi/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=US&l=english`
      : `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=US&l=english`

    const { data } = await axios.get(searchUrl)

    console.log('Resultado da busca:', data)
    searchResults.value = data.items || []
    
    if (data && data.items && data.items.length > 0) {
      return {
        appId: data.items[0].id,
        name: data.items[0].name,
        found: true
      }
    }
    
    return { found: false }
  } catch (error) {
    console.error('Erro na busca:', error)
    return { found: false, error: error.message }
  }
}

function getUrlParams() {
  const urlParams = new URLSearchParams(window.location.search)
  const params = {}
  for (const [key, value] of urlParams) {
    params[key] = value
  }
  return params
}

onMounted(() => {
  searchItems({ query: '' })
  const urlParams = getUrlParams()
  if (urlParams.appId) {
    appId.value = urlParams.appId
    console.log('App ID da URL:', urlParams.appId)
    fetchReviews()
  }
})


  </script>

  <style scoped lang="scss">

    @use '@/scss/mixings';
    @use '@/scss/variables';


  .steam {
    padding: 3rem;
    background: #f8fafc;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    @media (max-width: variables.$md-breakpoint) {
      padding: 2rem 1rem;
    }
    &__form{
      display: flex;
      flex-direction: row;
      justify-content: initial;
      align-items: initial;
      gap: 1rem;
      @media (max-width: variables.$md-breakpoint) {
        flex-direction: column;
      }
    }
    &__loading{
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 10rem;
    }
    &__list-games{
      display: flex;
      justify-content: initial;
      align-items: initial;
      height: 100%;
      width: 100%;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
      &--image{
        width: 100%;
        height: auto;
        object-fit: cover;
      }
    }

    &__games{
      margin-top: 2rem;
      display: flex;
      justify-content: flex-start;
      flex-direction: row;
      gap: 1rem;
      @media (max-width: variables.$md-breakpoint) {
        flex-direction: column;
      }
    }
  }

  input#appId {
      width: 100%;
  }

  :deep(.p-card-body) {
    justify-content: space-between;
    height: 100%;
  }

  :deep(.p-card-footer) {
    justify-content: initial;
    display: flex;
    flex: 1;
    align-items: end;
  }


  </style>
