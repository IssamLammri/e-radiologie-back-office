<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { casesApi } from '../../api/casesApi';
import { modalitiesApi } from '../../api/modalitiesApi';
import { categoriesApi } from '../../api/categoriesApi';
import type { RadiologyCase, ImagingModality, CaseCategory } from '../../types/cases';
import { DIFFICULTY_LABELS, STATUS_LABELS } from '../../types/cases';
import { Search, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Eye, Play, Archive } from 'lucide-vue-next';
import { formatDate } from '../../utils/format';
import AppModal from '../../components/ui/AppModal.vue';

const cases = ref<RadiologyCase[]>([]);
const pagination = ref({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

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

// Lookups for filters
const modalities = ref<ImagingModality[]>([]);
const categories = ref<CaseCategory[]>([]);

// Filters
const filters = ref({
  search: '',
  modality: '',
  category: '',
  difficulty: '',
  status: ''
});

const loadLookups = async () => {
  try {
    const [mods, cats] = await Promise.all([
      modalitiesApi.getActive(),
      categoriesApi.getActive()
    ]);
    modalities.value = mods;
    categories.value = cats;
  } catch (err) {
    console.error("Could not load lookups", err);
  }
};

const fetchCases = async () => {
  loading.value = true;
  error.value = '';
  
  const params: Record<string, any> = {
    page: pagination.value.page,
    limit: pagination.value.limit,
  };
  
  if (filters.value.search) params.search = filters.value.search;
  if (filters.value.modality) params.modality = filters.value.modality;
  if (filters.value.category) params.category = filters.value.category;
  if (filters.value.difficulty) params.difficulty = filters.value.difficulty;
  if (filters.value.status) params.status = filters.value.status;

  try {
    const data = await casesApi.getAdminAll(params);
    cases.value = data.items;
    pagination.value = data.pagination;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la récupération des cas.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadLookups();
  fetchCases();
});

// Debounce search and watch filters
let searchTimeout: any;
watch(filters, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchCases();
  }, 500);
}, { deep: true });

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return;
  pagination.value.page = newPage;
  fetchCases();
};

const handleDelete = (id: number, title: string) => {
  openConfirm(
    'Supprimer le cas',
    `Êtes-vous sûr de vouloir supprimer le cas "${title}" ? Cette action est irréversible.`,
    'danger',
    async () => {
      try {
        await casesApi.delete(id);
        openAlert('Succès', 'Le cas a été supprimé avec succès.', 'success');
        fetchCases();
      } catch (err: any) {
        openAlert('Erreur', err.response?.data?.message || 'Erreur lors de la suppression.', 'danger');
      }
    }
  );
};

const handlePublish = (id: number, title: string) => {
  openConfirm(
    'Publier le cas',
    `Voulez-vous vraiment publier le cas "${title}" ?`,
    'info',
    async () => {
      try {
        await casesApi.publish(id);
        openAlert('Succès', 'Le cas a été publié avec succès.', 'success');
        fetchCases();
      } catch (err: any) {
        openAlert('Erreur', err.response?.data?.message || 'Erreur lors de la publication.', 'danger');
      }
    }
  );
};

const handleArchive = (id: number, title: string) => {
  openConfirm(
    'Archiver le cas',
    `Voulez-vous vraiment archiver le cas "${title}" ?`,
    'warning',
    async () => {
      try {
        await casesApi.archive(id);
        openAlert('Succès', 'Le cas a été archivé avec succès.', 'success');
        fetchCases();
      } catch (err: any) {
        openAlert('Erreur', err.response?.data?.message || 'Erreur lors de l\'archivage.', 'danger');
      }
    }
  );
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'PUBLISHED': return 'bg-green-100 text-green-800';
    case 'ARCHIVED': return 'bg-slate-100 text-slate-800';
    case 'PENDING_VALIDATION': return 'bg-orange-100 text-orange-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const getDifficultyColor = (diff: string) => {
  switch(diff) {
    case 'BEGINNER': return 'bg-blue-100 text-blue-800';
    case 'INTERMEDIATE': return 'bg-indigo-100 text-indigo-800';
    case 'ADVANCED': return 'bg-purple-100 text-purple-800';
    default: return 'bg-slate-100 text-slate-800';
  }
};

const getModalityName = (id: number) => {
  return modalities.value.find(m => m.id === id)?.name || id;
};

const getCategoryName = (id: number) => {
  return categories.value.find(c => c.id === id)?.name || id;
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Cas cliniques</h1>
      
      <div class="flex items-center gap-4">
        <RouterLink to="/cases/create"
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Nouveau cas
        </RouterLink>
      </div>
    </div>
    
    <div v-if="error" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
      {{ error }}
    </div>

    <div v-if="successMessage" class="p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 flex justify-between items-center">
      {{ successMessage }}
      <button @click="successMessage = ''" class="text-green-500 hover:text-green-700">&times;</button>
    </div>
    
    <!-- Filters -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <div class="relative col-span-1 sm:col-span-2 md:col-span-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-slate-400" />
        </div>
        <input type="text" v-model="filters.search" placeholder="Rechercher..."
               class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500" />
      </div>
      
      <select v-model="filters.modality" class="block w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
        <option value="">Toutes modalités</option>
        <option v-for="m in modalities" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      
      <select v-model="filters.category" class="block w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
        <option value="">Toutes catégories</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      
      <select v-model="filters.difficulty" class="block w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
        <option value="">Toutes difficultés</option>
        <option v-for="(label, key) in DIFFICULTY_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      
      <select v-model="filters.status" class="block w-full py-2 px-3 border border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
        <option value="">Tous statuts</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>
    
    <!-- Table -->
    <div class="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modalité / Catégorie</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Niveau</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
              <th scope="col" class="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Publication</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-8 text-center text-slate-500">Chargement...</td>
            </tr>
            <tr v-else-if="cases.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">Aucun cas trouvé.</td>
            </tr>
            <tr v-for="c in cases" :key="c.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-900">{{ c.title }}</div>
                <div class="text-xs text-slate-500 mt-1">Auteur: {{ c.author?.displayName || (c.author?.firstName ? c.author.firstName + ' ' + c.author.lastName : null) || c.authorId || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-900">{{ c.modality?.name || getModalityName(c.modalityId as number) }}</div>
                <div class="text-xs text-slate-500">{{ c.category?.name || getCategoryName(c.categoryId as number) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="['px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', getDifficultyColor(typeof c.difficulty === 'object' ? c.difficulty.value : c.difficulty)]">
                  {{ typeof c.difficulty === 'object' ? c.difficulty.label : DIFFICULTY_LABELS[c.difficulty] }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="['px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusColor(typeof c.status === 'object' ? c.status.value : c.status)]">
                  {{ typeof c.status === 'object' ? c.status.label : STATUS_LABELS[c.status] }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">
                {{ c.publishedAt ? formatDate(c.publishedAt) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <RouterLink :to="`/cases/${c.slug}`" target="_blank" title="Voir (Public)" class="text-slate-600 hover:text-slate-900 inline-flex items-center p-2 rounded-lg hover:bg-slate-100 transition-colors mr-1">
                  <Eye class="h-4 w-4" />
                </RouterLink>
                <RouterLink :to="`/cases/${c.id}/edit`" title="Modifier" class="text-blue-600 hover:text-blue-900 inline-flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors mr-1">
                  <Edit2 class="h-4 w-4" />
                </RouterLink>
                <button v-if="(typeof c.status === 'object' ? c.status.value : c.status) !== 'PUBLISHED'" @click="handlePublish(c.id, c.title)" title="Publier" class="text-green-600 hover:text-green-900 inline-flex items-center p-2 rounded-lg hover:bg-green-50 transition-colors mr-1">
                  <Play class="h-4 w-4" />
                </button>
                <button v-if="(typeof c.status === 'object' ? c.status.value : c.status) === 'PUBLISHED'" @click="handleArchive(c.id, c.title)" title="Archiver" class="text-orange-600 hover:text-orange-900 inline-flex items-center p-2 rounded-lg hover:bg-orange-50 transition-colors mr-1">
                  <Archive class="h-4 w-4" />
                </button>
                <button @click="handleDelete(c.id, c.title)" title="Supprimer" class="text-red-600 hover:text-red-900 inline-flex items-center p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-slate-700">
              Affichage de <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> à
              <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.totalItems) }}</span> sur
              <span class="font-medium">{{ pagination.totalItems }}</span> résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                <ChevronLeft class="h-5 w-5" />
              </button>
              <button @click="changePage(pagination.page + 1)" :disabled="pagination.page === pagination.totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                <ChevronRight class="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
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
