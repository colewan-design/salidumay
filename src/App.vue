<script setup>
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <AppNavbar />
  <div class="content-shell">
    <RouterView />
  </div>
</template>

<style>
.content-shell {
  margin-left: 220px;
  min-height: 100vh;
}
@media (max-width: 768px) {
  .content-shell { margin-left: 0; }
}
</style>
