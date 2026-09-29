import type { ChoiceStep } from '../../../content/schema'
import type { Answer } from '../../../engine/grading'
import { CodeBlock } from '../../../ui/CodeBlock'
import { Markdown } from '../../../ui/Markdown'
import type { StepStatus } from '../types'

interface Props {
  step: ChoiceStep
  answer: Extract<Answer, { type: 'choice' }>
  setAnswer: (a: Answer) => void
  status: StepStatus
}

export function ChoiceStepView({ step, answer, setAnswer, status }: Props) {
  const locked = status === 'correct' || status === 'revealed'
  const letters = 'ABCDEFG'

  function toggle(id: string) {
    if (locked) return
    const selected = step.multiple
      ? answer.selected.includes(id)
        ? answer.selected.filter((x) => x !== id)
        : [...answer.selected, id]
      : [id]
    setAnswer({ type: 'choice', selected })
  }

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">
        {step.multiple ? 'Marca todas las correctas' : 'Elige una respuesta'}
      </p>
      <Markdown className="mt-1 text-xl font-extrabold leading-snug [&_p]:m-0">{step.prompt}</Markdown>
      {step.code && <CodeBlock {...step.code} />}
      <div className="mt-4 grid gap-2" role={step.multiple ? 'group' : 'radiogroup'}>
        {step.options.map((o, i) => {
          const selected = answer.selected.includes(o.id)
          const showCorrect = locked && o.correct
          const wrong = status === 'incorrect' && selected && !o.correct
          return (
            <button
              key={o.id}
              type="button"
              role={step.multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              onClick={() => toggle(o.id)}
              className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left shadow-[0_3px_0_var(--border)] transition-colors ${
                showCorrect
                  ? 'border-success bg-success-soft'
                  : wrong
                    ? 'animate-shake border-danger bg-danger-soft'
                    : selected
                      ? 'border-brand bg-brand-soft'
                      : 'border-border bg-surface hover:bg-surface-2'
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg border-2 text-xs font-black ${
                  selected ? 'border-brand text-brand' : 'border-border text-muted'
                }`}
                aria-hidden
              >
                {letters[i]}
              </span>
              <Markdown className="min-w-0 flex-1 text-[15px] font-semibold [&_p]:m-0">{o.text}</Markdown>
            </button>
          )
        })}
      </div>
    </div>
  )
}
