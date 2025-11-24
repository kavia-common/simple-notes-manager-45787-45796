<template>
  <header class="header">
    <div class="container" style="display:flex; gap:12px; align-items:center; padding: 12px 0;">
      <div style="display:flex; align-items:center; gap:10px; flex: 1 1 auto;">
        <div style="width:36px; height:36px; border-radius:10px; background: linear-gradient(135deg, rgba(37,99,235,.9), rgba(37,99,235,.6)); box-shadow: var(--shadow-md); display:flex; align-items:center; justify-content:center; color:white; font-weight:700;">
          N
        </div>
        <div>
          <div style="font-weight:700; letter-spacing:.2px;">Ocean Notes</div>
          <div class="meta">A modern notes manager</div>
        </div>
      </div>

      <div style="display:flex; gap:10px; align-items:center; flex: 2 2 600px;">
        <input
          class="input"
          :value="query"
          @input="onSearch"
          placeholder="Search notes..."
          aria-label="Search notes"
        />
        <button class="btn primary" @click="$emit('new')" aria-label="Create new note">
          + New Note
        </button>
      </div>

      <div class="hidden-sm" style="display:flex; gap:8px; align-items:center;">
        <span class="kbd">Ctrl/Cmd + S</span>
        <span class="meta">Save</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  hasSelected: boolean
  query: string
}>()
const emit = defineEmits<{
  (e: 'new'): void
  (e: 'search', value: string): void
}>()

function onSearch(e: Event) {
  const t = e.target as HTMLInputElement
  emit('search', t.value)
}

// Keyboard: Ctrl/Cmd+S saves
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      // Signal save via a custom event on window; NoteEditor listens and emits save
      window.dispatchEvent(new CustomEvent('ocean-notes-save'))
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>
