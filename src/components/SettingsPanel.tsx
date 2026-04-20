import { useCallback, useEffect, useRef, useState } from 'react'
import { applyBackup, assertBackupFileSizeOk, downloadBackup } from '../lib/backup'
import { requestNotificationPermission } from '../lib/notify'
import { useSettings } from '../context/useSettings'
import type { FontScale, ThemeId } from '../lib/settingsTypes'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function SettingsPanel() {
  const { settings, setSoundEnabled, setNotificationsEnabled, setTheme, setFontScale } =
    useSettings()
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installDismissed, setInstallDismissed] = useState(false)

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  const onImportFile = useCallback(async (file: File | null) => {
    setImportMsg(null)
    if (!file) return
    const sizeCheck = assertBackupFileSizeOk(file.size)
    if (!sizeCheck.ok) {
      setImportMsg({ type: 'err', text: sizeCheck.error })
      return
    }
    try {
      const text = await file.text()
      const data = JSON.parse(text) as unknown
      const res = applyBackup(data)
      if (res.ok) {
        window.location.reload()
        return
      }
      setImportMsg({ type: 'err', text: res.error })
    } catch {
      setImportMsg({ type: 'err', text: 'Nu am putut citi fișierul JSON.' })
    }
  }, [])

  const onEnableNotifications = useCallback(async () => {
    const perm = await requestNotificationPermission()
    if (perm === 'granted') {
      setNotificationsEnabled(true)
      setImportMsg({ type: 'ok', text: 'Notificări activate.' })
    } else {
      setNotificationsEnabled(false)
      setImportMsg({
        type: 'err',
        text: 'Permisiune refuzată. Verifică setările browserului pentru acest site.',
      })
    }
  }, [setNotificationsEnabled])

  const onInstallClick = useCallback(async () => {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    setInstallDismissed(true)
  }, [installEvent])

  return (
    <section className="cantier-surface cantier-settings p-5">
      <h2 className="cantier-card-heading mb-4 text-sm font-semibold tracking-wide uppercase">
        Setări & date
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="cantier-muted mb-2 text-xs font-medium">Aspect</legend>
            <label className="cantier-muted flex items-center gap-2 text-xs">
              Temă
              <select
                value={settings.theme}
                onChange={(e) => setTheme(e.target.value as ThemeId)}
                className="cantier-select ml-auto min-w-[9rem]"
              >
                <option value="dark">Întunecată</option>
                <option value="light">Luminată</option>
                <option value="contrast">Contrast ridicat</option>
              </select>
            </label>
            <label className="cantier-muted flex items-center gap-2 text-xs">
              Text
              <select
                value={settings.fontScale}
                onChange={(e) => setFontScale(e.target.value as FontScale)}
                className="cantier-select ml-auto min-w-[9rem]"
              >
                <option value="sm">Mai mic</option>
                <option value="md">Standard</option>
                <option value="lg">Mai mare</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="cantier-muted mb-1 text-xs font-medium">Pomodoro</legend>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="cantier-checkbox size-4 rounded border"
              />
              <span className="cantier-body">Sunet la final de rundă</span>
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      setNotificationsEnabled(false)
                      return
                    }
                    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                      setNotificationsEnabled(true)
                      return
                    }
                    void onEnableNotifications()
                  }}
                  className="cantier-checkbox size-4 rounded border"
                />
                <span className="cantier-body">Notificări la final de rundă</span>
              </label>
              {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
                <button
                  type="button"
                  onClick={() => void onEnableNotifications()}
                  className="cantier-secondary-btn w-fit px-3 py-1.5 text-xs"
                >
                  Cere permisiune
                </button>
              )}
            </div>
          </fieldset>
        </div>

        <div className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="cantier-muted mb-2 text-xs font-medium">Backup</legend>
            <p className="cantier-muted text-xs leading-relaxed">
              Exportă notițele, obiectivul, ciclurile Pomodoro și setările într-un fișier JSON.
              Importul înlocuiește datele curente și reîncarcă pagina.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={downloadBackup} className="cantier-primary-btn px-4 py-2 text-sm">
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="cantier-secondary-btn px-4 py-2 text-sm"
              >
                Import JSON
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null
                  e.target.value = ''
                  void onImportFile(f)
                }}
              />
            </div>
          </fieldset>

          {installEvent && !installDismissed && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="cantier-body mb-2 text-sm font-medium">Instalare ca aplicație (PWA)</p>
              <p className="cantier-muted mb-3 text-xs leading-relaxed">
                Poți adăuga Cantier pe ecranul principal sau în meniul aplicațiilor (depinde de
                browser).
              </p>
              <button type="button" onClick={() => void onInstallClick()} className="cantier-primary-btn px-4 py-2 text-sm">
                Adaugă la ecran
              </button>
            </div>
          )}

          {importMsg && (
            <p
              className={importMsg.type === 'ok' ? 'cantier-msg-ok text-sm' : 'cantier-msg-err text-sm'}
              role={importMsg.type === 'err' ? 'alert' : undefined}
            >
              {importMsg.text}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
