import { Link } from 'react-router'
import { ChevronRight, CircleCheck, Target } from 'lucide-react'
import { allMissions } from '../../content'
import { archNodes } from '../../content/architecture'
import { useStats } from '../../store/hooks'
import { useProgress } from '../../store/progress'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { ActivityHeatmap } from '../stats/ActivityHeatmap'
import { BadgeGrid } from '../stats/BadgeGrid'
import { LevelRing } from '../stats/LevelRing'

export function HomelabPage() {
  const missions = useProgress((s) => s.missions)
  const activity = useProgress((s) => s.activity)
  const earned = useProgress((s) => s.badges)
  const { xp, level, streak } = useStats()

  const all = allMissions()
  const lit = new Set(all.filter((m) => missions[m.step.missionId] && m.step.node).map((m) => m.step.node!))
  const level1 = archNodes.filter((n) => n.level === 1)

  return (
    <div className="grid grid-cols-1 gap-8">
      <section>
        <h1 className="text-2xl font-black">Mi Homelab</h1>
        <p className="text-muted">
          Cada misión real enciende una pieza de tu implementación: <strong className="text-fg">{lit.size}</strong> de{' '}
          {level1.length} componentes del Nivel 1 funcionando.
        </p>
        <div className="mt-4">
          <ArchitectureDiagram lit={lit} />
        </div>
      </section>

      <section aria-labelledby="missions-title">
        <h2 id="missions-title" className="text-xl font-black">
          Misiones
        </h2>
        <ul className="mt-3 grid gap-2">
          {all.map(({ step, unit }) => {
            const done = Boolean(missions[step.missionId])
            return (
              <li key={step.missionId}>
                <Link
                  to={`/mision/${step.missionId}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-border bg-surface p-3 hover:border-brand"
                >
                  {done ? (
                    <CircleCheck className="shrink-0 text-success" aria-hidden />
                  ) : (
                    <Target className="shrink-0 text-warn" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold leading-tight">{step.title}</span>
                    <span className="text-xs text-muted">
                      {unit.title}
                      {step.node ? '' : ' · laboratorio'}
                      {done ? ' · completada' : ' · pendiente'}
                    </span>
                  </span>
                  <ChevronRight className="shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="grid gap-6 rounded-3xl border-2 border-border bg-surface p-5 sm:grid-cols-2">
        <LevelRing level={level} xp={xp} />
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Racha</p>
          <p className="text-xl font-black">
            {streak} {streak === 1 ? 'día' : 'días'} seguidos
          </p>
          <div className="mt-2">
            <ActivityHeatmap activity={activity} />
          </div>
        </div>
      </section>

      <section aria-labelledby="badges-title">
        <h2 id="badges-title" className="text-xl font-black">
          Insignias
        </h2>
        <div className="mt-3">
          <BadgeGrid earned={earned} />
        </div>
      </section>
    </div>
  )
}
