import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { ArrowLeft, CircleCheck, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'
import { findMission } from '../../content'
import { useBadgeCheck } from '../../store/hooks'
import { useProgress } from '../../store/progress'
import { Button } from '../../ui/Button'
import { MissionStepView } from '../lesson/steps/MissionStepView'

/** Una misión fuera de su lección: para completarla cuando de verdad la hagas. */
export function MissionPage() {
  const { missionId = '' } = useParams()
  const found = findMission(missionId)
  const done = useProgress((s) => Boolean(s.missions[missionId]))
  const completeMission = useProgress((s) => s.completeMission)
  const checkBadges = useBadgeCheck()
  const [ready, setReady] = useState(false)
  const [gained, setGained] = useState(0)

  if (!found) return <Navigate to="/homelab" replace />

  function complete() {
    const xp = completeMission(missionId)
    setGained(xp)
    checkBadges()
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.8 }, disableForReducedMotion: true })
  }

  return (
    <div>
      <Link to="/homelab" className="mb-4 inline-flex items-center gap-1 text-sm font-extrabold text-brand">
        <ArrowLeft size={16} aria-hidden /> Mi Homelab
      </Link>
      <p className="text-xs font-bold text-muted">
        {found.unit.title} · {found.lesson.title}
      </p>
      <MissionStepView step={found.step} done={done} onReadyChange={setReady} />
      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {done ? (
          <p className="inline-flex items-center gap-2 font-extrabold text-success" role="status">
            <CircleCheck aria-hidden /> Misión completada
            {gained > 0 && (
              <span className="inline-flex items-center gap-1 text-xp">
                <Zap size={16} fill="currentColor" aria-hidden />+{gained} XP
              </span>
            )}
          </p>
        ) : (
          <Button variant="success" disabled={!ready} onClick={complete}>
            Completar misión
          </Button>
        )}
      </div>
    </div>
  )
}
