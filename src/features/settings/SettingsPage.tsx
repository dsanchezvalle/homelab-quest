import { useRef, useState } from 'react'
import { Download, ExternalLink, Monitor, Moon, Sun, Trash2, Upload } from 'lucide-react'
import { QUEST_REPO_URL } from '../../content/config'
import { exportProgress, useProgress } from '../../store/progress'
import { useUi, type Theme } from '../../store/ui'
import { Button } from '../../ui/Button'

const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'system', label: 'Sistema', icon: Monitor },
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
]

export function SettingsPage() {
  const { theme, setTheme } = useUi()
  const freeMode = useProgress((s) => s.freeMode)
  const setFreeMode = useProgress((s) => s.setFreeMode)
  const importData = useProgress((s) => s.importData)
  const reset = useProgress((s) => s.reset)
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  function download() {
    const blob = new Blob([JSON.stringify(exportProgress(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homelab-quest-progreso-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function upload(file: File) {
    try {
      const ok = importData(JSON.parse(await file.text()))
      setMessage(ok ? { ok, text: 'Progreso importado.' } : { ok, text: 'El archivo no tiene el formato esperado.' })
    } catch {
      setMessage({ ok: false, text: 'No pude leer ese archivo como JSON.' })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <h1 className="text-2xl font-black">Ajustes</h1>

      <section className="rounded-3xl border-2 border-border bg-surface p-5">
        <h2 className="font-black">Tema</h2>
        <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-extrabold ${
                theme === t.id ? 'border-brand bg-brand-soft text-brand' : 'border-border hover:bg-surface-2'
              }`}
            >
              <t.icon size={20} aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-border bg-surface p-5">
        <label className="flex items-start justify-between gap-4">
          <span>
            <span className="block font-black">Modo libre</span>
            <span className="text-sm text-muted">Desbloquea todas las unidades, por si ya dominas algún tema o quieres saltar directo a una misión.</span>
          </span>
          <input
            type="checkbox"
            checked={freeMode}
            onChange={(e) => setFreeMode(e.target.checked)}
            className="mt-1 size-6 shrink-0 accent-[var(--brand)]"
          />
        </label>
      </section>

      <section className="rounded-3xl border-2 border-border bg-surface p-5">
        <h2 className="font-black">Tu progreso</h2>
        <p className="text-sm text-muted">
          Se guarda en este navegador (localStorage). Expórtalo para llevarlo a otro dispositivo o como backup: es tu propio{' '}
          <em>bind mount</em>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={download}>
            <Download size={18} aria-hidden /> Exportar
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={18} aria-hidden /> Importar
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void upload(f)
              e.target.value = ''
            }}
          />
          <Button
            variant="danger-ghost"
            onClick={() => {
              if (window.confirm('¿Borrar todo tu progreso? No se puede deshacer (salvo que tengas un export).')) {
                reset()
                setMessage({ ok: true, text: 'Progreso reiniciado.' })
              }
            }}
          >
            <Trash2 size={18} aria-hidden /> Reiniciar
          </Button>
        </div>
        {message && (
          <p role="status" className={`mt-3 text-sm font-bold ${message.ok ? 'text-success' : 'text-danger'}`}>
            {message.text}
          </p>
        )}
      </section>

      <section className="text-sm text-muted">
        <a href={QUEST_REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-brand underline">
          Código fuente en GitHub <ExternalLink size={14} aria-hidden />
        </a>
        <p className="mt-1">HomeLab Quest v{__APP_VERSION__}</p>
      </section>
    </div>
  )
}
