export type ThemeId = 'dark' | 'light' | 'contrast'
export type FontScale = 'sm' | 'md' | 'lg'

export type CantierSettings = {
  soundEnabled: boolean
  notificationsEnabled: boolean
  theme: ThemeId
  fontScale: FontScale
}

export const defaultSettings: CantierSettings = {
  soundEnabled: true,
  notificationsEnabled: false,
  theme: 'dark',
  fontScale: 'md',
}
