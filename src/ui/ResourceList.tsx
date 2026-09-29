import { BookOpen, CirclePlay, ExternalLink, FileText, Wrench } from 'lucide-react'
import type { Resource } from '../content/schema'

const kindIcon = { docs: BookOpen, video: CirclePlay, article: FileText, tool: Wrench }
const kindLabel = { docs: 'Docs', video: 'Video', article: 'Artículo', tool: 'Herramienta' }

export function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <ul className="grid gap-2">
      {resources.map((r) => {
        const I = kindIcon[r.kind]
        return (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 hover:border-brand"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <I size={18} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold leading-snug group-hover:text-brand">{r.title}</span>
                <span className="text-xs text-muted">
                  {kindLabel[r.kind]}
                  {r.lang && ` · ${r.lang === 'es' ? 'Español' : 'Inglés'}`}
                </span>
              </span>
              <ExternalLink size={16} className="shrink-0 text-muted" aria-hidden />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
