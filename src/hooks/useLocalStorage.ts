import { useCallback, useEffect, useState } from 'react'
import { STORAGE } from '../lib/storageKeys'
import { sanitizeCantierSettings } from '../lib/sanitizeSettings'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return initial
      const parsed: unknown = JSON.parse(raw)
      if (key === STORAGE.settings) {
        return sanitizeCantierSettings(parsed) as T
      }
      return parsed as T
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      const toStore =
        key === STORAGE.settings && value !== null && typeof value === 'object'
          ? sanitizeCantierSettings(value as unknown)
          : value
      localStorage.setItem(key, JSON.stringify(toStore))
    } catch {
      /* ignore quota / private mode */
    }
  }, [key, value])

  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next))
  }, [])

  return [value, update] as const
}
