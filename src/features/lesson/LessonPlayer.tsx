import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Zap } from 'lucide-react'
import type { Step } from '../../content/schema'
import {
  emptyAnswer,
  gradeStep,
  isAnswerReady,
  isGradable,
  type Answer,
} from '../../engine/grading'
import { useProgress } from '../../store/progress'
import { Button } from '../../ui/Button'
import { ProgressBar } from '../../ui/ProgressBar'
import { FeedbackSheet } from './FeedbackSheet'
import type { StepStatus } from './types'
import { ConceptStepView } from './steps/ConceptStepView'
import { FlipStepView } from './steps/FlipStepView'
import { ChoiceStepView } from './steps/ChoiceStepView'
import { MatchStepView } from './steps/MatchStepView'
import { BuildCommandStepView } from './steps/BuildCommandStepView'
import { FillCodeStepView } from './steps/FillCodeStepView'
import { TypeCommandStepView } from './steps/TypeCommandStepView'
import { MissionStepView } from './steps/MissionStepView'

export interface LessonSummary {
  xp: number
  graded: number
  firstTry: number
  missions: number
}

interface Props {
  steps: Step[]
  /** `lesson` otorga XP normal; `review` saca de la cola de repaso lo que aciertes. */
  mode: 'lesson' | 'review'
  onExit: () => void
  onFinish: (summary: LessonSummary) => void
}

function initialAnswer(step: Step | undefined): Answer | null {
  return step && isGradable(step) ? emptyAnswer(step) : null
}

export function LessonPlayer({ steps, mode, onExit, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const step = steps[index]!
  const [answer, setAnswer] = useState<Answer | null>(() => initialAnswer(steps[0]))
  const [status, setStatus] = useState<StepStatus>('answering')
  const [attempts, setAttempts] = useState(0)
  const [missionReady, setMissionReady] = useState(false)
  const [gained, setGained] = useState(0)
  const summary = useRef<LessonSummary>({ xp: 0, graded: 0, firstTry: 0, missions: 0 })

  const missions = useProgress((s) => s.missions)
  const { completeStep, completeReview, markForReview, completeMission } = useProgress.getState()

  const missionDone = step.type === 'mission' && Boolean(missions[step.missionId])

  const record = useCallback(
    (tries: number, revealed: boolean) => {
      const xp =
        mode === 'lesson' ? completeStep(step.id, tries, revealed) : revealed ? 0 : completeReview(step.id, true)
      summary.current.xp += xp
      summary.current.graded += 1
      if (tries === 1 && !revealed) summary.current.firstTry += 1
      setGained(xp)
    },
    [mode, step.id, completeStep, completeReview],
  )

  const next = useCallback(() => {
    if (index + 1 >= steps.length) {
      onFinish(summary.current)
      return
    }
    const nextStep = steps[index + 1]
    setIndex(index + 1)
    setAnswer(initialAnswer(nextStep))
    setStatus('answering')
    setAttempts(0)
    setGained(0)
    setMissionReady(false)
    window.scrollTo({ top: 0 })
  }, [index, steps, onFinish])

  function check() {
    if (!answer || !isGradable(step)) return
    const tries = attempts + 1
    setAttempts(tries)
    if (gradeStep(step, answer)) {
      setStatus('correct')
      record(tries, false)
    } else {
      setStatus('incorrect')
      if (mode === 'lesson') markForReview(step.id)
    }
  }

  function reveal() {
    setStatus('revealed')
    record(attempts, true)
  }

  const onMatchSolved = useCallback(
    (mistakes: number) => {
      if (mistakes > 0 && mode === 'lesson') markForReview(step.id)
      setStatus('correct')
      record(mistakes + 1, false)
    },
    [mode, step.id, markForReview, record],
  )

  function finishMission() {
    if (step.type !== 'mission') return
    const xp = completeMission(step.missionId)
    summary.current.xp += xp
    summary.current.missions += 1
    setGained(xp)
    setStatus('correct')
  }

  // Botón principal según el tipo de paso y el estado.
  const primary = ((): { label: string; action: () => void; enabled: boolean } => {
    if (status === 'correct' || status === 'revealed') return { label: 'Continuar', action: next, enabled: true }
    if (status === 'incorrect') return { label: 'Reintentar', action: () => setStatus('answering'), enabled: true }
    switch (step.type) {
      case 'concept':
      case 'flip':
        return { label: 'Continuar', action: next, enabled: true }
      case 'match':
        return { label: 'Empareja todo', action: () => {}, enabled: false }
      case 'mission':
        return missionDone
          ? { label: 'Continuar', action: next, enabled: true }
          : { label: 'Completar misión', action: finishMission, enabled: missionReady }
      default:
        return { label: 'Comprobar', action: check, enabled: answer !== null && isAnswerReady(step, answer) }
    }
  })()

  // Enter = botón principal (salvo en textareas, donde Enter es salto de línea).
  const primaryRef = useRef(primary)
  useEffect(() => {
    primaryRef.current = primary
  })
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      // En opciones (radio/checkbox) Enter comprueba; Espacio sigue marcando.
      const isOption = ['radio', 'checkbox'].includes(target.getAttribute('role') ?? '')
      const ownsEnter = target.tagName === 'TEXTAREA' || target.tagName === 'A' || (target.tagName === 'BUTTON' && !isOption)
      if (e.key !== 'Enter' || ownsEnter) return
      if (primaryRef.current.enabled) {
        e.preventDefault()
        primaryRef.current.action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const progress = (index + (status === 'correct' || status === 'revealed' ? 1 : 0)) / steps.length
  const showSheet = status !== 'answering'

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button type="button" onClick={onExit} className="rounded-xl p-1.5 text-muted hover:bg-surface-2" aria-label="Salir de la lección">
            <X size={26} />
          </button>
          <ProgressBar value={progress} label="Progreso de la lección" />
          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-xp" aria-label={`${summary.current.xp} XP ganados`}>
            <Zap size={18} fill="currentColor" aria-hidden />
            {summary.current.xp}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-3 pb-56">
        <div key={step.id} className="animate-pop">
          {step.type === 'concept' && <ConceptStepView step={step} />}
          {step.type === 'flip' && <FlipStepView step={step} />}
          {step.type === 'choice' && answer?.type === 'choice' && (
            <ChoiceStepView step={step} answer={answer} setAnswer={setAnswer} status={status} />
          )}
          {step.type === 'match' && <MatchStepView step={step} onSolved={onMatchSolved} />}
          {step.type === 'build-command' && <BuildCommandStepView step={step} setAnswer={setAnswer} status={status} />}
          {step.type === 'fill-code' && answer?.type === 'fill-code' && (
            <FillCodeStepView step={step} answer={answer} setAnswer={setAnswer} status={status} />
          )}
          {step.type === 'type-command' && answer?.type === 'type-command' && (
            <TypeCommandStepView step={step} answer={answer} setAnswer={setAnswer} status={status} />
          )}
          {step.type === 'mission' && (
            <MissionStepView step={step} done={missionDone} onReadyChange={setMissionReady} />
          )}
        </div>
      </main>

      {showSheet ? (
        <FeedbackSheet
          step={step}
          status={status}
          answer={answer}
          attempts={attempts}
          gained={gained}
          onPrimary={primary.action}
          primaryLabel={primary.label}
          onReveal={status === 'incorrect' && attempts >= 2 ? reveal : undefined}
        />
      ) : (
        <footer className="fixed inset-x-0 bottom-0 border-t-2 border-border bg-bg pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4">
            {step.type === 'mission' && !missionDone ? (
              <Button variant="ghost" onClick={next}>
                Hacerla después
              </Button>
            ) : (
              <span />
            )}
            <Button
              variant={step.type === 'mission' ? 'success' : 'primary'}
              onClick={primary.action}
              disabled={!primary.enabled}
              className="min-w-40"
            >
              {primary.label}
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
