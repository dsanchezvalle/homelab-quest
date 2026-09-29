import type { Unit } from '../schema'
import { md } from '../md'
import { CONFIG_DIR, EXAMPLE_TZ, HA_IMAGE, HOMELAB_DIR } from '../config'

export const HA_RUN_COMMAND = md`
  docker run -d \\
    --name homeassistant \\
    --privileged \\
    --restart=unless-stopped \\
    -e TZ=${EXAMPLE_TZ} \\
    -v ${CONFIG_DIR}:/config \\
    -v /run/dbus:/run/dbus:ro \\
    --network=host \\
    ${HA_IMAGE}
`

export const unit05: Unit = {
  id: 'u5',
  order: 5,
  level: 1,
  title: 'Desplegar HA con docker run',
  subtitle: 'El comando oficial, flag por flag',
  icon: 'Rocket',
  lessons: [
    {
      id: 'u5-l1',
      title: 'Flag por flag',
      summary: 'Qué hace cada parámetro del comando oficial y por qué está ahí.',
      steps: [
        {
          id: 'u5-l1-command',
          type: 'concept',
          title: 'El comando oficial',
          body: md`
            Este es el comando que recomienda la documentación de Home Assistant, adaptado a tu repo:

            | Parámetro | Qué hace | Por qué para HA |
            |---|---|---|
            | \`-d\` | Corre en segundo plano (*detached*) | Es un servicio, no un comando interactivo |
            | \`--name homeassistant\` | Nombre fijo | Para usar \`docker logs homeassistant\` en vez de un ID aleatorio |
            | \`--privileged\` | Acceso amplio a dispositivos del host | Dongles USB (Zigbee, Z-Wave) y Bluetooth |
            | \`--restart=unless-stopped\` | Política de reinicio | Vuelve solo tras un reboot o un crash |
            | \`-e TZ=…\` | Variable de entorno | Zona horaria de automatizaciones y logs |
            | \`-v …:/config\` | Bind mount | **Persistencia** de toda tu configuración |
            | \`-v /run/dbus:/run/dbus:ro\` | Socket D-Bus del host, en solo lectura | Necesario para la integración Bluetooth |
            | \`--network=host\` | Red del host | Descubrimiento SSDP/mDNS y Wake-on-LAN |
            | \`ghcr.io/…:stable\` | Imagen y tag | Canal estable, multi-arquitectura |
          `,
          code: { lang: 'bash', code: HA_RUN_COMMAND },
        },
        {
          id: 'u5-l1-match',
          type: 'match',
          prompt: 'Empareja cada flag con su propósito',
          pairs: [
            { left: '-d', right: 'Segundo plano' },
            { left: '--restart=unless-stopped', right: 'Vuelve tras reboot salvo que lo detengas tú' },
            { left: '-v …:/config', right: 'Persistencia de la configuración' },
            { left: '--network=host', right: 'Descubrimiento de dispositivos en la LAN' },
            { left: '-e TZ=…', right: 'Zona horaria' },
          ],
          explanation: 'Si entiendes estos cinco, entiendes el 90 % de cualquier despliegue de Docker.',
        },
        {
          id: 'u5-l1-privileged',
          type: 'choice',
          prompt: '¿Qué implica `--privileged`?',
          options: [
            {
              id: 'a',
              text: 'Da al contenedor acceso a todos los dispositivos del host y desactiva buena parte del aislamiento. Útil para hardware, pero con más riesgo.',
              correct: true,
            },
            { id: 'b', text: 'Solo permite usar puertos menores a 1024.', feedback: 'Eso no requiere privileged, y con red host ni aplica.' },
            { id: 'c', text: 'Hace que el contenedor use más CPU.', feedback: 'No cambia recursos; cambia permisos.' },
          ],
          explanation: 'HA lo incluye por comodidad con el hardware (USB, Bluetooth). En una fase más avanzada puedes cambiarlo por `--device /dev/ttyUSB0` para exponer solo lo necesario: **mínimo privilegio**.',
        },
        {
          id: 'u5-l1-restart',
          type: 'choice',
          prompt: 'Detienes HA con `docker stop` para hacer mantenimiento y luego **reinicias Ubuntu**. ¿Con qué política el contenedor **NO** arranca solo?',
          options: [
            { id: 'a', text: '`unless-stopped`', correct: true },
            { id: 'b', text: '`always`', feedback: '`always` lo arranca cuando inicia el daemon, aunque lo hubieras detenido a mano.' },
            { id: 'c', text: 'Ninguna: las dos lo arrancan.', feedback: 'Justo esa es la diferencia entre ambas.' },
          ],
          explanation: '`unless-stopped` respeta tu decisión: si lo detuviste a mano, se queda detenido. Si lo detuvo un apagado o un crash, vuelve.',
        },
        {
          id: 'u5-l1-flip',
          type: 'flip',
          cards: [
            { id: 'u5-flip-dbus', front: '`/run/dbus:/run/dbus:ro`', back: 'D-Bus es el "bus de mensajes" de Linux. HA lo usa para hablar con BlueZ (Bluetooth). La documentación lo marca como opcional salvo que uses Bluetooth.' },
            { id: 'u5-flip-stop', front: 'Tiempo de apagado', back: 'Docker da 10 s por defecto para apagar. HA recomienda **60 s** (`--stop-timeout 60` o `stop_grace_period: 60s`) para cerrar la base de datos sin avisos de corrupción.' },
            { id: 'u5-flip-multiarch', front: 'Imagen multi-arch', back: 'La misma etiqueta `:stable` trae la variante amd64 (tu Ubuntu) o arm64 (Raspberry Pi). Docker elige sola la correcta.' },
          ],
        },
      ],
      resources: [
        { title: 'Home Assistant: instalación en Linux (Container)', url: 'https://www.home-assistant.io/installation/linux', kind: 'docs', lang: 'en' },
        { title: 'Restart policies', url: 'https://docs.docker.com/engine/containers/start-containers-automatically/', kind: 'docs', lang: 'en' },
        { title: 'docker container run', url: 'https://docs.docker.com/reference/cli/docker/container/run/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u5-l2',
      title: 'Arma y lanza',
      summary: 'Construye el comando tú mismo y levanta Home Assistant.',
      steps: [
        {
          id: 'u5-l2-build',
          type: 'build-command',
          prompt: 'Arma el comando completo para desplegar Home Assistant',
          chips: [
            'docker', 'run', '-d', '--name homeassistant', '--privileged', '--restart=unless-stopped',
            `-e TZ=${EXAMPLE_TZ}`, `-v ${CONFIG_DIR}:/config`, '-v /run/dbus:/run/dbus:ro', '--network=host', HA_IMAGE,
          ],
          distractors: ['-p 8123:8123', '--rm', '-v homeassistant:/config', '--network=bridge'],
          mode: 'docker',
          hint: 'Son 9 piezas después de `docker run`. Ninguna trampa sirve: piensa en persistencia y en red.',
          explanation: '`--rm` borraría el contenedor al detenerse, `-p` se ignora en modo host y `-v homeassistant:/config` sería un named volume, no tu carpeta del repo.',
        },
        {
          id: 'u5-l2-fill',
          type: 'fill-code',
          prompt: 'Completa las tres piezas críticas',
          lang: 'bash',
          template: md`
            docker run -d \\
              --name homeassistant \\
              --privileged \\
              --restart=[[restart]] \\
              -e TZ=${EXAMPLE_TZ} \\
              -v [[config]]:/config \\
              -v /run/dbus:/run/dbus:ro \\
              --network=[[net]] \\
              ${HA_IMAGE}
          `,
          blanks: [
            { id: 'restart', accept: ['unless-stopped'], options: ['no', 'always', 'unless-stopped', 'on-failure'] },
            { id: 'config', accept: [CONFIG_DIR, `$HOME/homelab-ha/homeassistant/config`, '/home/$USER/homelab-ha/homeassistant/config'], placeholder: 'ruta del host' },
            { id: 'net', accept: ['host'], options: ['bridge', 'host', 'none'] },
          ],
          explanation: 'Persistencia (`-v`), resiliencia (`--restart`) y descubrimiento (`--network`): los tres pilares de este despliegue.',
        },
        {
          id: 'u5-l2-url',
          type: 'choice',
          prompt: 'HA ya corre. ¿Dónde lo abres desde tu celular o tu Mac?',
          options: [
            { id: 'a', text: '`http://IP-DE-TU-UBUNTU:8123`', correct: true },
            { id: 'b', text: '`http://172.17.0.2:8123`', feedback: 'Esa sería una IP del bridge de Docker. En modo host no existe y, además, no es accesible desde tu LAN.' },
            { id: 'c', text: '`https://home-assistant.io`', feedback: 'Esa es la web del proyecto. Tu instancia es local.' },
          ],
          explanation: 'Con red host, HA escucha en el puerto 8123 de tu Ubuntu, en todas sus interfaces.',
        },
        {
          id: 'u5-l2-ip',
          type: 'type-command',
          prompt: '¿Qué comando rápido muestra las IPs de tu Ubuntu?',
          placeholder: 'hostname …',
          hint: '`hostname` con una opción en mayúscula.',
          accept: ['hostname -I', 'ip a', 'ip addr', 'ip -4 addr', 'ip addr show', 'ip -4 a'],
          explanation: '`hostname -I` lista las IPs sin ruido. La primera suele ser la de tu LAN (p. ej. `192.168.1.50`).',
        },
        {
          id: 'u5-l2-mission',
          type: 'mission',
          missionId: 'm-ha-run',
          node: 'ha',
          title: 'Levanta Home Assistant',
          goal: 'Tener HA corriendo en Docker y ver su pantalla de bienvenida en el puerto 8123.',
          steps: [
            { text: 'Ve a tu repo y confirma que existe la carpeta de configuración:', code: { lang: 'bash', code: `cd ${HOMELAB_DIR}\nls homeassistant/config` } },
            { text: 'Lanza el contenedor (cambia `TZ` por la tuya). La primera vez descarga la imagen y puede tardar varios minutos:', code: { lang: 'bash', code: HA_RUN_COMMAND } },
            { text: 'Mira el arranque en vivo (sal con Ctrl+C: el contenedor sigue corriendo):', code: { lang: 'bash', code: 'docker logs -f homeassistant' } },
            { text: 'Averigua tu IP y abre `http://IP:8123` en el navegador:', code: { lang: 'bash', code: 'hostname -I' } },
            { text: 'Mira lo que HA escribió en tu bind mount:', code: { lang: 'bash', code: 'ls -la homeassistant/config' } },
          ],
          expected: { lang: 'text', code: 'configuration.yaml  automations.yaml  scripts.yaml  scenes.yaml  secrets.yaml  .storage/  home-assistant_v2.db …' },
          checklist: [
            '`docker ps` muestra homeassistant como Up',
            'Veo la pantalla de bienvenida de HA en :8123',
            'Aparecieron archivos en homeassistant/config',
          ],
          verify: {
            instruction: 'Pega la salida de:',
            command: "docker ps --filter name=homeassistant --format '{{.Names}} {{.Status}}'",
            patterns: ['homeassistant\\s+Up'],
            success: '¡Home Assistant vive! El onboarding puede esperar a la Unidad 9: tus datos sobrevivirán a la migración a Compose porque viven en el bind mount.',
            failure: 'No veo `homeassistant Up …`. Revisa `docker ps -a` y `docker logs homeassistant`.',
          },
        },
      ],
      resources: [
        { title: 'Home Assistant: instalación en Linux (Container)', url: 'https://www.home-assistant.io/installation/linux', kind: 'docs', lang: 'en' },
        { title: 'Docker Tutorial for Beginners (TechWorld with Nana)', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', kind: 'video', lang: 'en' },
      ],
      frontHint: {
        title: 'Uniones discriminadas: un tipo por ejercicio',
        body: 'Cada paso es `ConceptStep | FlipStep | ChoiceStep | …` con un campo `type` literal. En un `switch (step.type)`, TypeScript estrecha el tipo en cada rama, y si agregas una variante nueva sin manejarla, el compilador te avisa. Es el patrón que sostiene todo el reproductor de lecciones.',
        file: 'src/content/schema.ts',
      },
    },
  ],
}
