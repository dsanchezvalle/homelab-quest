import {
  Activity, Archive, CalendarCheck, Container, Cpu, FileCode, Flame, FolderOpen, FolderTree,
  HardDrive, House, LayoutDashboard, Lightbulb, Mic, Network, Power, Radio, RefreshCw, Rocket,
  Smartphone, Star, Tv, Zap, Fan, Layers, Construction, type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

/** Los datos guardan el icono como string; aquí se resuelve al componente. */
const ICONS: Record<string, ComponentType<LucideProps>> = {
  Activity, Archive, CalendarCheck, Container, Cpu, FileCode, Flame, FolderOpen, FolderTree,
  HardDrive, House, LayoutDashboard, Lightbulb, Mic, Network, Power, Radio, RefreshCw, Rocket,
  Smartphone, Star, Tv, Zap, Fan, Layers, Construction,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? Star
  return <C {...props} />
}
