<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Navigation from '@/components/AppNavigationBar.vue'
</script>

<template>
  
  <header>
    <Navigation />
  </header>

  <main>
    <RouterView />
  </main>

  <footer>

  </footer>

</template>

<style scoped>

</style>
