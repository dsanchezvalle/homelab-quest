/**
 * Reglas de juego puras: XP, niveles, racha y desbloqueos.
 * Sin React ni almacenamiento: se testean con datos planos.
 */
import type { Badge, Lesson, Unit } from '../content/schema'

export const XP = {
  firstTry: 10,
  retry: 5,
  revealed: 0,
  mission: 50,
  review: 2,
} as const

export function xpForStep(attempts: number, revealed: boolean): number {
  if (revealed) return XP.revealed
  return attempts <= 1 ? XP.firstTry : XP.retry
}

export const LEVELS = [
  { min: 0, title: 'Novato' },
  { min: 200, title: 'Contenedorista' },
  { min: 600, title: 'Orquestador' },
  { min: 1100, title: 'Homelabber' },
  { min: 1700, title: 'Arquitecto' },
] as const

export function levelFor(xp: number) {
  let index = 0
  LEVELS.forEach((l, i) => {
    if (xp >= l.min) index = i
  })
  const current = LEVELS[index]!
  const next = LEVELS[index + 1]
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1
  return { index, number: index + 1, title: current.title, next, progress: Math.min(1, Math.max(0, progress)) }
}

/** Fecha local en formato YYYY-MM-DD (la racha es por día local, no UTC). */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Días consecutivos con actividad. La racha sigue viva si hoy todavía no
 * practicaste pero ayer sí.
 */
export function streak(activity: Record<string, number>, today: Date = new Date()): number {
  let cursor = today
  if (!activity[dayKey(cursor)]) cursor = addDays(cursor, -1)
  let count = 0
  while (activity[dayKey(cursor)]) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

export interface ProgressSnapshot {
  completedLessons: Record<string, unknown>
  missions: Record<string, unknown>
  xp: number
  freeMode: boolean
}

export function isLessonDone(p: ProgressSnapshot, lesson: Lesson): boolean {
  return Boolean(p.completedLessons[lesson.id])
}

export function isUnitDone(p: ProgressSnapshot, unit: Unit): boolean {
  return unit.lessons.every((l) => isLessonDone(p, l))
}

export type NodeState = 'locked' | 'available' | 'done'

/** Una unidad se desbloquea cuando la anterior del mismo recorrido está completa. */
export function unitState(p: ProgressSnapshot, units: Unit[], unit: Unit): NodeState {
  if (isUnitDone(p, unit) && unit.lessons.length > 0) return 'done'
  if (p.freeMode) return 'available'
  const playable = units.filter((u) => !u.preview).sort((a, b) => a.order - b.order)
  if (unit.preview) {
    // La hoja de ruta se abre al terminar el Nivel 1.
    return playable.every((u) => isUnitDone(p, u)) ? 'available' : 'locked'
  }
  const idx = playable.findIndex((u) => u.id === unit.id)
  if (idx <= 0) return 'available'
  return isUnitDone(p, playable[idx - 1]!) ? 'available' : 'locked'
}

export function lessonState(p: ProgressSnapshot, units: Unit[], unit: Unit, lesson: Lesson): NodeState {
  if (isLessonDone(p, lesson)) return 'done'
  if (unitState(p, units, unit) === 'locked') return 'locked'
  if (p.freeMode) return 'available'
  const idx = unit.lessons.findIndex((l) => l.id === lesson.id)
  if (idx <= 0) return 'available'
  return isLessonDone(p, unit.lessons[idx - 1]!) ? 'available' : 'locked'
}

/** La próxima lección disponible sin completar (el "EMPEZAR" del mapa). */
export function nextLesson(p: ProgressSnapshot, units: Unit[]) {
  for (const unit of [...units].sort((a, b) => a.order - b.order)) {
    if (unit.preview) continue
    for (const lesson of unit.lessons) {
      if (lessonState(p, units, unit, lesson) === 'available') return { unit, lesson }
    }
  }
  return null
}

export function earnedBadges(
  p: ProgressSnapshot,
  units: Unit[],
  badges: Badge[],
  currentStreak: number,
): string[] {
  return badges
    .filter((b) => {
      const w = b.when
      switch (w.kind) {
        case 'unit': {
          const unit = units.find((u) => u.id === w.unitId)
          return unit ? isUnitDone(p, unit) : false
        }
        case 'mission':
          return Boolean(p.missions[w.missionId])
        case 'xp':
          return p.xp >= w.amount
        case 'streak':
          return currentStreak >= w.days
      }
    })
    .map((b) => b.id)
}
