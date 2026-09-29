import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { Lang } from '../content/schema'
import { highlight } from './highlight'

interface Props {
  code: string
  lang?: Lang
  caption?: string
  /** Oculta el botón de copiar (p. ej. en salidas esperadas). */
  noCopy?: boolean
}

export function CodeBlock({ code, lang = 'bash', caption, noCopy }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      // Sin Clipboard API (http sin TLS): el usuario puede seleccionar a mano.
    }
  }

  return (
    <figure className="my-3 overflow-hidden rounded-2xl border border-border bg-code-bg text-code-fg">
      <figcaption className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-1.5 text-xs text-slate-400">
        <span className="font-mono">{caption ?? lang}</span>
        {!noCopy && (
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-slate-300 hover:bg-white/10"
            aria-label="Copiar código"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span aria-live="polite">{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        )}
      </figcaption>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed">
        <code className="font-mono">
          {highlight(code, lang).map((line, i) => (
            <span key={i} className="block min-h-[1.2em]">
              {line.map((tok, j) => (
                <span key={j} className={tok.cls ? `tok-${tok.cls}` : undefined}>
                  {tok.text}
                </span>
              ))}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
