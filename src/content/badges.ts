import type { Badge } from './schema'

export const badges: Badge[] = [
  { id: 'first-container', title: 'Primer contenedor', description: 'Instalaste Docker y corriste hello-world.', icon: 'Container', when: { kind: 'mission', missionId: 'm-docker-engine' } },
  { id: 'persistent', title: 'Persistente', description: 'Entiendes qué sobrevive a un contenedor.', icon: 'HardDrive', when: { kind: 'unit', unitId: 'u3' } },
  { id: 'networker', title: 'Networker', description: 'Bridge vs host ya no tiene secretos.', icon: 'Network', when: { kind: 'unit', unitId: 'u4' } },
  { id: 'ha-online', title: 'HA en línea', description: 'Home Assistant respondió en :8123.', icon: 'House', when: { kind: 'mission', missionId: 'm-ha-run' } },
  { id: 'compose-master', title: 'Compose Master', description: 'Tu infraestructura vive como código.', icon: 'FileCode', when: { kind: 'mission', missionId: 'm-compose' } },
  { id: 'survivor', title: 'Sobreviviente', description: 'HA volvió solo después de un reboot.', icon: 'Power', when: { kind: 'mission', missionId: 'm-lifecycle' } },
  { id: 'tv-obeys', title: 'La TV obedece', description: 'Encendiste la TV LG desde HA.', icon: 'Tv', when: { kind: 'mission', missionId: 'm-tv' } },
  { id: 'let-there-be-light', title: 'Hágase la luz', description: 'Controlaste la bombilla RGB.', icon: 'Lightbulb', when: { kind: 'mission', missionId: 'm-bulb' } },
  { id: 'backup-hero', title: 'Backup Hero', description: 'Hiciste backup y lo restauraste.', icon: 'Archive', when: { kind: 'mission', missionId: 'm-backup' } },
  { id: 'streak-3', title: 'Constancia', description: '3 días seguidos aprendiendo.', icon: 'Flame', when: { kind: 'streak', days: 3 } },
  { id: 'streak-7', title: 'Semana perfecta', description: '7 días seguidos aprendiendo.', icon: 'CalendarCheck', when: { kind: 'streak', days: 7 } },
  { id: 'xp-500', title: '500 XP', description: 'Medio millar de experiencia.', icon: 'Zap', when: { kind: 'xp', amount: 500 } },
]
