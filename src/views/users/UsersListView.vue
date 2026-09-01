<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { usersApi, type PaginatedUsers } from '../../api/usersApi';
import type { User } from '../../types/user';
import { Search, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const users = ref<User[]>([]);
const pagination = ref({ page: 1, limit: 20, totalItems: 0, totalPages: 1 });
const searchQuery = ref('');
const loading = ref(false);
const error = ref('');

const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const data = await usersApi.getAll({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: searchQuery.value || undefined
    });
    users.value = data.items;
    pagination.value = data.pagination;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors de la récupération des utilisateurs.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});

// Debounce search
let searchTimeout: any;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchUsers();
  }, 500);
});

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return;
  pagination.value.page = newPage;
  fetchUsers();
};

const handleDelete = async (id: number, name: string) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${name} ?`)) return;
  
  try {
    await usersApi.delete(id);
    fetchUsers();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Erreur lors de la suppression.');
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">Utilisateurs</h1>
      
      <div class="flex items-center gap-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-slate-400" />
          </div>
          <input type="text" v-model="searchQuery" placeholder="Rechercher..."
                 class="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors" />
        </div>
        
        <RouterLink to="/users/create"
                    class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
          <Plus class="h-4 w-4 mr-2" />
          Nouvel utilisateur
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
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rôle
              </th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="3" class="px-6 py-8 text-center text-slate-500">Chargement...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="3" class="px-6 py-12 text-center text-slate-500">Aucun utilisateur trouvé.</td>
            </tr>
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                    {{ user.firstName[0] }}{{ user.lastName[0] }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-slate-900">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="text-sm text-slate-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  user.roles.includes('ROLE_ADMIN') ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800',
                  'px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full'
                ]">
                  {{ user.roles.includes('ROLE_ADMIN') ? 'Administrateur' : 'Utilisateur' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <RouterLink :to="`/users/${user.id}/edit`" class="text-blue-600 hover:text-blue-900 inline-flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors mr-2">
                  <Edit2 class="h-4 w-4" />
                </RouterLink>
                <button @click="handleDelete(user.id, `${user.firstName} ${user.lastName}`)" class="text-red-600 hover:text-red-900 inline-flex items-center p-2 rounded-lg hover:bg-red-50 transition-colors">
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
  </div>
</template>
