<script setup lang="ts">
import { GripVertical } from "lucide-vue-next";
defineProps<{ handleId: string; label: string }>();
const emit = defineEmits<{ move: [delta: number] }>();
</script>

<template>
  <button
    type="button"
    class="bo-drag-handle"
    :data-sort-handle="handleId"
    :aria-label="label"
    title="Glisser pour déplacer · Au clavier : flèches haut et bas"
    @keydown.up.prevent.stop="emit('move', -1)"
    @keydown.down.prevent.stop="emit('move', 1)"
  >
    <GripVertical :size="18" aria-hidden="true" />
  </button>
</template>
