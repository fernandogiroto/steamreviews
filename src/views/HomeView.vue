  <template>
    <div class="steam">
      <!-- FORM -->
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
      <!-- FORM NAME -->
      <div class="steam__games">
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
      <!-- GAME SEARCH RESULT -->
      <div class="steam__list-games top-to-bottom--effect" v-if="searchResults">
        <Card class="steam-card" v-for="game in searchResults" :key="game.id">
            <template #header>
                <img class="steam__list-games--image" alt="user header" :src="game.tiny_image" />
            </template>
            <template #title>{{ game.name }}</template>
            <template #subtitle>ID: {{ game.id }}</template>
            <template #content>
                <p class="m-0" v-if="game.price">
                    Preço: {{ game.price?.final / 100}} {{ game.price?.currency }}
                </p>
            </template>
            <template #footer>
                <div class="flex gap-4 mt-1">
                    <Button label="Ver Reviews" @click="findReviewById(game.id)"/>
                </div>
            </template>
        </Card>
      </div>
      <!-- REVIEWS RESULT -->
      <div class="steam__list" v-if="!loading && reviews.length">
          <Button label="Ver Estatísticas" severity="warn" icon="pi pi-chart-scatter" @click="showStatiscs = true" />
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
              header="Ver Mais"
              sortField="timestamp_created"
            >
              <template #body="slotProps">
                <Button label="Info" icon="pi pi-plus-circle" @click="visible = true" />
              </template>
            </Column>
          </DataTable>
      </div>
      <!-- LOADING REVIEWS -->
      <div class="steam__loading" v-if="loading">
        <div class="loading-content">
          <div class="progress-section">
            <ProgressBar :value="loadingProgress" class="mb-2" />
            <p class="progress-text">
              Carregando reviews... {{ currentFetched }} de {{ totalReviewsToFetch }} 
              ({{ Math.round(loadingProgress) }}%)
            </p>
          </div>
        </div>
      </div>

      <Dialog v-model:visible="visible" maximizable modal header="Header" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
          <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
      </Dialog>
      <Dialog v-model:visible="showStatiscs" maximizable modal header="Estatísticas das Reviews" :style="{ width: '60rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div v-if="gameStatistic.total" class="statistics">
          <!-- Estatísticas Gerais -->
          <div class="stat-section">
            <h3>Estatísticas Gerais</h3>
            <div class="stats-grid mt-2">
              <div class="stat-card positive">
                <span class="stat-number">{{ gameStatistic.general.positive }}</span>
                <span class="stat-label"> Positivas ({{ gameStatistic.general.positivePercentage }}%)</span>
              </div>
              <div class="stat-card negative">
                <span class="stat-number">{{ gameStatistic.general.negative }}</span>
                <span class="stat-label"> Negativas ({{ gameStatistic.general.negativePercentage }}%)</span>
              </div>
              <div class="stat-card total">
                <span class="stat-number">{{ gameStatistic.total }}</span>
                <span class="stat-label"> Total de Reviews</span>
              </div>
            </div>
          </div>
          <!-- Por Idioma -->
          <div class="stat-section">
            <h3 class="mb-2">Distribuição por Idioma</h3>
            <DataTable :value="Object.entries(gameStatistic.byLanguage)" class="p-datatable-sm">
              <Column field="0" header="Idioma">
                <template #body="slotProps">
                  {{ slotProps.data[0] }}
                </template>
              </Column>
              <Column field="1.total" header="Total"></Column>
              <Column header="Positivas">
                <template #body="slotProps">
                  {{ slotProps.data[1].positive }} ({{ slotProps.data[1].positivePercentage }}%)
                </template>
              </Column>
              <Column header="Negativas">
                <template #body="slotProps">
                  {{ slotProps.data[1].negative }} ({{ slotProps.data[1].negativePercentage }}%)
                </template>
              </Column>
            </DataTable>
          </div>
          <!-- Por Tempo de Jogo -->
          <div class="stat-section">
            <h3>Tempo de Jogo</h3>
            <div class="stats-grid mt-2">
              <div class="stat-card">
                <span class="stat-number">{{ gameStatistic.byPlaytime.lessThan1h }}</span>
                <span class="stat-label">&lt; 1 hora</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ gameStatistic.byPlaytime.between1hAnd10h }}</span>
                <span class="stat-label">1-10 horas</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ gameStatistic.byPlaytime.moreThan10h }}</span>
                <span class="stat-label"> &gt; 10 horas</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ gameStatistic.averagePlaytime }}h</span>
                <span class="stat-label"> Média</span>
              </div>
            </div>
          </div>
          <!-- Compra na Steam -->
          <div class="stat-section">
            <h3>Compra na Steam</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-number">{{ gameStatistic.withPurchase }} </span>
                <span class="stat-label"> Comprado na Steam</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">{{ gameStatistic.withoutPurchase }} </span>
                <span class="stat-label"> Não comprado</span>
              </div>
            </div>
          </div>
        </div>
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
  import ProgressBar from 'primevue/progressbar';


const appId = ref('413150') 
const reviewQuantity = ref(5000) 
const reviews = ref([])
const loading = ref(false)
const error = ref('')
const visible = ref(false);
const gameSearch = ref('')
const searching = ref(false)
const gameStatistic = ref({})
const showStatiscs = ref(false)
const searchResults = ref([])
const loadingProgress = ref(0)
const totalReviewsToFetch = ref(0)
const currentFetched = ref(0)

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
  searchResults.value = []
  gameStatistic.value = {}
  loadingProgress.value = 0
  currentFetched.value = 0

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
    const maxRequests = 50

    if(reviewQuantity.value === 0){
      reviewQuantity.value = 5000
    }

    totalReviewsToFetch.value = reviewQuantity.value

    while (hasMore && requestCount < maxRequests && allReviews.length < reviewQuantity.value) {
      let url
      if (import.meta.env.DEV) {
        url = `${baseUrl}/${appId.value}?json=1&language=${selectedItem.value.value}&filter=recent&review_type=all&purchase_type=all&num_per_page=100&cursor=${encodeURIComponent(cursor)}`
      } else {
        const params = new URLSearchParams({
          appId: appId.value,
          language: selectedItem.value.value,
          num_per_page: '100',
          cursor: cursor
        })
        url = `${baseUrl}?${params.toString()}`
      }

      const { data } = await axios.get(url)
      requestCount++

      if (data && data.reviews && data.reviews.length > 0) {
        const remainingSlots = reviewQuantity.value - allReviews.length
        const reviewsToAdd = data.reviews.slice(0, remainingSlots)
        
        allReviews = [...allReviews, ...reviewsToAdd]
        currentFetched.value = allReviews.length
        
        // Atualizar progresso - ARREDONDANDO para 2 casas decimais
        const progress = (allReviews.length / reviewQuantity.value) * 100
        loadingProgress.value = Math.min(Math.round(progress * 100) / 100, 100) // 2 casas decimais
        
        if (allReviews.length >= reviewQuantity.value) {
          hasMore = false
        } 
        else if (data.cursor && data.cursor !== cursor) {
          cursor = data.cursor
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
      loadingProgress.value = 100 // Garantir 100% ao finalizar
      calculateStatistics(allReviews)
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
    setTimeout(() => {
      loadingProgress.value = 0
      currentFetched.value = 0
    }, 2000)
  }
}

async function searchGame() {
  if (!gameSearch.value.trim()) return

  searching.value = true
  try {
    const result = await searchAppByName(gameSearch.value)
    
    if (result.found) {
      appId.value = ''
      reviews.value = []
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
      : `/.netlify/functions/search-game?term=${encodeURIComponent(gameName)}`

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

function calculateStatistics(reviewsArray) {
  if (!reviewsArray.length) return

  const stats = {
    total: reviewsArray.length,
    general: {
      positive: 0,
      negative: 0,
      positivePercentage: 0,
      negativePercentage: 0
    },
    byLanguage: {},
    byPlaytime: {
      lessThan1h: 0,
      between1hAnd10h: 0,
      moreThan10h: 0
    },
    withPurchase: 0,
    withoutPurchase: 0,
    averagePlaytime: 0
  }

  let totalPlaytime = 0

  // Calcular estatísticas
  reviewsArray.forEach(review => {
    // Positivas vs Negativas
    if (review.voted_up) {
      stats.general.positive++
    } else {
      stats.general.negative++
    }

    // Por idioma
    const lang = review.language || 'unknown'
    if (!stats.byLanguage[lang]) {
      stats.byLanguage[lang] = {
        total: 0,
        positive: 0,
        negative: 0
      }
    }
    stats.byLanguage[lang].total++
    if (review.voted_up) {
      stats.byLanguage[lang].positive++
    } else {
      stats.byLanguage[lang].negative++
    }

    // Por tempo de jogo
    const playtimeHours = review.author.playtime_at_review / 60
    totalPlaytime += playtimeHours
    
    if (playtimeHours < 1) {
      stats.byPlaytime.lessThan1h++
    } else if (playtimeHours <= 10) {
      stats.byPlaytime.between1hAnd10h++
    } else {
      stats.byPlaytime.moreThan10h++
    }

    // Compra na Steam
    if (review.steam_purchase) {
      stats.withPurchase++
    } else {
      stats.withoutPurchase++
    }
  })

  // Calcular porcentagens
  stats.general.positivePercentage = ((stats.general.positive / stats.total) * 100).toFixed(1)
  stats.general.negativePercentage = ((stats.general.negative / stats.total) * 100).toFixed(1)
  stats.averagePlaytime = (totalPlaytime / stats.total).toFixed(1)

  // Calcular porcentagens por idioma
  Object.keys(stats.byLanguage).forEach(lang => {
    const langStats = stats.byLanguage[lang]
    langStats.positivePercentage = ((langStats.positive / langStats.total) * 100).toFixed(1)
    langStats.negativePercentage = ((langStats.negative / langStats.total) * 100).toFixed(1)
  })

  gameStatistic.value = stats
  console.log('Estatísticas calculadas:', stats)
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

  .statistics{
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  input#appId {
      width: 100%;
  }
  
  .steam-card {
    width: 18%;
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    @media (max-width: variables.$lg-breakpoint) {
      width: 100%;
      height: auto;
    }
    @media (max-width: variables.$md-breakpoint) {
      width: 100%;
      height: auto;
    }
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
