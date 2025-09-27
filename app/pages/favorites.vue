<!-- pages/favorites.vue -->
<template>
    <div style="margin: 20px;">
        <h1 style="color: #41b883;">My Favorite Launches</h1>
        <p>Your saved SpaceX launch missions</p>

        <!-- Favorites Count with Clear Button -->
        <v-card class="mb-6 pa-4" color="primary" variant="tonal">
            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                    <v-icon size="32" class="mr-3">mdi-heart</v-icon>
                    <div>
                        <h3>{{ favoritesStore.favoriteCount }} Favorite Launches</h3>
                        <p class="mb-0">Keep track of your favorite SpaceX missions</p>
                    </div>
                </div>
                
                <!-- Clear All Button - Only show if there are favorites -->
                <v-btn
                    v-if="favoritesStore.favoriteCount > 0"
                    @click="showModal"
                    color="error"
                    variant="outlined"
                    :disabled="clearing"
                >
                    <v-icon left>mdi-delete-sweep</v-icon>
                    Clear All
                </v-btn>
            </div>
        </v-card>

        <!-- Favorite Launch Cards -->
        <template v-if="favoriteLaunches.length > 0">
            <v-row>
                <v-col v-for="launch in favoriteLaunches" :key="launch.id" cols="12" md="6" lg="4">
                    <LaunchCard 
                        :launch="launch"
                        :is-favorite="true"
                        @favorite-toggle="handleFavoriteToggle"
                    />
                </v-col>
            </v-row>
        </template>

        <!-- Empty State -->
        <template v-else>
            <v-row>
                <v-col cols="12" class="text-center">
                    <v-card class="pa-8">
                        <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-heart-outline</v-icon>
                        <h2 class="text-grey mb-4">No Favorite Launches Yet</h2>
                        <p class="text-grey mb-6">
                            Start exploring SpaceX launches and add your favorites by clicking the heart icon on any launch card.
                        </p>
                        <v-btn 
                            to="/launches" 
                            color="primary" 
                            size="large"
                            variant="elevated"
                        >
                            <v-icon left>mdi-rocket-launch</v-icon>
                            Browse Launches
                        </v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <!-- Modal Confirmation -->
        <div v-if="modalView">
            <v-dialog 
                v-model="modalView" 
                max-width="500"
                persistent
            >
                <v-card>
                    <v-card-title class="text-h5 pa-6">
                        <v-icon left color="error" class="mr-2">mdi-alert-circle</v-icon>
                        Clear All Favorites?
                    </v-card-title>
                    
                    <v-card-text class="pa-6">
                        <p class="mb-3">Are you sure you want to remove all <strong>{{ favoritesStore.favoriteCount }} favorite launches</strong>?</p>
                        <p class="text-grey mb-0">This action cannot be undone.</p>
                    </v-card-text>
                    
                    <v-card-actions class="pa-6 pt-0">
                        <v-spacer></v-spacer>
                        <v-btn 
                            @click="hideModal"
                            variant="text"
                            color="grey"
                        >
                            Cancel
                        </v-btn>
                        <v-btn 
                            @click="confirmClearAll"
                            color="error"
                            variant="elevated"
                            :loading="clearing"
                            class="ml-2"
                        >
                            <v-icon left>mdi-delete</v-icon>
                            Clear All
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </div>

        <!-- Success Snackbar -->
        <v-snackbar
            v-model="showSuccessMessage"
            color="success"
            timeout="3000"
            location="bottom"
        >
            <v-icon left>mdi-check-circle</v-icon>
            All favorites cleared successfully!
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
const favoritesStore = useFavoritesStore()

const modalView = ref(false)
const clearing = ref(false)
const showSuccessMessage = ref(false)

// Load favorites on mount
onMounted(() => {
  favoritesStore.loadFavorites()
})

// GraphQL query to get all launches
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

const allLaunches = computed(() => data.value?.launches ?? [])

// Filter launches to show only favorites
const favoriteLaunches = computed(() => {
    return allLaunches.value.filter(launch => 
        favoritesStore.favorites.includes(launch.id)
    )
})

// Handle favorite toggle
const handleFavoriteToggle = (launchId: string) => {
    favoritesStore.toggleFavorite(launchId)
}

const showModal = () => {
    console.log('Showing modal')
    modalView.value = true
}

const hideModal = () => {
    console.log('Hiding modal')
    modalView.value = false
}

const confirmClearAll = async () => {
    clearing.value = true
    
    try {
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Clear all favorites
        favoritesStore.clearAllFavorites()
        
        // Hide modal and show success message
        modalView.value = false
        showSuccessMessage.value = true
        
        console.log('All favorites cleared successfully')
        
    } catch (error) {
        console.error('Error clearing favorites:', error)
    } finally {
        clearing.value = false
    }
}

// SEO
useSeoMeta({
    title: 'My Favorite Launches - SpaceX Explorer',
    description: 'Your saved favorite SpaceX launch missions'
})
</script>