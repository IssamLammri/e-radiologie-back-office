<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/authApi';

const authStore = useAuthStore();

// Profile state
const firstName = ref('');
const lastName = ref('');
const email = ref('');
const profileLoading = ref(false);
const profileSuccess = ref('');
const profileError = ref<any>({});

// Password state
const currentPassword = ref('');
const newPassword = ref('');
const passwordConfirmation = ref('');
const passwordLoading = ref(false);
const passwordSuccess = ref('');
const passwordError = ref<any>({});

onMounted(() => {
  if (authStore.user) {
    firstName.value = authStore.user.firstName;
    lastName.value = authStore.user.lastName;
    email.value = authStore.user.email;
  }
});

const handleProfileSubmit = async () => {
  profileLoading.value = true;
  profileSuccess.value = '';
  profileError.value = {};
  
  try {
    const data: any = {};
    if (firstName.value !== authStore.user?.firstName) data.firstName = firstName.value;
    if (lastName.value !== authStore.user?.lastName) data.lastName = lastName.value;
    if (email.value !== authStore.user?.email) data.email = email.value;
    
    if (Object.keys(data).length === 0) {
      profileLoading.value = false;
      return;
    }

    const result = await authApi.updateProfile(data);
    profileSuccess.value = result.message;
    
    if (result.requiresReauthentication) {
      alert("Votre email a été modifié. Vous allez être déconnecté pour vous reconnecter avec votre nouvel email.");
      authStore.logout();
      window.location.href = '/login';
    } else {
      await authStore.fetchMe();
    }
  } catch (err: any) {
    if (err.response?.status === 422) {
      profileError.value = err.response.data.errors || {};
    } else {
      profileError.value = { global: err.response?.data?.message || 'Erreur de mise à jour' };
    }
  } finally {
    profileLoading.value = false;
  }
};

const handlePasswordSubmit = async () => {
  if (newPassword.value !== passwordConfirmation.value) {
    passwordError.value = { passwordConfirmation: ['Les mots de passe ne correspondent pas.'] };
    return;
  }
  
  passwordLoading.value = true;
  passwordSuccess.value = '';
  passwordError.value = {};
  
  try {
    const result = await authApi.updatePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
      passwordConfirmation: passwordConfirmation.value
    });
    
    passwordSuccess.value = result.message;
    currentPassword.value = '';
    newPassword.value = '';
    passwordConfirmation.value = '';
  } catch (err: any) {
    if (err.response?.status === 422) {
      passwordError.value = err.response.data.errors || {};
    } else {
      passwordError.value = { global: err.response?.data?.message || 'Erreur de mise à jour' };
    }
  } finally {
    passwordLoading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Mon Profil</h1>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Informations personnelles -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6">Informations personnelles</h2>
        
        <div v-if="profileSuccess" class="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
          {{ profileSuccess }}
        </div>
        
        <div v-if="profileError.global" class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {{ profileError.global }}
        </div>

        <form @submit.prevent="handleProfileSubmit" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input id="firstName" type="text" v-model="firstName" required
                     class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
              <p v-if="profileError.firstName" class="mt-1 text-sm text-red-600">{{ profileError.firstName[0] }}</p>
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input id="lastName" type="text" v-model="lastName" required
                     class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
              <p v-if="profileError.lastName" class="mt-1 text-sm text-red-600">{{ profileError.lastName[0] }}</p>
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input id="email" type="email" v-model="email" required
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="profileError.email" class="mt-1 text-sm text-red-600">{{ profileError.email[0] }}</p>
          </div>

          <div class="pt-2 flex justify-end">
            <button type="submit" :disabled="profileLoading"
                    class="py-2.5 px-5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-sm">
              <span v-if="profileLoading">Enregistrement...</span>
              <span v-else>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Sécurité -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6">Sécurité</h2>
        
        <div v-if="passwordSuccess" class="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
          {{ passwordSuccess }}
        </div>
        
        <div v-if="passwordError.global" class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
          {{ passwordError.global }}
        </div>

        <form @submit.prevent="handlePasswordSubmit" class="space-y-5">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-slate-700 mb-1">Ancien mot de passe</label>
            <input id="currentPassword" type="password" v-model="currentPassword" required
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="passwordError.currentPassword" class="mt-1 text-sm text-red-600">{{ passwordError.currentPassword[0] }}</p>
          </div>
          
          <div>
            <label for="newPassword" class="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
            <input id="newPassword" type="password" v-model="newPassword" required minlength="8"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="passwordError.newPassword" class="mt-1 text-sm text-red-600">{{ passwordError.newPassword[0] }}</p>
          </div>
          
          <div>
            <label for="passwordConfirmation" class="block text-sm font-medium text-slate-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input id="passwordConfirmation" type="password" v-model="passwordConfirmation" required minlength="8"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="passwordError.passwordConfirmation" class="mt-1 text-sm text-red-600">{{ passwordError.passwordConfirmation[0] }}</p>
          </div>

          <div class="pt-2 flex justify-end">
            <button type="submit" :disabled="passwordLoading || !currentPassword || !newPassword"
                    class="py-2.5 px-5 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-all shadow-sm">
              <span v-if="passwordLoading">Mise à jour...</span>
              <span v-else>Mettre à jour le mot de passe</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
