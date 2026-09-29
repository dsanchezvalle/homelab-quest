import type { ArchEdge, ArchNode } from './schema'

/**
 * Diagrama "Mi Homelab". Cada misión ilumina un nodo (MissionStep.node).
 * Coordenadas (centro del nodo) en un viewBox de 760 × 476.
 */
export const archNodes: ArchNode[] = [
  // Host Ubuntu
  { id: 'docker', label: 'Docker Engine', sublabel: 'dockerd', x: 170, y: 95, level: 1, icon: 'Container' },
  { id: 'config', label: '/config', sublabel: 'bind mount', x: 95, y: 210, level: 1, icon: 'FolderOpen' },
  { id: 'ha', label: 'Home Assistant', sublabel: 'puerto 8123', x: 265, y: 210, level: 1, icon: 'House' },
  { id: 'host-net', label: 'Red host', sublabel: 'mDNS · SSDP · WoL', x: 430, y: 210, level: 1, icon: 'Network' },
  { id: 'compose', label: 'compose.yaml', sublabel: 'IaC en git', x: 265, y: 320, level: 1, icon: 'FileCode' },
  { id: 'systemd', label: 'Autoarranque', sublabel: 'unless-stopped', x: 430, y: 320, level: 1, icon: 'Power' },
  { id: 'backup', label: 'Backup', sublabel: 'tar + restore', x: 95, y: 320, level: 1, icon: 'Archive' },
  // Red local
  { id: 'app', label: 'App móvil', sublabel: 'Companion', x: 636, y: 95, level: 1, icon: 'Smartphone' },
  { id: 'tv', label: 'TV LG', sublabel: 'webOS + WoL', x: 636, y: 210, level: 1, icon: 'Tv' },
  { id: 'bulb', label: 'Bombilla RGB', sublabel: 'WiZ / Tuya', x: 636, y: 320, level: 1, icon: 'Lightbulb' },
  // Hoja de ruta
  { id: 'dashboard', label: 'Tu dashboard', sublabel: 'Nivel 1.5', x: 410, y: 95, level: 1.5, icon: 'LayoutDashboard' },
  { id: 'broadlink', label: 'Hub IR', sublabel: 'Nivel 2 · Broadlink', x: 636, y: 425, level: 2, icon: 'Radio' },
  { id: 'voice', label: 'Voz', sublabel: 'Nivel 2 · Assist', x: 430, y: 425, level: 2, icon: 'Mic' },
  { id: 'rpi', label: 'Raspberry Pi', sublabel: 'Nivel 3 · SSD', x: 170, y: 425, level: 3, icon: 'Cpu' },
]

export const archEdges: ArchEdge[] = [
  { from: 'docker', to: 'ha' },
  { from: 'config', to: 'ha', label: '-v' },
  { from: 'ha', to: 'host-net' },
  { from: 'host-net', to: 'tv' },
  { from: 'host-net', to: 'bulb' },
  { from: 'host-net', to: 'app' },
  { from: 'compose', to: 'ha' },
  { from: 'systemd', to: 'ha' },
  { from: 'config', to: 'backup' },
  { from: 'ha', to: 'dashboard' },
  { from: 'host-net', to: 'broadlink' },
  { from: 'broadlink', to: 'voice' },
  { from: 'backup', to: 'rpi' },
]
