import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE } from '../lib/storageKeys'

export function Scratchpad() {
  const [text, setText] = useLocalStorage(STORAGE.scratch, '')

  return (
    <section className="cantier-surface flex min-h-[220px] flex-1 flex-col p-6">
      <h2 className="cantier-card-heading mb-3 text-sm font-semibold tracking-wide uppercase">
        Notițe locale
      </h2>
      <p className="cantier-muted mb-3 text-xs">
        Salvate în acest browser (<code className="cantier-body text-[0.95em]">localStorage</code>
        ). Folosește exportul din setări pentru o copie de siguranță.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Gânduri, link-uri, rezumat rapid…"
        className="cantier-textarea min-h-[140px] flex-1 resize-y px-3 py-2 text-sm leading-relaxed"
        spellCheck={false}
      />
    </section>
  )
}
