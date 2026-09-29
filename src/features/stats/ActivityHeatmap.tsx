import { dayKey } from '../../engine/progression'

const WEEKS = 18
const LEVELS = [0, 1, 20, 50, 100]

function intensity(xp: number): number {
  let lvl = 0
  LEVELS.forEach((min, i) => {
    if (xp >= min && min > 0) lvl = i
  })
  return lvl
}

/**
 * Heatmap tipo GitHub: CSS Grid con 7 filas (lun→dom) y flujo por columnas.
 * Las fechas se calculan en hora local para que la racha no se corte en UTC.
 */
export function ActivityHeatmap({ activity }: { activity: Record<string, number> }) {
  const today = new Date()
  // Empezamos en el lunes de hace WEEKS-1 semanas.
  const start = new Date(today)
  const weekday = (today.getDay() + 6) % 7 // 0 = lunes
  start.setDate(today.getDate() - weekday - (WEEKS - 1) * 7)

  const days: { key: string; xp: number; future: boolean }[] = []
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = dayKey(d)
    days.push({ key, xp: activity[key] ?? 0, future: d > today })
  }
  const activeDays = days.filter((d) => d.xp > 0).length

  return (
    <figure>
      <div
        className="grid grid-flow-col grid-rows-7 gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`Actividad de las últimas ${WEEKS} semanas: ${activeDays} días con práctica`}
      >
        {days.map((d) => {
          const lvl = intensity(d.xp)
          return (
            <span
              key={d.key}
              title={d.future ? undefined : `${d.key}: ${d.xp} XP`}
              className="aspect-square rounded-[3px]"
              style={{
                background: d.future
                  ? 'transparent'
                  : lvl === 0
                    ? 'var(--surface-2)'
                    : `color-mix(in oklab, var(--success) ${25 + lvl * 18}%, var(--surface-2))`,
              }}
            />
          )
        })}
      </div>
      <figcaption className="mt-2 flex items-center justify-between text-xs text-muted">
        <span>Últimas {WEEKS} semanas</span>
        <span className="flex items-center gap-1">
          Menos
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="size-2.5 rounded-[2px]"
              style={{ background: l === 0 ? 'var(--surface-2)' : `color-mix(in oklab, var(--success) ${25 + l * 18}%, var(--surface-2))` }}
            />
          ))}
          Más
        </span>
      </figcaption>
    </figure>
  )
}
