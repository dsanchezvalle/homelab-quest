import type { levelFor } from '../../engine/progression'

export function LevelRing({ level, xp }: { level: ReturnType<typeof levelFor>; xp: number }) {
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="size-24 shrink-0 -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--xp)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - level.progress)}
          className="transition-[stroke-dashoffset] duration-700"
        />
        <text x="50" y="50" transform="rotate(90 50 50)" textAnchor="middle" dominantBaseline="central" fontSize="30" fontWeight="900" fill="var(--fg)">
          {level.number}
        </text>
      </svg>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Nivel {level.number}</p>
        <p className="text-xl font-black">{level.title}</p>
        <p className="text-sm text-muted">
          {xp} XP{level.next ? ` · faltan ${level.next.min - xp} para ${level.next.title}` : ' · nivel máximo'}
        </p>
      </div>
    </div>
  )
}
