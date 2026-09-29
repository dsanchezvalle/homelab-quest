import type { Unit } from '../schema'
import { md } from '../md'

export const TV_AUTOMATION = md`
  alias: Encender TV LG con Wake-on-LAN
  description: webOS pide encender la TV → enviamos el magic packet
  triggers:
    - trigger: webostv.turn_on
      entity_id: media_player.lg_webos_tv
  actions:
    - action: wake_on_lan.send_magic_packet
      data:
        mac: aa:bb:cc:dd:ee:ff
`

export const unit10: Unit = {
  id: 'u10',
  order: 10,
  level: 1,
  title: 'TV LG webOS',
  subtitle: 'Integración local y encendido con Wake-on-LAN',
  icon: 'Tv',
  lessons: [
    {
      id: 'u10-l1',
      title: 'Preparar la TV',
      summary: 'Por qué encender es distinto de controlar, y qué activar en la TV.',
      steps: [
        {
          id: 'u10-l1-two-problems',
          type: 'concept',
          title: 'Dos problemas distintos',
          body: md`
            **1. Controlar la TV encendida** (volumen, apps, entradas, apagar): lo hace la integración **LG webOS TV**.
            HA la descubre por **SSDP** y se conecta a su API local. La primera vez, la TV te pide aceptar el emparejamiento.

            **2. Encenderla:** una TV apagada **no escucha su API**, solo espera un **magic packet de Wake-on-LAN**
            dirigido a su MAC. Por eso se combinan:

            - el disparador **"Device is requested to turn on"** (\`webostv.turn_on\`) de la integración webOS, y
            - la acción \`wake_on_lan.send_magic_packet\`.

            Así, el botón de encendido de la tarjeta de la TV en HA dispara tu automatización de WoL.
          `,
        },
        {
          id: 'u10-l1-why',
          type: 'choice',
          prompt: '¿Por qué la integración webOS no puede encender la TV por sí sola?',
          options: [
            { id: 'a', text: 'Apagada, la TV no expone su API de red; solo responde al magic packet de WoL.', correct: true },
            { id: 'b', text: 'Porque LG cobra por esa función.', feedback: 'Es una limitación técnica, no comercial.' },
            { id: 'c', text: 'Porque HA no tiene permisos de administrador.', feedback: 'No es un tema de permisos: la TV literalmente no escucha.' },
          ],
          explanation: 'El magic packet lo recibe la tarjeta de red, que queda alimentada en standby. Por eso hay que activar esa opción en la TV.',
        },
        {
          id: 'u10-l1-settings',
          type: 'concept',
          title: 'Qué activar en la TV',
          body: md`
            Según la documentación de HA (los nombres del menú varían con la versión de webOS y el idioma):

            - **LG Connect Apps**, en la configuración de *Red* (en modelos antiguos se llama *Mobile App*). Permite el control por red.
            - **Encendido por red**:
              - Modelos 2017 en adelante: *Settings → General → Mobile TV On → **Turn On Via WiFi***.
              - Modelos 2025 en adelante: *Settings → Support → IP control settings → **Wake on LAN***.

            Anota la **MAC** de la TV (*Configuración → Soporte/General → Información de la TV*, o en tu router) y
            **resérvale una IP** por DHCP.
          `,
          callouts: [
            {
              tone: 'tip',
              title: 'Tip DevOps',
              body: 'La documentación recomienda conectar la TV por **Ethernet** para que Wake-on-LAN sea fiable. Por Wi-Fi, muchas TVs apagan la radio en standby.',
            },
          ],
        },
        {
          id: 'u10-l1-which',
          type: 'choice',
          multiple: true,
          prompt: '¿Qué ajustes activas en la TV? (marca todas)',
          options: [
            { id: 'a', text: 'LG Connect Apps (o Mobile App en modelos antiguos)', correct: true },
            { id: 'b', text: 'Turn On Via WiFi / Wake on LAN', correct: true },
            { id: 'c', text: 'Actualizaciones automáticas de apps', feedback: 'No tiene relación con el control desde HA.' },
            { id: 'd', text: 'Modo tienda (demo)', feedback: 'El modo tienda solo sirve para exhibición.' },
          ],
          explanation: 'Uno habilita el control por red cuando la TV está encendida; el otro, que se despierte con el magic packet.',
        },
        {
          id: 'u10-l1-flip',
          type: 'flip',
          cards: [
            { id: 'u10-flip-magic', front: 'Magic packet', back: '6 bytes `FF` seguidos de la **MAC repetida 16 veces**, enviados por **broadcast UDP** (normalmente al puerto 9). La tarjeta de red lo reconoce aunque la TV esté "apagada".' },
            { id: 'u10-flip-pairing', front: 'Emparejamiento', back: 'La primera conexión muestra un aviso en la TV. Al aceptarlo, HA guarda una clave en `.storage`, que es otro motivo para respaldar esa carpeta.' },
            { id: 'u10-flip-subnet', front: '¿Y si la TV está en otra red?', back: 'El broadcast no cruza routers ni VLANs sin configuración especial. HA (en red host) y la TV deben estar en el **mismo segmento**.' },
          ],
        },
        {
          id: 'u10-l1-mac',
          type: 'type-command',
          prompt: 'Después de hacer `ping` a la TV, ¿qué comando muestra su MAC en la tabla de vecinos de Ubuntu?',
          placeholder: 'ip …',
          accept: ['ip neigh', 'ip neighbor', 'ip neigh show', 'ip neighbour', 'arp -a', 'arp -n'],
          explanation: '`ip neigh` lista IP → MAC de los equipos con los que Ubuntu habló hace poco. Por eso primero haces `ping`.',
        },
      ],
      resources: [
        { title: 'LG webOS TV integration', url: 'https://www.home-assistant.io/integrations/webostv/', kind: 'docs', lang: 'en' },
        { title: 'Wake on LAN integration', url: 'https://www.home-assistant.io/integrations/wake_on_lan/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u10-l2',
      title: 'Integrar y encender',
      summary: 'Emparejar la TV y crear la automatización de encendido.',
      steps: [
        {
          id: 'u10-l2-fill',
          type: 'fill-code',
          prompt: 'Completa la automatización de encendido (usa la MAC de ejemplo `aa:bb:cc:dd:ee:ff`)',
          lang: 'yaml',
          template: md`
            alias: Encender TV LG con Wake-on-LAN
            triggers:
              - trigger: [[trigger]]
                entity_id: media_player.lg_webos_tv
            actions:
              - action: [[action]]
                data:
                  mac: [[mac]]
          `,
          blanks: [
            { id: 'trigger', accept: ['webostv.turn_on'], options: ['webostv.turn_on', 'state', 'time', 'media_player.turn_on'] },
            { id: 'action', accept: ['wake_on_lan.send_magic_packet'], options: ['media_player.turn_on', 'wake_on_lan.send_magic_packet', 'webostv.turn_on', 'light.turn_on'] },
            { id: 'mac', accept: ['aa:bb:cc:dd:ee:ff'], placeholder: 'MAC' },
          ],
          explanation: 'Disparador: la TV "pide" encenderse. Acción: el magic packet a su MAC. En tu casa, cambia la MAC y el `entity_id` por los reales.',
        },
        {
          id: 'u10-l2-bridge',
          type: 'choice',
          prompt: '¿Por qué este Wake-on-LAN funciona en tu setup y fallaría con HA en red bridge?',
          options: [
            { id: 'a', text: 'Porque el broadcast UDP no sale de la red bridge de Docker hacia tu LAN.', correct: true },
            { id: 'b', text: 'Porque en bridge no existe el protocolo UDP.', feedback: 'UDP existe, pero el broadcast queda confinado a la red de Docker.' },
            { id: 'c', text: 'Da igual el tipo de red.', feedback: 'Es justo el caso donde más importa. Repasa la Unidad 4.' },
          ],
          explanation: 'Aquí se juntan la teoría de la Unidad 4 y la práctica real.',
        },
        {
          id: 'u10-l2-wifi',
          type: 'choice',
          prompt: 'La automatización se dispara, pero la TV no enciende. Está conectada por Wi-Fi. ¿Qué es lo más efectivo?',
          options: [
            { id: 'a', text: 'Conectarla por Ethernet y confirmar que el ajuste de encendido por red está activo.', correct: true },
            { id: 'b', text: 'Enviar el magic packet 100 veces.', feedback: 'Si la radio está apagada, no importa cuántos envíes.' },
            { id: 'c', text: 'Cambiar la política de reinicio del contenedor.', feedback: 'No tiene relación con la TV.' },
          ],
          explanation: 'La documentación de HA recomienda Ethernet para WoL. Si no es posible, prueba con `broadcast_address` apuntando al broadcast de tu red (p. ej. `192.168.1.255`).',
        },
        {
          id: 'u10-l2-mission',
          type: 'mission',
          missionId: 'm-tv',
          node: 'tv',
          title: 'Controla y enciende tu TV LG',
          goal: 'Tener la TV integrada en HA y poder encenderla desde la app.',
          steps: [
            { text: 'En la TV: activa **LG Connect Apps** y **Turn On Via WiFi / Wake on LAN**. Anota su MAC y resérvale una IP en el router.' },
            { text: 'En HA: **Ajustes → Dispositivos y servicios**. Si la TV aparece descubierta, configúrala; si no, agrega *LG webOS TV* con su IP. **Acepta el aviso en la TV.**' },
            { text: 'Agrega la integración **Wake on LAN** desde la interfaz (te pedirá la MAC).' },
            { text: 'Crea la automatización: *Ajustes → Automatizaciones → Crear → Editar en YAML*, pega esto y ajusta MAC y entidad:', code: { lang: 'yaml', code: TV_AUTOMATION, caption: 'automatización' } },
            { text: 'Prueba: apaga la TV con el control, espera un minuto y enciéndela desde la tarjeta de la TV en HA (o desde la app).' },
            { text: 'Versiona: las automatizaciones creadas en la interfaz viven en `automations.yaml`:', code: { lang: 'bash', code: 'cd ~/homelab-ha\ngit add homeassistant/config/automations.yaml\ngit commit -m "feat(tv): encender TV LG con Wake-on-LAN"\ngit push' } },
          ],
          checklist: [
            'La TV aparece en HA y puedo cambiar volumen o apagarla',
            'Wake on LAN está configurado con la MAC correcta',
            'Encendí la TV apagada desde HA',
            'Hice commit de automations.yaml',
          ],
          commit: { files: ['homeassistant/config/automations.yaml'], message: 'feat(tv): encender TV LG con Wake-on-LAN' },
        },
      ],
      resources: [
        { title: 'LG webOS TV: turn on action', url: 'https://www.home-assistant.io/integrations/webostv/', kind: 'docs', lang: 'en' },
        { title: 'Automations', url: 'https://www.home-assistant.io/docs/automation/', kind: 'docs', lang: 'en' },
      ],
      frontHint: {
        title: 'Rellenar código sin romper el layout',
        body: 'El editor con huecos parte el template con `split(/\\[\\[(\\w+)\\]\\]/)`: los índices pares son texto y los impares, IDs de hueco. Cada hueco mide `N ch` según la respuesta más larga, y `white-space: pre-wrap` mantiene la indentación del YAML y a la vez permite partir líneas en el celular.',
        file: 'src/features/lesson/steps/FillCodeStepView.tsx',
      },
    },
  ],
}
