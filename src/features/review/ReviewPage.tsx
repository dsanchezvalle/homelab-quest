import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Brain } from 'lucide-react'
import { allFlipCards, units } from '../../content'
import { unitState } from '../../engine/progression'
import { useStats } from '../../store/hooks'
import { useProgress } from '../../store/progress'
import { Button } from '../../ui/Button'
import { FlipCard } from '../lesson/FlipCard'

export function ReviewPage() {
  const queue = useProgress((s) => s.reviewQueue)
  const navigate = useNavigate()
  const { snapshot } = useStats()
  const [unitFilter, setUnitFilter] = useState('all')

  const open = new Set(units.filter((u) => unitState(snapshot, units, u) !== 'locked').map((u) => u.id))
  const cards = allFlipCards().filter((c) => open.has(c.unit.id) && (unitFilter === 'all' || c.unit.id === unitFilter))

  return (
    <div className="grid grid-cols-1 gap-8">
      <section className="rounded-3xl border-2 border-border bg-surface p-5">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-danger-soft text-danger">
            <Brain size={28} aria-hidden />
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-black">Repaso</h1>
            <p className="text-muted">
              {queue.length === 0
                ? 'No tienes errores pendientes. Cuando falles una pregunta, aparecerá aquí.'
                : `Tienes ${queue.length} ${queue.length === 1 ? 'pregunta' : 'preguntas'} para reforzar. Cada acierto la saca de la cola (+2 XP).`}
            </p>
          </div>
        </div>
        {queue.length > 0 && (
          <Button className="mt-4 w-full sm:w-auto" onClick={() => navigate('/repaso/practicar')}>
            Practicar {queue.length}
          </Button>
        )}
      </section>

      <section aria-labelledby="deck-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="deck-title" className="text-xl font-black">
              Mazo de conceptos
            </h2>
            <p className="text-sm text-muted">Las flip cards de las unidades que ya abriste.</p>
          </div>
          <label className="text-sm font-bold">
            <span className="sr-only">Filtrar por unidad</span>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="rounded-xl border-2 border-border bg-surface px-3 py-2"
            >
              <option value="all">Todas las unidades</option>
              {units
                .filter((u) => open.has(u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {cards.length === 0 ? (
          <p className="mt-4 text-muted">Aún no hay tarjetas disponibles.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {cards.map((c) => (
              <FlipCard key={c.id} card={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
