import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Target, Trophy, Zap } from 'lucide-react'
import type { Badge, Lesson } from '../../content/schema'
import { Button } from '../../ui/Button'
import { FrontHintCard } from '../../ui/FrontHintCard'
import { Icon } from '../../ui/Icon'
import { ResourceList } from '../../ui/ResourceList'
import type { LessonSummary } from './LessonPlayer'

interface Props {
  lesson?: Lesson
  title: string
  summary: LessonSummary
  badges: Badge[]
  onContinue: () => void
}

export function LessonComplete({ lesson, title, summary, badges, onContinue }: Props) {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 }, disableForReducedMotion: true })
  }, [])

  const accuracy = summary.graded ? Math.round((summary.firstTry / summary.graded) * 100) : 100

  return (
    <div className="min-h-dvh bg-bg">
      <main className="mx-auto max-w-2xl px-4 pt-10 pb-32">
        <div className="text-center">
          <Trophy size={64} className="mx-auto text-xp" aria-hidden />
          <h1 className="mt-3 text-3xl font-black">¡Lección completada!</h1>
          <p className="mt-1 text-muted">{title}</p>
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="XP ganado" value={`+${summary.xp}`} icon={<Zap size={18} fill="currentColor" />} tone="text-xp" />
          <Stat label="Precisión" value={`${accuracy}%`} icon={<Target size={18} />} tone="text-success" />
          <Stat label="Misiones" value={String(summary.missions)} icon={<Trophy size={18} />} tone="text-brand" />
        </dl>

        {badges.length > 0 && (
          <section className="mt-6 rounded-3xl border-2 border-xp/50 bg-warn-soft p-4">
            <h2 className="font-black">Nuevas insignias</h2>
            <ul className="mt-2 grid gap-2">
              {badges.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-xp text-white">
                    <Icon name={b.icon} size={20} aria-hidden />
                  </span>
                  <span>
                    <strong className="block">{b.title}</strong>
                    <span className="text-sm text-muted">{b.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {lesson?.frontHint && (
          <div className="mt-6">
            <FrontHintCard hint={lesson.frontHint} />
          </div>
        )}

        {lesson?.resources && lesson.resources.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 font-black">Para profundizar</h2>
            <ResourceList resources={lesson.resources} />
          </section>
        )}
      </main>
      <footer className="fixed inset-x-0 bottom-0 border-t-2 border-border bg-bg pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-2xl justify-end px-4 py-4">
          <Button onClick={onContinue} className="w-full sm:w-auto sm:min-w-48" autoFocus>
            Continuar
          </Button>
        </div>
      </footer>
    </div>
  )
}

function Stat({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-surface p-3">
      <dt className={`flex items-center justify-center gap-1 text-xs font-extrabold uppercase ${tone}`}>
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-black">{value}</dd>
    </div>
  )
}
