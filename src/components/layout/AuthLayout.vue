<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="min-h-screen flex bg-white">
    <!-- Left side - Branding (Hidden on mobile) -->
    <div class="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] text-white flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
      <!-- Decorative geometric element -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div class="relative z-10 max-w-xl">
        <h1 class="text-6xl font-bold tracking-tight mb-6">
          e-Radiologie
        </h1>
        <p class="text-2xl text-slate-400 font-light leading-relaxed">
          La plateforme centralisée de gestion des cas radiologiques et de formation médicale.
        </p>
      </div>
      
      <!-- Footer brand -->
      <div class="absolute bottom-10 left-16 xl:left-24 z-10 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-white text-[#0a0a0a] flex items-center justify-center font-bold text-lg">
          eR
        </div>
        <span class="font-medium text-slate-300">© {{ new Date().getFullYear() }}</span>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
      <div class="w-full max-w-md">
        <div v-if="title" class="mb-10">
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">{{ title }}</h2>
          <p v-if="subtitle" class="mt-3 text-base text-slate-500">{{ subtitle }}</p>
        </div>
        
        <slot></slot>
      </div>
    </div>
  </div>
</template>
