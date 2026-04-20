import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  const [mode, setMode] = useState<Mode>('work')
  const [remaining, setRemaining] = useState(DURATIONS.work)
  const [running, setRunning] = useState(false)
  const [completedWork, setCompletedWork] = useState(0)
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
            beep()
            setRunning(false)

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
  }, [running])

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
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-400 uppercase">
          Pomodoro
        </h2>
        <span className="text-xs text-zinc-500">
          Cicluri: <span className="font-mono text-amber-400/90">{completedWork}</span>
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
              className="text-zinc-800"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-amber-500/90 transition-[stroke-dashoffset] duration-1000 ease-linear"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: dashOffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
              {formatMmSs(remaining)}
            </span>
            <span className="text-xs text-zinc-500">{MODE_LABEL[mode]}</span>
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
                  mode === m
                    ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
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
              className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/20 transition hover:bg-amber-400"
            >
              {running ? 'Pauză' : 'Start'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800/50"
            >
              Reset
            </button>
          </div>
          <p className="text-center text-[11px] leading-relaxed text-zinc-600 sm:text-left">
            Spațiu: pornește / oprește. La final de muncă trece automat la pauză (lungă la fiecare a
            4-a rundă).
          </p>
        </div>
      </div>
    </section>
  )
}
