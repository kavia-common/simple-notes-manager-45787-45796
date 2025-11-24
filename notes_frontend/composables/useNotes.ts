import { debounce } from '~/utils/debounce'
import type { Note } from './useNotesApi'

const STORAGE_KEY = 'notes.v1'
const STORAGE_SELECTED_KEY = 'notes.selected.v1'
const SEED_NOTE: Note = {
  id: 'example',
  title: 'Welcome to Ocean Notes',
  content:
    'This is your first note.\n\n- Create, edit, and delete notes\n- Search in the sidebar\n- Autosave with debounce\n\nTip: Press Ctrl/Cmd+S to save explicitly.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export interface NotesState {
  notes: Note[]
  selectedNoteId: string | null
  query: string
}

let singleton: ReturnType<typeof createNotes> | null = null

// PUBLIC_INTERFACE
export function useNotes() {
  /** Global reactive notes store with persistence and UI helpers. */
  if (!singleton) {
    singleton = createNotes()
  }
  return singleton
}

function createNotes() {
  const state = reactive<NotesState>({
    notes: [],
    selectedNoteId: null,
    query: '',
  })

  const selectedNote = computed(() =>
    state.notes.find(n => n && n.id === state.selectedNoteId) || null
  )

  const sortedByUpdatedDesc = computed(() =>
    [...state.notes]
      .filter((n) => !!n && typeof n.updatedAt === 'string')
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  )

  const filteredByQuery = computed(() => {
    const q = state.query.trim().toLowerCase()
    if (!q) return sortedByUpdatedDesc.value
    return sortedByUpdatedDesc.value.filter(n => {
      const title = typeof n.title === 'string' ? n.title.toLowerCase() : ''
      const content = typeof n.content === 'string' ? n.content.toLowerCase() : ''
      return title.includes(q) || content.includes(q)
    })
  })

  function safeRead<T>(key: string, fallback: T): T {
    if (!process.client) return fallback
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  function safeWrite<T>(key: string, value: T) {
    if (!process.client) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota or other errors
    }
  }

  function load() {
    const saved = safeRead<{ notes: Note[] }>(STORAGE_KEY, { notes: [] })
    const incoming = Array.isArray(saved.notes) ? saved.notes : []
    // Sanitize: drop null/undefined and ensure minimal fields exist
    state.notes = incoming.filter((n: any) => n && typeof n === 'object' && typeof n.updatedAt === 'string')
    if (state.notes.length === 0) {
      state.notes = [seed()]
    }
    const sel = safeRead<string | null>(STORAGE_SELECTED_KEY, null)
    if (sel && state.notes.some(n => n.id === sel)) {
      state.selectedNoteId = sel
    } else {
      state.selectedNoteId = state.notes[0]?.id || null
    }
  }

  function seed(): Note {
    return { ...SEED_NOTE, id: cryptoRandomId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  }

  function cryptoRandomId(): string {
    if (process.client && 'randomUUID' in crypto) {
      // @ts-expect-error
      return crypto.randomUUID()
    }
    return Math.random().toString(36).slice(2, 10)
  }

  const persistNow = () => {
    safeWrite(STORAGE_KEY, { notes: state.notes })
    safeWrite(STORAGE_SELECTED_KEY, state.selectedNoteId)
  }
  const persist = debounce(persistNow, 400)

  function createNote(): string {
    const now = new Date().toISOString()
    const newNote: Note = {
      id: cryptoRandomId(),
      title: 'Untitled',
      content: '',
      createdAt: now,
      updatedAt: now,
    }
    state.notes.unshift(newNote)
    state.selectedNoteId = newNote.id
    persist()
    return newNote.id
  }

  function updateNote(id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) {
    const note = state.notes.find(n => n.id === id)
    if (!note) return
    if (typeof patch.title === 'string') note.title = patch.title
    if (typeof patch.content === 'string') note.content = patch.content
    note.updatedAt = new Date().toISOString()
    persist()
  }

  function deleteNote(id: string) {
    const idx = state.notes.findIndex(n => n.id === id)
    if (idx === -1) return
    state.notes.splice(idx, 1)
    if (state.selectedNoteId === id) {
      state.selectedNoteId = state.notes[0]?.id || null
    }
    persist()
  }

  function selectNote(id: string | null) {
    state.selectedNoteId = id
    persist()
  }

  function setQuery(q: string) {
    state.query = q
  }

  onMounted(() => {
    load()
    window.addEventListener('beforeunload', persistNow)
  })
  onBeforeUnmount(() => {
    persist.flush()
    window.removeEventListener('beforeunload', persistNow)
  })

  return {
    // state
    notes: toRef(state, 'notes'),
    selectedNoteId: toRef(state, 'selectedNoteId'),
    query: toRef(state, 'query'),
    selectedNote,

    // getters
    sortedByUpdatedDesc,
    filteredByQuery,

    // actions
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    setQuery,

    // persistence control
    flushPersist: persist.flush,
  }
}
