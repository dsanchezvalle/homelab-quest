import { useEffect, useState } from 'react'
import { CircleCheck, CircleX, GitCommitHorizontal, Target, Terminal } from 'lucide-react'
import type { MissionStep } from '../../../content/schema'
import { verifyOutput } from '../../../engine/grading'
import { CodeBlock } from '../../../ui/CodeBlock'
import { Markdown } from '../../../ui/Markdown'

interface Props {
  step: MissionStep
  /** La misión ya se completó antes (se muestra como hecha). */
  done: boolean
  onReadyChange: (ready: boolean) => void
}

/** Misión real: pasos con comandos copiables, verificador opcional y checklist. */
export function MissionStepView({ step, done, onReadyChange }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => step.checklist.map(() => done))
  const [output, setOutput] = useState('')
  const [verdict, setVerdict] = useState<boolean | null>(done ? true : null)

  const ready = checked.every(Boolean) && (!step.verify || verdict === true)
  useEffect(() => {
    onReadyChange(ready)
  }, [ready, onReadyChange])

  return (
    <div>
      <p className="inline-flex items-center gap-1.5 rounded-full bg-warn-soft px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-warn">
        <Target size={14} aria-hidden /> Misión real · en tu Ubuntu
      </p>
      <h2 className="mt-2 text-2xl font-black leading-tight">{step.title}</h2>
      <p className="mt-1 text-muted">{step.goal}</p>

      <ol className="mt-4 grid gap-4">
        {step.steps.map((s, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr] gap-3">
            <span className="grid size-7 place-items-center rounded-full bg-brand text-sm font-black text-white" aria-hidden>
              {i + 1}
            </span>
            <div className="min-w-0">
              <Markdown className="[&_p]:m-0">{s.text}</Markdown>
              {s.code && <CodeBlock {...s.code} />}
            </div>
          </li>
        ))}
      </ol>

      {step.expected && (
        <div className="mt-2">
          <p className="text-sm font-extrabold">Salida esperada (aproximada)</p>
          <CodeBlock {...step.expected} caption="salida" noCopy />
        </div>
      )}

      {step.commit && (
        <div className="mt-3 rounded-2xl border border-border bg-surface p-3 text-sm">
          <p className="flex items-center gap-2 font-extrabold">
            <GitCommitHorizontal size={18} aria-hidden /> Commit sugerido en homelab-ha
          </p>
          <p className="mt-1 text-muted">
            Archivos: {step.commit.files.map((f) => <code key={f} className="font-mono text-fg">{f} </code>)}
          </p>
          <CodeBlock code={`git commit -m "${step.commit.message}"`} lang="bash" />
        </div>
      )}

      {step.verify && (
        <section className="mt-4 rounded-2xl border-2 border-border bg-surface p-4" aria-labelledby={`${step.id}-verify`}>
          <h3 id={`${step.id}-verify`} className="flex items-center gap-2 font-extrabold">
            <Terminal size={18} aria-hidden /> Verificador
          </h3>
          <p className="mt-1 text-sm text-muted">{step.verify.instruction}</p>
          <CodeBlock code={step.verify.command} lang="bash" />
          <label className="text-sm font-bold" htmlFor={`${step.id}-out`}>
            Pega aquí la salida de tu terminal
          </label>
          <textarea
            id={`${step.id}-out`}
            value={output}
            onChange={(e) => {
              setOutput(e.target.value)
              setVerdict(null)
            }}
            rows={4}
            spellCheck={false}
            className="mt-1 w-full rounded-xl border-2 border-border bg-code-bg p-3 font-mono text-[13px] text-code-fg outline-none focus:border-brand"
            placeholder="$ …"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setVerdict(verifyOutput(step.verify!, output))}
              disabled={!output.trim()}
              className="rounded-xl border-2 border-brand px-3 py-1.5 text-sm font-extrabold text-brand hover:bg-brand-soft disabled:opacity-40"
            >
              Verificar
            </button>
            <span aria-live="polite" className="text-sm">
              {verdict === true && (
                <span className="inline-flex items-center gap-1 font-bold text-success">
                  <CircleCheck size={18} aria-hidden /> {done && !output ? 'Verificada anteriormente.' : step.verify.success}
                </span>
              )}
              {verdict === false && (
                <span className="inline-flex items-center gap-1 font-bold text-danger">
                  <CircleX size={18} aria-hidden /> {step.verify.failure}
                </span>
              )}
            </span>
          </div>
        </section>
      )}

      <fieldset className="mt-4 rounded-2xl border-2 border-border bg-surface p-4">
        <legend className="px-1 font-extrabold">Checklist</legend>
        <div className="grid gap-2">
          {step.checklist.map((item, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-3 rounded-xl p-1.5 hover:bg-surface-2">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                className="mt-0.5 size-5 shrink-0 accent-[var(--success)]"
              />
              <Markdown className="text-sm [&_p]:m-0">{item}</Markdown>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
