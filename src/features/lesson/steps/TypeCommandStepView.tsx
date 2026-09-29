import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import type { TypeCommandStep } from '../../../content/schema'
import type { Answer } from '../../../engine/grading'
import { Markdown } from '../../../ui/Markdown'
import type { StepStatus } from '../types'

interface Props {
  step: TypeCommandStep
  answer: Extract<Answer, { type: 'type-command' }>
  setAnswer: (a: Answer) => void
  status: StepStatus
}

export function TypeCommandStepView({ step, answer, setAnswer, status }: Props) {
  const [showHint, setShowHint] = useState(false)
  const locked = status === 'correct' || status === 'revealed'
  const border = status === 'correct' ? 'border-success' : status === 'incorrect' ? 'border-danger' : 'border-border focus-within:border-brand'

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">Escribe el comando</p>
      <Markdown className="mt-1 text-xl font-extrabold leading-snug [&_p]:m-0">{step.prompt}</Markdown>
      <label className={`mt-4 flex items-center gap-2 rounded-2xl border-2 bg-code-bg px-3 py-3 font-mono text-code-fg ${border}`}>
        <span className="text-emerald-400" aria-hidden>
          $
        </span>
        <span className="sr-only">Comando</span>
        <input
          autoFocus
          value={answer.text}
          disabled={locked}
          onChange={(e) => setAnswer({ type: 'type-command', text: e.target.value })}
          placeholder={step.placeholder}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-500"
        />
      </label>
      {step.hint && (
        <div className="mt-3">
          {showHint ? (
            <p className="flex gap-2 rounded-xl bg-warn-soft p-3 text-sm">
              <Lightbulb size={18} className="shrink-0 text-warn" aria-hidden />
              <Markdown className="[&_p]:m-0">{step.hint}</Markdown>
            </p>
          ) : (
            <button type="button" onClick={() => setShowHint(true)} className="text-sm font-bold text-brand underline underline-offset-2">
              Ver pista
            </button>
          )}
        </div>
      )}
    </div>
  )
}
