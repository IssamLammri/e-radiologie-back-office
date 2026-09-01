<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
    </div>
    
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 class="text-xl font-semibold text-slate-900 mb-2">Bienvenue, {{ authStore.user?.firstName }} {{ authStore.user?.lastName }} !</h2>
      <p class="text-slate-600">Vous êtes connecté à l'espace e-Radiologie avec l'adresse <span class="font-medium text-slate-900">{{ authStore.user?.email }}</span>.</p>
    </div>
  </div>
</template>
