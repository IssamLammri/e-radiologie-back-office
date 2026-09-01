<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usersApi } from '../../api/usersApi';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const role = ref('ROLE_USER');

const loading = ref(false);
const error = ref<any>({});
const successMessage = ref('');

const handleSubmit = async () => {
  error.value = {};
  successMessage.value = '';
  
  if (password.value !== passwordConfirmation.value) {
    error.value = { passwordConfirmation: ['Les mots de passe ne correspondent pas.'] };
    return;
  }
  
  loading.value = true;
  
  try {
    await usersApi.create({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
      roles: [role.value]
    });
    
    router.push('/users');
  } catch (err: any) {
    if (err.response?.status === 422) {
      error.value = err.response.data.errors || {};
    } else {
      error.value = { global: err.response?.data?.message || 'Une erreur est survenue lors de la création.' };
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    
    <div class="flex items-center gap-4">
      <RouterLink to="/users" class="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
        <ArrowLeft class="h-5 w-5" />
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Créer un utilisateur</h1>
    </div>
    
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div v-if="error.global" class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
        {{ error.global }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1">Prénom <span class="text-red-500">*</span></label>
            <input id="firstName" type="text" v-model="firstName" required
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="error.firstName" class="mt-1 text-sm text-red-600">{{ error.firstName[0] }}</p>
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1">Nom <span class="text-red-500">*</span></label>
            <input id="lastName" type="text" v-model="lastName" required
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="error.lastName" class="mt-1 text-sm text-red-600">{{ error.lastName[0] }}</p>
          </div>
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
          <input id="email" type="email" autocomplete="email" v-model="email" required
                 class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
          <p v-if="error.email" class="mt-1 text-sm text-red-600">{{ error.email[0] }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Mot de passe temporaire <span class="text-red-500">*</span></label>
            <input id="password" type="password" autocomplete="new-password" v-model="password" required minlength="8"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="error.password" class="mt-1 text-sm text-red-600">{{ error.password[0] }}</p>
          </div>
          
          <div>
            <label for="passwordConfirmation" class="block text-sm font-medium text-slate-700 mb-1">Confirmation du mot de passe <span class="text-red-500">*</span></label>
            <input id="passwordConfirmation" type="password" autocomplete="new-password" v-model="passwordConfirmation" required minlength="8"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="error.passwordConfirmation" class="mt-1 text-sm text-red-600">{{ error.passwordConfirmation[0] }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">Rôle <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="relative flex cursor-pointer rounded-xl border bg-white p-4 shadow-sm focus:outline-none"
                   :class="role === 'ROLE_USER' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'">
              <input type="radio" v-model="role" value="ROLE_USER" class="sr-only" />
              <span class="flex flex-1">
                <span class="flex flex-col">
                  <span class="block text-sm font-medium text-slate-900">Utilisateur Standard</span>
                  <span class="mt-1 flex items-center text-sm text-slate-500">Accès aux fonctionnalités de base</span>
                </span>
              </span>
              <svg class="h-5 w-5 text-blue-600" :class="role === 'ROLE_USER' ? 'block' : 'hidden'" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
            </label>

            <label class="relative flex cursor-pointer rounded-xl border bg-white p-4 shadow-sm focus:outline-none"
                   :class="role === 'ROLE_ADMIN' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'">
              <input type="radio" v-model="role" value="ROLE_ADMIN" class="sr-only" />
              <span class="flex flex-1">
                <span class="flex flex-col">
                  <span class="block text-sm font-medium text-slate-900">Administrateur</span>
                  <span class="mt-1 flex items-center text-sm text-slate-500">Accès complet (gestion des utilisateurs)</span>
                </span>
              </span>
              <svg class="h-5 w-5 text-blue-600" :class="role === 'ROLE_ADMIN' ? 'block' : 'hidden'" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
              </svg>
            </label>
          </div>
          <p v-if="error.roles" class="mt-1 text-sm text-red-600">{{ error.roles[0] }}</p>
        </div>
        
        <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <RouterLink to="/users"
                  class="py-2.5 px-5 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors">
            Annuler
          </RouterLink>
          <button type="submit" :disabled="loading"
                  class="py-2.5 px-5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm">
            <span v-if="loading" class="mr-2 inline-block">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            Créer l'utilisateur
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
