import { units } from '../../content'
import type { Resource } from '../../content/schema'
import { ResourceList } from '../../ui/ResourceList'

function unitResources(unitId: string): Resource[] {
  const unit = units.find((u) => u.id === unitId)!
  const seen = new Set<string>()
  const out: Resource[] = []
  for (const l of unit.lessons) {
    const flipLinks = l.steps.flatMap((s) => (s.type === 'flip' ? s.cards.flatMap((c) => (c.link ? [c.link] : [])) : []))
    for (const r of [...(l.resources ?? []), ...flipLinks]) {
      if (seen.has(r.url)) continue
      seen.add(r.url)
      out.push(r)
    }
  }
  return out
}

export function ResourcesPage() {
  return (
    <div>
      <h1 className="text-2xl font-black">Recursos</h1>
      <p className="text-muted">Documentación oficial, artículos y videos verificados, agrupados por unidad.</p>
      <div className="mt-6 grid gap-8">
        {units.map((u) => {
          const res = unitResources(u.id)
          if (res.length === 0) return null
          return (
            <section key={u.id} aria-labelledby={`res-${u.id}`}>
              <h2 id={`res-${u.id}`} className="mb-3 text-lg font-black">
                {u.title}
              </h2>
              <ResourceList resources={res} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
