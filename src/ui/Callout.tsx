import { Info, Lightbulb, TriangleAlert } from 'lucide-react'
import type { Callout as CalloutData } from '../content/schema'
import { Markdown } from './Markdown'

const tones = {
  tip: { icon: Lightbulb, cls: 'border-success/40 bg-success-soft', iconCls: 'text-success', label: 'Tip DevOps' },
  warning: { icon: TriangleAlert, cls: 'border-warn/40 bg-warn-soft', iconCls: 'text-warn', label: 'Advertencia' },
  info: { icon: Info, cls: 'border-brand/40 bg-brand-soft', iconCls: 'text-brand', label: 'Nota' },
}

export function Callout({ tone, title, body }: CalloutData) {
  const t = tones[tone]
  const I = t.icon
  return (
    <aside className={`my-3 flex gap-3 rounded-2xl border p-3 ${t.cls}`}>
      <I className={`mt-0.5 shrink-0 ${t.iconCls}`} size={20} aria-hidden />
      <div className="min-w-0 text-sm">
        <p className="font-extrabold">{title ?? t.label}</p>
        <Markdown className="[&_p]:my-1">{body}</Markdown>
      </div>
    </aside>
  )
}
