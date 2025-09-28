<template>
	<v-app>
		<!-- Mobile Navigation Drawer -->
		<v-navigation-drawer
			v-if="mobile"
			v-model="drawer"
			temporary
			app
			color="primary"
			dark
		>
			<v-list>
				<!-- App Logo/Title -->
				<v-list-item class="px-2">
					<div class="d-flex align-center">
						<v-icon size="32" class="mr-3">mdi-rocket-launch</v-icon>
						<div>
							<v-list-item-title class="text-h6 font-weight-bold">
								SpaceX Explorer
							</v-list-item-title>
							<v-list-item-subtitle class="text-caption">
								Portfolio Project
							</v-list-item-subtitle>
						</div>
					</div>
				</v-list-item>

				<v-divider class="my-2"></v-divider>

				<!-- Navigation Items -->
				<v-list-item
					v-for="item in navigationItems"
					:key="item.title"
					:to="item.to"
					@click="drawer = false"
					class="mb-1"
				>
					<template v-slot:prepend>
						<v-icon>{{ item.icon }}</v-icon>
					</template>
					<v-list-item-title>{{ item.title }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>

		<!-- App Bar -->
		<v-app-bar app color="primary" dark elevation="4">
			<!-- Mobile Menu Button -->
			<v-app-bar-nav-icon 
				v-if="mobile" 
				@click="drawer = !drawer"
				class="mr-2"
			></v-app-bar-nav-icon>

			<!-- App Title -->
			<v-toolbar-title class="font-weight-bold d-flex align-center">
				<v-icon left class="mr-2">mdi-rocket-launch</v-icon>
				<span class="d-none d-sm-inline">SpaceX Explorer</span>
				<span class="d-inline d-sm-none">SpaceX</span>
			</v-toolbar-title>

			<v-spacer></v-spacer>

			<!-- Desktop Navigation -->
			<template v-if="!mobile">
				<v-btn
					v-for="item in navigationItems"
					:key="item.title"
					:to="item.to"
					variant="text"
					class="mx-1"
				>
					<v-icon left>{{ item.icon }}</v-icon>
					{{ item.title }}
				</v-btn>
			</template>

		</v-app-bar>

		<v-main>
			<slot />
		</v-main>

		<v-footer app color="grey-darken-4">
			<div class="text-center w-100 py-2">
				<span class="text-caption">
					&copy; {{ new Date().getFullYear() }} Developed By Patrick De Lara
				</span>
			</div>
		</v-footer>
	</v-app>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'

// Vuetify responsive breakpoints
const { mobile } = useDisplay()

// Drawer state - open by default on desktop, closed on mobile
const drawer = ref(!mobile.value)

// Navigation items
const navigationItems = [
	{ title: 'Home', to: '/', icon: 'mdi-home' },
	{ title: 'Launches', to: '/launches', icon: 'mdi-rocket-launch-outline' },
	{ title: 'Favorites', to: '/favorites', icon: 'mdi-heart' },
]

// Watch for screen size changes
watch(mobile, (newVal) => {
	// Auto-close drawer on mobile, auto-open on desktop
	drawer.value = !newVal
})


</script>

<style scoped>
/* Custom styles for mobile responsiveness */
@media (max-width: 600px) {
	.v-toolbar-title {
		font-size: 1.1rem !important;
	}
}
</style>
