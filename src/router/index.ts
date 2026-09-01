import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('../views/LoginView.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/forgot-password',
            name: 'ForgotPassword',
            component: () => import('../views/ForgotPasswordView.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: () => import('../views/ResetPasswordView.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/',
            component: () => import('../components/layout/DashboardLayout.vue'),
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'dashboard',
                    name: 'Dashboard',
                    component: () => import('../views/DashboardView.vue'),
                },
                {
                    path: 'profile',
                    name: 'Profile',
                    component: () => import('../views/ProfileView.vue'),
                },
                {
                    path: 'users',
                    name: 'UsersList',
                    component: () => import('../views/users/UsersListView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'users/create',
                    name: 'CreateUser',
                    component: () => import('../views/users/CreateUserView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'users/:id/edit',
                    name: 'EditUser',
                    component: () => import('../views/users/EditUserView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'modalities',
                    name: 'ModalitiesList',
                    component: () => import('../views/modalities/ModalitiesListView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'modalities/create',
                    name: 'CreateModality',
                    component: () => import('../views/modalities/ModalityFormView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'modalities/:id/edit',
                    name: 'EditModality',
                    component: () => import('../views/modalities/ModalityFormView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'categories',
                    name: 'CategoriesList',
                    component: () => import('../views/categories/CategoriesListView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'categories/create',
                    name: 'CreateCategory',
                    component: () => import('../views/categories/CategoryFormView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'categories/:id/edit',
                    name: 'EditCategory',
                    component: () => import('../views/categories/CategoryFormView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'cases',
                    name: 'CasesList',
                    component: () => import('../views/cases/CasesListView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'cases/create',
                    name: 'CreateCase',
                    component: () => import('../views/cases/CaseFormView.vue'),
                    meta: { requiresAdmin: true }
                },
                {
                    path: 'cases/:id/edit',
                    name: 'EditCase',
                    component: () => import('../views/cases/CaseFormView.vue'),
                    meta: { requiresAdmin: true }
                }
            ]
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    
    // Check if the route requires auth
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next('/login');
    }
    
    // Check if the route requires admin
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        return next('/dashboard');
    }
    
    // Check if the route is for guests only (e.g., login, forgot-password)
    if (to.meta.guestOnly && authStore.isAuthenticated) {
        return next('/dashboard');
    }
    
    next();
});

export default router;
