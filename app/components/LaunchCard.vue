<template>
    <v-card height="100%" class="d-flex flex-column">
        <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ launch.mission_name }}</span>
            <FavoriteButton 
                :launch-id="launch.id"
                :is-favorite="isFavorite"
                @toggle="handleFavoriteToggle"
            />
        </v-card-title>
        <v-card-text class="flex-grow-1">
            <p><strong>Launch Date:</strong> 
                <ClientOnly>
                    {{ formatDate(launch.launch_date_utc) }}
                    <template #fallback>{{ launch.launch_date_utc }}</template>
                </ClientOnly>
            </p>
            <p><strong>Launch Site:</strong> {{ launch.launch_site?.site_name || 'Unknown' }}</p>
            <p><strong>Rocket:</strong> {{ launch.rocket?.rocket_name || 'Unknown' }}</p>
            <p v-if="launch.details" class="mt-3">
                <strong>Details:</strong><br>
                {{ truncateDetails(launch.details) }}
            </p>
            <p v-else class="text-grey">
                <em>No details available</em>
            </p>
        </v-card-text>
        <v-card-actions class="justify-end mb-2">
            <v-btn 
                color="primary" 
                variant="outlined"
                @click="handleViewDetails"
                :disabled="!launch.rocket?.rocket?.id"
            >
                View Details
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
interface Launch {
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
}

interface Props {
    launch: Launch
    isFavorite?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isFavorite: false
})

const emit = defineEmits<{
    viewDetails: [rocketId: string]
    favoriteToggle: [launchId: string]
}>()

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const truncateDetails = (details: string, maxLength: number = 150) => {
    if (details.length <= maxLength) return details
    return details.substring(0, maxLength) + '...'
}

const handleViewDetails = async () => {
    if (props.launch.rocket?.rocket?.id) {
        await navigateTo(`/rockets/${props.launch.rocket.rocket.id}`)
    }
}

const handleFavoriteToggle = (launchId: string) => {
    emit('favoriteToggle', launchId)
}
</script>