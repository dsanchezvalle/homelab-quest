import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { Lock } from 'lucide-react'
import { findLesson, units } from '../../content'
import type { Badge } from '../../content/schema'
import { lessonState } from '../../engine/progression'
import { useBadgeCheck, useStats } from '../../store/hooks'
import { useProgress } from '../../store/progress'
import { LessonComplete } from './LessonComplete'
import { LessonPlayer, type LessonSummary } from './LessonPlayer'

/** El `key` fuerza un estado limpio al pasar de una lección a otra por URL. */
export function LessonPage() {
  const { lessonId = '' } = useParams()
  return <LessonScreen key={lessonId} lessonId={lessonId} />
}

function LessonScreen({ lessonId }: { lessonId: string }) {
  const navigate = useNavigate()
  const found = findLesson(lessonId)
  const { snapshot } = useStats()
  const completeLesson = useProgress((s) => s.completeLesson)
  const checkBadges = useBadgeCheck()
  const [result, setResult] = useState<{ summary: LessonSummary; badges: Badge[] } | null>(null)
  // El estado de bloqueo se evalúa al entrar, no mientras juegas.
  const [initialState] = useState(() => (found ? lessonState(snapshot, units, found.unit, found.lesson) : 'locked'))

  if (!found) return <Navigate to="/" replace />
  const { unit, lesson } = found

  if (initialState === 'locked') {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-4 text-center">
        <div>
          <Lock size={48} className="mx-auto text-muted" aria-hidden />
          <h1 className="mt-3 text-2xl font-black">Lección bloqueada</h1>
          <p className="mt-1 text-muted">Completa las lecciones anteriores o activa el modo libre en Ajustes.</p>
          <Link to="/" className="mt-4 inline-block font-extrabold text-brand underline">
            Volver a la ruta
          </Link>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <LessonComplete
        lesson={lesson}
        title={`${unit.title} · ${lesson.title}`}
        summary={result.summary}
        badges={result.badges}
        onContinue={() => navigate('/')}
      />
    )
  }

  return (
    <LessonPlayer
      key={lesson.id}
      steps={lesson.steps}
      mode="lesson"
      onExit={() => navigate('/')}
      onFinish={(summary) => {
        completeLesson(lesson.id)
        setResult({ summary, badges: checkBadges() })
      }}
    />
  )
}
