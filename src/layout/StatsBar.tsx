import { Flame, Zap } from 'lucide-react'
import { useStats } from '../store/hooks'

export function StatsBar() {
  const { xp, streak, level } = useStats()
  return (
    <div className="flex items-center gap-2 text-sm font-extrabold">
      <span
        className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 ${streak ? 'text-warn' : 'text-muted'}`}
        title="Racha de días seguidos"
      >
        <Flame size={18} aria-hidden fill={streak ? 'currentColor' : 'none'} /> {streak}
        <span className="sr-only">días de racha</span>
      </span>
      <span className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xp" title="Experiencia">
        <Zap size={18} aria-hidden fill="currentColor" /> {xp}
        <span className="sr-only">XP</span>
      </span>
      <span className="hidden rounded-xl bg-brand-soft px-2 py-1 text-brand sm:inline" title="Nivel">
        Nv {level.number} · {level.title}
      </span>
    </div>
  )
}
