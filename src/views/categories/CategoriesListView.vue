<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { categoriesApi } from '../../api/categoriesApi';
import type { CaseCategory } from '../../types/cases';
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-vue-next';
import AppModal from '../../components/ui/AppModal.vue';

const categories = ref<CaseCategory[]>([]);
const loading = ref(false);
const error = ref('');

const modal = ref({
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
  showCancel: true,
  confirmText: 'Confirmer',
  action: null as Function | null
});

const openConfirm = (title: string, message: string, type: string, action: Function) => {
  modal.value = { isOpen: true, title, message, type, showCancel: true, confirmText: 'Confirmer', action };
};

const openAlert = (title: string, message: string, type: string = 'info') => {
  modal.value = { isOpen: true, title, message, type, showCancel: false, confirmText: 'Fermer', action: null };
};

const handleModalConfirm = async () => {
  const actionToRun = modal.value.action;
  modal.value.isOpen = false;
  if (actionToRun) {
    await actionToRun();
  }
};

const fetchCategories = async () => {
  loading.value = true;
  error.value = '';
  try {
    categories.value = await categoriesApi.getAdminAll();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la récupération des catégories.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});

const handleDelete = (id: number, name: string) => {
  openConfirm(
    'Supprimer la catégorie',
    `Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ? Cette action est irréversible.`,
    'danger',
    async () => {
      try {
        await categoriesApi.delete(id);
        openAlert('Succès', 'La catégorie a été supprimée avec succès.', 'success');
        await fetchCategories();
      } catch (err: any) {
        if (err.response?.status === 409) {
          openAlert('Action impossible', "Cette catégorie ne peut pas être supprimée car elle est utilisée par un ou plusieurs cas cliniques.", 'warning');
        } else {
          openAlert('Erreur', err.response?.data?.message || 'Erreur lors de la suppression.', 'danger');
        }
      }
    }
  );
};

const toggleActive = async (category: CaseCategory) => {
  try {
    await categoriesApi.update(category.id, { active: !category.active });
    category.active = !category.active;
  } catch (err: any) {
    openAlert('Erreur', "Erreur lors de la mise à jour du statut.", 'danger');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Catégories de cas</h1>
      
      <div class="flex items-center gap-4">
        <RouterLink to="/categories/create"
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </RouterLink>
      </div>
    </div>
    
    <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
      {{ error }}
    </div>
    
    <div class="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Position</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actif</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500">Chargement...</td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">Aucune catégorie trouvée.</td>
            </tr>
            <tr v-for="category in categories" :key="category.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{{ category.name }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 truncate max-w-xs">{{ category.description || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-500">{{ category.position }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <button @click="toggleActive(category)" class="inline-flex items-center justify-center rounded-full focus:outline-none transition-colors" :class="category.active ? 'text-green-500 hover:text-green-600' : 'text-slate-300 hover:text-slate-400'">
                  <CheckCircle v-if="category.active" class="h-6 w-6" />
                  <XCircle v-else class="h-6 w-6" />
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <RouterLink :to="`/categories/${category.id}/edit`" class="text-blue-600 hover:text-blue-900 inline-flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2">
                  <Edit2 class="h-4 w-4" />
                </RouterLink>
                <button @click="handleDelete(category.id, category.name)" class="text-red-600 hover:text-red-900 inline-flex items-center p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal Universel -->
    <AppModal 
      v-model:isOpen="modal.isOpen"
      :title="modal.title"
      :message="modal.message"
      :type="modal.type"
      :showCancel="modal.showCancel"
      :confirmText="modal.confirmText"
      @confirm="handleModalConfirm"
    />
  </div>
</template>
