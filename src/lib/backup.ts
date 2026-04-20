import { STORAGE } from './storageKeys'
import type { CantierSettings } from './settingsTypes'
import { sanitizeCantierSettings } from './sanitizeSettings'
import {
  MAX_BACKUP_FILE_BYTES,
  MAX_FOCUS_CHARS,
  MAX_POMODORO_CYCLES,
  MAX_SCRATCH_CHARS,
} from './limits'

export type CantierBackupV1 = {
  version: 1
  exportedAt: string
  scratch: string
  focus: string
  pomodoroCompleted: number
  /** Prezent doar dacă există setări salvate; întotdeauna forma sanitizată. */
  settings?: CantierSettings
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function buildBackup(): CantierBackupV1 {
  const rawSettings = localStorage.getItem(STORAGE.settings)
  let settings: CantierSettings | undefined
  if (rawSettings) {
    try {
      const parsed: unknown = JSON.parse(rawSettings)
      settings = sanitizeCantierSettings(parsed)
    } catch {
      settings = undefined
    }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    scratch: readJson(STORAGE.scratch, ''),
    focus: readJson(STORAGE.focus, ''),
    pomodoroCompleted: readJson(STORAGE.pomodoroCompleted, 0),
    settings,
  }
}

export function downloadBackup(): void {
  const data = buildBackup()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cantier-backup-${data.exportedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function validateTextField(value: string, max: number, label: string): { ok: true } | { ok: false; error: string } {
  if (value.length > max) {
    return { ok: false, error: `${label} depășește ${max} caractere.` }
  }
  return { ok: true }
}

export function applyBackup(raw: unknown): { ok: true } | { ok: false; error: string } {
  if (raw == null || typeof raw !== 'object') {
    return { ok: false, error: 'Fișier invalid.' }
  }
  const o = raw as Record<string, unknown>
  if (o.version !== 1) {
    return { ok: false, error: 'Versiune de backup necunoscută.' }
  }
  if (typeof o.scratch !== 'string' || typeof o.focus !== 'string') {
    return { ok: false, error: 'Structură backup incompletă.' }
  }

  const scratchOk = validateTextField(o.scratch, MAX_SCRATCH_CHARS, 'Notițele')
  if (!scratchOk.ok) return scratchOk
  const focusOk = validateTextField(o.focus, MAX_FOCUS_CHARS, 'Obiectivul')
  if (!focusOk.ok) return focusOk

  const cycles = o.pomodoroCompleted
  if (typeof cycles !== 'number' || !Number.isFinite(cycles) || cycles < 0) {
    return { ok: false, error: 'Valoare Pomodoro invalidă.' }
  }
  const cyclesInt = Math.floor(cycles)
  if (cyclesInt > MAX_POMODORO_CYCLES) {
    return { ok: false, error: 'Valoare Pomodoro prea mare.' }
  }

  try {
    localStorage.setItem(STORAGE.scratch, JSON.stringify(o.scratch))
    localStorage.setItem(STORAGE.focus, JSON.stringify(o.focus))
    localStorage.setItem(STORAGE.pomodoroCompleted, JSON.stringify(cyclesInt))

    if (o.settings != null && typeof o.settings === 'object' && !Array.isArray(o.settings)) {
      const merged = sanitizeCantierSettings(o.settings)
      localStorage.setItem(STORAGE.settings, JSON.stringify(merged))
    }
  } catch {
    return { ok: false, error: 'Nu s-a putut scrie în localStorage (spațiu/quota?).' }
  }

  return { ok: true }
}

export function assertBackupFileSizeOk(size: number): { ok: true } | { ok: false; error: string } {
  if (!Number.isFinite(size) || size < 0) return { ok: false, error: 'Fișier invalid.' }
  if (size > MAX_BACKUP_FILE_BYTES) {
    return { ok: false, error: `Fișierul depășește ${MAX_BACKUP_FILE_BYTES / (1024 * 1024)} Mo.` }
  }
  return { ok: true }
}
