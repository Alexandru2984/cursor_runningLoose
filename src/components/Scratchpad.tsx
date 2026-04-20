import { useLocalStorage } from '../hooks/useLocalStorage'

export function Scratchpad() {
  const [text, setText] = useLocalStorage('cantier-scratch', '')

  return (
    <section className="flex min-h-[220px] flex-1 flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-sm">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">
        Notițe locale
      </h2>
      <p className="mb-3 text-xs text-zinc-500">
        Salvate doar în acest browser (<code className="text-zinc-400">localStorage</code>).
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Gânduri, link-uri, rezumat rapid…"
        className="min-h-[140px] flex-1 resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        spellCheck={false}
      />
    </section>
  )
}
