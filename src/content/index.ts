import type { FlipCardData, Lesson, MissionStep, Step, Unit } from './schema'
import { unit01 } from './units/01-fundamentos'
import { unit02 } from './units/02-terreno'
import { unit03 } from './units/03-persistencia'
import { unit04 } from './units/04-redes'
import { unit05 } from './units/05-docker-run'
import { unit06 } from './units/06-observabilidad'
import { unit07 } from './units/07-compose'
import { unit08 } from './units/08-ciclo-de-vida'
import { unit09 } from './units/09-onboarding'
import { unit10 } from './units/10-tv-lg'
import { unit11 } from './units/11-bombilla'
import { unit12 } from './units/12-backups'
import { dashboardUnit, irVoiceUnit, rpiUnit } from './units/roadmap'

export const units: Unit[] = [
  unit01, unit02, unit03, unit04, unit05, unit06, unit07, unit08, unit09, unit10, unit11, unit12,
  dashboardUnit, irVoiceUnit, rpiUnit,
].sort((a, b) => a.order - b.order)

export interface StepRef {
  unit: Unit
  lesson: Lesson
  step: Step
}

const lessonIndex = new Map<string, { unit: Unit; lesson: Lesson }>()
const stepIndex = new Map<string, StepRef>()
for (const unit of units) {
  for (const lesson of unit.lessons) {
    lessonIndex.set(lesson.id, { unit, lesson })
    for (const step of lesson.steps) stepIndex.set(step.id, { unit, lesson, step })
  }
}

export const findLesson = (lessonId: string) => lessonIndex.get(lessonId)
export const findStep = (stepId: string) => stepIndex.get(stepId)

export function allMissions(): (StepRef & { step: MissionStep })[] {
  return [...stepIndex.values()].filter((r): r is StepRef & { step: MissionStep } => r.step.type === 'mission')
}

export function findMission(missionId: string) {
  return allMissions().find((m) => m.step.missionId === missionId)
}

export function allFlipCards(): (FlipCardData & { unit: Unit })[] {
  return [...stepIndex.values()].flatMap((r) => (r.step.type === 'flip' ? r.step.cards.map((c) => ({ ...c, unit: r.unit })) : []))
}
