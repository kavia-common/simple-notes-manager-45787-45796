<template>
  <div id="app">
    <NuxtRouteAnnouncer />
    <div class="header">
      <AppHeader
        :hasSelected="!!notesStore.selectedNoteId"
        @new="onNewNote"
        @search="notesStore.setQuery"
        :query="notesStore.query"
      />
    </div>

    <div class="container" style="padding-top: 16px; padding-bottom: 20px;">
      <div class="layout" :style="layoutStyle">
        <aside class="sidebar card" :style="sidebarStyle" v-show="sidebarOpen">
          <NoteList
            :notes="notesStore.filteredByQuery"
            :selectedId="notesStore.selectedNoteId"
            @select="notesStore.selectNote"
            @delete="onDeleteNote"
          />
        </aside>

        <main class="card" :style="mainStyle">
          <transition name="fade" mode="out-in">
            <NoteEditor
              v-if="notesStore.selectedNote"
              :key="notesStore.selectedNoteId"
              :note="notesStore.selectedNote"
              @update="onUpdateNote"
              @save="onSaveNote"
            />
            <EmptyState
              v-else
              @create="onNewNote"
            />
          </transition>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// PUBLIC_INTERFACE
/** Root app shell for the Notes manager UI. Provides header, sidebar, and main editor regions. */
import AppHeader from '~/components/AppHeader.vue'
import NoteList from '~/components/NoteList.vue'
import NoteEditor from '~/components/NoteEditor.vue'
import EmptyState from '~/components/EmptyState.vue'
import { useNotes } from '~/composables/useNotes'

const notesStore = useNotes()

// Sidebar responsive toggle
const sidebarOpen = ref(true)
const toggleForWidth = () => {
  if (process.client) {
    sidebarOpen.value = window.innerWidth >= 900
  }
}
onMounted(() => {
  toggleForWidth()
  window.addEventListener('resize', toggleForWidth)
})
onBeforeUnmount(() => window.removeEventListener('resize', toggleForWidth))

const onNewNote = () => {
  const id = notesStore.createNote()
  notesStore.selectNote(id)
}
const onDeleteNote = async (id: string) => {
  const ok = confirm('Delete this note? This cannot be undone.')
  if (!ok) return
  notesStore.deleteNote(id)
}
const onUpdateNote = (payload: { id: string; title?: string; content?: string }) => {
  notesStore.updateNote(payload.id, { title: payload.title, content: payload.content })
}
const onSaveNote = () => {
  // Explicit save triggers a sync; store already auto-saves with debounce.
  notesStore.flushPersist()
}

const layoutStyle = computed(() => ({
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: sidebarOpen.value ? '320px 1fr' : '1fr',
  alignItems: 'stretch',
  minHeight: 'calc(100vh - 80px)',
}))
const sidebarStyle = {
  padding: '12px',
  overflow: 'hidden auto',
}
const mainStyle = {
  padding: '16px',
  minHeight: 'calc(100% - 32px)',
}
</script>

<style>
#app {
  min-height: 100%;
}
.layout {
  width: 100%;
}
</style>
