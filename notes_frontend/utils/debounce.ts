export type Debounced<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
  flush: () => void
  cancel: () => void
}

// PUBLIC_INTERFACE
export function debounce<T extends (...args: any[]) => any>(fn: T, wait = 300): Debounced<T> {
  /** Debounce a function, returning a debounced callable with flush and cancel helpers. */
  let t: any
  let lastArgs: any[] | null = null
  const debounced = (...args: Parameters<T>) => {
    lastArgs = args
    clearTimeout(t)
    t = setTimeout(() => {
      fn(...args)
      lastArgs = null
    }, wait)
  }
  debounced.flush = () => {
    if (lastArgs) {
      clearTimeout(t)
      fn(...(lastArgs as Parameters<T>))
      lastArgs = null
    }
  }
  debounced.cancel = () => {
    clearTimeout(t)
    lastArgs = null
  }
  return debounced as Debounced<T>
}
