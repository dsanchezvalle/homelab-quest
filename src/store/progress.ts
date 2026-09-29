/**
 * Progreso del jugador, persistido en localStorage.
 *
 * Igual que el /config de Home Assistant vive en un bind mount para
 * sobrevivir al contenedor, tu progreso vive en localStorage para
 * sobrevivir a recargas. `version` + `migrate` permiten cambiar la forma
 * del estado sin perder lo que ya tienes.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { XP, dayKey, xpForStep } from '../engine/progression'

export interface StepRecord {
  attempts: number
  revealed: boolean
  xp: number
  completedAt: string
}

export interface ProgressData {
  xp: number
  steps: Record<string, StepRecord>
  completedLessons: Record<string, { completedAt: string }>
  missions: Record<string, { completedAt: string }>
  /** IDs de pasos que fallaste y conviene repasar. */
  reviewQueue: string[]
  /** XP ganado por día (YYYY-MM-DD). Alimenta la racha y el heatmap. */
  activity: Record<string, number>
  badges: Record<string, string>
  freeMode: boolean
}

interface ProgressActions {
  completeStep: (stepId: string, attempts: number, revealed: boolean) => number
  markForReview: (stepId: string) => void
  completeReview: (stepId: string, correct: boolean) => number
  completeLesson: (lessonId: string) => void
  completeMission: (missionId: string) => number
  awardBadges: (ids: string[]) => string[]
  setFreeMode: (on: boolean) => void
  importData: (data: unknown) => boolean
  reset: () => void
}

export type ProgressState = ProgressData & ProgressActions

export const initialProgress: ProgressData = {
  xp: 0,
  steps: {},
  completedLessons: {},
  missions: {},
  reviewQueue: [],
  activity: {},
  badges: {},
  freeMode: false,
}

const now = () => new Date().toISOString()

function addActivity(activity: Record<string, number>, xp: number) {
  const key = dayKey(new Date())
  return { ...activity, [key]: (activity[key] ?? 0) + Math.max(xp, 1) }
}

export function isProgressData(value: unknown): value is ProgressData {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.xp === 'number' &&
    typeof v.steps === 'object' &&
    typeof v.completedLessons === 'object' &&
    typeof v.missions === 'object' &&
    Array.isArray(v.reviewQueue) &&
    typeof v.activity === 'object'
  )
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      completeStep: (stepId, attempts, revealed) => {
        // El XP se gana una sola vez por paso; repetir lecciones es práctica.
        if (get().steps[stepId]) {
          set((s) => ({ activity: addActivity(s.activity, 0) }))
          return 0
        }
        const xp = xpForStep(attempts, revealed)
        set((s) => ({
          xp: s.xp + xp,
          steps: { ...s.steps, [stepId]: { attempts, revealed, xp, completedAt: now() } },
          activity: addActivity(s.activity, xp),
        }))
        return xp
      },

      markForReview: (stepId) =>
        set((s) => (s.reviewQueue.includes(stepId) ? s : { reviewQueue: [...s.reviewQueue, stepId] })),

      completeReview: (stepId, correct) => {
        if (!correct) return 0
        set((s) => ({
          xp: s.xp + XP.review,
          reviewQueue: s.reviewQueue.filter((id) => id !== stepId),
          activity: addActivity(s.activity, XP.review),
        }))
        return XP.review
      },

      completeLesson: (lessonId) =>
        set((s) =>
          s.completedLessons[lessonId]
            ? s
            : { completedLessons: { ...s.completedLessons, [lessonId]: { completedAt: now() } } },
        ),

      completeMission: (missionId) => {
        if (get().missions[missionId]) return 0
        set((s) => ({
          xp: s.xp + XP.mission,
          missions: { ...s.missions, [missionId]: { completedAt: now() } },
          activity: addActivity(s.activity, XP.mission),
        }))
        return XP.mission
      },

      awardBadges: (ids) => {
        const fresh = ids.filter((id) => !get().badges[id])
        if (fresh.length) {
          const stamp = now()
          set((s) => ({ badges: { ...s.badges, ...Object.fromEntries(fresh.map((id) => [id, stamp])) } }))
        }
        return fresh
      },

      setFreeMode: (on) => set({ freeMode: on }),

      importData: (data) => {
        if (!isProgressData(data)) return false
        set({ ...initialProgress, ...data })
        return true
      },

      reset: () => set({ ...initialProgress }),
    }),
    {
      name: 'homelab-quest:progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): ProgressData => ({
        xp: s.xp,
        steps: s.steps,
        completedLessons: s.completedLessons,
        missions: s.missions,
        reviewQueue: s.reviewQueue,
        activity: s.activity,
        badges: s.badges,
        freeMode: s.freeMode,
      }),
      // Cuando cambie la forma del estado: subir `version` y transformar aquí.
      migrate: (persisted) => ({ ...initialProgress, ...(persisted as Partial<ProgressData>) }),
    },
  ),
)

/** Datos exportables (sin funciones). */
export function exportProgress(): ProgressData {
  const s = useProgress.getState()
  return {
    xp: s.xp,
    steps: s.steps,
    completedLessons: s.completedLessons,
    missions: s.missions,
    reviewQueue: s.reviewQueue,
    activity: s.activity,
    badges: s.badges,
    freeMode: s.freeMode,
  }
}
