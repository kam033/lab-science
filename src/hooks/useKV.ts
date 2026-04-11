import { useState, useCallback } from 'react'

/**
 * Drop-in replacement for @github/spark/hooks useKV
 * Uses localStorage for persistence outside GitHub Spark environment.
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `lab-science:${key}`

  const read = (): T => {
    try {
      const item = localStorage.getItem(storageKey)
      return item !== null ? (JSON.parse(item) as T) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const [value, setValueState] = useState<T>(read)

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState(prev => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          localStorage.setItem(storageKey, JSON.stringify(resolved))
        } catch {
          // storage full or private mode – ignore
        }
        return resolved
      })
    },
    [storageKey]
  )

  return [value, setValue]
}
