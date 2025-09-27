<template>
  <v-btn
    @click="handleToggle"
    :color="isFavorite ? 'red' : 'grey'"
    variant="text"
    icon
    size="small"
    :loading="loading"
  >
    <v-icon>
      {{ isFavorite ? 'mdi-heart' : 'mdi-heart-outline' }}
    </v-icon>
    <v-tooltip activator="parent" location="top">
      {{ isFavorite ? 'Remove from favorites' : 'Add to favorites' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
interface Props {
  launchId: string
  isFavorite: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [launchId: string]
}>()

const loading = ref(false)

const handleToggle = async () => {
  loading.value = true
  try {
    emit('toggle', props.launchId)
  } finally {
    // Small delay for visual feedback
    setTimeout(() => {
      loading.value = false
    }, 200)
  }
}
</script>