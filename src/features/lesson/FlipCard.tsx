import { useState } from 'react'
import { ExternalLink, RotateCcw } from 'lucide-react'
import type { FlipCardData } from '../../content/schema'
import { Markdown } from '../../ui/Markdown'

/**
 * Flip card en CSS puro (ver .flip* en index.css):
 * perspective en el contenedor, preserve-3d en el interior y
 * backface-visibility: hidden en cada cara.
 */
export function FlipCard({ card, onFlip }: { card: FlipCardData; onFlip?: () => void }) {
  const [flipped, setFlipped] = useState(false)
  const toggle = () => {
    setFlipped((f) => !f)
    onFlip?.()
  }

  return (
    <div className="flip h-52" data-flipped={flipped}>
      <div className="flip-inner">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={flipped}
          aria-hidden={flipped}
          tabIndex={flipped ? -1 : 0}
          className="flip-face grid place-items-center rounded-3xl border-2 border-border bg-surface p-4 text-center shadow-[0_4px_0_var(--border)] hover:border-brand"
        >
          <Markdown className="text-lg font-extrabold [&_p]:m-0">{card.front}</Markdown>
          <span className="absolute bottom-3 inline-flex items-center gap-1 text-xs font-bold text-muted">
            <RotateCcw size={12} aria-hidden /> Toca para girar
          </span>
        </button>
        <div
          className="flip-face flip-back flex flex-col rounded-3xl border-2 border-brand bg-brand-soft p-4"
          aria-hidden={!flipped}
        >
          <button
            type="button"
            onClick={toggle}
            tabIndex={flipped ? 0 : -1}
            className="min-h-0 flex-1 overflow-y-auto text-left text-sm"
            aria-label={`Volver al frente de ${card.id}`}
          >
            <Markdown className="[&_p]:my-1">{card.back}</Markdown>
          </button>
          {card.link && (
            <a
              href={card.link.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={flipped ? 0 : -1}
              className="mt-2 inline-flex items-center gap-1 self-start text-xs font-bold text-brand underline underline-offset-2"
            >
              {card.link.title} <ExternalLink size={12} aria-hidden />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
