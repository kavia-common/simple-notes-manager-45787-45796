import type { Ref } from 'vue'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface NotesApi {
  // PUBLIC_INTERFACE
  list: () => Promise<Note[]>
  // PUBLIC_INTERFACE
  create: (note: Partial<Note>) => Promise<Note>
  // PUBLIC_INTERFACE
  update: (id: string, patch: Partial<Note>) => Promise<Note>
  // PUBLIC_INTERFACE
  remove: (id: string) => Promise<{ ok: boolean }>
  // PUBLIC_INTERFACE
  isRemote: Ref<boolean>
}

/**
 * PUBLIC_INTERFACE
 * useNotesApi provides an abstraction over a future backend API, using runtimeConfig.public.apiBase.
 * If apiBase is falsy or unreachable, it operates in local mode and the caller should persist via localStorage.
 */
export function useNotesApi(): NotesApi {
  const config = useRuntimeConfig()
  const apiBase = (config.public?.apiBase || '').trim()
  const isRemote = ref<boolean>(false)

  const request = async (path: string, opts?: RequestInit) => {
    if (!apiBase) {
      throw new Error('No API base configured')
    }
    const url = `${apiBase.replace(/\/+$/, '')}${path}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...opts,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API ${res.status}: ${text || res.statusText}`)
    }
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      return res.json()
    }
    return null
  }

  // Pinging api to determine reachability lazily
  const ensureRemote = async () => {
    if (!apiBase) {
      isRemote.value = false
      return false
    }
    if (isRemote.value) return true
    try {
      await request('/notes', { method: 'GET' })
      isRemote.value = true
      return true
    } catch {
      isRemote.value = false
      return false
    }
  }

  const list = async (): Promise<Note[]> => {
    if (!(await ensureRemote())) {
      throw new Error('Remote API not available')
    }
    return request('/notes', { method: 'GET' })
  }

  const create = async (note: Partial<Note>): Promise<Note> => {
    if (!(await ensureRemote())) {
      throw new Error('Remote API not available')
    }
    return request('/notes', { method: 'POST', body: JSON.stringify(note) })
  }

  const update = async (id: string, patch: Partial<Note>): Promise<Note> => {
    if (!(await ensureRemote())) {
      throw new Error('Remote API not available')
    }
    return request(`/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(patch) })
  }

  const remove = async (id: string): Promise<{ ok: boolean }> => {
    if (!(await ensureRemote())) {
      throw new Error('Remote API not available')
    }
    await request(`/notes/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return { ok: true }
  }

  return { list, create, update, remove, isRemote }
}
