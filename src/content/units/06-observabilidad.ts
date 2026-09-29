import type { Unit } from '../schema'
import { md } from '../md'

export const unit06: Unit = {
  id: 'u6',
  order: 6,
  level: 1,
  title: 'Observabilidad',
  subtitle: 'ps, logs, inspect, stats y exec: mirar dentro sin miedo',
  icon: 'Activity',
  lessons: [
    {
      id: 'u6-l1',
      title: 'Mirar dentro',
      summary: 'La caja de herramientas para saber qué está pasando.',
      steps: [
        {
          id: 'u6-l1-toolkit',
          type: 'concept',
          title: 'Tu caja de herramientas',
          body: md`
            | Comando | Para qué |
            |---|---|
            | \`docker ps\` / \`docker ps -a\` | Contenedores en ejecución / todos (también los detenidos) |
            | \`docker logs -f -n 100 homeassistant\` | Últimas 100 líneas del log y seguir en vivo |
            | \`docker inspect homeassistant\` | Toda la configuración real en JSON (red, montajes, política…) |
            | \`docker inspect -f '{{…}}'\` | Extraer un solo campo con plantillas Go |
            | \`docker stats\` | CPU, RAM, red y disco en vivo |
            | \`docker exec -it homeassistant sh\` | Abrir una shell **dentro** del contenedor |
            | \`docker system df\` | Cuánto disco usan imágenes, contenedores y volúmenes |
          `,
          callouts: [
            { tone: 'tip', title: 'Tip DevOps', body: 'Ante cualquier problema, el orden es: **¿está vivo?** (`ps -a`) → **¿qué dice?** (`logs`) → **¿cómo está configurado?** (`inspect`).' },
          ],
        },
        {
          id: 'u6-l1-psa',
          type: 'type-command',
          prompt: 'Muestra **todos** los contenedores, incluidos los detenidos',
          placeholder: 'docker …',
          accept: ['docker ps -a', 'docker container ls -a', 'docker ps --all'],
          explanation: 'Sin `-a` solo ves los que están corriendo. Un contenedor que se cayó al arrancar solo aparece con `-a`.',
        },
        {
          id: 'u6-l1-logs',
          type: 'build-command',
          prompt: 'Sigue los logs de HA en vivo, empezando por las últimas 100 líneas',
          chips: ['docker', 'logs', '-f', '-n 100', 'homeassistant'],
          distractors: ['-a', 'exec', '--rm'],
          mode: 'docker',
          explanation: '`-f` (*follow*) se queda escuchando y `-n 100` (alias de `--tail 100`) evita que te inunden miles de líneas antiguas.',
        },
        {
          id: 'u6-l1-inspect',
          type: 'fill-code',
          prompt: 'Extrae la **política de reinicio** del contenedor con una plantilla Go',
          lang: 'bash',
          template: "docker inspect -f '{{.HostConfig.[[field]].Name}}' homeassistant",
          blanks: [{ id: 'field', accept: ['RestartPolicy'], options: ['NetworkMode', 'RestartPolicy', 'Binds', 'Privileged'], caseSensitive: true }],
          explanation: '`docker inspect` devuelve JSON; `-f` navega con la sintaxis de plantillas Go. `.HostConfig.NetworkMode`, `.HostConfig.Binds` y `.HostConfig.Privileged` son otros campos útiles.',
        },
        {
          id: 'u6-l1-stats',
          type: 'choice',
          prompt: '`docker stats` sirve para…',
          options: [
            { id: 'a', text: 'Ver en vivo el consumo de CPU, RAM, red y disco de cada contenedor.', correct: true },
            { id: 'b', text: 'Ver estadísticas de descargas de la imagen en el registry.', feedback: 'Eso no lo muestra el CLI.' },
            { id: 'c', text: 'Reiniciar contenedores que usan demasiada memoria.', feedback: 'Solo observa; no actúa.' },
          ],
          explanation: 'Útil para dimensionar la Raspberry Pi: si HA usa ~500 MB en Ubuntu, una Pi con 4 GB tiene margen de sobra.',
        },
        {
          id: 'u6-l1-exec',
          type: 'choice',
          prompt: '¿Qué hace `docker exec -it homeassistant sh`?',
          options: [
            { id: 'a', text: 'Abre una shell interactiva dentro del contenedor ya en ejecución.', correct: true },
            { id: 'b', text: 'Crea un contenedor nuevo con una shell.', feedback: 'Eso sería `docker run -it`. `exec` entra en uno existente.' },
            { id: 'c', text: 'Ejecuta `sh` en el host con permisos del contenedor.', feedback: 'Es al revés: ejecuta dentro del contenedor.' },
          ],
          explanation: '`-i` mantiene abierta la entrada estándar y `-t` asigna una terminal. Todo lo que cambies ahí (salvo en /config) se pierde al recrear el contenedor.',
        },
      ],
      resources: [
        { title: 'docker container logs', url: 'https://docs.docker.com/reference/cli/docker/container/logs/', kind: 'docs', lang: 'en' },
        { title: 'docker inspect', url: 'https://docs.docker.com/reference/cli/docker/inspect/', kind: 'docs', lang: 'en' },
        { title: 'docker container exec', url: 'https://docs.docker.com/reference/cli/docker/container/exec/', kind: 'docs', lang: 'en' },
        { title: 'Format command and log output', url: 'https://docs.docker.com/engine/cli/formatting/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u6-l2',
      title: 'Diagnóstico',
      summary: 'Qué hacer cuando algo no arranca.',
      steps: [
        {
          id: 'u6-l2-down',
          type: 'choice',
          prompt: 'HA no carga en :8123 y `docker ps` no lo muestra. ¿Cuál es tu **primer** paso?',
          options: [
            { id: 'a', text: '`docker ps -a` y `docker logs homeassistant` para ver por qué salió.', correct: true },
            { id: 'b', text: 'Reinstalar Docker.', feedback: 'Demasiado drástico sin diagnóstico. Casi nunca es Docker.' },
            { id: 'c', text: 'Borrar la carpeta config y empezar de cero.', feedback: '¡Nunca como primer paso! Es tu estado importante.' },
          ],
          explanation: 'Los logs de un contenedor detenido siguen disponibles mientras el contenedor exista. Por eso no conviene `--rm` en servicios.',
        },
        {
          id: 'u6-l2-restarting',
          type: 'choice',
          prompt: '`docker ps` muestra `Restarting (1) 5 seconds ago` una y otra vez. ¿Qué significa?',
          options: [
            { id: 'a', text: 'El proceso falla al arrancar y la política de reinicio lo relanza en bucle.', correct: true },
            { id: 'b', text: 'Se está actualizando solo.', feedback: 'Docker nunca actualiza imágenes por sí mismo.' },
            { id: 'c', text: 'Todo bien: así funciona `unless-stopped`.', feedback: 'Un contenedor sano muestra `Up …`, no `Restarting`.' },
          ],
          explanation: 'El `(1)` es el código de salida. Mira `docker logs homeassistant`: suele ser un error de YAML o un permiso en /config.',
        },
        {
          id: 'u6-l2-check',
          type: 'fill-code',
          prompt: 'Valida la configuración de HA **desde dentro** del contenedor antes de reiniciar',
          lang: 'bash',
          template: 'docker [[cmd]] homeassistant python -m homeassistant --script check_config --config /config',
          blanks: [{ id: 'cmd', accept: ['exec'], options: ['run', 'exec', 'start', 'attach'] }],
          explanation: 'Así atrapas un error de YAML **antes** de reiniciar y quedarte sin HA. Es el equivalente a un "test" de tu configuración.',
        },
        {
          id: 'u6-l2-mission',
          type: 'mission',
          missionId: 'm-inspect',
          node: 'host-net',
          title: 'Audita tu contenedor',
          goal: 'Confirmar con `inspect` que la red, el reinicio y los privilegios son los que decidiste.',
          steps: [
            { text: 'Consulta los tres campos clave en una sola línea:', code: { lang: 'bash', code: "docker inspect -f '{{.HostConfig.RestartPolicy.Name}} {{.HostConfig.NetworkMode}} {{.HostConfig.Privileged}}' homeassistant" } },
            { text: 'Mira el consumo (una sola lectura):', code: { lang: 'bash', code: 'docker stats --no-stream homeassistant' } },
            { text: 'Entra, explora `/config` y sal:', code: { lang: 'bash', code: 'docker exec -it homeassistant sh\nls /config\nexit' } },
          ],
          expected: { lang: 'text', code: 'unless-stopped host true' },
          checklist: ['La política es unless-stopped', 'La red es host', 'Entré con exec y vi /config'],
          verify: {
            instruction: 'Pega la salida del primer comando:',
            command: "docker inspect -f '{{.HostConfig.RestartPolicy.Name}} {{.HostConfig.NetworkMode}} {{.HostConfig.Privileged}}' homeassistant",
            patterns: ['unless-stopped', '\\bhost\\b', '\\btrue\\b'],
            success: 'Configuración auditada: resiliente, con red host y con acceso a hardware.',
            failure: 'Espero `unless-stopped host true`. Si algo difiere, recrea el contenedor con el comando de la Unidad 5.',
          },
        },
      ],
      resources: [
        { title: 'Home Assistant Container: common tasks', url: 'https://www.home-assistant.io/common-tasks/container/', kind: 'docs', lang: 'en' },
        { title: 'docker container stats', url: 'https://docs.docker.com/reference/cli/docker/container/stats/', kind: 'docs', lang: 'en' },
      ],
      frontHint: {
        title: 'Un parser pequeño y testeado',
        body: 'Para aceptar `docker logs -n 100 -f x` y `docker logs -f --tail 100 x` como equivalentes, `commandParser.ts` tokeniza, resuelve alias y ordena las opciones. Es lógica pura (sin React), así que se prueba con Vitest en `tests/engine.test.ts`. Separar la lógica de la UI es lo que la hace testeable.',
        file: 'src/engine/commandParser.ts',
      },
    },
  ],
}
