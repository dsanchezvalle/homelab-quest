import { useEffect, useMemo, useState } from 'react'
import type { MatchStep } from '../../../content/schema'
import { seededShuffle } from '../../../engine/shuffle'
import { Markdown } from '../../../ui/Markdown'

interface Props {
  step: MatchStep
  /** Se llama una vez, cuando todos los pares están emparejados. */
  onSolved: (mistakes: number) => void
}

type Side = 'left' | 'right'

/** Emparejar: se califica par por par, como en Duolingo. */
export function MatchStepView({ step, onSolved }: Props) {
  const rights = useMemo(() => seededShuffle(step.pairs.map((_, i) => i), step.id), [step])
  const [selected, setSelected] = useState<{ side: Side; index: number } | null>(null)
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [wrong, setWrong] = useState<{ left: number; right: number } | null>(null)
  const [mistakes, setMistakes] = useState(0)

  useEffect(() => {
    if (matched.size === step.pairs.length) onSolved(mistakes)
    // Solo reaccionamos a "todo emparejado"; onSolved no cambia durante la vida del paso.
  }, [matched.size])

  useEffect(() => {
    if (!wrong) return
    const t = setTimeout(() => setWrong(null), 500)
    return () => clearTimeout(t)
  }, [wrong])

  function choose(side: Side, index: number) {
    if (matched.has(index) && side === 'left') return
    if (!selected || selected.side === side) {
      setSelected({ side, index })
      return
    }
    const left = side === 'left' ? index : selected.index
    const right = side === 'right' ? index : selected.index
    setSelected(null)
    if (left === right) setMatched((m) => new Set(m).add(left))
    else {
      setWrong({ left, right })
      setMistakes((n) => n + 1)
    }
  }

  const cell = (side: Side, pairIndex: number, text: string) => {
    const done = matched.has(pairIndex)
    const isSel = selected?.side === side && selected.index === pairIndex
    const isWrong = wrong && (side === 'left' ? wrong.left : wrong.right) === pairIndex
    return (
      <button
        key={`${side}-${pairIndex}`}
        type="button"
        disabled={done}
        aria-pressed={isSel}
        onClick={() => choose(side, pairIndex)}
        className={`min-h-14 rounded-2xl border-2 px-3 py-2 text-left text-sm font-bold shadow-[0_3px_0_var(--border)] transition-colors ${
          done
            ? 'border-success/40 bg-success-soft text-success opacity-60 shadow-none'
            : isWrong
              ? 'animate-shake border-danger bg-danger-soft'
              : isSel
                ? 'border-brand bg-brand-soft'
                : 'border-border bg-surface hover:bg-surface-2'
        }`}
      >
        <Markdown className="[&_p]:m-0 [&_code]:text-[0.8em]">{text}</Markdown>
      </button>
    )
  }

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">Empareja</p>
      <Markdown className="mt-1 text-xl font-extrabold leading-snug [&_p]:m-0">{step.prompt}</Markdown>
      <p className="mt-1 text-sm text-muted">
        Toca un elemento de cada columna. Errores: <strong>{mistakes}</strong>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="grid content-start gap-2">{step.pairs.map((p, i) => cell('left', i, `\`${p.left}\``))}</div>
        <div className="grid content-start gap-2">{rights.map((i) => cell('right', i, step.pairs[i]!.right))}</div>
      </div>
    </div>
  )
}
