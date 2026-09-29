import type { Unit } from '../schema'
import { md } from '../md'

export const unit03: Unit = {
  id: 'u3',
  order: 3,
  level: 1,
  title: 'Persistencia',
  subtitle: 'Bind mounts, named volumes y qué sobrevive a qué',
  icon: 'HardDrive',
  lessons: [
    {
      id: 'u3-l1',
      title: '¿Qué sobrevive?',
      summary: 'El ciclo de vida del contenedor y los dos tipos de volumen.',
      steps: [
        {
          id: 'u3-l1-lifecycle',
          type: 'concept',
          title: 'El ciclo de vida de un contenedor',
          body: md`
            | Acción | Estado | ¿La capa escribible sigue ahí? |
            |---|---|---|
            | \`docker stop\` | detenido (*exited*) | ✅ Sí |
            | Apagar Ubuntu | detenido → vuelve según la *restart policy* | ✅ Sí |
            | \`docker start\` | en ejecución | ✅ Sí |
            | \`docker rm\` | **eliminado** | ❌ No |
            | Actualizar la imagen (rm + run) | contenedor **nuevo** | ❌ No: empieza vacío |

            **Apagar no es borrar.** El problema llega al **recrear** el contenedor, algo que harás en cada actualización.
            Por eso lo importante va en un **volumen**: un directorio que vive fuera del ciclo de vida del contenedor.
          `,
        },
        {
          id: 'u3-l1-shutdown',
          type: 'choice',
          prompt: 'HA corre **sin volúmenes**. Apagas el Ubuntu y, al encenderlo, el contenedor arranca solo por su restart policy. ¿Siguen tus datos?',
          options: [
            { id: 'a', text: 'Sí: el contenedor no se borró, solo se detuvo.', correct: true },
            { id: 'b', text: 'No: apagar el equipo borra los contenedores.', feedback: 'Los contenedores detenidos persisten en disco (/var/lib/docker). Apagar ≠ borrar.' },
          ],
          explanation: 'Sobrevive… **por ahora**. La trampa llega en la siguiente pregunta.',
        },
        {
          id: 'u3-l1-update',
          type: 'choice',
          prompt: 'Sigue sin volúmenes. Actualizas HA: `docker rm` del contenedor viejo y `docker run` con la imagen nueva. ¿Qué pasa con tus automatizaciones?',
          options: [
            { id: 'a', text: 'Se pierden: el contenedor nuevo parte de la imagen limpia.', correct: true },
            { id: 'b', text: 'Docker las migra automáticamente.', feedback: 'Docker no sabe qué datos te importan. Tienes que decírselo con un volumen.' },
            { id: 'c', text: 'Quedan dentro de la imagen nueva.', feedback: 'Las imágenes son inmutables y se construyen en otro lado (en el CI de Home Assistant).' },
          ],
          explanation: 'Por eso todo despliegue serio monta `/config` desde fuera. Contenedor desechable, datos persistentes.',
        },
        {
          id: 'u3-l1-flip',
          type: 'flip',
          title: 'Tres formas de montar datos',
          cards: [
            {
              id: 'u3-flip-bind',
              front: 'Bind mount',
              back: 'Montas **una ruta concreta del host**: `-v ~/homelab-ha/homeassistant/config:/config`. Ves y editas los archivos con cualquier herramienta. Ideal para HA.',
              link: { title: 'Bind mounts', url: 'https://docs.docker.com/engine/storage/bind-mounts/', kind: 'docs', lang: 'en' },
            },
            {
              id: 'u3-flip-volume',
              front: 'Named volume',
              back: 'Docker gestiona el almacenamiento: `-v ha_data:/config`. Vive en `/var/lib/docker/volumes/`. Es cómodo para bases de datos, pero menos transparente.',
              link: { title: 'Volumes', url: 'https://docs.docker.com/engine/storage/volumes/', kind: 'docs', lang: 'en' },
            },
            {
              id: 'u3-flip-tmpfs',
              front: 'tmpfs',
              back: 'Solo en RAM: desaparece al detener el contenedor. Útil para datos temporales o sensibles que no quieres en disco.',
            },
            { id: 'u3-flip-ro', front: 'Sufijo `:ro`', back: 'Monta en **solo lectura**. HA lo usa para `/run/dbus:/run/dbus:ro`: puede leer D-Bus del host, pero no modificar ese directorio.' },
          ],
        },
        {
          id: 'u3-l1-match',
          type: 'match',
          prompt: 'Empareja cada montaje con lo que es',
          pairs: [
            { left: '-v ~/ha/config:/config', right: 'Bind mount' },
            { left: '-v ha_data:/config', right: 'Named volume' },
            { left: ':ro', right: 'Solo lectura' },
            { left: '/var/lib/docker/volumes', right: 'Donde Docker guarda los named volumes' },
          ],
          explanation: 'Regla rápida: si el lado izquierdo empieza con `/`, `./` o `~`, es una ruta del host (bind mount). Si es un nombre suelto, es un named volume.',
        },
        {
          id: 'u3-l1-why-bind',
          type: 'choice',
          prompt: '¿Por qué para Home Assistant preferimos un **bind mount**?',
          options: [
            { id: 'a', text: 'Porque quieres editar los YAML, versionarlos en git y respaldarlos con herramientas normales.', correct: true },
            { id: 'b', text: 'Porque los named volumes no persisten.', feedback: 'Los named volumes sí persisten; solo son menos visibles.' },
            { id: 'c', text: 'Porque HA no soporta named volumes.', feedback: 'Los soporta; es una decisión de operación, no una limitación.' },
          ],
          explanation: 'Con un bind mount, `homeassistant/config` es una carpeta normal dentro de tu repo: se ve, se edita, se versiona y se respalda con `tar`.',
        },
      ],
      resources: [
        { title: 'Docker Volumes explained in 6 minutes (TechWorld with Nana)', url: 'https://www.youtube.com/watch?v=p2PH_YPCsis', kind: 'video', lang: 'en' },
        { title: 'Storage overview', url: 'https://docs.docker.com/engine/storage/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u3-l2',
      title: 'Laboratorio de persistencia',
      summary: 'Compruébalo con tus propias manos usando alpine.',
      steps: [
        {
          id: 'u3-l2-rm',
          type: 'choice',
          prompt: '¿Qué hace `--rm` en `docker run --rm alpine echo hola`?',
          options: [
            { id: 'a', text: 'Borra el contenedor automáticamente cuando termina.', correct: true },
            { id: 'b', text: 'Borra la imagen después de usarla.', feedback: 'La imagen queda en caché; solo se borra el contenedor.' },
            { id: 'c', text: 'Ejecuta el comando en modo remoto.', feedback: 'No tiene que ver con ejecución remota.' },
          ],
          explanation: 'Perfecto para pruebas: no deja contenedores huérfanos. **Nunca** lo uses para HA: querrás que el contenedor persista entre reinicios.',
        },
        {
          id: 'u3-l2-fill',
          type: 'fill-code',
          prompt: 'Monta la carpeta del laboratorio para que el archivo sobreviva al contenedor',
          lang: 'bash',
          template: "docker run --rm -v [[host]]:[[container]] alpine sh -c 'echo hola > /datos/nota.txt'",
          blanks: [
            { id: 'host', accept: ['~/lab-persistencia', '$HOME/lab-persistencia'], placeholder: 'ruta del host' },
            { id: 'container', accept: ['/datos'], placeholder: 'ruta en el contenedor' },
          ],
          hint: 'Formato `-v HOST:CONTENEDOR`. El comando escribe en /datos y queremos verlo en ~/lab-persistencia.',
          explanation: 'El lado izquierdo es tu host y el derecho, el contenedor. El orden importa, igual que en `-p HOST:CONTENEDOR`.',
        },
        {
          id: 'u3-l2-mission',
          type: 'mission',
          missionId: 'm-lab-persistence',
          title: 'Laboratorio: prueba la persistencia',
          goal: 'Comprobar con tus propias manos qué se pierde y qué sobrevive.',
          steps: [
            {
              text: '**Sin volumen:** escribe un archivo, borra el contenedor y comprueba que el archivo desapareció.',
              code: {
                lang: 'bash',
                code: md`
                  docker run --name efimero alpine sh -c 'echo secreto > /tmp/x.txt'
                  docker ps -a --filter name=efimero   # existe, detenido (Exited)
                  docker diff efimero                  # la capa escribible: A /tmp/x.txt
                  docker rm efimero                    # adiós contenedor… y adiós x.txt
                `,
              },
            },
            {
              text: '**Con bind mount:** el archivo queda en tu host.',
              code: {
                lang: 'bash',
                code: md`
                  mkdir -p ~/lab-persistencia
                  docker run --rm -v ~/lab-persistencia:/datos alpine sh -c 'echo "hola desde el contenedor" > /datos/nota.txt'
                  cat ~/lab-persistencia/nota.txt
                `,
              },
            },
            {
              text: '**Con named volume:** Docker decide dónde guardarlo.',
              code: {
                lang: 'bash',
                code: md`
                  docker volume create lab-vol
                  docker run --rm -v lab-vol:/datos alpine sh -c 'echo persistente > /datos/n.txt'
                  docker run --rm -v lab-vol:/datos alpine cat /datos/n.txt
                  docker volume inspect lab-vol   # mira "Mountpoint"
                `,
              },
            },
            { text: 'Limpia:', code: { lang: 'bash', code: 'docker volume rm lab-vol\nrm -rf ~/lab-persistencia' } },
          ],
          checklist: [
            'Vi que sin volumen el archivo se pierde con `docker rm`',
            'Leí nota.txt desde mi host (bind mount)',
            'Encontré el Mountpoint del named volume',
          ],
          verify: {
            instruction: 'Antes de limpiar, pega la salida de:',
            command: 'cat ~/lab-persistencia/nota.txt',
            patterns: ['hola desde el contenedor'],
            success: 'El contenedor ya no existe (usaste --rm) y el archivo sigue ahí. Eso es persistencia.',
            failure: 'No veo el texto esperado. ¿Corriste el docker run con -v ~/lab-persistencia:/datos?',
          },
        },
        {
          id: 'u3-l2-ls',
          type: 'type-command',
          prompt: '¿Qué comando lista los **named volumes**?',
          placeholder: 'docker …',
          accept: ['docker volume ls', 'docker volume list'],
          explanation: '`docker volume ls`. Los bind mounts no aparecen aquí: para Docker son solo rutas del host.',
        },
      ],
      resources: [
        { title: 'Bind mounts', url: 'https://docs.docker.com/engine/storage/bind-mounts/', kind: 'docs', lang: 'en' },
        { title: 'Volumes', url: 'https://docs.docker.com/engine/storage/volumes/', kind: 'docs', lang: 'en' },
      ],
      frontHint: {
        title: 'Tu progreso también tiene un "volumen"',
        body: 'La SPA guarda tu progreso con `zustand/middleware/persist` en `localStorage`. El store tiene `version` y `migrate`: si mañana cambia la forma de los datos, la migración los transforma en lugar de perderlos. Es la misma idea que un bind mount que sobrevive a la imagen nueva.',
        file: 'src/store/progress.ts',
      },
    },
  ],
}
