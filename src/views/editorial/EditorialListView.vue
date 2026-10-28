<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  editorialApi,
  errorMessage,
  resources,
  type Resource,
} from "../../api/editorialApi";
const route = useRoute();
const resource = computed(() => route.meta.resource as Resource);
const config = computed(() => resources[resource.value]);
const items = ref<any[]>([]),
  search = ref(""),
  loading = ref(false),
  error = ref("");
async function load() {
  loading.value = true;
  error.value = "";
  try {
    items.value = await editorialApi.list(resource.value);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}
const filtered = computed(() =>
  items.value.filter((item) =>
    (item.name || item.title || item.label || "")
      .toLocaleLowerCase("fr")
      .includes(search.value.toLocaleLowerCase("fr")),
  ),
);
async function remove(item: any) {
  if (
    !window.confirm(`Supprimer « ${item.name || item.title || item.label} » ?`)
  )
    return;
  try {
    await editorialApi.remove(resource.value, item.id);
    await load();
  } catch (e) {
    error.value = errorMessage(e);
  }
}
onMounted(load);
watch(resource, () => {
  search.value = "";
  load();
});
</script>
<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <div>
        <p
          class="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2"
        >
          Gestion des contenus
        </p>
        <h1 class="text-3xl font-bold text-slate-900">{{ config.label }}</h1>
      </div>
      <RouterLink class="bo-button" :to="`/content/${resource}/create`"
        >+ Créer</RouterLink
      >
    </div>
    <p v-if="error" role="alert" class="bo-error">{{ error }}</p>
    <div class="bo-panel">
      <label class="bo-label"
        >Rechercher<input
          class="bo-input mt-2 mb-6"
          v-model="search"
          :placeholder="`Rechercher : ${config.label.toLowerCase()}`"
      /></label>
      <p v-if="loading" role="status" class="text-slate-500 py-10 text-center">
        Chargement…
      </p>
      <div v-else class="overflow-x-auto">
        <table class="bo-table">
          <thead>
            <tr>
              <th>Nom / titre</th>
              <th>Rattachement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.id">
              <td class="font-semibold">
                {{ item.name || item.title || item.label
                }}<small
                  v-if="item.category"
                  class="block mt-1 text-slate-400 font-normal"
                  >{{
                    item.category === "NORMAL" ? "Normal" : "Pathologique"
                  }}</small
                >
              </td>
              <td>
                {{
                  item.specialty?.name ||
                  item.modality?.name ||
                  item.exam?.name ||
                  "—"
                }}<small
                  v-if="resource === 'specialties'"
                  class="text-slate-400"
                  >{{ item.classificationCount }} classification(s) ·
                  {{ item.courseCount }} cours</small
                >
              </td>
              <td>
                <div class="flex gap-3 text-sm">
                  <RouterLink
                    class="text-slate-500"
                    :to="`/content/${resource}/${item.id}`"
                    >Consulter</RouterLink
                  ><RouterLink
                    class="text-sky-700"
                    :to="`/content/${resource}/${item.id}/edit`"
                    >Modifier</RouterLink
                  ><button class="text-red-600" @click="remove(item)">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-if="!filtered.length" class="text-slate-500 text-center py-12">
          Aucun contenu pour cette sélection.
        </p>
      </div>
    </div>
  </div>
</template>
