import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE } from '../lib/storageKeys'

export function FocusLine() {
  const [line, setLine] = useLocalStorage(STORAGE.focus, '')

  return (
    <section className="cantier-surface p-5 shadow-lg">
      <label htmlFor="focus-line" className="cantier-muted mb-2 block text-xs font-medium">
        Obiectiv pentru această sesiune
      </label>
      <input
        id="focus-line"
        type="text"
        value={line}
        onChange={(e) => setLine(e.target.value)}
        placeholder="Ex.: termină capitolul 3, trimite mailul către…"
        className="cantier-input w-full px-4 py-3 text-sm"
        maxLength={200}
      />
    </section>
  )
}
