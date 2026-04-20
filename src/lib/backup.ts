import { STORAGE } from './storageKeys'
import type { CantierSettings } from './settingsTypes'
import { defaultSettings } from './settingsTypes'

export type CantierBackupV1 = {
  version: 1
  exportedAt: string
  scratch: string
  focus: string
  pomodoroCompleted: number
  settings?: Partial<CantierSettings>
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
  let settings: Partial<CantierSettings> | undefined
  if (rawSettings) {
    try {
      settings = JSON.parse(rawSettings) as Partial<CantierSettings>
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
  const cycles = o.pomodoroCompleted
  if (typeof cycles !== 'number' || !Number.isFinite(cycles) || cycles < 0) {
    return { ok: false, error: 'Valoare Pomodoro invalidă.' }
  }

  try {
    localStorage.setItem(STORAGE.scratch, JSON.stringify(o.scratch))
    localStorage.setItem(STORAGE.focus, JSON.stringify(o.focus))
    localStorage.setItem(STORAGE.pomodoroCompleted, JSON.stringify(Math.floor(cycles)))

    if (o.settings != null && typeof o.settings === 'object') {
      const merged: CantierSettings = {
        ...defaultSettings,
        ...(o.settings as Partial<CantierSettings>),
      }
      localStorage.setItem(STORAGE.settings, JSON.stringify(merged))
    }
  } catch {
    return { ok: false, error: 'Nu s-a putut scrie în localStorage (spațiu/quota?).' }
  }

  return { ok: true }
}
