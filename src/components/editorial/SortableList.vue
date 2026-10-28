<script setup lang="ts" generic="T extends { id?: number; _key?: string }">
import { ref, useId } from "vue";
import { VueDraggable } from "vue-draggable-plus";

const items = defineModel<T[]>({ required: true });
defineProps<{ label: string; readonly?: boolean }>();
const handleId = useId();
const announcement = ref("");

function announce(index?: number) {
  if (index !== undefined)
    announcement.value = `Nouvel ordre : élément en position ${index + 1} sur ${items.value.length}.`;
}
function move(index: number, delta: number) {
  const next = index + delta;
  if (next < 0 || next >= items.value.length) return;
  const reordered = [...items.value];
  const [item] = reordered.splice(index, 1);
  reordered.splice(next, 0, item);
  items.value = reordered;
  announce(next);
}
</script>

<template>
  <div class="bo-sortable">
    <VueDraggable
      v-model="items"
      class="bo-sort-list"
      role="list"
      :aria-label="label"
      :disabled="readonly"
      :handle="`[data-sort-handle='${handleId}']`"
      draggable=".bo-sort-item"
      :group="{ name: handleId, pull: false, put: false }"
      :animation="180"
      :force-fallback="true"
      :fallback-on-body="true"
      :fallback-tolerance="5"
      :scroll-sensitivity="70"
      :scroll-speed="12"
      ghost-class="bo-sort-ghost"
      chosen-class="bo-sort-chosen"
      drag-class="bo-sort-drag"
      @end="announce($event.newIndex)"
    >
      <div
        v-for="(item, index) in items"
        :key="item._key || item.id"
        class="bo-sort-item"
        role="listitem"
      >
        <slot
          :item="item"
          :index="index"
          :handle-id="handleId"
          :move="(delta: number) => move(index, delta)"
        />
      </div>
    </VueDraggable>
    <p class="sr-only" role="status" aria-live="polite">{{ announcement }}</p>
  </div>
</template>
