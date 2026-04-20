import { useContext } from 'react'
import { CantierSettingsContext } from './cantierSettingsContext'

export function useSettings() {
  const ctx = useContext(CantierSettingsContext)
  if (!ctx) throw new Error('useSettings trebuie folosit în SettingsProvider.')
  return ctx
}
