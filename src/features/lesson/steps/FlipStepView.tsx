import { useState } from 'react'
import type { FlipStep } from '../../../content/schema'
import { FlipCard } from '../FlipCard'

export function FlipStepView({ step }: { step: FlipStep }) {
  const [seen, setSeen] = useState<Set<string>>(new Set())
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">Tarjetas</p>
      <h2 className="mt-1 text-2xl font-black leading-tight">{step.title ?? 'Gira cada tarjeta'}</h2>
      <p className="mt-1 text-sm text-muted">
        Giradas: {seen.size}/{step.cards.length}. Puedes volver a todas desde <strong>Repaso</strong>.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {step.cards.map((c) => (
          <FlipCard key={c.id} card={c} onFlip={() => setSeen((s) => new Set(s).add(c.id))} />
        ))}
      </div>
    </div>
  )
}
