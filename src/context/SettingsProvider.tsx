import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE } from '../lib/storageKeys'
import {
  defaultSettings,
  type CantierSettings,
  type FontScale,
  type ThemeId,
} from '../lib/settingsTypes'
import { CantierSettingsContext } from './cantierSettingsContext'

const THEME_COLOR: Record<ThemeId, string> = {
  dark: '#09090b',
  light: '#fafafa',
  contrast: '#000000',
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<CantierSettings>(STORAGE.settings, defaultSettings)
  const settings = useMemo(() => ({ ...defaultSettings, ...stored }), [stored])

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme
    document.documentElement.dataset.font = settings.fontScale
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', THEME_COLOR[settings.theme])
  }, [settings.theme, settings.fontScale])

  const patchSettings = useCallback(
    (p: Partial<CantierSettings>) => {
      setStored((prev) => ({ ...defaultSettings, ...prev, ...p }))
    },
    [setStored],
  )

  const value = useMemo(
    () => ({
      settings,
      setSoundEnabled: (soundEnabled: boolean) => patchSettings({ soundEnabled }),
      setNotificationsEnabled: (notificationsEnabled: boolean) =>
        patchSettings({ notificationsEnabled }),
      setTheme: (theme: ThemeId) => patchSettings({ theme }),
      setFontScale: (fontScale: FontScale) => patchSettings({ fontScale }),
      patchSettings,
    }),
    [settings, patchSettings],
  )

  return (
    <CantierSettingsContext.Provider value={value}>{children}</CantierSettingsContext.Provider>
  )
}
