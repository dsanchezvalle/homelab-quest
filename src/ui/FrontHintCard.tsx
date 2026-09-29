import { Code, ExternalLink } from 'lucide-react'
import type { FrontHint } from '../content/schema'
import { QUEST_REPO_URL } from '../content/config'
import { Markdown } from './Markdown'

export function FrontHintCard({ hint }: { hint: FrontHint }) {
  return (
    <aside className="rounded-2xl border-2 border-dashed border-brand/50 bg-brand-soft p-4">
      <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-brand">
        <Code size={16} aria-hidden /> Pista front
      </p>
      <h3 className="mt-1 font-extrabold">{hint.title}</h3>
      <Markdown className="text-sm">{hint.body}</Markdown>
      <a
        href={`${QUEST_REPO_URL}/blob/main/${hint.file}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand underline underline-offset-2"
      >
        {hint.file} <ExternalLink size={12} aria-hidden />
      </a>
    </aside>
  )
}
