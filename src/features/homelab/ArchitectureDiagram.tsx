import { Lock } from 'lucide-react'
import { archEdges, archNodes } from '../../content/architecture'
import type { ArchNode } from '../../content/schema'
import { Icon } from '../../ui/Icon'

const W = 150
const H = 54

/** Zonas de fondo: dónde vive cada pieza. */
const zones = [
  { x: 12, y: 34, w: 500, h: 336, label: 'Ubuntu · host físico' },
  { x: 524, y: 34, w: 224, h: 336, label: 'Tu red local (LAN)' },
  { x: 12, y: 384, w: 736, h: 82, label: 'Próximos niveles', dashed: true },
]

/**
 * Diagrama guiado por datos: nodos y aristas salen de content/architecture.ts.
 * Un nodo se "enciende" cuando su misión está completa.
 */
export function ArchitectureDiagram({ lit }: { lit: Set<string> }) {
  const byId = new Map(archNodes.map((n) => [n.id, n]))

  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-border bg-surface p-2">
      <svg viewBox="0 0 760 476" className="min-w-[620px]" role="img" aria-labelledby="arch-title arch-desc">
        <title id="arch-title">Arquitectura de tu homelab</title>
        <desc id="arch-desc">
          {`${lit.size} de ${archNodes.filter((n) => n.level === 1).length} componentes del Nivel 1 funcionando.`}
        </desc>

        {zones.map((z) => (
          <g key={z.label}>
            <rect
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx={18}
              fill="var(--surface-2)"
              stroke="var(--border)"
              strokeWidth={2}
              strokeDasharray={z.dashed ? '6 6' : undefined}
            />
            <text x={z.x + 14} y={z.y - 8} fontSize={12} fontWeight={800} fill="var(--muted)" letterSpacing="0.06em">
              {z.label.toUpperCase()}
            </text>
          </g>
        ))}

        {archEdges.map((e) => {
          const a = byId.get(e.from)!
          const b = byId.get(e.to)!
          const active = lit.has(a.id) && lit.has(b.id)
          return (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? 'var(--brand)' : 'var(--border)'}
                strokeWidth={active ? 3 : 2}
                strokeDasharray={active ? undefined : '4 6'}
                className={active ? 'edge-active' : undefined}
              />
              {e.label && (
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} fontSize={11} textAnchor="middle" fill="var(--muted)" fontFamily="var(--font-mono)">
                  {e.label}
                </text>
              )}
            </g>
          )
        })}

        {archNodes.map((n) => (
          <Node key={n.id} node={n} on={lit.has(n.id)} />
        ))}
      </svg>
    </div>
  )
}

function Node({ node, on }: { node: ArchNode; on: boolean }) {
  const future = node.level !== 1
  const x = node.x - W / 2
  const y = node.y - H / 2
  const stroke = on ? 'var(--brand)' : future ? 'var(--border)' : 'var(--muted)'
  const fill = on ? 'var(--brand-soft)' : 'var(--surface)'

  return (
    <g opacity={future ? 0.6 : on ? 1 : 0.8}>
      {on && <rect x={x - 4} y={y - 4} width={W + 8} height={H + 8} rx={18} fill="var(--brand)" opacity={0.15} />}
      <rect
        x={x}
        y={y}
        width={W}
        height={H}
        rx={14}
        fill={fill}
        stroke={stroke}
        strokeWidth={on ? 2.5 : 1.5}
        strokeDasharray={on ? undefined : '5 4'}
      />
      {future ? (
        <Lock x={x + 10} y={y + 17} width={20} height={20} color="var(--muted)" aria-hidden />
      ) : (
        <Icon name={node.icon} x={x + 10} y={y + 17} width={20} height={20} color={on ? 'var(--brand)' : 'var(--muted)'} aria-hidden />
      )}
      <text x={x + 38} y={y + 24} fontSize={13} fontWeight={800} fill="var(--fg)">
        {node.label}
      </text>
      {node.sublabel && (
        <text x={x + 38} y={y + 40} fontSize={10.5} fill="var(--muted)">
          {node.sublabel}
        </text>
      )}
    </g>
  )
}
