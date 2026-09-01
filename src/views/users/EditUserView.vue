<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usersApi } from '../../api/usersApi';
import { ArrowLeft } from 'lucide-vue-next';
import type { User } from '../../types/user';

const router = useRouter();
const route = useRoute();
const userId = Number(route.params.id);

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const role = ref('ROLE_USER');

const loading = ref(true);
const saving = ref(false);
const error = ref<any>({});
const globalError = ref('');
const successMessage = ref('');
const passwordSuccessMessage = ref('');

const newPassword = ref('');
const passwordConfirmation = ref('');
const savingPassword = ref(false);
const passwordError = ref<any>({});

onMounted(async () => {
  try {
    const user = await usersApi.getById(userId);
    firstName.value = user.firstName;
    lastName.value = user.lastName;
    email.value = user.email;
    role.value = user.roles.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';
  } catch (err: any) {
    globalError.value = "Impossible de charger les informations de l'utilisateur.";
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  saving.value = true;
  error.value = {};
  successMessage.value = '';
  
  try {
    const result = await usersApi.update(userId, {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      roles: [role.value]
    });
    
    successMessage.value = result.message || 'Utilisateur mis à jour avec succès.';
  } catch (err: any) {
    if (err.response?.status === 422) {
      error.value = err.response.data.errors || {};
    } else {
      error.value = { global: err.response?.data?.message || 'Erreur lors de la mise à jour.' };
    }
  } finally {
    saving.value = false;
  }
};
const handlePasswordSubmit = async () => {
  if (newPassword.value !== passwordConfirmation.value) {
    passwordError.value = { passwordConfirmation: ['Les mots de passe ne correspondent pas.'] };
    return;
  }
  
  savingPassword.value = true;
  passwordError.value = {};
  passwordSuccessMessage.value = '';
  
  try {
    const result = await usersApi.updatePassword(userId, {
      newPassword: newPassword.value,
      passwordConfirmation: passwordConfirmation.value
    });
    
    passwordSuccessMessage.value = result.message || 'Mot de passe mis à jour avec succès.';
    newPassword.value = '';
    passwordConfirmation.value = '';
  } catch (err: any) {
    if (err.response?.status === 422) {
      passwordError.value = err.response.data.errors || {};
    } else {
      passwordError.value = { global: err.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe.' };
    }
  } finally {
    savingPassword.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    
    <div class="flex items-center gap-4">
      <RouterLink to="/users" class="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
        <ArrowLeft class="h-5 w-5" />
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Modifier l'utilisateur</h1>
    </div>
    
    <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="mt-4 text-slate-500">Chargement des données...</p>
    </div>
    
    <div v-else-if="globalError" class="bg-red-50 text-red-700 p-6 rounded-2xl text-center border border-red-100">
      <p class="font-medium">{{ globalError }}</p>
      <RouterLink to="/users" class="mt-4 inline-block text-blue-600 font-medium hover:underline">Retour à la liste</RouterLink>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div v-if="successMessage" class="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
        {{ successMessage }}
      </div>

      <div v-if="error.global" class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
        {{ error.global }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <h2 class="text-lg font-semibold text-slate-900 mb-4">Informations de l'utilisateur</h2>
        
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
          <button type="submit" :disabled="saving"
                  class="py-2.5 px-5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm">
            <span v-if="saving" class="mr-2 inline-block">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </span>
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>

    <!-- Sécurité (Modification du mot de passe) -->
    <div v-if="!loading && !globalError" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <h2 class="text-lg font-semibold text-slate-900 mb-6">Sécurité (Changer le mot de passe)</h2>
      
      <div v-if="passwordSuccessMessage" class="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
        {{ passwordSuccessMessage }}
      </div>

      <div v-if="passwordError.global" class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
        {{ passwordError.global }}
      </div>

      <form @submit.prevent="handlePasswordSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="newPassword" class="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe <span class="text-red-500">*</span></label>
            <input id="newPassword" type="password" v-model="newPassword" required minlength="8"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="passwordError.newPassword" class="mt-1 text-sm text-red-600">{{ passwordError.newPassword[0] }}</p>
          </div>
          
          <div>
            <label for="passwordConfirmation" class="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe <span class="text-red-500">*</span></label>
            <input id="passwordConfirmation" type="password" v-model="passwordConfirmation" required minlength="8"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="passwordError.passwordConfirmation" class="mt-1 text-sm text-red-600">{{ passwordError.passwordConfirmation[0] }}</p>
          </div>
        </div>

        <div class="pt-2 flex justify-end">
          <button type="submit" :disabled="savingPassword || !newPassword"
                  class="py-2.5 px-5 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-all shadow-sm">
            <span v-if="savingPassword">Mise à jour...</span>
            <span v-else>Mettre à jour le mot de passe</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
