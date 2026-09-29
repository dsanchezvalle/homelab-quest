import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { findStep } from '../../content'
import type { Step } from '../../content/schema'
import { useProgress } from '../../store/progress'
import { LessonComplete } from '../lesson/LessonComplete'
import { LessonPlayer, type LessonSummary } from '../lesson/LessonPlayer'

const MAX = 10

/** Sesión de repaso: hasta 10 pasos de la cola de errores. */
export function ReviewSession() {
  const navigate = useNavigate()
  // La lista se congela al empezar: acertar saca el paso de la cola, pero no de esta sesión.
  const [steps] = useState<Step[]>(() =>
    useProgress
      .getState()
      .reviewQueue.map((id) => findStep(id)?.step)
      .filter((s): s is Step => Boolean(s) && s!.type !== 'mission')
      .slice(0, MAX),
  )
  const [summary, setSummary] = useState<LessonSummary | null>(null)

  if (steps.length === 0) return <Navigate to="/repaso" replace />
  if (summary) {
    return <LessonComplete title="Sesión de repaso" summary={summary} badges={[]} onContinue={() => navigate('/repaso')} />
  }
  return <LessonPlayer steps={steps} mode="review" onExit={() => navigate('/repaso')} onFinish={setSummary} />
}
