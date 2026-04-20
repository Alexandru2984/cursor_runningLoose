import { Pomodoro } from './components/Pomodoro'
import { FocusLine } from './components/FocusLine'
import { Scratchpad } from './components/Scratchpad'
import { SettingsPanel } from './components/SettingsPanel'

function App() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 px-4 py-10 md:px-8">
      <header className="text-center md:text-left">
        <p className="mb-1 text-xs font-medium tracking-widest text-amber-500/80 uppercase">
          autoCursor
        </p>
        <h1 className="cantier-heading text-3xl font-semibold tracking-tight md:text-4xl">
          Cantier
        </h1>
        <p className="cantier-tagline mt-2 max-w-xl text-sm md:text-base">
          Hub local: Pomodoro, obiectiv de sesiune și notițe. Poți instala aplicația (PWA), face
          backup JSON și ajusta contrastul sau mărimea textului.
        </p>
      </header>

      <SettingsPanel />

      <FocusLine />

      <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Pomodoro />
        <Scratchpad />
      </div>

      <footer className="cantier-footer mt-auto border-t pt-6 text-center text-xs md:text-left">
        Construit în folderul tău <span className="cantier-body">autoCursor</span> — dezvoltare:{' '}
        <kbd className="cantier-kbd px-1.5 py-0.5">npm run dev</kbd>
      </footer>
    </div>
  )
}

export default App
