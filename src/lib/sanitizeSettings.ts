import { defaultSettings, type CantierSettings, type FontScale, type ThemeId } from './settingsTypes'

const THEMES = new Set<ThemeId>(['dark', 'light', 'contrast'])
const FONTS = new Set<FontScale>(['sm', 'md', 'lg'])

export function sanitizeCantierSettings(raw: unknown): CantierSettings {
  const out: CantierSettings = { ...defaultSettings }
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return out

  const o = raw as Record<string, unknown>

  if (typeof o.soundEnabled === 'boolean') out.soundEnabled = o.soundEnabled
  if (typeof o.notificationsEnabled === 'boolean') out.notificationsEnabled = o.notificationsEnabled

  if (typeof o.theme === 'string' && THEMES.has(o.theme as ThemeId)) {
    out.theme = o.theme as ThemeId
  }
  if (typeof o.fontScale === 'string' && FONTS.has(o.fontScale as FontScale)) {
    out.fontScale = o.fontScale as FontScale
  }

  return out
}
