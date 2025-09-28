// stores/favorites.ts
export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favorites = ref<string[]>([])
  
  // Getters
  const favoriteCount = computed(() => favorites.value.length)
  const isFavorite = computed(() => (launchId: string) => favorites.value.includes(launchId))
  
  // IndexedDB Configuration
  const DB_CONFIG = {
    name: 'spacex-favorites-db',
    version: 1,
    storeName: 'favorites',
    key: 'user-favorites'
  }
  
  // IndexedDB Helper
  const openDB = async (): Promise<IDBDatabase> => {
    if (!process.client) throw new Error('IndexedDB not available on server')
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
          db.createObjectStore(DB_CONFIG.storeName, { keyPath: 'id' })
        }
      }
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const addFavorite = async (launchId: string) => {
    if (!favorites.value.includes(launchId)) {
      favorites.value.push(launchId)
      await saveToIndexedDB()
    }
  }
  
  const removeFavorite = async (launchId: string) => {
    const index = favorites.value.indexOf(launchId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      await saveToIndexedDB()
    }
  }
  
  const toggleFavorite = async (launchId: string) => {
    if (isFavorite.value(launchId)) {
      await removeFavorite(launchId)
    } else {
      await addFavorite(launchId)
    }
  }

  const clearAllFavorites = async () => {
    favorites.value = []
    await saveToIndexedDB()
  }

  // IndexedDB Operations
  const saveToIndexedDB = async () => {
    try {
      if (!process.client) return
      
      const db = await openDB()
      const tx = db.transaction([DB_CONFIG.storeName], 'readwrite')
      const store = tx.objectStore(DB_CONFIG.storeName)
      
      const data = {
        id: DB_CONFIG.key,
        favorites: [...favorites.value],
        updatedAt: new Date().toISOString()
      }
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(data)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      db.close()
      //debug
      console.log('Favorites saved to IndexedDB')
      
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error)
      // Fallback to localStorage
      localStorage.setItem('spacex-favorites-backup', JSON.stringify(favorites.value))
    }
  }

  const loadFromIndexedDB = async (): Promise<{ migrated: boolean, count: number }> => {
    try {
      if (!process.client) return { migrated: false, count: 0 }
      
      const db = await openDB()
      const tx = db.transaction([DB_CONFIG.storeName], 'readonly')
      const store = tx.objectStore(DB_CONFIG.storeName)
      
      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(DB_CONFIG.key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      
      db.close()
      
      if (result?.favorites) {
        favorites.value = [...result.favorites]
        //debug
        console.log('Loaded from IndexedDB:', favorites.value.length, 'items')
        return { migrated: false, count: favorites.value.length }
      }
      
      // Try migration from localStorage
      return await migrateFromLocalStorage()
      
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error)
      return await loadFromLocalStorageBackup()
    }
  }

  // Migration & Fallback
  const migrateFromLocalStorage = async (): Promise<{ migrated: boolean, count: number }> => {
    try {
      const oldData = localStorage.getItem('spacex-favorites')
      if (!oldData) return { migrated: false, count: 0 }
      
      const parsed = JSON.parse(oldData)
      const validFavorites = Array.isArray(parsed) 
        ? parsed.filter(item => typeof item === 'string')
        : []
      
      if (validFavorites.length > 0) {
        favorites.value = [...validFavorites]
        await saveToIndexedDB()
        localStorage.removeItem('spacex-favorites')
        
        //debig
        console.log('Migrated from localStorage:', validFavorites.length, 'items')
        return { migrated: true, count: validFavorites.length }
      }
      
      return { migrated: false, count: 0 }
      
    } catch (error) {
      console.error(' Migration failed:', error)
      return { migrated: false, count: 0 }
    }
  }

  const loadFromLocalStorageBackup = async (): Promise<{ migrated: boolean, count: number }> => {
    try {
      const backup = localStorage.getItem('spacex-favorites-backup')
      if (backup) {
        const parsed = JSON.parse(backup)
        if (Array.isArray(parsed)) {
          favorites.value = [...parsed]

          //debug
          console.log('Loaded from localStorage backup')
          return { migrated: false, count: parsed.length }
        }
      }
      return { migrated: false, count: 0 }
    } catch (error) {
      console.error('Backup load failed:', error)
      return { migrated: false, count: 0 }
    }
  }

  // Utility Functions
  const clearAllData = async () => {
    try {
      favorites.value = []
      
      if (process.client) {
        // Clear IndexedDB
        const db = await openDB()
        const tx = db.transaction([DB_CONFIG.storeName], 'readwrite')
        await tx.objectStore(DB_CONFIG.storeName).clear()
        db.close()
        
        // Clear localStorage
        localStorage.removeItem('spacex-favorites')
        localStorage.removeItem('spacex-favorites-backup')
        
        //debug
        console.log('All data cleared')
      }
    } catch (error) {
      console.error('Clear all failed:', error)
    }
  }

  const getStorageInfo = async () => {
    if (!process.client) return null
    
    try {
      const db = await openDB()
      const tx = db.transaction([DB_CONFIG.storeName], 'readonly')
      const indexedDBData = await new Promise(resolve => {
        const request = tx.objectStore(DB_CONFIG.storeName).get(DB_CONFIG.key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(null)
      })
      db.close()
      
      return {
        indexedDB: indexedDBData,
        localStorage: localStorage.getItem('spacex-favorites-backup'),
        current: favorites.value,
        count: favorites.value.length
      }
    } catch (error) {
      console.error('Storage info failed:', error)
      return null
    }
  }
  
  return {
    // State
    favorites: readonly(favorites),
    favoriteCount,
    isFavorite,
    
    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    
    // Storage
    loadFromIndexedDB,
    saveToIndexedDB,
    clearAllData,
    getStorageInfo,
    
    // Legacy compatibility
    loadFavorites: loadFromIndexedDB
  }
})