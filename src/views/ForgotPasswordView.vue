<script setup lang="ts">
import { ref } from 'vue';
import { authApi } from '../api/authApi';
import AuthLayout from '../components/layout/AuthLayout.vue';

const email = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

const handleSubmit = async () => {
  if (!email.value) return;
  
  error.value = '';
  loading.value = true;
  success.value = false;
  
  try {
    await authApi.forgotPassword(email.value);
    success.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout title="Mot de passe oublié" subtitle="Entrez votre adresse email pour recevoir un lien de réinitialisation">
    <form v-if="!success" class="space-y-6" @submit.prevent="handleSubmit">
      <div v-if="error" class="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start">
        <svg class="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
      
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Adresse email <span class="text-red-500">*</span></label>
        <input id="email" name="email" type="email" autocomplete="email" required
               v-model="email"
               class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm"
               placeholder="user@example.com" />
      </div>

      <div>
        <button type="submit" :disabled="loading || !email"
                class="group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
          <span v-if="loading" class="mr-2">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </span>
          Envoyer le lien de réinitialisation
        </button>
      </div>
      
      <div class="text-center mt-6">
        <RouterLink to="/login" class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Retour à la connexion
        </RouterLink>
      </div>
    </form>
    
    <div v-else class="space-y-6">
      <div class="bg-green-50 text-green-800 p-5 rounded-xl text-sm border border-green-100 text-center flex flex-col items-center">
        <svg class="h-8 w-8 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Si un compte correspond à cette adresse email, un email de réinitialisation vous a été envoyé.</span>
      </div>
      <div class="text-center mt-6">
        <RouterLink to="/login" class="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Retour à la connexion
        </RouterLink>
      </div>
    </div>
  </AuthLayout>
</template>
