import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './index.css';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Initialize authentication state before mounting the app
const authStore = useAuthStore();
authStore.initialize().then(() => {
    app.use(router);
    app.mount('#app');
});
