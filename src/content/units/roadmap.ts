import type { Unit } from '../schema'
import { md } from '../md'

/** Vistas previas de la hoja de ruta: se abren al terminar el Nivel 1. */

export const dashboardUnit: Unit = {
  id: 'r15',
  order: 15,
  level: 1.5,
  preview: true,
  title: 'Tu dashboard',
  subtitle: 'El gran reto front: diseñar la interfaz de tu casa',
  icon: 'LayoutDashboard',
  lessons: [
    {
      id: 'r15-l1',
      title: 'Tres caminos para tu interfaz',
      summary: 'Dashboards nativos, tarjetas propias o un frontend completo.',
      steps: [
        {
          id: 'r15-l1-paths',
          type: 'concept',
          title: 'De menos a más código',
          body: md`
            | Camino | Qué haces | Qué aprendes |
            |---|---|---|
            | **Dashboards nativos** | Vista *Secciones*, tarjetas y modo YAML | Diseño de información y jerarquía |
            | **Tarjetas personalizadas** | Web Components con **Lit** + TypeScript, distribuidos vía HACS | Custom Elements, Shadow DOM y reactividad |
            | **Frontend propio** | Una SPA (React/Vite, como esta) que habla con HA por **WebSocket API** | Estado en tiempo real, autenticación y diseño de producto |

            La recomendación: empezar por el nativo para entender qué necesitas, prototipar una tarjeta propia y solo
            después decidir si vale la pena un frontend completo.
          `,
          callouts: [
            {
              tone: 'warning',
              title: 'Seguridad',
              body: 'Un frontend propio usa un **token de acceso de larga duración**. Nunca lo subas a un repo público ni lo metas en el bundle de una web publicada.',
            },
          ],
        },
        {
          id: 'r15-l1-flip',
          type: 'flip',
          cards: [
            { id: 'r15-flip-sections', front: 'Vista "Secciones"', back: 'El layout moderno de dashboards de HA: una cuadrícula por secciones que se adapta al celular.', link: { title: 'Dashboards', url: 'https://www.home-assistant.io/dashboards/', kind: 'docs', lang: 'en' } },
            { id: 'r15-flip-lit', front: 'Lit', back: 'Una librería mínima para Web Components. El frontend de HA está hecho con Lit, así que tus tarjetas encajan de forma nativa.', link: { title: 'Lit', url: 'https://lit.dev/', kind: 'docs', lang: 'en' } },
            { id: 'r15-flip-ws', front: 'WebSocket API', back: 'Te suscribes a `state_changed` y recibes cada cambio en tiempo real. Es la base de cualquier UI propia.', link: { title: 'WebSocket API', url: 'https://developers.home-assistant.io/docs/api/websocket/', kind: 'docs', lang: 'en' } },
            { id: 'r15-flip-card', front: 'Custom card', back: 'Un elemento `<mi-tarjeta>` que recibe `hass` (el estado) y `config` (tu YAML). HA lo renderiza como cualquier otra tarjeta.', link: { title: 'Custom card', url: 'https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/', kind: 'docs', lang: 'en' } },
          ],
        },
      ],
      resources: [
        { title: 'Dashboards', url: 'https://www.home-assistant.io/dashboards/', kind: 'docs', lang: 'en' },
        { title: 'Custom card (developer docs)', url: 'https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/', kind: 'docs', lang: 'en' },
      ],
    },
  ],
}

export const irVoiceUnit: Unit = {
  id: 'r2',
  order: 16,
  level: 2,
  preview: true,
  title: 'Infrarrojo + voz',
  subtitle: 'Nivel 2: el ventilador con control remoto y asistentes de voz',
  icon: 'Radio',
  lessons: [
    {
      id: 'r2-l1',
      title: 'La arquitectura del Nivel 2',
      summary: 'Qué comprar, cómo aprender comandos IR y cómo exponerlos a la voz.',
      steps: [
        {
          id: 'r2-l1-arch',
          type: 'concept',
          title: 'Del control remoto a "Ok, enciende el ventilador"',
          body: md`
            1. **Hardware:** un hub **Broadlink RM4 mini** (solo IR) o **RM4 pro** (IR + RF 433 MHz, por si algún control es de radio).
            2. **Integración Broadlink** (local): crea una entidad \`remote.…\`.
            3. **Aprender:** \`remote.learn_command\`. Apuntas el control del ventilador al hub y pulsas el botón.
            4. **Enviar:** \`remote.send_command\` repite el código aprendido.
            5. **Modelar:** envuelves los comandos en un **ventilador template** (\`fan.…\`) con encender, apagar y velocidades.
            6. **Voz:** expones la entidad a **Assist** (local), Google Assistant o Alexa (vía Home Assistant Cloud o con una configuración manual).

            Nada cambia en Docker: con la red host, HA ya ve el Broadlink en tu LAN.
          `,
          code: {
            lang: 'yaml',
            caption: 'script de ejemplo (docs de Broadlink)',
            code: md`
              script:
                learn_fan_power:
                  sequence:
                    - action: remote.learn_command
                      target:
                        entity_id: remote.bedroom
                      data:
                        device: fan
                        command: power
            `,
          },
        },
        {
          id: 'r2-l1-flip',
          type: 'flip',
          cards: [
            { id: 'r2-flip-ir-rf', front: 'IR vs RF', back: 'IR necesita línea de vista (como el control de la TV). RF 433 MHz atraviesa paredes. Mira qué usa tu ventilador antes de comprar.' },
            { id: 'r2-flip-template', front: 'Ventilador template', back: 'Una entidad `fan` "virtual" cuyas acciones llaman a tus scripts IR. Para HA y los asistentes de voz es un ventilador real.', link: { title: 'Template', url: 'https://www.home-assistant.io/integrations/template/', kind: 'docs', lang: 'en' } },
            { id: 'r2-flip-assist', front: 'Assist', back: 'El asistente de voz de HA. Puede funcionar 100 % local y entiende español.', link: { title: 'Voice control', url: 'https://www.home-assistant.io/voice_control/', kind: 'docs', lang: 'en' } },
            { id: 'r2-flip-state', front: 'El problema del estado', back: 'El IR es "dispara y olvida": HA no sabe si el ventilador realmente encendió. Un enchufe con medición de consumo puede servir de sensor de verdad.' },
          ],
        },
      ],
      resources: [
        { title: 'Broadlink integration', url: 'https://www.home-assistant.io/integrations/broadlink/', kind: 'docs', lang: 'en' },
        { title: 'Voice control (Assist)', url: 'https://www.home-assistant.io/voice_control/', kind: 'docs', lang: 'en' },
      ],
    },
  ],
}

export const rpiUnit: Unit = {
  id: 'r3',
  order: 17,
  level: 3,
  preview: true,
  title: 'Migración a Raspberry Pi',
  subtitle: 'Nivel 3: hardware dedicado con el mismo compose.yaml',
  icon: 'Cpu',
  lessons: [
    {
      id: 'r3-l1',
      title: 'El plan de migración',
      summary: 'Hardware, la decisión HA OS vs Docker y la mudanza paso a paso.',
      steps: [
        {
          id: 'r3-l1-plan',
          type: 'concept',
          title: 'Tu homelab, en otra máquina',
          body: md`
            **Hardware:** Raspberry Pi 4/5 (4 GB o más), **fuente oficial** y **SSD** (USB 3 en la Pi 4; NVMe con HAT en la Pi 5).
            Evita la microSD para HA: la base de datos la desgasta.

            **Decisión clave:**

            | | Home Assistant OS | Raspberry Pi OS + Docker |
            |---|---|---|
            | Apps (antes *add-ons*) | ✅ | ❌ |
            | Backups y actualizaciones desde la UI | ✅ | Parcial (lo haces tú) |
            | Control y aprendizaje | Menos | **Máximo**: es lo que ya sabes |

            **La mudanza (si sigues con Docker):**
            1. \`./scripts/backup.sh\` en Ubuntu y copia el .tar.gz.
            2. En la Pi: Raspberry Pi OS Lite **64 bits** + Docker Engine (guía para Debian).
            3. \`git clone\` de homelab-ha, crea \`.env\` y ejecuta \`./scripts/restore.sh backups/…\`.
            4. \`docker compose up -d\`: la imagen arm64 se elige sola (multi-arch).
            5. Mueve la reserva DHCP (o cambia la IP en la app) y apaga Ubuntu.
          `,
        },
        {
          id: 'r3-l1-flip',
          type: 'flip',
          cards: [
            { id: 'r3-flip-multiarch', front: '¿Hay que cambiar compose.yaml?', back: 'No. `ghcr.io/home-assistant/home-assistant:stable` es multi-arch: Docker descarga la variante arm64 en la Pi. Por eso usamos rutas relativas y `.env`.' },
            { id: 'r3-flip-sd', front: '¿Por qué no microSD?', back: 'HA escribe historial todo el tiempo. Las microSD tienen ciclos de escritura limitados y fallan sin avisar. Un SSD dura años.' },
            { id: 'r3-flip-debian', front: 'Docker en Raspberry Pi OS', back: 'Raspberry Pi OS está basado en Debian: sigue la guía de Docker Engine **para Debian** (mismo repo oficial, distinta URL).', link: { title: 'Install Docker Engine on Debian', url: 'https://docs.docker.com/engine/install/debian/', kind: 'docs', lang: 'en' } },
          ],
        },
      ],
      resources: [
        { title: 'Home Assistant en Raspberry Pi', url: 'https://www.home-assistant.io/installation/raspberrypi', kind: 'docs', lang: 'en' },
        { title: 'Raspberry Pi: getting started', url: 'https://www.raspberrypi.com/documentation/computers/getting-started.html', kind: 'docs', lang: 'en' },
      ],
    },
  ],
}
