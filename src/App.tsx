import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router'
import { AppShell } from './layout/AppShell'
import { MapPage } from './features/map/MapPage'
import { LessonPage } from './features/lesson/LessonPage'
import { HomelabPage } from './features/homelab/HomelabPage'
import { MissionPage } from './features/homelab/MissionPage'
import { ReviewPage } from './features/review/ReviewPage'
import { ReviewSession } from './features/review/ReviewSession'
import { ResourcesPage } from './features/resources/ResourcesPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { applyTheme, useUi } from './store/ui'

/**
 * HashRouter: en GitHub Pages no hay servidor que reescriba rutas, así que
 * /homelab-quest/#/leccion/u1-l1 siempre sirve index.html y el router
 * resuelve el resto en el navegador.
 */
export function App() {
  const theme = useUi((s) => s.theme)
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <HashRouter>
      <Routes>
        {/* Pantallas de foco total, sin navegación */}
        <Route path="/leccion/:lessonId" element={<LessonPage />} />
        <Route path="/repaso/practicar" element={<ReviewSession />} />

        <Route element={<AppShell />}>
          <Route index element={<MapPage />} />
          <Route path="/homelab" element={<HomelabPage />} />
          <Route path="/mision/:missionId" element={<MissionPage />} />
          <Route path="/repaso" element={<ReviewPage />} />
          <Route path="/recursos" element={<ResourcesPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
