import { createContext } from 'react'
import type { CantierSettings, FontScale, ThemeId } from '../lib/settingsTypes'

export type SettingsContextValue = {
  settings: CantierSettings
  setSoundEnabled: (v: boolean) => void
  setNotificationsEnabled: (v: boolean) => void
  setTheme: (t: ThemeId) => void
  setFontScale: (f: FontScale) => void
  patchSettings: (p: Partial<CantierSettings>) => void
}

export const CantierSettingsContext = createContext<SettingsContextValue | null>(null)
