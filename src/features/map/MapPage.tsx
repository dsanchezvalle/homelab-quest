import { Link, useNavigate } from 'react-router'
import { Check, Lock, Target } from 'lucide-react'
import { units } from '../../content'
import type { Lesson, Unit } from '../../content/schema'
import { lessonState, unitState, type NodeState } from '../../engine/progression'
import { useStats } from '../../store/hooks'
import { useProgress } from '../../store/progress'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { ProgressBar } from '../../ui/ProgressBar'

/** Desplazamiento horizontal de cada nodo: el zigzag del camino. */
const ZIGZAG = [0, 56, 84, 56, 0, -56, -84, -56]

export function MapPage() {
  const { next, snapshot, level } = useStats()
  const navigate = useNavigate()
  const playable = units.filter((u) => !u.preview)
  const roadmap = units.filter((u) => u.preview)
  const doneLessons = playable.flatMap((u) => u.lessons).filter((l) => snapshot.completedLessons[l.id]).length
  const totalLessons = playable.flatMap((u) => u.lessons).length

  return (
    <div>
      <section className="rounded-3xl border-2 border-border bg-surface p-5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-brand">
          Nivel {level.number} · {level.title}
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight">
          {next ? 'Tu próximo paso' : doneLessons === totalLessons ? '¡Nivel 1 completo!' : 'Elige una lección'}
        </h1>
        {next && (
          <p className="mt-1 text-muted">
            <strong className="text-fg">{next.unit.title}</strong> · {next.lesson.title}
          </p>
        )}
        <ProgressBar value={totalLessons ? doneLessons / totalLessons : 0} className="mt-4" label="Progreso total" />
        <p className="mt-1 text-xs font-bold text-muted">
          {doneLessons}/{totalLessons} lecciones del Nivel 1
        </p>
        {next && (
          <Button className="mt-4 w-full sm:w-auto" onClick={() => navigate(`/leccion/${next.lesson.id}`)}>
            {doneLessons === 0 ? 'Empezar' : 'Continuar'}
          </Button>
        )}
      </section>

      <ol className="mt-8 grid gap-10">
        {playable.map((unit, ui) => (
          <UnitSection key={unit.id} unit={unit} index={ui} nextLessonId={next?.lesson.id} />
        ))}
      </ol>

      {roadmap.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-black">Próximos niveles</h2>
          <p className="text-sm text-muted">Vistas previas de la hoja de ruta. Se abren al terminar el Nivel 1.</p>
          <ol className="mt-4 grid gap-10">
            {roadmap.map((unit, ui) => (
              <UnitSection key={unit.id} unit={unit} index={playable.length + ui} nextLessonId={undefined} />
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

function UnitSection({ unit, index, nextLessonId }: { unit: Unit; index: number; nextLessonId?: string }) {
  const { snapshot } = useStats()
  const state = unitState(snapshot, units, unit)
  const done = unit.lessons.filter((l) => snapshot.completedLessons[l.id]).length
  const locked = state === 'locked'

  return (
    <li>
      <header
        className={`rounded-3xl p-4 text-white shadow-[0_4px_0_rgb(0_0_0/0.15)] ${
          locked ? 'bg-muted' : unit.preview ? 'bg-violet-500' : 'bg-brand'
        }`}
      >
        <p className="text-xs font-extrabold uppercase tracking-wider opacity-85">
          {unit.preview ? `Nivel ${unit.level} · vista previa` : `Unidad ${index + 1}`}
        </p>
        <div className="mt-0.5 flex items-center gap-3">
          <h2 className="flex-1 text-xl font-black leading-tight">{unit.title}</h2>
          <Icon name={unit.icon} size={28} aria-hidden className="shrink-0 opacity-90" />
        </div>
        <p className="mt-0.5 text-sm opacity-90">{unit.subtitle}</p>
        <p className="mt-2 text-xs font-extrabold opacity-90">
          {done}/{unit.lessons.length} lecciones{locked && ' · bloqueada'}
        </p>
      </header>

      <ol className="mt-6 flex flex-col items-center gap-7">
        {unit.lessons.map((lesson, li) => (
          <LessonNode
            key={lesson.id}
            unit={unit}
            lesson={lesson}
            offset={ZIGZAG[(index * 2 + li) % ZIGZAG.length]!}
            isNext={lesson.id === nextLessonId}
          />
        ))}
      </ol>
    </li>
  )
}

function LessonNode({ unit, lesson, offset, isNext }: { unit: Unit; lesson: Lesson; offset: number; isNext: boolean }) {
  const { snapshot } = useStats()
  const missions = useProgress((s) => s.missions)
  const state: NodeState = lessonState(snapshot, units, unit, lesson)
  const mission = lesson.steps.find((s) => s.type === 'mission')
  const missionDone = mission?.type === 'mission' && Boolean(missions[mission.missionId])

  const circle =
    state === 'done'
      ? 'bg-xp text-white shadow-[0_6px_0_#c07d00]'
      : state === 'available'
        ? unit.preview
          ? 'bg-violet-500 text-white shadow-[0_6px_0_#5b21b6]'
          : 'bg-brand text-white shadow-[0_6px_0_var(--brand-strong)]'
        : 'bg-surface-2 text-muted shadow-[0_6px_0_var(--border)]'

  const content = (
    <>
      <span
        className={`relative grid size-[72px] place-items-center rounded-full transition-transform group-hover:scale-105 group-active:translate-y-1 ${circle} ${
          isNext ? 'ring-4 ring-brand/30 ring-offset-4 ring-offset-bg' : ''
        }`}
      >
        {state === 'done' ? (
          <Check size={34} strokeWidth={3} aria-hidden />
        ) : state === 'locked' ? (
          <Lock size={28} aria-hidden />
        ) : (
          <Icon name={unit.icon} size={30} aria-hidden />
        )}
        {mission && (
          <span
            className={`absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-bg ${
              missionDone ? 'bg-success text-white' : 'bg-warn text-white'
            }`}
            title={missionDone ? 'Misión completada' : 'Incluye una misión real'}
          >
            <Target size={14} aria-hidden />
          </span>
        )}
      </span>
      <span className="mt-2 block max-w-44 text-center text-sm font-extrabold leading-tight">{lesson.title}</span>
      {isNext && (
        <span className="animate-bob absolute -top-11 left-1/2 whitespace-nowrap rounded-xl border-2 border-border bg-surface px-3 py-1 text-xs font-black uppercase text-brand shadow">
          Empieza aquí
        </span>
      )}
    </>
  )

  return (
    <li style={{ transform: `translateX(${offset}px)` }}>
      {state === 'locked' ? (
        <div className="relative flex flex-col items-center opacity-80" aria-label={`${lesson.title} (bloqueada)`}>
          {content}
        </div>
      ) : (
        <Link
          to={`/leccion/${lesson.id}`}
          className="group relative flex flex-col items-center"
          aria-label={`${lesson.title}${state === 'done' ? ' (completada)' : ''}`}
        >
          {content}
        </Link>
      )}
    </li>
  )
}
