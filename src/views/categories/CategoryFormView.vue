<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { categoriesApi } from '../../api/categoriesApi';
import { ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const isEditing = route.params.id !== undefined;
const categoryId = isEditing ? Number(route.params.id) : null;

const form = ref({
  name: '',
  description: '',
  active: true,
  position: 0
});

const loading = ref(isEditing);
const saving = ref(false);
const error = ref<any>({});
const globalError = ref('');

onMounted(async () => {
  if (isEditing && categoryId) {
    try {
      const category = await categoriesApi.getAdminById(categoryId);
      form.value = {
        name: category.name,
        description: category.description || '',
        active: category.active,
        position: category.position
      };
    } catch (err: any) {
      globalError.value = "Impossible de charger la catégorie.";
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  saving.value = true;
  error.value = {};
  
  try {
    if (isEditing && categoryId) {
      await categoriesApi.update(categoryId, form.value);
    } else {
      await categoriesApi.create(form.value);
    }
    router.push('/categories');
  } catch (err: any) {
    if (err.response?.status === 422) {
      error.value = err.response.data.errors || {};
    } else {
      error.value = { global: err.response?.data?.message || 'Une erreur est survenue.' };
    }
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    
    <div class="flex items-center gap-4">
      <RouterLink to="/categories" class="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
        <ArrowLeft class="h-5 w-5" />
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">
        {{ isEditing ? 'Modifier la catégorie' : 'Créer une catégorie' }}
      </h1>
    </div>
    
    <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <p class="text-slate-500">Chargement...</p>
    </div>
    
    <div v-else-if="globalError" class="bg-red-50 text-red-700 p-6 rounded-2xl text-center border border-red-100">
      <p class="font-medium">{{ globalError }}</p>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div v-if="error.global" class="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
        {{ error.global }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nom <span class="text-red-500">*</span></label>
          <input id="name" type="text" v-model="form.name" required placeholder="Ex: Imagerie urologique"
                 class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
          <p v-if="error.name" class="mt-1 text-sm text-red-600">{{ error.name[0] }}</p>
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea id="description" v-model="form.description" rows="3" placeholder="Cas d'imagerie urologique..."
                 class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm"></textarea>
          <p v-if="error.description" class="mt-1 text-sm text-red-600">{{ error.description[0] }}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="position" class="block text-sm font-medium text-slate-700 mb-1">Position</label>
            <input id="position" type="number" v-model="form.position" required
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all sm:text-sm" />
            <p v-if="error.position" class="mt-1 text-sm text-red-600">{{ error.position[0] }}</p>
          </div>
          
          <div class="flex items-center h-full pt-6">
            <label class="relative flex items-center cursor-pointer">
              <input type="checkbox" v-model="form.active" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span class="ml-3 text-sm font-medium text-slate-700">Catégorie active</span>
            </label>
            <p v-if="error.active" class="mt-1 text-sm text-red-600">{{ error.active[0] }}</p>
          </div>
        </div>
        
        <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
          <RouterLink to="/categories"
                  class="py-2.5 px-5 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            Annuler
          </RouterLink>
          <button type="submit" :disabled="saving"
                  class="py-2.5 px-5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            <span v-if="saving">Enregistrement...</span>
            <span v-else>Enregistrer</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
