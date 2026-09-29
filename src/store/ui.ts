import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'system' | 'light' | 'dark'

interface UiState {
  theme: Theme
  setTheme: (t: Theme) => void
}

/** Preferencias de interfaz (separadas del progreso: no se exportan). */
export const useUi = create<UiState>()(
  persist((set) => ({ theme: 'system', setTheme: (theme) => set({ theme }) }), {
    name: 'homelab-quest:ui',
    storage: createJSONStorage(() => localStorage),
  }),
)

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
}
