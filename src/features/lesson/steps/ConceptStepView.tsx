import type { ConceptStep } from '../../../content/schema'
import { Callout } from '../../../ui/Callout'
import { CodeBlock } from '../../../ui/CodeBlock'
import { Markdown } from '../../../ui/Markdown'

export function ConceptStepView({ step }: { step: ConceptStep }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand">Concepto</p>
      <h2 className="mt-1 text-2xl font-black leading-tight">{step.title}</h2>
      <Markdown className="mt-2">{step.body}</Markdown>
      {step.code && <CodeBlock {...step.code} />}
      {step.callouts?.map((c, i) => <Callout key={i} {...c} />)}
    </div>
  )
}
