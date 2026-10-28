<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, useId, watch } from "vue";
import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from "lucide-vue-next";
import { editorialApi, errorMessage, mediaUrl } from "../../api/editorialApi";
import { pendingUploadsKey } from "./uploadState";

const props = defineProps<{
  modelValue: string | null;
  label: string;
  readonly?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const input = ref<HTMLInputElement>();
const id = useId();
const uploading = ref(false);
const dragDepth = ref(0);
const error = ref("");
const status = ref("");
const filename = ref("");
const localPreview = ref("");
const previewFailed = ref(false);
const pendingUploads = inject(pendingUploadsKey, undefined);
const preview = computed(
  () =>
    localPreview.value || (props.modelValue ? mediaUrl(props.modelValue) : ""),
);
let controller: AbortController | undefined;
let disposed = false;

watch(preview, () => {
  previewFailed.value = false;
});
onBeforeUnmount(() => {
  disposed = true;
  controller?.abort();
  if (localPreview.value) URL.revokeObjectURL(localPreview.value);
});

async function upload(files: File[]) {
  dragDepth.value = 0;
  if (props.readonly || uploading.value || !files.length) return;
  error.value = "";
  status.value = "";
  if (files.length !== 1) {
    error.value = "Déposez une seule image à la fois.";
    return;
  }
  const file = files[0];
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 5_000_000 ||
    !file.size
  ) {
    error.value = "Choisir une image PNG, JPEG ou WebP de 5 Mo maximum.";
    return;
  }
  uploading.value = true;
  if (pendingUploads) pendingUploads.value++;
  localPreview.value = URL.createObjectURL(file);
  controller = new AbortController();
  try {
    const path = await editorialApi.upload(file, controller.signal);
    if (!disposed) {
      emit("update:modelValue", path);
      filename.value = file.name;
      status.value =
        "Image importée. Enregistrez le formulaire pour conserver cette modification.";
    }
  } catch (e) {
    if (!disposed) error.value = errorMessage(e);
  } finally {
    if (pendingUploads) pendingUploads.value--;
    URL.revokeObjectURL(localPreview.value);
    localPreview.value = "";
    uploading.value = false;
  }
}
function choose(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  target.value = "";
  void upload(files);
}
function enter(event: DragEvent) {
  if (!uploading.value && event.dataTransfer?.types.includes("Files"))
    dragDepth.value++;
}
function over(event: DragEvent) {
  if (event.dataTransfer)
    event.dataTransfer.dropEffect = uploading.value ? "none" : "copy";
}
function drop(event: DragEvent) {
  void upload(Array.from(event.dataTransfer?.files || []));
}
function updateUrl(value: string) {
  emit("update:modelValue", value);
  filename.value = "";
  error.value = "";
  status.value = "";
}
function remove() {
  updateUrl("");
  status.value = "Image retirée du formulaire.";
}
</script>

<template>
  <div class="bo-media-field" :aria-busy="uploading">
    <label :for="`${id}-url`" class="bo-label block mb-2">{{ label }}</label>
    <template v-if="!readonly">
      <input
        :id="`${id}-file`"
        ref="input"
        class="sr-only"
        tabindex="-1"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        :aria-label="`Choisir un fichier : ${label}`"
        :disabled="uploading"
        @change="choose"
      />
      <button
        type="button"
        class="bo-dropzone"
        :class="{
          'is-over': dragDepth > 0,
          'is-uploading': uploading,
          'has-image': preview && !previewFailed,
        }"
        :aria-label="`Importer une image : ${label}`"
        :aria-describedby="`${id}-formats ${error ? `${id}-error` : ''}`"
        :aria-disabled="uploading"
        @click="!uploading && input?.click()"
        @dragenter.prevent.stop="enter"
        @dragover.prevent.stop="over"
        @dragleave.prevent.stop="dragDepth = Math.max(0, dragDepth - 1)"
        @drop.prevent.stop="drop"
      >
        <span v-if="preview && !previewFailed" class="bo-dropzone-preview">
          <img
            :src="preview"
            :alt="`Aperçu : ${label}`"
            @error="previewFailed = true"
          />
        </span>
        <span v-else class="bo-dropzone-icon"
          ><ImagePlus :size="26" aria-hidden="true"
        /></span>
        <span class="bo-dropzone-copy">
          <span class="bo-dropzone-title">
            <LoaderCircle
              v-if="uploading"
              class="bo-upload-spinner"
              :size="18"
              aria-hidden="true"
            />
            <UploadCloud v-else :size="18" aria-hidden="true" />
            {{
              uploading
                ? "Import en cours…"
                : dragDepth
                  ? "Déposez votre image ici"
                  : modelValue
                    ? "Glissez une image pour la remplacer"
                    : "Glissez-déposez votre image ici"
            }}
          </span>
          <span class="bo-dropzone-link">{{
            uploading
              ? "Veuillez patienter avant d’enregistrer."
              : "ou cliquez pour parcourir vos fichiers"
          }}</span>
          <span :id="`${id}-formats`" class="bo-dropzone-formats"
            >PNG, JPEG ou WebP · 5 Mo maximum · une image</span
          >
        </span>
      </button>
      <div v-if="modelValue" class="bo-media-caption">
        <span class="bo-media-filename"
          ><CheckCircle2 :size="14" aria-hidden="true" />{{
            filename || "Image sélectionnée"
          }}</span
        >
        <button
          type="button"
          class="bo-media-remove"
          :aria-label="`Retirer l’image : ${label}`"
          :disabled="uploading"
          @click="remove"
        >
          <Trash2 :size="14" aria-hidden="true" />Retirer
        </button>
      </div>
      <span class="bo-media-url-hint">Ou utilisez une URL d’image</span>
    </template>
    <input
      :id="`${id}-url`"
      class="bo-input"
      type="text"
      :value="modelValue || ''"
      :disabled="readonly || uploading"
      placeholder="https://… ou chemin d’une image déjà importée"
      @input="updateUrl(($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" :id="`${id}-error`" role="alert" class="bo-media-error">
      {{ error }}
    </p>
    <p
      v-if="previewFailed && modelValue && !uploading"
      class="text-xs text-slate-500 mt-2"
    >
      L’aperçu de cette image n’est pas disponible. Vérifiez son adresse.
    </p>
    <p role="status" aria-live="polite" class="bo-media-status">
      {{ uploading ? "Import de l’image en cours…" : status }}
    </p>
    <img
      v-if="readonly && preview && !previewFailed"
      :src="preview"
      :alt="`Aperçu : ${label}`"
      class="max-h-48 object-contain rounded-xl mt-3 border border-slate-100"
      @error="previewFailed = true"
    />
  </div>
</template>
