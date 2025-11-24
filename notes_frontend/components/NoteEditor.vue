<template>
  <div>
    <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px;">
      <div class="meta">Created: {{ toLocal(note.createdAt) }}</div>
      <div class="meta">Updated: {{ toLocal(local.updatedAt) }}</div>
    </div>
    <hr class="separator" />

    <input
      class="input"
      v-model="local.title"
      placeholder="Title"
      @keydown.enter.prevent="focusContent"
      aria-label="Note title"
    />
    <div style="height: 10px;"></div>
    <textarea
      ref="contentRef"
      class="textarea"
      v-model="local.content"
      placeholder="Start writing..."
      aria-label="Note content"
    ></textarea>

    <div style="display:flex; align-items:center; justify-content:space-between; margin-top: 12px;">
      <div class="meta">Autosaves with debounce</div>
      <div style="display:flex; gap:8px;">
        <button class="btn" @click="resetLocal">Reset</button>
        <button class="btn primary" @click="saveNow">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from '~/utils/debounce'
import type { Note } from '~/composables/useNotesApi'

const props = defineProps<{
  note: Note
}>()
const emit = defineEmits<{
  (e: 'update', payload: { id: string; title?: string; content?: string }): void
  (e: 'save'): void
}>()

const local = reactive({
  id: props.note.id,
  title: props.note.title,
  content: props.note.content,
  updatedAt: props.note.updatedAt,
})

watch(() => props.note, (n) => {
  local.id = n.id
  local.title = n.title
  local.content = n.content
  local.updatedAt = n.updatedAt
}, { deep: true })

const autosave = debounce(() => {
  emit('update', { id: local.id, title: local.title, content: local.content })
}, 400)

watch(() => [local.title, local.content], () => {
  local.updatedAt = new Date().toISOString()
  autosave()
})

function saveNow() {
  autosave.flush()
  emit('save')
}
function resetLocal() {
  local.title = props.note.title
  local.content = props.note.content
}

const contentRef = ref<HTMLTextAreaElement | null>(null)
function focusContent() {
  contentRef.value?.focus()
}

function toLocal(iso: string) {
  return new Date(iso).toLocaleString()
}

// Listen for global save shortcut
onMounted(() => {
  const handler = () => saveNow()
  window.addEventListener('ocean-notes-save', handler as EventListener)
  onBeforeUnmount(() => window.removeEventListener('ocean-notes-save', handler as EventListener))
})
</script>
