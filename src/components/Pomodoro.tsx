import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useSettings } from '../context/useSettings'
import { STORAGE } from '../lib/storageKeys'
import { notifyCantier } from '../lib/notify'

type Mode = 'work' | 'short' | 'long'

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

function formatMmSs(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function beep() {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g)
    g.connect(ctx.destination)
    o.frequency.value = 880
    g.gain.setValueAtTime(0.08, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    o.start(ctx.currentTime)
    o.stop(ctx.currentTime + 0.26)
  } catch {
    /* no audio */
  }
}

const MODE_LABEL: Record<Mode, string> = {
  work: 'Muncă',
  short: 'Pauză scurtă',
  long: 'Pauză lungă',
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

export function Pomodoro() {
  const { settings } = useSettings()
  const soundRef = useRef(settings.soundEnabled)
  const notifyRef = useRef(settings.notificationsEnabled)

  useEffect(() => {
    soundRef.current = settings.soundEnabled
  }, [settings.soundEnabled])

  useEffect(() => {
    notifyRef.current = settings.notificationsEnabled
  }, [settings.notificationsEnabled])

  const [mode, setMode] = useState<Mode>('work')
  const [remaining, setRemaining] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const [completedWork, setCompletedWork] = useLocalStorage<number>(
    STORAGE.pomodoroCompleted,
    0,
  )
  const tickRef = useRef<number | null>(null)

  const modeRef = useRef(mode)
  const completedRef = useRef(completedWork)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    completedRef.current = completedWork
  }, [completedWork])

  const total = DURATIONS[mode]
  const progress = useMemo(() => 1 - remaining / total, [remaining, total])

  useEffect(() => {
    if (!running) {
      if (tickRef.current != null) {
        window.clearInterval(tickRef.current)
        tickRef.current = null
      }
      return
    }

    tickRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (tickRef.current != null) {
            window.clearInterval(tickRef.current)
            tickRef.current = null
          }

          queueMicrotask(() => {
            const m = modeRef.current
            if (soundRef.current) beep()
            setRunning(false)

            if (notifyRef.current) {
              if (m === 'work') {
                notifyCantier('Cantier', 'Rundă de muncă terminată — e timpul pentru o pauză.')
              } else if (m === 'short') {
                notifyCantier('Cantier', 'Pauza scurtă s-a terminat.')
              } else {
                notifyCantier('Cantier', 'Pauza lungă s-a terminat.')
              }
            }

            if (m === 'work') {
              const next = completedRef.current + 1
              completedRef.current = next
              setCompletedWork(next)
              if (next % 4 === 0) {
                setMode('long')
                setRemaining(DURATIONS.long)
              } else {
                setMode('short')
                setRemaining(DURATIONS.short)
              }
              return
            }

            setMode('work')
            setRemaining(DURATIONS.work)
          })

          return 0
        }
        return r - 1
      })
    }, 1000)

    return () => {
      if (tickRef.current != null) window.clearInterval(tickRef.current)
    }
  }, [running, setCompletedWork])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      if (isTypingTarget(e.target)) return
      e.preventDefault()
      setRunning((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectMode = useCallback((m: Mode) => {
    setRunning(false)
    setMode(m)
    setRemaining(DURATIONS[m])
  }, [])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining(DURATIONS[mode])
  }, [mode])

  const circumference = 2 * Math.PI * 52
  const dashOffset = circumference * (1 - progress)

  return (
    <section className="cantier-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="cantier-card-heading text-sm font-semibold tracking-wide uppercase">
          Pomodoro
        </h2>
        <span className="cantier-muted text-xs">
          Cicluri:{' '}
          <span className="font-mono text-amber-500/90 tabular-nums">{completedWork}</span>
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div className="relative h-36 w-36 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="cantier-ring-track"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="cantier-ring-fill transition-[stroke-dashoffset] duration-1000 ease-linear"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: dashOffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="cantier-timer font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {formatMmSs(remaining)}
            </span>
            <span className="cantier-muted text-xs">{MODE_LABEL[mode]}</span>
          </div>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(['work', 'short', 'long'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => selectMode(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  mode === m ? 'cantier-pomo-tab-active' : 'cantier-pomo-tab'
                }`}
              >
                {MODE_LABEL[m]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="cantier-primary-btn flex-1 px-4 py-2.5 text-sm"
            >
              {running ? 'Pauză' : 'Start'}
            </button>
            <button type="button" onClick={reset} className="cantier-secondary-btn px-4 py-2.5 text-sm">
              Reset
            </button>
          </div>
          <p className="cantier-muted text-center text-[11px] leading-relaxed sm:text-left">
            Spațiu: pornește / oprește. La final de muncă trece automat la pauză (lungă la fiecare a
            4-a rundă). Sunet și notificări se reglează din setări.
          </p>
        </div>
      </div>
    </section>
  )
}
