import { badges } from '../../content/badges'
import { Icon } from '../../ui/Icon'

export function BadgeGrid({ earned }: { earned: Record<string, string> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {badges.map((b) => {
        const has = Boolean(earned[b.id])
        return (
          <li
            key={b.id}
            className={`flex flex-col items-center rounded-2xl border-2 p-3 text-center ${
              has ? 'border-xp/60 bg-warn-soft' : 'border-border bg-surface opacity-60'
            }`}
          >
            <span className={`grid size-12 place-items-center rounded-full ${has ? 'bg-xp text-white' : 'bg-surface-2 text-muted'}`}>
              <Icon name={b.icon} size={24} aria-hidden />
            </span>
            <strong className="mt-2 text-sm leading-tight">{b.title}</strong>
            <span className="mt-0.5 text-xs text-muted">{b.description}</span>
            <span className="sr-only">{has ? 'Obtenida' : 'Pendiente'}</span>
          </li>
        )
      })}
    </ul>
  )
}
