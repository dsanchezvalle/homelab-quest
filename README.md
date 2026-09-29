# HomeLab Quest

Aprende Docker **implementando Home Assistant de verdad**, con una ruta gamificada al estilo Duolingo.
La app no se limita a darte comandos: te pregunta cuál corresponde, te hace armarlos y te manda a
ejecutarlos en tu Ubuntu con misiones reales que se verifican.

**App:** https://dsanchezvalle.github.io/homelab-quest/ · **Implementación:** repo privado `homelab-ha`

## Qué incluye

- **12 unidades** (Nivel 1): de "¿qué es un contenedor?" a Home Assistant con Compose, TV LG con Wake-on-LAN,
  bombilla RGB y backups probados. Además, vistas previas de los Niveles 1.5 (dashboard), 2 (IR + voz) y 3 (Raspberry Pi).
- **9 tipos de paso:** concepto, flip cards, opción múltiple, emparejar, banco de fichas para armar comandos,
  código con huecos, escribir el comando, misiones reales con verificador de salida y pistas front.
- **Progreso visual:** XP y niveles, racha con heatmap, insignias y el diagrama **Mi Homelab**, que se enciende
  a medida que completas misiones.
- **Repaso:** los errores van a una cola para practicar, y todas las flip cards quedan en un mazo.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router (HashRouter) · Zustand (persist) · Vitest

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # motor + integridad del contenido
npm run typecheck
npm run build
npm run check-links  # verifica online todos los enlaces del contenido
```

## Arquitectura

```text
src/
├── content/          # Los datos del curso (un archivo TS por unidad)
│   ├── schema.ts     # Unión discriminada de tipos de paso
│   ├── config.ts     # Tu usuario de GitHub, rutas y zona horaria de ejemplo
│   ├── architecture.ts / badges.ts
│   └── units/
├── engine/           # Lógica pura y testeada: parser de comandos, calificación, XP, racha, desbloqueos
├── store/            # Zustand + persist (localStorage, con version/migrate)
├── features/         # map · lesson (reproductor + un componente por tipo de paso) · homelab · review · …
└── ui/               # CodeBlock (resaltado propio), Markdown, Button, …
tests/                # engine.test.ts · content-integrity.test.ts · links.online.test.ts
```

### Agregar una lección

1. Edita (o crea) `src/content/units/NN-*.ts` y agrega un objeto `Lesson` con sus `steps`.
2. Convención de IDs: `u<unidad>-l<lección>-<slug>`.
3. `npm test` valida IDs únicos, que cada comando se pueda armar con sus fichas, que cada hueco tenga una respuesta
   válida, que las misiones apunten a nodos del diagrama y que las pistas front apunten a archivos que existen.

## Deploy

Cada push a `main` ejecuta [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): typecheck → tests →
build → GitHub Pages. En el repo: **Settings → Pages → Source: GitHub Actions**.
