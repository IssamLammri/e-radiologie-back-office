<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { authApi } from '../api/authApi';
import AuthLayout from '../components/layout/AuthLayout.vue';

const route = useRoute();
const router = useRouter();

const token = ref<string | null>(null);
const password = ref('');
const passwordConfirmation = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);
const invalidToken = ref(false);

onMounted(() => {
  const queryToken = route.query.token as string;
  if (!queryToken) {
    invalidToken.value = true;
  } else {
    token.value = queryToken;
  }
});

const handleSubmit = async () => {
  if (!token.value || !password.value || !passwordConfirmation.value) return;
  
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }
  
  if (password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.';
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  try {
    await authApi.resetPassword(token.value, password.value, passwordConfirmation.value);
    success.value = true;
    setTimeout(() => {
      router.push('/login');
    }, 4000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ce lien de réinitialisation est invalide ou a expiré.';
  } finally {
    loading.value = false;
  }
};

const titleText = computed(() => {
  if (invalidToken.value) return 'Lien invalide';
  if (success.value) return 'Mot de passe réinitialisé';
  return 'Nouveau mot de passe';
});

const subtitleText = computed(() => {
  if (invalidToken.value || success.value) return '';
  return 'Veuillez définir votre nouveau mot de passe';
});
</script>

<template>
  <AuthLayout :title="titleText" :subtitle="subtitleText">
    
    <template v-if="invalidToken">
      <div class="text-center space-y-6">
        <div class="bg-red-50 text-red-700 p-5 rounded-xl text-sm border border-red-100 flex flex-col items-center">
          <svg class="h-8 w-8 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ce lien de réinitialisation est invalide.</span>
        </div>
        <RouterLink to="/forgot-password" class="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Demander un nouveau lien
        </RouterLink>
      </div>
    </template>
    
    <template v-else-if="success">
      <div class="text-center space-y-6">
        <div class="bg-green-50 text-green-800 p-5 rounded-xl text-sm border border-green-100 flex flex-col items-center">
          <svg class="h-8 w-8 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Votre mot de passe a été réinitialisé avec succès.</span>
        </div>
        <RouterLink to="/login" class="inline-flex justify-center w-full py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm">
          Se connecter
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div v-if="error" class="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex flex-col items-center text-center">
          <span>{{ error }}</span>
          <div v-if="error.includes('invalide ou a expiré')" class="mt-3">
            <RouterLink to="/forgot-password" class="font-medium underline hover:text-red-800 transition-colors">
              Demander un nouveau lien
            </RouterLink>
          </div>
        </div>
        
        <div class="space-y-5">
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe <span class="text-red-500">*</span></label>
            <input id="password" name="password" type="password" autocomplete="new-password" required minlength="8"
                   v-model="password"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
          </div>
          <div>
            <label for="password_confirmation" class="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe <span class="text-red-500">*</span></label>
            <input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required minlength="8"
                   v-model="passwordConfirmation"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading || !password || !passwordConfirmation"
                  class="group w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">
            <span v-if="loading" class="mr-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            Réinitialiser mon mot de passe
          </button>
        </div>
      </form>
    </template>
  </AuthLayout>
</template>
