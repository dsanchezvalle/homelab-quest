import type { Unit } from '../schema'
import { md } from '../md'

export const unit04: Unit = {
  id: 'u4',
  order: 4,
  level: 1,
  title: 'Redes',
  subtitle: 'Bridge vs host y por qué HA necesita ver tu LAN',
  icon: 'Network',
  lessons: [
    {
      id: 'u4-l1',
      title: 'Bridge vs host',
      summary: 'Publicar puertos, NAT y descubrimiento de dispositivos IoT.',
      steps: [
        {
          id: 'u4-l1-bridge',
          type: 'concept',
          title: 'Dos formas de conectar un contenedor',
          body: md`
            **bridge** (por defecto): Docker crea una red privada (normalmente \`172.17.0.0/16\`) y el contenedor recibe una IP propia.
            Para entrar desde tu LAN tienes que **publicar puertos** con \`-p HOST:CONTENEDOR\`; Docker hace NAT.

            **host** (\`--network host\`): el contenedor **comparte la pila de red del host**. No tiene IP propia: si escucha en 8123,
            escucha en el 8123 de tu Ubuntu. Sin NAT y sin \`-p\`.

            | | bridge | host |
            |---|---|---|
            | Aislamiento de red | ✅ | ❌ |
            | Necesita \`-p\` | Sí | No (se ignora) |
            | Ve multicast/broadcast de la LAN | ❌ | ✅ |
          `,
        },
        {
          id: 'u4-l1-p',
          type: 'choice',
          prompt: '`-p 8080:80` significa…',
          options: [
            { id: 'a', text: 'El puerto 8080 del host redirige al 80 del contenedor.', correct: true },
            { id: 'b', text: 'El puerto 80 del host redirige al 8080 del contenedor.', feedback: 'El orden es HOST:CONTENEDOR, igual que en los volúmenes.' },
            { id: 'c', text: 'El contenedor usa los puertos del 80 al 8080.', feedback: 'No es un rango: es un mapeo de un puerto a otro.' },
          ],
          explanation: 'Siempre **HOST:CONTENEDOR**. Abres `http://tu-ubuntu:8080` y Docker lo reenvía al puerto 80 de nginx dentro del contenedor.',
        },
        {
          id: 'u4-l1-discovery',
          type: 'concept',
          title: 'Por qué HA necesita la red host',
          body: md`
            Muchos dispositivos se **anuncian** en la LAN con paquetes que no cruzan el NAT del bridge:

            - **SSDP** (multicast \`239.255.255.250:1900\`): así se descubre tu **TV LG webOS**.
            - **mDNS / zeroconf** (multicast \`224.0.0.251:5353\`): Chromecast, HomeKit, ESPHome…
            - **Broadcast UDP**: el *magic packet* de **Wake-on-LAN** que enciende la TV y el descubrimiento de bombillas **WiZ**.

            En bridge, HA está en una red aislada y **no oye** nada de eso. Con \`--network host\`, HA se comporta como una app
            instalada directamente en Ubuntu.
          `,
          callouts: [
            {
              tone: 'info',
              title: 'Existe una alternativa',
              body: '`macvlan` le da al contenedor una IP propia en tu LAN. Es más compleja de configurar; `host` es la opción recomendada por Home Assistant.',
            },
          ],
        },
        {
          id: 'u4-l1-needs-host',
          type: 'choice',
          multiple: true,
          prompt: '¿Qué funciones de HA **dependen** de la red host? (marca todas)',
          options: [
            { id: 'a', text: 'Descubrir la TV LG por SSDP', correct: true },
            { id: 'b', text: 'Enviar el magic packet de Wake-on-LAN', correct: true },
            { id: 'c', text: 'Descubrimiento mDNS/zeroconf', correct: true },
            { id: 'd', text: 'Abrir la interfaz web en :8123', feedback: 'Eso funciona también en bridge con `-p 8123:8123`. Es tráfico TCP normal.' },
          ],
          explanation: 'Multicast y broadcast son locales al segmento de red. El NAT del bridge los corta; la red host no.',
        },
        {
          id: 'u4-l1-ports-host',
          type: 'choice',
          prompt: 'Con `--network host`, ¿qué pasa si además pones `-p 8123:8123`?',
          options: [
            { id: 'a', text: 'Se ignora: en modo host no hay nada que publicar.', correct: true },
            { id: 'b', text: 'Duplica el puerto y da error de conflicto.', feedback: 'Docker lo descarta con un aviso; no hay conflicto.' },
            { id: 'c', text: 'Es obligatorio para acceder a HA.', feedback: 'En modo host HA ya escucha directamente en el 8123 de Ubuntu.' },
          ],
          explanation: 'Docker avisa que *published ports are discarded when using host network mode*. Es un error típico copiar ambos.',
        },
        {
          id: 'u4-l1-match',
          type: 'match',
          prompt: 'Empareja cada protocolo con su puerto',
          pairs: [
            { left: 'mDNS', right: '5353/udp multicast' },
            { left: 'SSDP', right: '1900/udp multicast' },
            { left: 'Wake-on-LAN', right: 'Broadcast UDP (puerto 9)' },
            { left: 'UI de Home Assistant', right: '8123/tcp' },
          ],
          explanation: 'Si algún día falla el descubrimiento, revisa primero si hay un firewall (ufw) bloqueando estos puertos UDP.',
        },
      ],
      resources: [
        { title: 'Networking overview', url: 'https://docs.docker.com/engine/network/', kind: 'docs', lang: 'en' },
        { title: 'Host network driver', url: 'https://docs.docker.com/engine/network/drivers/host/', kind: 'docs', lang: 'en' },
        { title: 'Bridge network driver', url: 'https://docs.docker.com/engine/network/drivers/bridge/', kind: 'docs', lang: 'en' },
        { title: 'Docker networking is CRAZY (NetworkChuck)', url: 'https://www.youtube.com/watch?v=bKFMS5C4CG0', kind: 'video', lang: 'en' },
      ],
    },
    {
      id: 'u4-l2',
      title: 'Laboratorio de redes',
      summary: 'Nginx en bridge y en host, uno al lado del otro.',
      steps: [
        {
          id: 'u4-l2-build',
          type: 'build-command',
          prompt: 'Arma el comando: nginx en segundo plano, llamado `web-bridge`, accesible en el puerto **8080** del host',
          chips: ['docker', 'run', '-d', '--name web-bridge', '-p 8080:80', 'nginx'],
          distractors: ['--network host', '-p 80:8080', '--rm'],
          mode: 'docker',
          hint: 'Recuerda: -p HOST:CONTENEDOR. Nginx escucha en el 80 dentro del contenedor.',
          explanation: 'El orden de los flags da igual, pero la **imagen va al final** (después vendría el comando del contenedor, si lo hubiera).',
        },
        {
          id: 'u4-l2-mac',
          type: 'choice',
          prompt: '¿Por qué este laboratorio (y HA) debe correr en tu **Ubuntu** y no en Docker Desktop de tu Mac?',
          options: [
            { id: 'a', text: 'En Mac, Docker corre dentro de una VM: la red "host" es la de esa VM, no tu LAN, y el multicast no llega igual.', correct: true },
            { id: 'b', text: 'Docker no existe para Mac.', feedback: 'Existe (Docker Desktop), pero con una VM de por medio.' },
            { id: 'c', text: 'Da igual: se comporta exactamente igual.', feedback: 'La red es justo donde más se nota la diferencia.' },
          ],
          explanation: 'En Linux, los contenedores corren sobre el kernel del host sin VM de por medio. Por eso HA en Docker se despliega sobre Linux (Ubuntu hoy, Raspberry Pi OS mañana).',
        },
        {
          id: 'u4-l2-mission',
          type: 'mission',
          missionId: 'm-lab-network',
          title: 'Laboratorio: bridge vs host',
          goal: 'Ver con tus ojos la diferencia entre publicar un puerto y compartir la red del host.',
          steps: [
            {
              text: '**Bridge:** nginx con puerto publicado. Mira su IP privada.',
              code: {
                lang: 'bash',
                code: md`
                  docker run -d --name web-bridge -p 8080:80 nginx
                  curl -I http://localhost:8080
                  docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web-bridge
                  docker port web-bridge
                `,
              },
            },
            {
              text: '**Host:** sin `-p`, escucha directo en el 80 de Ubuntu. (Si el 80 está ocupado, por ejemplo por Apache, verás un error en los logs.)',
              code: {
                lang: 'bash',
                code: md`
                  docker run -d --name web-host --network host nginx
                  curl -I http://localhost
                  docker port web-host          # vacío: no hay nada publicado
                `,
              },
            },
            { text: 'Lista las redes y limpia:', code: { lang: 'bash', code: 'docker network ls\ndocker rm -f web-bridge web-host' } },
          ],
          checklist: [
            'web-bridge respondió en :8080 y tiene una IP 172.x',
            'web-host respondió en :80 sin usar -p',
            '`docker port web-host` no muestra nada',
          ],
          verify: {
            instruction: 'Antes de limpiar, pega la salida de:',
            command: "docker inspect -f '{{.Name}} {{.HostConfig.NetworkMode}}' web-bridge web-host",
            patterns: ['/web-bridge\\s+(bridge|default)', '/web-host\\s+host'],
            success: 'Tienes uno en bridge y otro en host. Ya sabes por qué HA va en host.',
            failure: 'Espero ver `/web-bridge bridge` y `/web-host host`. ¿Siguen corriendo los dos contenedores?',
          },
        },
        {
          id: 'u4-l2-netls',
          type: 'type-command',
          prompt: '¿Qué comando lista las **redes** de Docker?',
          placeholder: 'docker …',
          accept: ['docker network ls', 'docker network list'],
          explanation: 'Verás al menos `bridge`, `host` y `none`: las tres redes que Docker crea al instalarse.',
        },
      ],
      resources: [
        { title: 'docker container run: --network y --publish', url: 'https://docs.docker.com/reference/cli/docker/container/run/', kind: 'docs', lang: 'en' },
        { title: 'Home Assistant: SSDP', url: 'https://www.home-assistant.io/integrations/ssdp/', kind: 'docs', lang: 'en' },
        { title: 'Home Assistant: Zero-configuration networking', url: 'https://www.home-assistant.io/integrations/zeroconf/', kind: 'docs', lang: 'en' },
      ],
      frontHint: {
        title: 'Cómo gira una flip card (solo CSS)',
        body: 'El contenedor tiene `perspective`; la tarjeta interna usa `transform-style: preserve-3d` y rota 180° en Y. Cada cara tiene `backface-visibility: hidden` y el dorso arranca ya rotado 180°. Además se respeta `prefers-reduced-motion`.',
        file: 'src/features/lesson/FlipCard.tsx',
      },
    },
  ],
}
