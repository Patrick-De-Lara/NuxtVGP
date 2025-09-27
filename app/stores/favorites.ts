export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favorites = ref<string[]>([])
  
  // Getters
  const favoriteCount = computed(() => favorites.value.length)
  
  const isFavorite = computed(() => (launchId: string) => {
    return favorites.value.includes(launchId)
  })
  
  // Actions
  const addFavorite = (launchId: string) => {
    if (!favorites.value.includes(launchId)) {
      favorites.value.push(launchId)
    }
  }
  
  const removeFavorite = (launchId: string) => {
    const index = favorites.value.indexOf(launchId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
  }
  
  const toggleFavorite = (launchId: string) => {
    if (isFavorite.value(launchId)) {
      removeFavorite(launchId)
    } else {
      addFavorite(launchId)
    }
  }

  const clearAllFavorites = () => {
    favorites.value = []
  }
  
  // Persist favorites to localStorage
  const saveFavorites = () => {
    if (process.client) {
      localStorage.setItem('spacex-favorites', JSON.stringify(favorites.value))
    }
  }
  
  const loadFavorites = () => {
    if (process.client) {
      const saved = localStorage.getItem('spacex-favorites')
      if (saved) {
        favorites.value = JSON.parse(saved)
      }
    }
  }
  
  // Watch for changes and save
  watch(favorites, saveFavorites, { deep: true })
  
  return {
    favorites: readonly(favorites),
    favoriteCount,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    loadFavorites
  }
})