import { useLocalStorage } from '../hooks/useLocalStorage'

export function FocusLine() {
  const [line, setLine] = useLocalStorage('cantier-focus', '')

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-lg backdrop-blur-sm">
      <label htmlFor="focus-line" className="mb-2 block text-xs font-medium text-zinc-500">
        Obiectiv pentru această sesiune
      </label>
      <input
        id="focus-line"
        type="text"
        value={line}
        onChange={(e) => setLine(e.target.value)}
        placeholder="Ex.: termină capitolul 3, trimite mailul către…"
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        maxLength={200}
      />
    </section>
  )
}
