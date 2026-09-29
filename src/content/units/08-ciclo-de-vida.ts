import type { Unit } from '../schema'
import { md } from '../md'
import { HOMELAB_DIR } from '../config'

export const unit08: Unit = {
  id: 'u8',
  order: 8,
  level: 1,
  title: 'Ciclo de vida',
  subtitle: 'Parar, arrancar, sobrevivir a reinicios y actualizar',
  icon: 'RefreshCw',
  lessons: [
    {
      id: 'u8-l1',
      title: 'Parar, arrancar, sobrevivir',
      summary: 'Qué hace cada comando de Compose y qué pasa al reiniciar Ubuntu.',
      steps: [
        {
          id: 'u8-l1-commands',
          type: 'concept',
          title: 'Los verbos de Compose',
          body: md`
            | Comando | Contenedor | Cuándo usarlo |
            |---|---|---|
            | \`docker compose stop\` | Se detiene, **no** se borra | Mantenimiento corto |
            | \`docker compose start\` | Arranca el existente | Después de un \`stop\` |
            | \`docker compose restart\` | stop + start | Aplicar cambios de configuration.yaml |
            | \`docker compose down\` | Se detiene **y se elimina** | Recrear desde cero |
            | \`docker compose up -d\` | Crea o actualiza según el archivo | Tras editar compose.yaml o cambiar la imagen |

            **Al reiniciar Ubuntu:** systemd arranca \`docker.service\`; el daemon revisa los contenedores y relanza los que
            tienen \`restart: unless-stopped\` (salvo que los hayas detenido a mano). No necesitas ningún script propio.
          `,
          callouts: [
            { tone: 'warning', title: 'Advertencia', body: '`restart` **no** relee compose.yaml. Si cambiaste el archivo (imagen, volúmenes, variables), usa `docker compose up -d`.' },
          ],
        },
        {
          id: 'u8-l1-match',
          type: 'match',
          prompt: 'Empareja cada comando con su efecto',
          pairs: [
            { left: 'compose stop', right: 'Detiene sin borrar' },
            { left: 'compose start', right: 'Arranca el contenedor existente' },
            { left: 'compose down', right: 'Detiene y elimina el contenedor' },
            { left: 'compose up -d', right: 'Crea o recrea según el archivo' },
          ],
          explanation: 'Regla mental: `stop`/`start` conservan el contenedor; `down`/`up` lo recrean. Tus datos están a salvo en ambos casos.',
        },
        {
          id: 'u8-l1-apply',
          type: 'choice',
          prompt: 'Editaste `configuration.yaml`. ¿Cómo aplicas el cambio?',
          options: [
            { id: 'a', text: 'Validar la configuración y reiniciar HA (desde la UI o con `docker compose restart`).', correct: true },
            { id: 'b', text: '`docker compose down -v` y `up -d`.', feedback: 'Innecesario y `-v` borraría named volumes si los tuvieras. Nunca uses -v "por las dudas".' },
            { id: 'c', text: '`docker compose pull`.', feedback: 'Eso descarga una imagen nueva; no tiene que ver con tu YAML.' },
          ],
          explanation: 'configuration.yaml vive en el bind mount: HA lo relee al reiniciarse. No hace falta recrear el contenedor.',
        },
        {
          id: 'u8-l1-enabled',
          type: 'type-command',
          prompt: '¿Qué comando confirma que el servicio de Docker arranca con el sistema?',
          placeholder: 'systemctl …',
          accept: ['systemctl is-enabled docker', 'systemctl is-enabled docker.service', 'sudo systemctl is-enabled docker'],
          explanation: 'En Ubuntu, Docker queda habilitado al instalarlo. Si alguna vez dice `disabled`: `sudo systemctl enable docker.service containerd.service`.',
        },
        {
          id: 'u8-l1-restart',
          type: 'type-command',
          prompt: 'Reinicia solo Home Assistant usando Compose',
          placeholder: 'docker compose …',
          accept: ['docker compose restart', 'docker compose restart homeassistant'],
          explanation: 'Con un solo servicio da igual nombrarlo, pero `docker compose restart homeassistant` es más explícito cuando sumes más servicios (por ejemplo, un broker MQTT).',
        },
      ],
      resources: [
        { title: 'Start containers automatically', url: 'https://docs.docker.com/engine/containers/start-containers-automatically/', kind: 'docs', lang: 'en' },
        { title: 'docker compose (CLI)', url: 'https://docs.docker.com/reference/cli/docker/compose/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u8-l2',
      title: 'Actualizar sin miedo',
      summary: 'pull, up -d, fijar versiones, volver atrás y limpiar.',
      steps: [
        {
          id: 'u8-l2-flow',
          type: 'concept',
          title: 'El flujo de actualización',
          body: md`
            1. **Backup** (Unidad 12) y lee las *release notes*: busca los *breaking changes*.
            2. \`docker compose pull\`: descarga la imagen nueva, sin tocar lo que está corriendo.
            3. \`docker compose up -d\`: como la imagen cambió, recrea el contenedor con la nueva.
            4. Revisa \`docker compose logs -f\` y la sección *Reparaciones* de HA.
            5. \`docker image prune\`: limpia las imágenes viejas sin etiqueta.

            **Fijar versión:** con \`HA_IMAGE_TAG=2026.9.4\` en tu .env, actualizas **cuando tú decides**. Para volver atrás,
            vuelves al tag anterior y ejecutas \`up -d\`. Eso es un *rollback* en una línea.
          `,
        },
        {
          id: 'u8-l2-build',
          type: 'build-command',
          prompt: 'Arma la actualización en una línea: descargar y, **solo si eso funciona**, recrear',
          chips: ['docker compose pull', '&&', 'docker compose up -d'],
          distractors: ['docker compose down -v', '||', ';', 'docker rm -f homeassistant'],
          mode: 'exact',
          hint: '`&&` ejecuta el segundo comando solo si el primero termina bien; `;` lo ejecuta siempre.',
          explanation: 'Si el `pull` falla (sin red, tag inexistente), el `&&` evita recrear el contenedor y HA sigue funcionando con la versión actual.',
        },
        {
          id: 'u8-l2-pin',
          type: 'choice',
          prompt: '¿Por qué conviene fijar `HA_IMAGE_TAG=2026.9.4` en lugar de `stable`?',
          options: [
            { id: 'a', text: 'Actualizas cuando decides y puedes volver atrás cambiando el tag.', correct: true },
            { id: 'b', text: 'Porque `stable` no recibe parches de seguridad.', feedback: '`stable` siempre apunta a la última estable; el problema es que cambia sin avisarte.' },
            { id: 'c', text: 'Porque las versiones fijas ocupan menos disco.', feedback: 'Pesan lo mismo.' },
          ],
          explanation: 'Con `stable`, un `pull` inocente puede traer una versión mayor con *breaking changes*. Con un tag fijo, el cambio es explícito, queda en git y es reversible.',
        },
        {
          id: 'u8-l2-prune',
          type: 'choice',
          prompt: '`docker image prune` (sin `-a`) borra…',
          options: [
            { id: 'a', text: 'Imágenes "dangling": sin tag y sin uso (las que quedaron huérfanas tras un pull).', correct: true },
            { id: 'b', text: 'Todas las imágenes, incluida la que usa HA.', feedback: 'Nunca borra imágenes en uso por un contenedor.' },
            { id: 'c', text: 'Los volúmenes sin uso.', feedback: 'Eso es `docker volume prune`.' },
          ],
          explanation: 'Con `-a` borra además todas las imágenes sin contenedores asociados. `docker system df` te muestra cuánto espacio vas a recuperar.',
        },
        {
          id: 'u8-l2-flip',
          type: 'flip',
          cards: [
            { id: 'u8-flip-grace', front: '`stop_grace_period: 60s`', back: 'Tiempo que Docker espera entre SIGTERM y SIGKILL. Con 60 s HA cierra su base de datos limpio.' },
            { id: 'u8-flip-logs', front: '`docker compose logs -f`', back: 'Los logs de todos los servicios del proyecto, sin tener que recordar nombres de contenedor.' },
            { id: 'u8-flip-df', front: '`docker system df`', back: 'Resumen del disco usado por imágenes, contenedores, volúmenes y caché. Clave en una Raspberry con SSD pequeño.' },
          ],
        },
        {
          id: 'u8-l2-mission',
          type: 'mission',
          missionId: 'm-lifecycle',
          node: 'systemd',
          title: 'Simulacro de reboot y actualización',
          goal: 'Demostrar que HA sobrevive a un reinicio del equipo y que sabes actualizarlo.',
          steps: [
            { text: 'Confirma el autoarranque y reinicia el equipo:', code: { lang: 'bash', code: 'systemctl is-enabled docker\nsudo reboot' } },
            { text: 'Al volver, **sin hacer nada más**, comprueba:', code: { lang: 'bash', code: `uptime -p\ncd ${HOMELAB_DIR}\ndocker compose ps` } },
            { text: 'Simulacro de actualización y limpieza:', code: { lang: 'bash', code: 'docker compose pull && docker compose up -d\ndocker compose logs --tail 50\ndocker image prune -f\ndocker system df' } },
          ],
          checklist: [
            'Tras el reboot, HA volvió solo',
            'Ejecuté pull + up -d sin errores',
            'Limpié las imágenes huérfanas',
          ],
          verify: {
            instruction: 'Justo después del reboot, pega la salida de:',
            command: "uptime -p && docker ps --format '{{.Names}} {{.Status}}'",
            patterns: ['^up\\s', 'homeassistant\\s+Up'],
            success: 'Ubuntu acaba de arrancar y HA ya está arriba sin que lo tocaras. Resiliencia comprobada.',
            failure: 'Espero ver `up …` (uptime) y `homeassistant Up …`. Revisa la política de reinicio y `systemctl is-enabled docker`.',
          },
        },
      ],
      resources: [
        { title: 'Home Assistant Container: updating', url: 'https://www.home-assistant.io/common-tasks/container/', kind: 'docs', lang: 'en' },
        { title: 'docker image prune', url: 'https://docs.docker.com/reference/cli/docker/image/prune/', kind: 'docs', lang: 'en' },
        { title: 'Home Assistant blog (release notes)', url: 'https://www.home-assistant.io/blog/', kind: 'article', lang: 'en' },
      ],
      frontHint: {
        title: 'Un heatmap de actividad con CSS Grid',
        body: 'El calendario de racha es un `grid` con `grid-auto-flow: column` y 7 filas (días de la semana). Cada celda toma la intensidad de un mapa `YYYY-MM-DD → XP` del store y la convierte en opacidad. Las fechas se calculan en hora local, no en UTC, para que la racha no se corte a las 7 p. m.',
        file: 'src/features/stats/ActivityHeatmap.tsx',
      },
    },
  ],
}
