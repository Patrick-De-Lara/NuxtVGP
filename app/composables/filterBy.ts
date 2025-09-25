export const filterBy = (launches: Ref<any[]>) => {
  const selectedYear = ref<string>('all')

  // Get unique years from launches
  const availableYears = computed(() => {
    if (!launches.value.length) return []
    
    const years = launches.value
      .map(launch => {
        if (!launch.launch_date_utc) {
          return null
        }
        return new Date(launch.launch_date_utc).getFullYear().toString()

      })
      .filter(year => year !== null)
      .sort((a, b) => parseInt(b) - parseInt(a)) // Sort descending (newest first)
    
    return [...new Set(years)] // Remove duplicates
  })

  // Filter launches by year 
  const filteredLaunches = computed(() => {
    let filtered = launches.value

    if (selectedYear.value !== 'all') {
      filtered = filtered.filter(launch => {
        if (!launch.launch_date_utc) 
        {
          return false
        } 
        const launchYear = new Date(launch.launch_date_utc).getFullYear().toString()
        return launchYear === selectedYear.value
      })
    }

    return filtered
  })

  // Reset filters
  const resetFilters = () => {
    selectedYear.value = 'all'
  }

  const filterSummary = computed(() => {
    const total = launches.value.length
    const filtered = filteredLaunches.value.length
    
    return {
      total,
      filtered,
      isFiltered: selectedYear.value !== 'all'
    }
  })

  return {
    selectedYear,
    availableYears,
    filteredLaunches,
    resetFilters,
    filterSummary
  }
}