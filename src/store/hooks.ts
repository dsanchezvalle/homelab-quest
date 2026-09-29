import { useCallback, useMemo } from 'react'
import { units } from '../content'
import { badges } from '../content/badges'
import { earnedBadges, levelFor, nextLesson, streak } from '../engine/progression'
import { useProgress } from './progress'

/** Métricas derivadas del progreso (no se guardan: se calculan). */
export function useStats() {
  const xp = useProgress((s) => s.xp)
  const activity = useProgress((s) => s.activity)
  const completedLessons = useProgress((s) => s.completedLessons)
  const missions = useProgress((s) => s.missions)
  const freeMode = useProgress((s) => s.freeMode)

  return useMemo(() => {
    const snapshot = { xp, completedLessons, missions, freeMode }
    return {
      xp,
      level: levelFor(xp),
      streak: streak(activity),
      next: nextLesson(snapshot, units),
      snapshot,
    }
  }, [xp, activity, completedLessons, missions, freeMode])
}

/** Evalúa y otorga insignias; devuelve las recién ganadas. */
export function useBadgeCheck() {
  return useCallback(() => {
    const s = useProgress.getState()
    const ids = earnedBadges(
      { xp: s.xp, completedLessons: s.completedLessons, missions: s.missions, freeMode: s.freeMode },
      units,
      badges,
      streak(s.activity),
    )
    const fresh = s.awardBadges(ids)
    return badges.filter((b) => fresh.includes(b.id))
  }, [])
}
