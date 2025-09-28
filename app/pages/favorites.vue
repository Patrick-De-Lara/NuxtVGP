<template>
    <div style="margin: 20px;">
        <h1 style="color: #41b883;">My Favorite Launches</h1>
        
        <!-- Status Alert -->
        <v-alert v-if="status.show" :type="status.type" class="mb-4" closable>
            <v-icon left>{{ status.icon }}</v-icon>
            {{ status.message }}
        </v-alert>

        <!-- Header Card -->
        <v-card class="mb-6 pa-4" color="primary" variant="tonal">
            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                    <v-icon size="32" class="mr-3">mdi-heart</v-icon>
                    <div>
                        <h3>{{ favoritesStore.favoriteCount }} Favorite Launches</h3>
                        <p class="mb-0">Your saved SpaceX missions</p>
                    </div>
                </div>
                
                <v-btn
                    v-if="favoritesStore.favoriteCount > 0"
                    @click="showClearDialog = true"
                    color="error"
                    variant="outlined"
                >
                    <v-icon left>mdi-delete-sweep</v-icon>
                    Clear All
                </v-btn>
            </div>
        </v-card>

        <!-- Loading -->
        <v-card v-if="loading" class="pa-6 text-center">
            <v-progress-circular indeterminate></v-progress-circular>
            <p class="mt-4">Loading favorites...</p>
        </v-card>

        <!-- Favorites Grid -->
        <v-row v-else-if="favoriteLaunches.length > 0">
            <v-col v-for="launch in favoriteLaunches" :key="launch.id" cols="12" md="6" lg="4">
                <LaunchCard 
                    :launch="launch"
                    :is-favorite="true"
                    @favorite-toggle="handleToggle"
                />
            </v-col>
        </v-row>

        <!-- Empty State -->
        <v-card v-else class="pa-8 text-center">
            <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-heart-outline</v-icon>
            <h2 class="text-grey mb-4">No Favorites Yet</h2>
            <p class="text-grey mb-6">Start exploring and save your favorite launches!</p>
            <v-btn to="/launches" color="primary" size="large">
                <v-icon left>mdi-rocket-launch</v-icon>
                Browse Launches
            </v-btn>
        </v-card>

        <!-- Clear Dialog -->
        <v-dialog v-model="showClearDialog" max-width="500">
            <v-card>
                <v-card-title>Clear All Favorites?</v-card-title>
                <v-card-text>
                    Remove all {{ favoritesStore.favoriteCount }} favorites? This cannot be undone.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="showClearDialog = false">Cancel</v-btn>
                    <v-btn @click="handleClearAll" color="error" :loading="clearing">
                        Clear All
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
const favoritesStore = useFavoritesStore()
const loading = ref(true)
const clearing = ref(false)
const showClearDialog = ref(false)

const status = ref({
    show: false,
    type: 'info' as 'success' | 'info' | 'warning',
    icon: 'mdi-information',
    message: ''
})

// Load on mount
onMounted(async () => {
    const result = await favoritesStore.loadFromIndexedDB()
    
    if (result.migrated) {
        status.value = {
            show: true,
            type: 'success',
            icon: 'mdi-database-import',
            message: `Migrated ${result.count} favorites to IndexedDB!`
        }
    }
    
    loading.value = false
})

const getLaunches = gql`
    query getLaunches {
        launches {
            id
            mission_name
            launch_date_utc
            details
            launch_site { site_name }
            rocket {
                rocket_name
                rocket { id name }
            }
        }
    }
`

const { data } = await useAsyncQuery(getLaunches)
const allLaunches = computed(() => data.value?.launches ?? [])
const favoriteLaunches = computed(() => 
    allLaunches.value.filter(launch => favoritesStore.favorites.includes(launch.id))
)

const handleToggle = async (launchId: string) => {
    await favoritesStore.toggleFavorite(launchId)
}

const handleClearAll = async () => {
    clearing.value = true
    await favoritesStore.clearAllFavorites()
    showClearDialog.value = false
    clearing.value = false
}
</script>