<template>
    <div style="margin: 20px;">
        <v-container>
            <!-- Loading State -->
            <div v-if="pending" class="text-center">
                <v-progress-circular 
                    indeterminate 
                    color="primary" 
                    size="64"
                    class="mb-4"
                ></v-progress-circular>
                <p>Loading rocket information...</p>
            </div>

            <!-- Error State -->
            <v-alert v-else-if="error" type="error" class="mb-4">
                Failed to load rocket information: {{ error.message }}
            </v-alert>

            <!-- Rocket Details -->
            <div v-else-if="rocket">
                <v-card class="mb-6">
                    <v-card-title class="text-h3 pa-6">
                        {{ rocket.name }}
                    </v-card-title>
                    
                    <v-card-subtitle class="px-6 mb-6">
                        {{ rocket.company }} • {{ rocket.country }}
                    </v-card-subtitle>
                </v-card>

                <v-row>
                    <!-- Basic Information -->
                    <v-col cols="12" md="6">
                        <v-card height="100%">
                            <v-card-title>
                                <v-icon left color="primary">mdi-information</v-icon>
                                Basic Information
                            </v-card-title>
                            <v-card-text>
                                <p><strong>Description:</strong></p>
                                <p class="mb-4">{{ rocket.description || 'No description available' }}</p>
                                
                                <p><strong>First Flight:</strong> {{ formatDate(rocket.first_flight) }}</p>
                                <p><strong>Active:</strong> 
                                    <v-chip 
                                        :color="rocket.active ? 'success' : 'error'" 
                                        size="small"
                                    >
                                        {{ rocket.active ? 'Active' : 'Retired' }}
                                    </v-chip>
                                </p>
                                <p><strong>Success Rate:</strong> {{ rocket.success_rate_pct || 'N/A' }}%</p>
                                <p><strong>Cost per Launch:</strong> ${{ formatCurrency(rocket.cost_per_launch) }}</p>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <!-- Physical Specifications -->
                    <v-col cols="12" md="6">
                        <v-card height="100%">
                            <v-card-title>
                                <v-icon left color="primary">mdi-ruler</v-icon>
                                Physical Specifications
                            </v-card-title>
                            <v-card-text>
                                <p><strong>Height:</strong> {{ rocket.height?.meters || 'N/A' }} meters ({{ rocket.height?.feet || 'N/A' }} feet)</p>
                                <p><strong>Diameter:</strong> {{ rocket.diameter?.meters || 'N/A' }} meters ({{ rocket.diameter?.feet || 'N/A' }} feet)</p>
                                <p><strong>Mass:</strong> {{ formatMass(rocket.mass?.kg) }} kg ({{ formatMass(rocket.mass?.lb) }} lbs)</p>
                                <p><strong>Number of Stages:</strong> {{ rocket.stages || 'N/A' }}</p>
                                <p><strong>Boosters:</strong> {{ rocket.boosters || 0 }}</p>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </div>

            <!-- No Rocket Found -->
            <v-card v-else class="text-center pa-6">
                <v-icon size="64" color="grey" class="mb-4">mdi-rocket</v-icon>
                <h3 class="text-grey">Rocket Not Found</h3>
                <p class="text-grey">The requested rocket could not be found.</p>
                <v-btn @click="$router.push('/launches')" color="primary" class="mt-4">
                    Back to Launches
                </v-btn>
            </v-card>
        </v-container>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const getRocket = gql`
    query getRocket($id: ID!) {
        rocket(id: $id) {
            id
            name
            description
            company
            country
            active
            stages
            boosters
            cost_per_launch
            success_rate_pct
            first_flight
            height {
                meters
                feet
            }
            diameter {
                meters
                feet
            }
            mass {
                kg
                lb
            }
        }
    }
`

// Type definition based on introspection schema
interface RocketData {
    rocket: {
        id: string
        name: string
        description: string
        company: string
        country: string
        active: boolean
        stages: number
        boosters: number
        cost_per_launch: number
        success_rate_pct: number
        first_flight: string
        height: {
            meters: number
            feet: number
        }
        diameter: {
            meters: number
            feet: number
        }
        mass: {
            kg: number
            lb: number
        }
    } | null
}

// Execute the query
const { data, pending, error } = await useAsyncQuery<RocketData>(getRocket, {
    id: id
})

const rocket = computed(() => data.value?.rocket)

// Utility functions for formatting
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US').format(amount)
}

const formatMass = (mass: number | null | undefined) => {
    if (!mass) return 'N/A'
    return new Intl.NumberFormat('en-US').format(mass)
}

</script>

<style scoped>
.v-card-title {
    font-weight: 600;
}

.v-card-text p {
    margin-bottom: 8px;
    line-height: 1.6;
}

strong {
    color: rgb(var(--v-theme-on-surface));
    font-weight: 600;
}
</style>
