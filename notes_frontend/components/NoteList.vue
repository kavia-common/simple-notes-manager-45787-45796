<template>
  <div>
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
      <div style="font-weight: 700;">Notes</div>
      <div class="meta">{{ safeCount }} total</div>
    </div>
    <hr class="separator" />
    <div role="list" aria-label="Notes">
      <!-- Guard against undefined/null items and missing id -->
      <NoteItem
        v-for="(n, index) in safeNotes"
        :key="n.id || n.tempId || index"
        :note="n"
        :active="(n.id || null) === selectedId"
        @select="onSelect(n, index)"
        @delete="onDelete(n, index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NoteItem from './NoteItem.vue'
import type { Note } from '~/composables/useNotesApi'

/**
 * PUBLIC_INTERFACE
 * NoteList renders a list of notes with defensive guards to tolerate malformed entries.
 * - Filters out null/undefined items.
 * - Falls back to a stable key if id is missing.
 * - Emits select/delete with the note id only if present.
 */
const props = defineProps<{
  notes: Note[]
  selectedId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
}>()

// Filter out any undefined/null notes and ensure required shape for rendering text safely
const safeNotes = computed<Note[]>(() => {
  const arr = Array.isArray(props.notes) ? props.notes : []
  // Only include objects with minimal expected shape; tolerate notes missing id for display
  return arr.filter((n) => !!n && typeof n === 'object' && ('title' in n || 'content' in n || 'id' in n))
})

const safeCount = computed(() => safeNotes.value.length)

function onSelect(n: Partial<Note> & { id?: string }, index: number) {
  if (n && typeof n.id === 'string') {
    emit('select', n.id)
  }
}
function onDelete(n: Partial<Note> & { id?: string }, index: number) {
  if (n && typeof n.id === 'string') {
    emit('delete', n.id)
  }
}
</script>
