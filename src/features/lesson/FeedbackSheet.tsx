import { CircleCheck, CircleX, Eye, Zap } from 'lucide-react'
import type { Step } from '../../content/schema'
import { describeSolution, gradeFillCode, isGradable, type Answer } from '../../engine/grading'
import { pick } from '../../engine/shuffle'
import { Button } from '../../ui/Button'
import { Markdown } from '../../ui/Markdown'
import type { StepStatus } from './types'

interface Props {
  step: Step
  status: StepStatus
  answer: Answer | null
  attempts: number
  gained: number
  primaryLabel: string
  onPrimary: () => void
  onReveal?: () => void
}

const PRAISE = ['¡Excelente!', '¡Correcto!', '¡Bien hecho!', '¡Eso es!', '¡Impecable!']

/** Explica POR QUÉ algo está mal, no solo que está mal. */
function wrongDetail(step: Step, answer: Answer | null): string {
  if (step.type === 'choice' && answer?.type === 'choice') {
    const notes = step.options.filter((o) => answer.selected.includes(o.id) && !o.correct && o.feedback).map((o) => `- ${o.feedback}`)
    const missing = step.multiple && step.options.some((o) => o.correct && !answer.selected.includes(o.id))
    return [...notes, missing ? '- Te faltó marcar al menos una opción correcta.' : ''].filter(Boolean).join('\n')
  }
  if (step.type === 'fill-code' && answer?.type === 'fill-code') {
    const bad = Object.entries(gradeFillCode(step, answer.values).perBlank).filter(([, ok]) => !ok).length
    return `Revisa ${bad === 1 ? 'el hueco marcado' : `los ${bad} huecos marcados`} en rojo.${step.hint ? `\n\n${step.hint}` : ''}`
  }
  if ((step.type === 'build-command' || step.type === 'type-command') && step.hint) return step.hint
  return 'Revisa tu respuesta e inténtalo de nuevo.'
}

export function FeedbackSheet({ step, status, answer, attempts, gained, primaryLabel, onPrimary, onReveal }: Props) {
  const ok = status === 'correct'
  const revealed = status === 'revealed'
  const tone = ok ? 'bg-success-soft text-success' : revealed ? 'bg-warn-soft text-warn' : 'bg-danger-soft text-danger'
  const explanation = 'explanation' in step ? step.explanation : ''

  let title: string
  let body: string
  if (step.type === 'mission' && ok) {
    title = 'Misión cumplida'
    body = step.node ? 'Se iluminó un nodo en **Mi Homelab**. Tu implementación real avanza.' : 'Laboratorio completado: ahora lo sabes por experiencia propia.'
  } else if (ok) {
    title = pick(PRAISE, step.id + attempts)
    body = explanation
  } else if (revealed && isGradable(step)) {
    title = 'Así se resuelve'
    body = `${describeSolution(step)}\n\n${explanation}`
  } else {
    title = 'Casi…'
    body = wrongDetail(step, answer)
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 bottom-0 z-20 border-t-2 border-current/10 pb-[env(safe-area-inset-bottom)] ${tone}`}
    >
      <div className="mx-auto max-h-[60dvh] max-w-2xl overflow-y-auto px-4 pt-4">
        <div className="flex items-center gap-2">
          {ok ? <CircleCheck size={28} aria-hidden /> : revealed ? <Eye size={28} aria-hidden /> : <CircleX size={28} aria-hidden />}
          <h2 className="text-2xl font-black">{title}</h2>
          {gained > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-sm font-extrabold text-xp">
              <Zap size={16} fill="currentColor" aria-hidden /> +{gained} XP
            </span>
          )}
        </div>
        {body && <Markdown className="mt-1 text-[15px] text-fg">{body}</Markdown>}
      </div>
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-end gap-3 px-4 py-4">
        {onReveal && (
          <Button variant="ghost" onClick={onReveal} className="mr-auto">
            Ver solución
          </Button>
        )}
        <Button variant={ok ? 'success' : revealed ? 'primary' : 'danger'} onClick={onPrimary} className="min-w-40" autoFocus>
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}
