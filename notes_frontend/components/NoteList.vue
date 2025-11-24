<template>
  <div>
    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px;">
      <div style="font-weight: 700;">Notes</div>
      <div class="meta">{{ notes.length }} total</div>
    </div>
    <hr class="separator" />
    <div role="list" aria-label="Notes">
      <NoteItem
        v-for="n in notes"
        :key="n.id"
        :note="n"
        :active="n.id === selectedId"
        @select="$emit('select', n.id)"
        @delete="$emit('delete', n.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NoteItem from './NoteItem.vue'
import type { Note } from '~/composables/useNotesApi'

defineProps<{
  notes: Note[]
  selectedId: string | null
}>()

defineEmits<{
  (e: 'select', id: string): void
  (e: 'delete', id: string): void
}>()
</script>
