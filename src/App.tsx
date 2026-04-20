import { Pomodoro } from './components/Pomodoro'
import { FocusLine } from './components/FocusLine'
import { Scratchpad } from './components/Scratchpad'

function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 px-4 py-10 font-sans md:px-8">
      <header className="text-center md:text-left">
        <p className="mb-1 text-xs font-medium tracking-widest text-amber-500/80 uppercase">
          autoCursor
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-4xl">
          Cantier
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400 md:text-base">
          Un hub local, fără cont și fără server: timer Pomodoro, o linie de focus și notițe care
          rămân pe mașina ta.
        </p>
      </header>

      <FocusLine />

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Pomodoro />
        <Scratchpad />
      </div>

      <footer className="mt-auto border-t border-zinc-800/60 pt-6 text-center text-xs text-zinc-600 md:text-left">
        Construit în folderul tău <span className="text-zinc-500">autoCursor</span> — rulează cu{' '}
        <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
          npm run dev
        </kbd>
      </footer>
    </div>
  )
}

export default App
