<script setup lang="ts">
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
    <div v-if="!authStore.initialized" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
    <RouterView v-else />
  </div>
</template>
