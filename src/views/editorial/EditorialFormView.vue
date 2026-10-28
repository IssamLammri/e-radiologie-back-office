<script setup lang="ts">
import { computed, onMounted, provide, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  editorialApi,
  errorMessage,
  resources,
  answerFields,
  type Resource,
  type CourseSectionForm,
  type EvaluationRuleForm,
} from "../../api/editorialApi";
import { modalitiesApi } from "../../api/modalitiesApi";
import RichTextEditor from "../../components/editorial/RichTextEditor.vue";
import MediaField from "../../components/editorial/MediaField.vue";
import CourseSectionEditor from "../../components/editorial/CourseSectionEditor.vue";
import SortableList from "../../components/editorial/SortableList.vue";
import DragHandle from "../../components/editorial/DragHandle.vue";
import { pendingUploadsKey } from "../../components/editorial/uploadState";
const pendingUploads = ref(0);
provide(pendingUploadsKey, pendingUploads);
const route = useRoute(),
  router = useRouter();
const resource = route.meta.resource as Resource;
const config = resources[resource];
const id = route.params.id ? Number(route.params.id) : null;
const readonly = computed(() => route.meta.readOnly === true);
const form = ref<{
  rules: EvaluationRuleForm[];
  sections: CourseSectionForm[];
  [key: string]: any;
}>({
  name: "",
  position: 0,
  type: "",
  description: "",
  indications: "",
  specialtyId: null,
  rules: [],
  title: "",
  imagePath: "",
  authorName: "",
  institution: "",
  sections: [],
  maskedName: "",
  clinicalPresentation: "",
  identification: "",
  analyticStudy: "",
  syntheticStudy: "",
  differentialDiagnosis: "",
  management: "",
  modalityId: null,
  examId: null,
  category: "NORMAL",
  label: "",
  contentHtml: "",
  conclusionHtml: "",
});
const specialties = ref<any[]>([]),
  modalities = ref<any[]>([]),
  exams = ref<any[]>([]);
const loading = ref(true),
  saving = ref(false),
  error = ref("");
const isSpecialtyLinked =
  resource === "classifications" || resource === "courses";
const newKey = () => crypto.randomUUID();
onMounted(async () => {
  try {
    if (isSpecialtyLinked)
      specialties.value = await editorialApi.list("specialties");
    if (resource === "report-exams")
      modalities.value = await modalitiesApi.getAdminAll();
    if (resource === "report-templates")
      exams.value = await editorialApi.list("report-exams");
    if (id) {
      const result = await editorialApi.get(resource, id);
      form.value = { ...form.value, ...result, ...result.answers };
    }
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
});
function payload() {
  const keys: Record<Resource, string[]> = {
    specialties: ["name", "position"],
    classifications: [
      "name",
      "type",
      "description",
      "indications",
      "specialtyId",
      "rules",
    ],
    courses: [
      "title",
      "imagePath",
      "authorName",
      "institution",
      "specialtyId",
      "sections",
    ],
    "dems-exercises": [
      "name",
      "maskedName",
      "imagePath",
      "clinicalPresentation",
      ...answerFields.map(([key]) => key),
    ],
    "report-exams": ["name", "modalityId"],
    "report-templates": [
      "examId",
      "category",
      "label",
      "contentHtml",
      "conclusionHtml",
    ],
  };
  return Object.fromEntries(
    keys[resource].map((key) => [key, form.value[key]]),
  );
}
async function submit() {
  if (readonly.value || saving.value || pendingUploads.value > 0) return;
  saving.value = true;
  error.value = "";
  try {
    if (id) await editorialApi.update(resource, id, payload());
    else await editorialApi.create(resource, payload());
    router.push(`/content/${resource}`);
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    saving.value = false;
  }
}
</script>
<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <RouterLink :to="`/content/${resource}`" class="text-sm text-sky-700"
      >← Retour à la liste</RouterLink
    >
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-slate-900">
        {{ readonly ? "Consulter" : id ? "Modifier" : "Créer" }} ·
        {{ config.singular }}
      </h1>
      <RouterLink
        v-if="readonly"
        class="bo-button"
        :to="`/content/${resource}/${id}/edit`"
        >Modifier</RouterLink
      >
    </div>
    <p v-if="loading" class="bo-panel text-slate-500">Chargement…</p>
    <p v-if="error" role="alert" class="bo-error whitespace-pre-wrap">
      {{ error }}
    </p>
    <form v-if="!loading" @submit.prevent="submit" class="space-y-6">
      <div class="bo-panel space-y-5">
        <label
          v-if="resource !== 'courses' && resource !== 'report-templates'"
          class="bo-label block"
          >Nom<input
            v-model="form.name"
            class="bo-input mt-2"
            required
            maxlength="255"
            :disabled="readonly" /></label
        ><label v-if="resource === 'specialties'" class="bo-label block"
          >Ordre d’affichage<input
            v-model.number="form.position"
            type="number"
            min="0"
            class="bo-input mt-2"
            required
            :disabled="readonly" /></label
        ><label v-if="isSpecialtyLinked" class="bo-label block"
          >Spécialité<select
            aria-label="Spécialité"
            v-model="form.specialtyId"
            class="bo-input mt-2"
            required
            :disabled="readonly"
          >
            <option :value="null" disabled>Choisir une spécialité</option>
            <option v-for="s in specialties" :value="s.id" :key="s.id">
              {{ s.name }}
            </option>
          </select>
          <p v-if="!specialties.length" class="mt-2 text-amber-700 text-sm">
            Créez d’abord une spécialité.
          </p></label
        >
        <template v-if="resource === 'classifications'"
          ><label class="bo-label block"
            >Type de classification (tag)<input
              v-model="form.type"
              class="bo-input mt-2"
              required
              maxlength="120"
              :disabled="readonly" /></label
          ><label class="bo-label block"
            >Description<textarea
              v-model="form.description"
              class="bo-input mt-2 min-h-24"
              required
              :disabled="readonly"
            /></label
          ><label class="bo-label block"
            >Indications générales<textarea
              v-model="form.indications"
              class="bo-input mt-2 min-h-24"
              required
              :disabled="readonly"
            /></label
        ></template>
        <template v-if="resource === 'courses'"
          ><label class="bo-label block"
            >Nom du cours<input
              v-model="form.title"
              class="bo-input mt-2"
              required
              maxlength="255"
              :disabled="readonly" /></label
          ><MediaField
            v-model="form.imagePath"
            label="Image de présentation"
            :readonly="readonly" />
          <div class="grid md:grid-cols-2 gap-5">
            <label class="bo-label block"
              >Rédacteur / créateur<input
                v-model="form.authorName"
                class="bo-input mt-2"
                required
                maxlength="255"
                :disabled="readonly" /></label
            ><label class="bo-label block"
              >Hôpital / établissement / lieu d’exercice<input
                v-model="form.institution"
                class="bo-input mt-2"
                required
                maxlength="255"
                :disabled="readonly"
            /></label></div
        ></template>
        <template v-if="resource === 'dems-exercises'"
          ><label class="bo-label block"
            >Nom de masquage (titre alternatif)<input
              v-model="form.maskedName"
              class="bo-input mt-2"
              required
              maxlength="255"
              :disabled="readonly" /></label
          ><MediaField
            v-model="form.imagePath"
            label="Image du dossier"
            :readonly="readonly" /><label class="bo-label block"
            >Présentation clinique d’admission (énoncé)<textarea
              v-model="form.clinicalPresentation"
              class="bo-input mt-2 min-h-32"
              required
              :disabled="readonly"
            /></label
          ><label
            v-for="[key, label] in answerFields"
            :key="key"
            class="bo-label block"
            >{{ label }} · Réponse de référence<textarea
              v-model="form[key]"
              class="bo-input mt-2 min-h-32"
              required
              :disabled="readonly"
            /></label
        ></template>
        <label v-if="resource === 'report-exams'" class="bo-label block"
          >Modalité<select
            aria-label="Modalité"
            v-model="form.modalityId"
            class="bo-input mt-2"
            required
            :disabled="readonly"
          >
            <option :value="null" disabled>Choisir une modalité</option>
            <option v-for="m in modalities" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select></label
        >
        <template v-if="resource === 'report-templates'"
          ><label class="bo-label block"
            >Examen<select
              aria-label="Examen"
              v-model="form.examId"
              class="bo-input mt-2"
              required
              :disabled="readonly"
            >
              <option :value="null" disabled>Choisir un examen</option>
              <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                {{ exam.name }} · {{ exam.modality.name }}
              </option>
            </select></label
          >
          <div class="grid md:grid-cols-2 gap-5">
            <label class="bo-label block"
              >Catégorie<select
                aria-label="Catégorie"
                v-model="form.category"
                class="bo-input mt-2"
                :disabled="readonly"
              >
                <option value="NORMAL">Normal</option>
                <option value="PATHOLOGICAL">Pathologique</option>
              </select></label
            ><label class="bo-label block"
              >Libellé du résultat / diagnostic<input
                v-model="form.label"
                class="bo-input mt-2"
                required
                maxlength="255"
                :disabled="readonly"
            /></label>
          </div>
          <div>
            <label class="bo-label block mb-2">Contenu du modèle</label
            ><RichTextEditor
              v-model="form.contentHtml"
              label="Contenu du modèle"
              :readonly="readonly"
            />
          </div>
          <div>
            <label class="bo-label block mb-2">Conclusion diagnostique</label
            ><RichTextEditor
              v-model="form.conclusionHtml"
              label="Conclusion du modèle"
              :readonly="readonly"
            />
          </div>
          <p class="text-xs text-slate-500">
            Cette interface gère les modèles éditoriaux. Les comptes rendus
            privés des médecins n’y sont pas accessibles.
          </p></template
        >
      </div>
      <section v-if="resource === 'classifications'" class="bo-panel space-y-4">
        <h2 class="text-lg font-bold">
          Règles d’évaluation · Ordre d’affichage
        </h2>
        <p class="text-sm text-slate-500">
          Glissez les règles à l’aide de la poignée pour définir leur ordre
          d’affichage. Vous pouvez aussi utiliser les flèches ou le clavier.
        </p>
        <SortableList
          v-model="form.rules"
          label="Règles d’évaluation"
          :readonly="readonly"
        >
          <template #default="{ item: rule, index: i, handleId, move }">
            <div class="bo-block">
              <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2">
                  <DragHandle
                    v-if="!readonly"
                    :handle-id="handleId"
                    :label="`Déplacer la règle ${i + 1}`"
                    @move="move"
                  />
                  <h3 class="font-semibold text-sm">Règle {{ i + 1 }}</h3>
                </div>
                <div v-if="!readonly" class="flex gap-1">
                  <button
                    type="button"
                    class="bo-tool"
                    aria-label="Monter la règle"
                    :disabled="i === 0"
                    @click="move(-1)"
                  >
                    ↑</button
                  ><button
                    type="button"
                    class="bo-tool"
                    aria-label="Descendre la règle"
                    :disabled="i === form.rules.length - 1"
                    @click="move(1)"
                  >
                    ↓</button
                  ><button
                    type="button"
                    class="bo-tool text-red-600"
                    aria-label="Supprimer la règle"
                    @click="form.rules.splice(i, 1)"
                  >
                    ×
                  </button>
                </div>
              </div>
              <label class="bo-label block"
                >Grade / score<input
                  class="bo-input mt-2 mb-3"
                  v-model="rule.grade"
                  required
                  maxlength="255"
                  :disabled="readonly" /></label
              ><label class="bo-label block"
                >Sémiologie<textarea
                  class="bo-input mt-2 mb-3"
                  v-model="rule.semiology"
                  required
                  :disabled="readonly"
                /></label
              ><label class="bo-label block"
                >Description clinique<textarea
                  class="bo-input mt-2"
                  v-model="rule.clinicalDescription"
                  required
                  :disabled="readonly"
                />
              </label>
            </div>
          </template>
        </SortableList>
        <button
          v-if="!readonly"
          type="button"
          class="bo-button secondary"
          @click="
            form.rules.push({
              grade: '',
              semiology: '',
              clinicalDescription: '',
              _key: newKey(),
            })
          "
        >
          + Ajouter une règle
        </button>
      </section>
      <section v-if="resource === 'courses'" class="bo-panel space-y-5">
        <h2 class="text-lg font-bold">Arborescence du cours</h2>
        <p class="text-sm text-slate-500">
          Ajoutez les titres, sous-titres et blocs. Glissez leurs poignées pour
          réordonner les éléments d’un même niveau. Les flèches restent
          disponibles.
        </p>
        <SortableList
          v-model="form.sections"
          label="Sections du cours"
          :readonly="readonly"
        >
          <template #default="{ item: section, index: i, handleId, move }">
            <CourseSectionEditor
              :section="section"
              :readonly="readonly"
              :handle-id="handleId"
              :index="i"
              :sibling-count="form.sections.length"
              @remove="form.sections.splice(i, 1)"
              @up="move(-1)"
              @down="move(1)"
            />
          </template>
        </SortableList>
        <button
          v-if="!readonly"
          type="button"
          class="bo-button secondary"
          @click="
            form.sections.push({
              title: '',
              blocks: [],
              children: [],
              _key: newKey(),
            })
          "
        >
          + Ajouter une section
        </button>
      </section>
      <div v-if="!readonly" class="flex justify-end gap-3">
        <RouterLink class="bo-button secondary" :to="`/content/${resource}`"
          >Annuler</RouterLink
        ><button
          class="bo-button"
          type="submit"
          :disabled="saving || pendingUploads > 0"
        >
          {{
            pendingUploads > 0
              ? "Import d’image en cours…"
              : saving
                ? "Enregistrement…"
                : "Enregistrer"
          }}
        </button>
      </div>
    </form>
  </div>
</template>
