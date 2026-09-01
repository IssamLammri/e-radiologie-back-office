<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AuthLayout from '../components/layout/AuthLayout.vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  if (!email.value || !password.value) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (err: any) {
    if (err.response?.status === 401) {
      error.value = 'Email ou mot de passe incorrect.';
    } else {
      error.value = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout title="Bienvenue sur e-Radiologie" subtitle="Connectez-vous pour continuer">
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="error" class="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start">
        <svg class="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
      
      <div class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
          <input id="email" name="email" type="email" autocomplete="email" required
                 v-model="email"
                 class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm"
                 placeholder="jean.dupont@example.com" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Mot de passe <span class="text-red-500">*</span></label>
          <input id="password" name="password" type="password" autocomplete="current-password" required
                 v-model="password"
                 class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm"
                 placeholder="••••••••" />
        </div>
      </div>

      <div class="flex items-center justify-end">
        <RouterLink to="/forgot-password" class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Mot de passe oublié ?
        </RouterLink>
      </div>

      <div>
        <button type="submit" :disabled="loading || !email || !password"
                class="group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
          <span v-if="loading" class="mr-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          Se connecter
        </button>
      </div>
    </form>
  </AuthLayout>
</template>
