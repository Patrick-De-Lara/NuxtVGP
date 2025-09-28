export default defineNuxtRouteMiddleware((to, from) => {
  
  const router = useRouter()
  const route = router.resolve(to.path)
  
  // If route doesn't exist (404), redirect to home
  if (route.name === null || !route.matched.length) {
    return navigateTo('/')
  }
  

})