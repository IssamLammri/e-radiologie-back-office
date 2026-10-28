<script setup lang="ts">
import RichTextEditor from "./RichTextEditor.vue";
import MediaField from "./MediaField.vue";
import SortableList from "./SortableList.vue";
import DragHandle from "./DragHandle.vue";
import { layouts, type CourseSectionForm } from "../../api/editorialApi";
defineOptions({ name: "CourseSectionEditor" });
const props = defineProps<{
  section: CourseSectionForm;
  readonly?: boolean;
  depth?: number;
  handleId?: string;
  index?: number;
  siblingCount?: number;
}>();
const emit = defineEmits<{ remove: []; up: []; down: [] }>();
const newKey = () => crypto.randomUUID();
const addChild = () =>
  props.section.children.push({
    title: "",
    blocks: [],
    children: [],
    _key: newKey(),
  });
</script>
<template>
  <section class="bo-section">
    <div class="bo-section-heading">
      <DragHandle
        v-if="!readonly && handleId"
        :handle-id="handleId"
        :label="`Déplacer ${depth ? 'le sous-titre' : 'la section'} ${(index || 0) + 1}`"
        @move="(delta) => (delta < 0 ? emit('up') : emit('down'))"
      />
      <label class="bo-label flex-1"
        >{{ depth ? "Sous-titre" : "Titre de section"
        }}<input
          class="bo-input mt-2"
          v-model="section.title"
          required
          maxlength="255"
          :disabled="readonly"
      /></label>
      <div v-if="!readonly" class="flex gap-1 self-end pb-1">
        <button
          class="bo-tool"
          type="button"
          aria-label="Monter la section"
          :disabled="index === 0"
          @click="emit('up')"
        >
          ↑</button
        ><button
          class="bo-tool"
          type="button"
          aria-label="Descendre la section"
          :disabled="index === (siblingCount || 0) - 1"
          @click="emit('down')"
        >
          ↓</button
        ><button
          class="bo-tool text-red-600"
          type="button"
          aria-label="Supprimer la section"
          @click="emit('remove')"
        >
          ×
        </button>
      </div>
    </div>
    <SortableList
      v-model="section.blocks"
      label="Blocs de contenu"
      :readonly="readonly"
    >
      <template
        #default="{ item: block, index: i, handleId: blockHandleId, move }"
      >
        <div class="bo-block">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
              <DragHandle
                v-if="!readonly"
                :handle-id="blockHandleId"
                :label="`Déplacer le bloc ${i + 1}`"
                @move="move"
              />
              <h4 class="font-semibold text-sm">Bloc {{ i + 1 }}</h4>
            </div>
            <div v-if="!readonly" class="flex gap-1">
              <button
                type="button"
                class="bo-tool"
                :disabled="i === 0"
                aria-label="Monter le bloc"
                @click="move(-1)"
              >
                ↑</button
              ><button
                type="button"
                class="bo-tool"
                :disabled="i === section.blocks.length - 1"
                aria-label="Descendre le bloc"
                @click="move(1)"
              >
                ↓</button
              ><button
                type="button"
                class="bo-tool text-red-600"
                aria-label="Supprimer le bloc"
                @click="section.blocks.splice(i, 1)"
              >
                ×
              </button>
            </div>
          </div>
          <label class="bo-label block mb-2"
            >Texte riche (facultatif si une image est fournie)</label
          ><RichTextEditor
            v-model="block.contentHtml"
            :readonly="readonly"
            :label="`Texte du bloc ${i + 1}`"
          />
          <div class="mt-4">
            <MediaField
              v-model="block.imagePath"
              label="Image du bloc (facultative si un texte est fourni)"
              :readonly="readonly"
            />
          </div>
          <label class="bo-label block mt-4"
            >Disposition texte / image<select
              aria-label="Disposition texte / image"
              class="bo-input mt-2"
              v-model="block.layout"
              :disabled="readonly"
            >
              <option v-for="[key, label] in layouts" :key="key" :value="key">
                {{ label }}
              </option>
            </select></label
          >
        </div>
      </template>
    </SortableList>
    <button
      v-if="!readonly"
      type="button"
      class="bo-button secondary mb-5"
      @click="
        section.blocks.push({
          contentHtml: '',
          imagePath: null,
          layout: 'IMAGE_LEFT',
          _key: newKey(),
        })
      "
    >
      + Ajouter un bloc
    </button>
    <SortableList
      v-model="section.children"
      label="Sous-titres du cours"
      :readonly="readonly"
    >
      <template
        #default="{ item: child, index: i, handleId: childHandleId, move }"
      >
        <CourseSectionEditor
          :section="child"
          :readonly="readonly"
          :depth="(depth || 0) + 1"
          :handle-id="childHandleId"
          :index="i"
          :sibling-count="section.children.length"
          @remove="section.children.splice(i, 1)"
          @up="move(-1)"
          @down="move(1)"
        />
      </template>
    </SortableList>
    <button
      v-if="!readonly && (depth || 0) < 10"
      type="button"
      class="bo-button secondary mt-3"
      @click="addChild"
    >
      + Ajouter un sous-titre
    </button>
  </section>
</template>
