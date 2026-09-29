import { useMemo, useState } from 'react'
import type { BuildCommandStep } from '../../../content/schema'
import type { Answer } from '../../../engine/grading'
import { seededShuffle } from '../../../engine/shuffle'
import { Markdown } from '../../../ui/Markdown'
import type { StepStatus } from '../types'

interface Props {
  step: BuildCommandStep
  setAnswer: (a: Answer) => void
  status: StepStatus
}

/** Banco de fichas: tocas una ficha y pasa a la terminal; tocas en la terminal y vuelve. */
export function BuildCommandStepView({ step, setAnswer, status }: Props) {
  const bank = useMemo(() => seededShuffle([...step.chips, ...step.distractors], step.id), [step])
  const [picked, setPicked] = useState<number[]>([])
  const locked = status === 'correct' || status === 'revealed'

  function update(next: number[]) {
    setPicked(next)
    setAnswer({ type: 'build-command', chips: next.map((i) => bank[i]!) })
  }

  const terminalBorder =
    status === 'correct' ? 'border-success' : status === 'incorrect' ? 'border-danger animate-shake' : 'border-border'

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">Arma el comando</p>
      <Markdown className="mt-1 text-xl font-extrabold leading-snug [&_p]:m-0">{step.prompt}</Markdown>

      <div
        className={`mt-4 min-h-28 rounded-2xl border-2 bg-code-bg p-3 font-mono text-sm text-code-fg ${terminalBorder}`}
        aria-label="Comando armado"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-emerald-400" aria-hidden>
            $
          </span>
          {picked.length === 0 && <span className="text-slate-500">toca las fichas de abajo…</span>}
          {picked.map((i, pos) => (
            <button
              key={`${i}-${pos}`}
              type="button"
              disabled={locked}
              onClick={() => update(picked.filter((_, p) => p !== pos))}
              className="animate-pop rounded-lg border border-white/15 bg-white/10 px-2 py-1 hover:bg-white/20"
              aria-label={`Quitar ${bank[i]}`}
            >
              {bank[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Fichas disponibles">
        {bank.map((chip, i) => {
          const used = picked.includes(i)
          return (
            <button
              key={i}
              type="button"
              disabled={used || locked}
              onClick={() => update([...picked, i])}
              className={`rounded-xl border-2 px-2.5 py-1.5 font-mono text-[13px] font-semibold ${
                used
                  ? 'border-dashed border-border bg-surface-2 text-transparent'
                  : 'border-border bg-surface shadow-[0_3px_0_var(--border)] hover:border-brand active:translate-y-[2px] active:shadow-none'
              }`}
              aria-hidden={used}
            >
              {chip}
            </button>
          )
        })}
      </div>
      {step.mode === 'docker' && (
        <p className="mt-3 text-xs text-muted">El orden de los flags no importa; lo que va después de la imagen, sí.</p>
      )}
    </div>
  )
}
