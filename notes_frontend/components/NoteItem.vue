<template>
  <div
    class="note-list-item"
    :class="{ active }"
    role="listitem"
    tabindex="0"
    @click="emitSelect"
    @keydown.enter="emitSelect"
    @keydown.delete.stop.prevent="confirmDelete"
    @keydown.backspace.stop.prevent="confirmDelete"
    :aria-selected="active ? 'true' : 'false'"
    style="display:flex; align-items:center; gap:10px; margin: 6px 0;"
  >
    <div style="flex:1 1 auto; min-width:0;">
      <div style="display:flex; align-items:center; gap:8px;">
        <div style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          {{ (note && note.title) ? note.title : 'Untitled' }}
        </div>
        <div class="meta">• {{ shortDate(note?.updatedAt) }}</div>
      </div>
      <div class="meta" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        {{ (note && note.content) ? note.content : 'No content' }}
      </div>
    </div>
    <button class="btn danger" title="Delete note" @click.stop="confirmDelete" aria-label="Delete note">
      Delete
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '~/composables/useNotesApi'

/**
 * A single note list item. Defensively handles absent fields.
 */
const props = defineProps<{
  note: Partial<Note> | null | undefined
  active?: boolean
}>()
const emit = defineEmits<{
  (e: 'select'): void
  (e: 'delete'): void
}>()

function shortDate(iso?: string) {
  if (!iso) return '—'
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return '—'
  return new Date(t).toLocaleString()
}
function confirmDelete() {
  const ok = confirm('Delete this note?')
  if (ok) emit('delete')
}
function emitSelect() {
  emit('select')
}
</script>
