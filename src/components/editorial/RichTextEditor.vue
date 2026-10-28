<script setup lang="ts">
import { watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
const props = defineProps<{
  modelValue: string;
  label: string;
  readonly?: boolean;
}>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();
const editor = useEditor({
  extensions: [StarterKit],
  content: props.modelValue || "",
  editable: !props.readonly,
  editorProps: {
    attributes: {
      role: "textbox",
      "aria-label": props.label,
      "aria-multiline": "true",
      class: "rich-content",
    },
  },
  onUpdate: ({ editor }) => emit("update:modelValue", editor.getHTML()),
});
watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value)
      editor.value.commands.setContent(value || "", { emitUpdate: false });
  },
);
watch(
  () => props.readonly,
  (value) => editor.value?.setEditable(!value),
);
watch(
  () => props.label,
  (label) =>
    editor.value?.setOptions({
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-label": label,
          "aria-multiline": "true",
          class: "rich-content",
        },
      },
    }),
);
const tools = [
  {
    name: "Gras",
    action: () => editor.value?.chain().focus().toggleBold().run(),
  },
  {
    name: "Italique",
    action: () => editor.value?.chain().focus().toggleItalic().run(),
  },
  {
    name: "Titre",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    name: "Sous-titre",
    action: () =>
      editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    name: "Liste",
    action: () => editor.value?.chain().focus().toggleBulletList().run(),
  },
  {
    name: "Numérotation",
    action: () => editor.value?.chain().focus().toggleOrderedList().run(),
  },
  { name: "Annuler", action: () => editor.value?.chain().focus().undo().run() },
  {
    name: "Rétablir",
    action: () => editor.value?.chain().focus().redo().run(),
  },
];
</script>
<template>
  <div class="bo-rich-editor">
    <div
      v-if="!readonly"
      role="toolbar"
      :aria-label="`Mise en forme : ${label}`"
      class="bo-rich-toolbar"
    >
      <button
        v-for="tool in tools"
        :key="tool.name"
        type="button"
        @click="tool.action"
      >
        {{ tool.name }}
      </button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
