<template>
	<v-app>
		<v-app-bar app>
			<v-toolbar-title>My App</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn to="/" text>Home</v-btn>
			<v-btn to="/launches" text>Launches</v-btn>
		</v-app-bar>
		<v-main>
			<slot />
		</v-main>
	</v-app>
</template>
<script>
export default {
	name: 'DefaultLayout',
}
</script>
