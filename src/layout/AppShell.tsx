import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { BookOpen, Brain, House, Map, Settings } from 'lucide-react'
import { StatsBar } from './StatsBar'
import { useProgress } from '../store/progress'

const nav = [
  { to: '/', label: 'Ruta', icon: Map, end: true },
  { to: '/homelab', label: 'Mi Homelab', icon: House },
  { to: '/repaso', label: 'Repaso', icon: Brain },
  { to: '/recursos', label: 'Recursos', icon: BookOpen },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

export function AppShell() {
  const reviewCount = useProgress((s) => s.reviewQueue.length)
  const { pathname } = useLocation()
  // Cada pantalla nueva empieza arriba (el navegador no lo hace solo en una SPA).
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-dvh md:pl-60">
      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r-2 border-border bg-surface px-3 py-5 md:flex">
        <Logo />
        <nav className="mt-6 grid gap-1" aria-label="Principal">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-sm font-extrabold uppercase tracking-wide ${
                  isActive ? 'border-brand/60 bg-brand-soft text-brand' : 'border-transparent text-muted hover:bg-surface-2'
                }`
              }
            >
              <item.icon size={22} aria-hidden />
              {item.label}
              {item.to === '/repaso' && reviewCount > 0 && <Count n={reviewCount} />}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Cabecera */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b-2 border-border bg-bg/90 px-4 py-2 backdrop-blur">
        <div className="md:hidden">
          <Logo compact />
        </div>
        <div className="ml-auto">
          <StatsBar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pt-5 pb-28 md:pb-12">
        <Outlet />
      </main>

      {/* Barra inferior (móvil) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t-2 border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Principal"
      >
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-extrabold uppercase ${
                isActive ? 'text-brand' : 'text-muted'
              }`
            }
          >
            <item.icon size={22} aria-hidden />
            {item.label}
            {item.to === '/repaso' && reviewCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-20px)]">
                <Count n={reviewCount} />
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] leading-5 text-white">
      {n}
      <span className="sr-only"> para repasar</span>
    </span>
  )
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <NavLink to="/" className="flex items-center gap-2 px-2">
      <svg viewBox="0 0 64 64" className="size-8" aria-hidden>
        <rect width="64" height="64" rx="14" fill="var(--brand)" />
        <path d="M32 12 12 28v24h14V38h12v14h14V28z" fill="#fff" />
        <circle cx="32" cy="29" r="4" fill="#18bcf2" />
      </svg>
      <span className={`font-black tracking-tight ${compact ? 'text-lg' : 'text-xl'}`}>
        HomeLab <span className="text-brand">Quest</span>
      </span>
    </NavLink>
  )
}
