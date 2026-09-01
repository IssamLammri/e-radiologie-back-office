<script setup lang="ts">
import { useAuthStore } from '../../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { ref, computed } from 'vue';
import { 
  LayoutDashboard, 
  Users, 
  User as UserIcon, 
  LogOut,
  Menu,
  X,
  FileText,
  Layers,
  Tags
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const mobileMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const navigation = computed(() => {
  const items = [];
  
  if (authStore.isAdmin) {
    items.push({ name: 'Cas cliniques', href: '/cases', icon: FileText });
    items.push({ name: 'Modalités', href: '/modalities', icon: Layers });
    items.push({ name: 'Catégories', href: '/categories', icon: Tags });
    items.push({ name: 'Utilisateurs', href: '/users', icon: Users });
  }
  
  return items;
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Desktop sidebar -->
    <div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div class="flex-1 flex flex-col min-h-0 border-r border-slate-200 bg-white">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-6 mb-6">
            <span class="text-xl font-bold tracking-tight text-slate-900">e-Radiologie</span>
          </div>
          <nav class="mt-5 flex-1 px-4 space-y-1">
            <RouterLink v-for="item in navigation" :key="item.name" :to="item.href"
              :class="[
                route.path.startsWith(item.href) && (item.href !== '/dashboard' || route.path === '/dashboard') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
              ]">
              <component :is="item.icon" 
                :class="[
                  route.path.startsWith(item.href) && (item.href !== '/dashboard' || route.path === '/dashboard') 
                    ? 'text-blue-700' 
                    : 'text-slate-400 group-hover:text-slate-500',
                  'mr-3 flex-shrink-0 h-5 w-5'
                ]" aria-hidden="true" />
              {{ item.name }}
            </RouterLink>
          </nav>
        </div>
        <div class="flex-shrink-0 flex border-t border-slate-200 p-4">
          <button @click="handleLogout" class="flex-shrink-0 w-full group block">
            <div class="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
              <div>
                <LogOut class="inline-block h-5 w-5 text-slate-400 group-hover:text-slate-500" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium">Déconnexion</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div class="md:hidden">
      <!-- Top nav -->
      <div class="fixed top-0 left-0 right-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <span class="text-lg font-bold text-slate-900">e-Radiologie</span>
        <button @click="mobileMenuOpen = true" class="text-slate-500 hover:text-slate-900">
          <Menu class="h-6 w-6" />
        </button>
      </div>

      <!-- Mobile sidebar -->
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 flex">
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div class="absolute top-0 right-0 -mr-12 pt-4">
            <button @click="mobileMenuOpen = false" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <X class="h-6 w-6 text-white" />
            </button>
          </div>
          <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div class="flex-shrink-0 flex items-center px-4">
              <span class="text-xl font-bold tracking-tight text-slate-900">e-Radiologie</span>
            </div>
            <nav class="mt-5 px-2 space-y-1">
              <RouterLink v-for="item in navigation" :key="item.name" :to="item.href"
                @click="mobileMenuOpen = false"
                :class="[
                  route.path.startsWith(item.href) && (item.href !== '/dashboard' || route.path === '/dashboard') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                ]">
                <component :is="item.icon" 
                  :class="[
                    route.path.startsWith(item.href) && (item.href !== '/dashboard' || route.path === '/dashboard') 
                      ? 'text-blue-700' 
                      : 'text-slate-400 group-hover:text-slate-500',
                    'mr-4 flex-shrink-0 h-6 w-6'
                  ]" aria-hidden="true" />
                {{ item.name }}
              </RouterLink>
            </nav>
          </div>
          <div class="flex-shrink-0 flex border-t border-slate-200 p-4">
            <button @click="handleLogout" class="flex-shrink-0 group block w-full">
              <div class="flex items-center text-slate-600 hover:text-slate-900">
                <div>
                  <LogOut class="inline-block h-6 w-6 text-slate-400 group-hover:text-slate-500" />
                </div>
                <div class="ml-3">
                  <p class="text-base font-medium">Déconnexion</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-1 md:pl-64 flex flex-col">
      <main class="flex-1 p-6 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
