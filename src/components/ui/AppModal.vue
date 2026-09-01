<script setup lang="ts">
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // 'info', 'success', 'warning', 'danger'
  confirmText: { type: String, default: 'Confirmer' },
  cancelText: { type: String, default: 'Annuler' },
  showCancel: { type: Boolean, default: true }
});

const emit = defineEmits(['update:isOpen', 'confirm', 'cancel']);

const close = () => {
  emit('update:isOpen', false);
  emit('cancel');
};

const confirm = () => {
  emit('confirm');
};

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'danger': return XCircle;
    default: return Info;
  }
});

const iconColorClass = computed(() => {
  switch (props.type) {
    case 'success': return 'text-green-600 bg-green-100';
    case 'warning': return 'text-orange-600 bg-orange-100';
    case 'danger': return 'text-red-600 bg-red-100';
    default: return 'text-blue-600 bg-blue-100';
  }
});

const buttonClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
    case 'warning': return 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500';
    default: return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
  }
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>
    
    <!-- Modal Panel -->
    <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 transform transition-all animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Close Button -->
      <div class="absolute top-4 right-4">
        <button @click="close" class="text-slate-400 hover:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 rounded-lg p-1">
          <X class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Content -->
      <div class="flex flex-col items-center text-center">
        <div :class="['p-3 rounded-full mb-4', iconColorClass]">
          <component :is="iconComponent" class="h-8 w-8" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-slate-500 mb-8 leading-relaxed">{{ message }}</p>
      </div>
      
      <!-- Actions -->
      <div class="flex flex-col-reverse sm:flex-row sm:justify-center gap-3">
        <button v-if="showCancel" @click="close" 
                class="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors">
          {{ cancelText }}
        </button>
        <button @click="confirm" 
                :class="['w-full sm:w-auto px-5 py-2.5 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-sm', buttonClass]">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
