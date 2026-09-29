import type { Unit } from '../schema'
import { md } from '../md'
import { HOMELAB_DIR } from '../config'

/** La implementación de referencia que terminarás commiteando en homelab-ha. */
export const COMPOSE_YAML = md`
  # Home Assistant: implementación de referencia (Nivel 1)
  # Portable: el mismo archivo sirve en Ubuntu (amd64) y en Raspberry Pi (arm64).
  services:
    homeassistant:
      container_name: homeassistant
      image: ghcr.io/home-assistant/home-assistant:\${HA_IMAGE_TAG:-stable}
      volumes:
        - \${CONFIG_DIR:-./homeassistant/config}:/config
        - /etc/localtime:/etc/localtime:ro
        - /run/dbus:/run/dbus:ro
      environment:
        TZ: \${TZ}
      restart: unless-stopped
      stop_grace_period: 60s
      privileged: true
      network_mode: host
`

export const unit07: Unit = {
  id: 'u7',
  order: 7,
  level: 1,
  title: 'Infraestructura como código',
  subtitle: 'De docker run a compose.yaml versionado',
  icon: 'FileCode',
  lessons: [
    {
      id: 'u7-l1',
      title: 'De comando a archivo',
      summary: 'Traducir cada flag a su clave de Compose y parametrizar con .env.',
      steps: [
        {
          id: 'u7-l1-why',
          type: 'concept',
          title: '¿Por qué Compose?',
          body: md`
            Un \`docker run\` de 9 líneas vive en tu historial de bash… hasta que se pierde. Compose convierte el comando en un
            **archivo declarativo**:

            - **Versionado:** está en git, con historial y *diff* de cada cambio.
            - **Reproducible:** \`docker compose up -d\` en otra máquina produce lo mismo.
            - **Idempotente:** si nada cambió, \`up -d\` no hace nada; si cambió algo, recrea solo lo necesario.
            - **Portable:** es la pieza que moverás a la Raspberry Pi.

            | docker run | compose.yaml |
            |---|---|
            | \`--name\` | \`container_name:\` |
            | \`--restart=\` | \`restart:\` |
            | \`-e\` | \`environment:\` |
            | \`-v\` | \`volumes:\` |
            | \`--network=host\` | \`network_mode: host\` |
            | \`--privileged\` | \`privileged: true\` |
            | \`--stop-timeout 60\` | \`stop_grace_period: 60s\` |
          `,
        },
        {
          id: 'u7-l1-match',
          type: 'match',
          prompt: 'Traduce cada flag a su clave de Compose',
          pairs: [
            { left: '--name', right: 'container_name' },
            { left: '--restart', right: 'restart' },
            { left: '-e', right: 'environment' },
            { left: '--network=host', right: 'network_mode: host' },
            { left: '--privileged', right: 'privileged: true' },
          ],
          explanation: 'Casi todo flag de `docker run` tiene su equivalente en Compose. La referencia completa está en la especificación de servicios.',
        },
        {
          id: 'u7-l1-fill',
          type: 'fill-code',
          prompt: 'Completa el compose.yaml de Home Assistant',
          lang: 'yaml',
          template: md`
            services:
              homeassistant:
                container_name: homeassistant
                image: ghcr.io/home-assistant/home-assistant:stable
                volumes:
                  - [[vol]]:/config
                  - /etc/localtime:/etc/localtime:ro
                  - /run/dbus:/run/dbus:ro
                restart: [[restart]]
                stop_grace_period: 60s
                privileged: [[priv]]
                network_mode: [[net]]
                environment:
                  TZ: America/Bogota
          `,
          blanks: [
            { id: 'vol', accept: ['./homeassistant/config', 'homeassistant/config', '~/homelab-ha/homeassistant/config'], placeholder: 'ruta relativa' },
            { id: 'restart', accept: ['unless-stopped'], options: ['no', 'always', 'unless-stopped', 'on-failure'] },
            { id: 'priv', accept: ['true'], options: ['true', 'false'] },
            { id: 'net', accept: ['host'], options: ['bridge', 'host', 'none'] },
          ],
          hint: 'La ruta del volumen puede ser relativa a la carpeta donde está el compose.yaml.',
          explanation: 'Con `./homeassistant/config`, la ruta es **relativa al compose.yaml**: funciona igual donde sea que clones el repo.',
        },
        {
          id: 'u7-l1-relative',
          type: 'choice',
          prompt: '¿Por qué `./homeassistant/config` es mejor que `/home/david/homelab-ha/homeassistant/config` pensando en la Raspberry Pi?',
          options: [
            { id: 'a', text: 'Porque es relativa al compose.yaml: funciona en cualquier máquina y con cualquier usuario.', correct: true },
            { id: 'b', text: 'Porque las rutas absolutas no funcionan en Compose.', feedback: 'Funcionan, pero atan el archivo a un usuario y una máquina concretos.' },
            { id: 'c', text: 'Porque es más rápida.', feedback: 'El rendimiento es idéntico.' },
          ],
          explanation: 'En la Pi quizás tu usuario sea `pi` o el repo esté en otra ruta. Relativa = portable.',
        },
        {
          id: 'u7-l1-env',
          type: 'concept',
          title: 'Variables con .env',
          body: md`
            Compose lee automáticamente el archivo \`.env\` que está junto a \`compose.yaml\` e **interpola** las variables:

            - \`\${TZ}\`: el valor de TZ en .env.
            - \`\${HA_IMAGE_TAG:-stable}\`: el valor de HA_IMAGE_TAG o, si no existe, \`stable\`.

            Así, el mismo \`compose.yaml\` (en git) sirve en varias máquinas con distinto \`.env\` (fuera de git).
            Esta es la versión final que vas a commitear:
          `,
          code: { lang: 'yaml', code: COMPOSE_YAML, caption: 'compose.yaml' },
        },
        {
          id: 'u7-l1-var',
          type: 'fill-code',
          prompt: 'Haz que el tag de la imagen salga de `.env`, con `stable` por defecto',
          lang: 'yaml',
          template: 'image: ghcr.io/home-assistant/home-assistant:${[[var]]:-[[def]]}',
          blanks: [
            { id: 'var', accept: ['HA_IMAGE_TAG'], placeholder: 'VARIABLE', caseSensitive: true },
            { id: 'def', accept: ['stable'], options: ['latest', 'stable', 'dev'] },
          ],
          explanation: '`${VAR:-default}` usa el valor por defecto si la variable no existe o está vacía. Es la misma sintaxis que en bash.',
        },
      ],
      resources: [
        { title: 'Docker Compose overview', url: 'https://docs.docker.com/compose/', kind: 'docs', lang: 'en' },
        { title: 'Compose file: services', url: 'https://docs.docker.com/reference/compose-file/services/', kind: 'docs', lang: 'en' },
        { title: 'Variable interpolation', url: 'https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/', kind: 'docs', lang: 'en' },
        { title: 'Ultimate Docker Compose Tutorial (TechWorld with Nana)', url: 'https://www.youtube.com/watch?v=SXwC9fSwct8', kind: 'video', lang: 'en' },
      ],
    },
    {
      id: 'u7-l2',
      title: 'La migración',
      summary: 'Retirar el contenedor de docker run y dejar el control a Compose.',
      steps: [
        {
          id: 'u7-l2-conflict',
          type: 'choice',
          prompt: '¿Por qué hay que eliminar el contenedor creado con `docker run` **antes** de `docker compose up`?',
          options: [
            { id: 'a', text: 'Porque ambos usan `container_name: homeassistant` y el nombre estaría en conflicto.', correct: true },
            { id: 'b', text: 'Porque Compose no puede usar la misma imagen.', feedback: 'Sí puede: la imagen ya descargada se reutiliza.' },
            { id: 'c', text: 'Porque si no, se borra la configuración.', feedback: 'La configuración está en el bind mount: sobrevive a ambos.' },
          ],
          explanation: 'Borrar el contenedor es seguro: todo lo importante está en `homeassistant/config`. Acabas de aplicar la Unidad 3.',
        },
        {
          id: 'u7-l2-up',
          type: 'type-command',
          prompt: 'Levanta el stack en segundo plano',
          placeholder: 'docker compose …',
          accept: ['docker compose up -d', 'docker compose up --detach'],
          explanation: '`up` crea lo que falta y recrea lo que cambió; `-d` lo deja en segundo plano, igual que en `docker run`.',
        },
        {
          id: 'u7-l2-config',
          type: 'type-command',
          prompt: '¿Qué comando valida el archivo y muestra la configuración final con las variables ya resueltas?',
          placeholder: 'docker compose …',
          accept: ['docker compose config'],
          explanation: '`docker compose config` es tu *linter*: si hay un error de YAML o una variable sin definir, lo verás aquí antes de romper nada.',
        },
        {
          id: 'u7-l2-down',
          type: 'choice',
          prompt: '¿Qué hace `docker compose down` en este stack?',
          options: [
            { id: 'a', text: 'Detiene y elimina el contenedor, pero NO toca tu carpeta config.', correct: true },
            { id: 'b', text: 'Borra la carpeta config.', feedback: 'Los bind mounts nunca se borran con Compose. Ni siquiera `down -v` los toca: `-v` solo afecta a named volumes.' },
            { id: 'c', text: 'Apaga Ubuntu.', feedback: 'Solo afecta a los contenedores del proyecto.' },
            { id: 'd', text: 'Borra la imagen descargada.', feedback: 'La imagen queda en caché (a menos que uses `--rmi`).' },
          ],
          explanation: '`down` + `up -d` es la forma limpia de recrear todo. Tus datos están a salvo en el bind mount.',
        },
        {
          id: 'u7-l2-mission',
          type: 'mission',
          missionId: 'm-compose',
          node: 'compose',
          title: 'Migra a Compose y haz tu primer commit',
          goal: 'Que HA corra desde compose.yaml y que ese archivo quede versionado en homelab-ha.',
          steps: [
            { text: 'Retira el contenedor de `docker run` (tus datos quedan en el bind mount):', code: { lang: 'bash', code: `cd ${HOMELAB_DIR}\ndocker stop homeassistant\ndocker rm homeassistant` } },
            { text: 'Crea `compose.yaml` con este contenido:', code: { lang: 'yaml', code: COMPOSE_YAML, caption: 'compose.yaml' } },
            { text: 'Valida y levanta:', code: { lang: 'bash', code: 'docker compose config\ndocker compose up -d\ndocker compose ps' } },
            { text: 'Abre `http://IP:8123`: tu HA sigue ahí, con el mismo estado. Versiona:', code: { lang: 'bash', code: 'git add compose.yaml\ngit commit -m "feat: desplegar Home Assistant con Docker Compose"\ngit push' } },
          ],
          checklist: [
            'Eliminé el contenedor viejo',
            '`docker compose ps` muestra homeassistant en ejecución',
            'HA conserva su estado en :8123',
            'Hice push de compose.yaml a homelab-ha',
          ],
          verify: {
            instruction: 'Pega la salida de:',
            command: 'docker compose ps',
            patterns: ['homeassistant', '\\b(Up|running)\\b'],
            success: 'Tu infraestructura ya es código. Desde ahora, cualquier cambio pasa por compose.yaml y git.',
            failure: 'No veo homeassistant en ejecución. Revisa `docker compose logs`.',
          },
          commit: { files: ['compose.yaml'], message: 'feat: desplegar Home Assistant con Docker Compose' },
        },
      ],
      resources: [
        { title: 'docker compose (CLI)', url: 'https://docs.docker.com/reference/cli/docker/compose/', kind: 'docs', lang: 'en' },
        { title: 'Docker Compose will BLOW your MIND (NetworkChuck)', url: 'https://www.youtube.com/watch?v=DM65_JyGxCo', kind: 'video', lang: 'en' },
      ],
      frontHint: {
        title: 'Un diagrama SVG guiado por datos',
        body: 'El diagrama de "Mi Homelab" no está dibujado a mano: recorre `architecture.ts` (nodos con x/y, aristas from/to) y pinta cada nodo según si su misión está completa. Las aristas activas animan `stroke-dashoffset` con CSS. Si agregas un nodo, aparece solo.',
        file: 'src/features/homelab/ArchitectureDiagram.tsx',
      },
    },
  ],
}
