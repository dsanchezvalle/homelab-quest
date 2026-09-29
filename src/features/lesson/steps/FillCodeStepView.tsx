import { Fragment } from 'react'
import type { FillCodeStep } from '../../../content/schema'
import { gradeFillCode, type Answer } from '../../../engine/grading'
import { Markdown } from '../../../ui/Markdown'
import type { StepStatus } from '../types'

interface Props {
  step: FillCodeStep
  answer: Extract<Answer, { type: 'fill-code' }>
  setAnswer: (a: Answer) => void
  status: StepStatus
}

/** Código con huecos: el template se parte por los marcadores [[id]]. */
export function FillCodeStepView({ step, answer, setAnswer, status }: Props) {
  const parts = step.template.split(/\[\[(\w+)\]\]/)
  const locked = status === 'correct' || status === 'revealed'
  const perBlank = status === 'answering' ? null : gradeFillCode(step, answer.values).perBlank

  function set(id: string, value: string) {
    setAnswer({ type: 'fill-code', values: { ...answer.values, [id]: value } })
  }

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">Completa el código</p>
      <Markdown className="mt-1 text-xl font-extrabold leading-snug [&_p]:m-0">{step.prompt}</Markdown>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-code-bg text-code-fg">
        <div className="border-b border-white/10 px-3 py-1.5 font-mono text-xs text-slate-400">{step.lang}</div>
        <pre className="whitespace-pre-wrap break-words p-3 font-mono text-[13px] leading-[2.1]">
          {parts.map((part, i) => {
            if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>
            const blank = step.blanks.find((b) => b.id === part)
            if (!blank) return null
            const value = answer.values[blank.id] ?? ''
            const state = perBlank?.[blank.id]
            const tone =
              state === true
                ? 'border-emerald-400 bg-emerald-400/15'
                : state === false
                  ? 'border-rose-400 bg-rose-400/15'
                  : 'border-sky-400/70 bg-white/10'
            const width = Math.max(blank.options ? 10 : 8, ...blank.accept.map((a) => a.length), ...(blank.options ?? []).map((o) => o.length)) + 3
            const common = `rounded-md border-2 px-1.5 py-0.5 align-middle font-mono text-[13px] text-code-fg outline-none focus:border-sky-300 ${tone}`
            return blank.options ? (
              <select
                key={i}
                aria-label={`Hueco ${blank.id}`}
                disabled={locked}
                value={value}
                onChange={(e) => set(blank.id, e.target.value)}
                className={`${common} bg-code-bg`}
                style={{ width: `${width}ch` }}
              >
                <option value="">▾ elige</option>
                {blank.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={i}
                aria-label={`Hueco ${blank.id}`}
                disabled={locked}
                value={value}
                placeholder={blank.placeholder ?? '…'}
                onChange={(e) => set(blank.id, e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={`${common} placeholder:text-slate-500`}
                style={{ width: `${width}ch` }}
              />
            )
          })}
        </pre>
      </div>
    </div>
  )
}
