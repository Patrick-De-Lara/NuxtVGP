<template>
    <div style="margin: 20px;">
        <h1 style="color: #41b883;">Hello World!</h1>
        <p>Welcome to the launch page</p>

        <h2>Launch Missions:</h2>

        <!-- Filter Controls -->
        <v-card class="mb-6 pa-4">
            <v-row>
                <!-- Year Filter -->
                <v-col cols="12" md="6">
                    <v-select
                        v-model="selectedYear"
                        :items="yearOptions"
                        label="Filter by Year"
                        variant="outlined"
                        hide-details
                        prepend-inner-icon="mdi-calendar"
                    ></v-select>
                </v-col>
                
                <!-- Reset Button -->
                <v-col cols="12" md="6">
                    <v-btn
                        @click="resetFilters"
                        variant="outlined"
                        color="grey"
                        height="56"
                        :disabled="!filterSummary.isFiltered"
                    >
                        <v-icon left>mdi-refresh</v-icon>
                        Reset Filter
                    </v-btn>
                </v-col>
            </v-row>
            
            <!-- Filter Summary -->
            <v-row v-if="filterSummary.isFiltered" class="mt-2">
                <v-col>
                    <v-chip color="primary" variant="outlined">
                        Showing {{ filterSummary.filtered }} of {{ filterSummary.total }} launches from {{ selectedYear }}
                    </v-chip>
                </v-col>
            </v-row>
        </v-card>
        
        <!-- Launch Cards -->
        <v-row>
            <v-col v-for="launch in paginatedLaunches" :key="launch.id" cols="12" md="6" lg="4">
                <LaunchCard 
                    :launch="launch"
                    :is-favorite="favoritesStore.isFavorite(launch.id)"
                    
                    @favorite-toggle="handleFavoriteToggle"
                />
            </v-col>
        </v-row>

        <!-- No Results Message -->
        <v-row v-if="filteredLaunches.length === 0">
            <v-col cols="12" class="text-center">
                <v-card class="pa-6">
                    <v-icon size="64" color="grey" class="mb-4">mdi-rocket-launch</v-icon>
                    <h3 class="text-grey">No launches found for {{ selectedYear }}</h3>
                    <p class="text-grey">Try selecting a different year</p>
                    <v-btn @click="resetFilters" color="primary" variant="outlined">
                        Show All Years
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>

        <!-- Pagination -->
        <v-pagination 
            v-if="filteredLaunches.length > 0"
            :length="totalPages" 
            v-model="currentPage" 
            class="mt-4"
            :total-visible="7">
        </v-pagination>
        
    </div>
</template>

<script setup lang="ts">
import {filterBy} from '@/composables/filterBy'

const getLaunches = gql`
    query getLaunches {
        launches {
            id
            mission_name
            launch_date_utc
            details
            launch_site {
                site_name
            }
            rocket {
                rocket_name
                rocket {         
                    id          
                    name
                }
            }
        }
    }
`

const { data } = await useAsyncQuery<{
    launches: {
        id: string
        mission_name: string
        launch_date_utc: string
        details: string | null
        launch_site: {
            site_name: string
        } | null
        rocket: {
            rocket_name: string
             rocket: {         
                id: string
                name: string
            } | null
        } | null
    }[]
}>(getLaunches)

const launches = computed(() => data.value?.launches ?? [])

// Initialize favorites store
const favoritesStore = useFavoritesStore()

// Load favorites on mount
onMounted(async () => {
  await favoritesStore.loadFromIndexedDB()
})

// filterby composable for year filtering
const {
    selectedYear,
    availableYears,
    filteredLaunches,
    resetFilters,
    filterSummary
} = filterBy(launches)

// year options that is processed from composable
const yearOptions = computed(() => [
    { title: 'All Years', value: 'all' },
    ...availableYears.value.map(year => ({
        title: year,
        value: year
    }))
])

const currentPage = ref(1)
const itemsPerPage = 9

const totalPages = computed(() => Math.ceil(filteredLaunches.value.length / itemsPerPage))

const paginatedLaunches = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredLaunches.value.slice(start, end)
})

// Reset pagination when year filter changes
watch(selectedYear, () => {
    currentPage.value = 1
})

// Handle favorite toggle (now async)
const handleFavoriteToggle = async (launchId: string) => {
  await favoritesStore.toggleFavorite(launchId)
}

</script>