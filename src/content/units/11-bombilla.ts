import type { Unit } from '../schema'
import { md } from '../md'

export const SUNSET_AUTOMATION = md`
  alias: Luz cálida al atardecer
  triggers:
    - trigger: sun
      event: sunset
      offset: "-00:15:00"
  actions:
    - action: light.turn_on
      target:
        entity_id: light.bombilla_sala
      data:
        color_temp_kelvin: 2700
        brightness_pct: 60
`

export const unit11: Unit = {
  id: 'u11',
  order: 11,
  level: 1,
  title: 'Bombilla RGB',
  subtitle: 'WiZ o Tuya: local vs nube, color y tu primera escena',
  icon: 'Lightbulb',
  lessons: [
    {
      id: 'u11-l1',
      title: '¿Qué bombilla tienes?',
      summary: 'Identificar el ecosistema y entender local push frente a cloud push.',
      steps: [
        {
          id: 'u11-l1-ecosystems',
          type: 'concept',
          title: 'La app que usaste te dice la integración',
          body: md`
            | Configuraste la bombilla con… | Integración en HA | Tipo |
            |---|---|---|
            | App **WiZ** (Philips WiZ y afines) | **WiZ** | *Local Push*: todo en tu red |
            | App **Smart Life** o **Tuya Smart** (genéricas) | **Tuya** (oficial) | *Cloud Push*: pasa por la nube de Tuya |

            **WiZ:** HA la descubre sola, pero antes tienes que activar **"Allow local communication"** en la app WiZ.

            **Tuya:** la integración oficial se vincula escaneando un **QR** con la app Smart Life, usando tu **User Code**
            (*Yo → ⚙️ → Cuenta y seguridad → User Code*). Depende de internet y de los servidores de Tuya.
          `,
          callouts: [
            { tone: 'info', title: 'Nivel extra (más adelante)', body: 'Para controlar Tuya **en local**, la comunidad mantiene integraciones vía **HACS**. Mejor dejarlo para cuando lo básico funcione.' },
          ],
        },
        {
          id: 'u11-l1-which',
          type: 'choice',
          prompt: 'Configuraste la bombilla con la app **Smart Life**. ¿Qué integración usas en HA?',
          options: [
            { id: 'a', text: 'Tuya', correct: true },
            { id: 'b', text: 'WiZ', feedback: 'WiZ es otro ecosistema, con su propia app.' },
            { id: 'c', text: 'LG webOS', feedback: 'Esa es la de la TV.' },
          ],
          explanation: 'Smart Life y Tuya Smart son la misma plataforma (Tuya). La integración oficial se vincula por QR.',
        },
        {
          id: 'u11-l1-local',
          type: 'choice',
          prompt: '¿Cuál es la diferencia práctica entre **Local Push** (WiZ) y **Cloud Push** (Tuya)?',
          options: [
            { id: 'a', text: 'Local funciona sin internet y responde más rápido; cloud depende de los servidores del fabricante.', correct: true },
            { id: 'b', text: 'Ninguna: ambas pasan por la nube.', feedback: 'WiZ con comunicación local habla directo con HA en tu LAN.' },
            { id: 'c', text: 'Cloud es más seguro porque cifra todo.', feedback: 'Local también puede ser seguro, y además no expone datos a terceros.' },
          ],
          explanation: 'Si se cae internet, WiZ sigue funcionando y Tuya (oficial) no. Tenlo en cuenta al elegir dispositivos nuevos.',
        },
        {
          id: 'u11-l1-match',
          type: 'match',
          prompt: 'Empareja cada pieza con su rol',
          pairs: [
            { left: 'WiZ', right: 'Local Push con autodescubrimiento' },
            { left: 'Tuya', right: 'Cloud Push vinculado por QR' },
            { left: 'HACS', right: 'Tienda de integraciones de la comunidad' },
            { left: 'light.turn_on', right: 'Acción para encender y cambiar color o brillo' },
          ],
          explanation: 'Con cualquier ecosistema, al final tendrás una entidad `light.…` que se controla con las mismas acciones.',
        },
        {
          id: 'u11-l1-flip',
          type: 'flip',
          cards: [
            { id: 'u11-flip-rgb', front: '`rgb_color` vs `color_temp_kelvin`', back: '`rgb_color: [255, 120, 0]` para colores; `color_temp_kelvin: 2700` para blancos (2700 K es cálido y 6500 K, frío).' },
            { id: 'u11-flip-scene', front: 'Escena', back: 'Una "foto" del estado de varias entidades (luz al 30 %, TV encendida…) que activas de un toque o desde una automatización.' },
            { id: 'u11-flip-discovery', front: '¿Por qué WiZ se descubre sola?', back: 'Usa broadcast UDP en la LAN, y HA lo escucha **porque está en red host**. En bridge no la vería.' },
          ],
        },
      ],
      resources: [
        { title: 'WiZ integration', url: 'https://www.home-assistant.io/integrations/wiz/', kind: 'docs', lang: 'en' },
        { title: 'Tuya integration', url: 'https://www.home-assistant.io/integrations/tuya/', kind: 'docs', lang: 'en' },
        { title: 'Light: actions and attributes', url: 'https://www.home-assistant.io/integrations/light/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u11-l2',
      title: 'Hágase la luz',
      summary: 'Integrarla, controlar color y brillo y crear tu primera automatización.',
      steps: [
        {
          id: 'u11-l2-fill',
          type: 'fill-code',
          prompt: 'Enciende la bombilla en naranja al **60 %** de brillo',
          lang: 'yaml',
          template: md`
            action: [[action]]
            target:
              entity_id: light.bombilla_sala
            data:
              rgb_color: [255, 120, 0]
              brightness_pct: [[bri]]
          `,
          blanks: [
            { id: 'action', accept: ['light.turn_on'], options: ['light.turn_off', 'light.turn_on', 'switch.turn_on', 'scene.turn_on'] },
            { id: 'bri', accept: ['60'], placeholder: '0-100' },
          ],
          explanation: '`light.turn_on` también sirve para **cambiar** color o brillo de una luz ya encendida. `brightness_pct` va de 0 a 100.',
        },
        {
          id: 'u11-l2-wiz',
          type: 'choice',
          prompt: 'Tu bombilla WiZ no aparece como descubierta. ¿Qué revisas?',
          options: [
            { id: 'a', text: 'Que "Allow local communication" esté activo en la app WiZ y que HA esté en red host.', correct: true },
            { id: 'b', text: 'Que tengas cuenta en la nube de Tuya.', feedback: 'WiZ no usa Tuya.' },
            { id: 'c', text: 'Que el contenedor tenga `-p 38899:38899`.', feedback: 'En red host no se publican puertos; el problema suele estar en la app WiZ.' },
          ],
          explanation: 'Sin comunicación local, la bombilla ignora a HA. Sin red host, HA no oye el descubrimiento.',
        },
        {
          id: 'u11-l2-mission',
          type: 'mission',
          missionId: 'm-bulb',
          node: 'bulb',
          title: 'Controla tu bombilla RGB',
          goal: 'Integrar la bombilla, cambiar color y brillo desde HA y automatizarla al atardecer.',
          steps: [
            { text: 'Reserva una IP para la bombilla en el router (búscala por su MAC o por su nombre).' },
            { text: '**Si es WiZ:** en la app WiZ, activa *Allow local communication*. En HA, *Dispositivos y servicios* debería mostrarla descubierta. Configúrala.' },
            { text: '**Si es Tuya/Smart Life:** copia tu *User Code* desde la app. En HA, agrega la integración **Tuya**, pega el código y escanea el QR con Smart Life.' },
            { text: 'Prueba color y brillo desde la tarjeta de la luz. Luego crea esta automatización (en modo YAML) ajustando el `entity_id`:', code: { lang: 'yaml', code: SUNSET_AUTOMATION, caption: 'automatización' } },
            { text: 'Versiona:', code: { lang: 'bash', code: 'cd ~/homelab-ha\ngit add homeassistant/config/automations.yaml\ngit commit -m "feat(luz): bombilla RGB y luz cálida al atardecer"\ngit push' } },
          ],
          checklist: [
            'La bombilla aparece como entidad `light.…` en HA',
            'Cambié color y brillo desde HA',
            'Creé la automatización del atardecer',
            'Hice commit de automations.yaml',
          ],
          commit: { files: ['homeassistant/config/automations.yaml'], message: 'feat(luz): bombilla RGB y luz cálida al atardecer' },
        },
      ],
      resources: [
        { title: 'Automation triggers (sun)', url: 'https://www.home-assistant.io/docs/automation/trigger/', kind: 'docs', lang: 'en' },
        { title: 'HACS', url: 'https://hacs.xyz/', kind: 'tool', lang: 'en' },
      ],
      frontHint: {
        title: 'Temas claro y oscuro con tokens',
        body: 'Los colores de la app son variables CSS (`--bg`, `--brand`, …) que Tailwind v4 expone con `@theme inline`. El modo oscuro solo redefine esas variables, ya sea bajo `prefers-color-scheme` o con `data-theme="dark"` en `<html>` si lo eliges en Ajustes. No hace falta un `dark:` en cada clase.',
        file: 'src/index.css',
      },
    },
  ],
}
