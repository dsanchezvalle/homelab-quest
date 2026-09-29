import type { Unit } from '../schema'
import { md } from '../md'

export const unit01: Unit = {
  id: 'u1',
  order: 1,
  level: 1,
  title: 'Fundamentos de Docker',
  subtitle: 'Imagen, contenedor, registry e instalación en Ubuntu',
  icon: 'Container',
  lessons: [
    {
      id: 'u1-l1',
      title: 'Contenedores sin misterio',
      summary: 'Qué es un contenedor, en qué se diferencia de una VM y cómo se nombra una imagen.',
      steps: [
        {
          id: 'u1-l1-intro',
          type: 'concept',
          title: '¿Qué problema resuelve Docker?',
          body: md`
            Home Assistant es una aplicación Python con **cientos de dependencias**. Instalarlas a mano en Ubuntu
            es frágil: una actualización del sistema puede romperlas.

            Un **contenedor** es un proceso de Linux aislado que trae **su propio sistema de archivos** con todo lo
            que necesita. Tu Ubuntu solo necesita Docker; el resto viaja dentro de la imagen.

            - Se aísla con *namespaces* (qué ve el proceso) y *cgroups* (cuánto puede consumir).
            - **Comparte el kernel** del host: por eso arranca en segundos y no en minutos.
          `,
          callouts: [
            {
              tone: 'tip',
              title: 'Tip DevOps',
              body: 'Piensa en el contenedor como **desechable**. Lo que importa (tu configuración) debe vivir fuera de él. Esa idea guía todo este curso.',
            },
          ],
        },
        {
          id: 'u1-l1-flip',
          type: 'flip',
          title: 'Las cuatro palabras clave',
          cards: [
            {
              id: 'u1-flip-image',
              front: 'Imagen',
              back: 'Una plantilla **de solo lectura**, construida en capas. Es la "receta": `ghcr.io/home-assistant/home-assistant:stable`.',
              link: { title: 'What is an image?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/', kind: 'docs', lang: 'en' },
            },
            {
              id: 'u1-flip-container',
              front: 'Contenedor',
              back: 'Una **instancia en ejecución** de una imagen, con una capa escribible encima. Es el "plato servido": puedes tener varios de la misma receta.',
              link: { title: 'What is a container?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/', kind: 'docs', lang: 'en' },
            },
            {
              id: 'u1-flip-registry',
              front: 'Registry',
              back: 'El almacén de imágenes. Docker Hub es el más conocido; Home Assistant publica en **GitHub Container Registry** (`ghcr.io`).',
              link: { title: 'What is a registry?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/', kind: 'docs', lang: 'en' },
            },
            {
              id: 'u1-flip-tag',
              front: 'Tag',
              back: 'La etiqueta de versión después de los dos puntos: `:stable`, `:2026.9.4`, `:beta`. Sin tag, Docker asume `:latest`.',
            },
          ],
        },
        {
          id: 'u1-l1-vm',
          type: 'choice',
          prompt: '¿Cuál es la diferencia **principal** entre un contenedor y una máquina virtual?',
          options: [
            { id: 'a', text: 'El contenedor comparte el kernel del host; la VM trae su propio sistema operativo completo.', correct: true },
            { id: 'b', text: 'El contenedor emula hardware completo (CPU, disco, BIOS).', feedback: 'Eso lo hace un hipervisor para una VM. El contenedor es solo un proceso aislado.' },
            { id: 'c', text: 'Los contenedores solo funcionan en la nube.', feedback: 'Corren en cualquier Linux: tu Ubuntu, una Raspberry Pi o un servidor.' },
            { id: 'd', text: 'La VM es más liviana y arranca más rápido.', feedback: 'Es al revés: la VM arranca un SO entero; el contenedor, solo un proceso.' },
          ],
          explanation: 'Al compartir el kernel, los contenedores son livianos y arrancan en segundos. El precio es un aislamiento menor que el de una VM.',
        },
        {
          id: 'u1-l1-match',
          type: 'match',
          prompt: 'Empareja cada concepto con su definición',
          pairs: [
            { left: 'Imagen', right: 'Plantilla inmutable en capas' },
            { left: 'Contenedor', right: 'Instancia en ejecución con capa escribible' },
            { left: 'Registry', right: 'Almacén remoto de imágenes' },
            { left: 'dockerd', right: 'Servicio que crea y gestiona contenedores' },
          ],
          explanation: 'El CLI `docker` le habla al daemon `dockerd`. El daemon descarga imágenes del registry y crea contenedores a partir de ellas.',
        },
        {
          id: 'u1-l1-image-name',
          type: 'choice',
          prompt: 'En `ghcr.io/home-assistant/home-assistant:stable`, ¿qué parte es el **registry**?',
          options: [
            { id: 'a', text: '`ghcr.io`', correct: true },
            { id: 'b', text: '`home-assistant/home-assistant`', feedback: 'Eso es el repositorio (organización/nombre de la imagen).' },
            { id: 'c', text: '`stable`', feedback: 'Eso es el tag: la versión.' },
            { id: 'd', text: 'No tiene registry; es de Docker Hub.', feedback: 'Cuando la imagen no empieza con un dominio se asume Docker Hub, pero aquí el dominio es ghcr.io.' },
          ],
          explanation: 'Formato: `registry/organización/imagen:tag`. `ghcr.io` es el GitHub Container Registry.',
        },
        {
          id: 'u1-l1-layer',
          type: 'choice',
          prompt: 'Un contenedor escribe un archivo en `/tmp` (no hay volúmenes). Luego **borras** el contenedor. ¿Qué pasa con el archivo?',
          options: [
            { id: 'a', text: 'Se pierde: vivía en la capa escribible del contenedor.', correct: true },
            { id: 'b', text: 'Queda guardado en la imagen.', feedback: 'La imagen es de solo lectura: nunca cambia al usar un contenedor.' },
            { id: 'c', text: 'Docker lo mueve a tu carpeta home.', feedback: 'Docker no hace eso. Para conservar datos se usan volúmenes (Unidad 3).' },
          ],
          explanation: 'Esto es el corazón de la **persistencia**: todo lo que no esté en un volumen desaparece con el contenedor.',
        },
      ],
      resources: [
        { title: 'Docker in 100 Seconds (Fireship)', url: 'https://www.youtube.com/watch?v=Gjnup-PuquQ', kind: 'video', lang: 'en' },
        { title: 'Docker de novato a pro, curso completo (Pelado Nerd)', url: 'https://www.youtube.com/watch?v=CV_Uf3Dq-EU', kind: 'video', lang: 'es' },
        { title: 'Docker concepts: the basics', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u1-l2',
      title: 'Instalar Docker Engine en Ubuntu',
      summary: 'Arquitectura del Engine, instalación desde el repo oficial y el grupo docker.',
      steps: [
        {
          id: 'u1-l2-arch',
          type: 'concept',
          title: 'Cómo está armado Docker Engine',
          body: md`
            Cuando escribes \`docker run\`, pasa esto:

            1. El **CLI** (\`docker\`) envía la orden por el socket \`/var/run/docker.sock\`.
            2. El **daemon** (\`dockerd\`) la recibe, descarga la imagen si hace falta y delega.
            3. **containerd** + **runc** crean el proceso aislado.

            En Ubuntu instalamos **Docker Engine**, no Docker Desktop. Desktop trae una VM y una interfaz gráfica;
            Engine corre nativo sobre el kernel del host, que es lo que queremos para un servidor y luego para la Raspberry Pi.
          `,
          callouts: [
            {
              tone: 'warning',
              title: 'Advertencia',
              body: 'Ubuntu trae un paquete `docker.io` propio. **No lo mezcles** con el de Docker (`docker-ce`): la guía oficial primero desinstala los paquetes en conflicto.',
            },
          ],
        },
        {
          id: 'u1-l2-compose-pkg',
          type: 'choice',
          prompt: '¿Qué paquete te da el comando `docker compose` (Compose v2)?',
          options: [
            { id: 'a', text: '`docker-compose-plugin`', correct: true },
            { id: 'b', text: '`docker-compose`', feedback: 'Ese es el Compose v1 heredado, escrito en Python (`docker-compose` con guion). Ya no se usa.' },
            { id: 'c', text: '`compose-cli`', feedback: 'No existe en el repo oficial.' },
            { id: 'd', text: 'Viene dentro de `docker-ce` sin nada más.', feedback: 'Es un plugin aparte y hay que instalarlo explícitamente.' },
          ],
          explanation: 'Compose v2 es un **plugin** del CLI: se invoca como `docker compose` (con espacio, sin guion).',
        },
        {
          id: 'u1-l2-apt',
          type: 'fill-code',
          prompt: 'Completa la instalación de los paquetes oficiales',
          lang: 'bash',
          template: 'sudo apt install [[engine]] docker-ce-cli containerd.io docker-buildx-plugin [[compose]]',
          blanks: [
            { id: 'engine', accept: ['docker-ce'], options: ['docker-ce', 'docker.io', 'docker-desktop', 'podman'] },
            { id: 'compose', accept: ['docker-compose-plugin'], options: ['docker-compose', 'docker-compose-plugin', 'compose'] },
          ],
          explanation: '`docker-ce` es el Engine (Community Edition); `docker-compose-plugin` agrega `docker compose`.',
        },
        {
          id: 'u1-l2-group',
          type: 'choice',
          prompt: 'Para no escribir `sudo` en cada comando, agregas tu usuario al grupo `docker`. ¿Qué implica en seguridad?',
          options: [
            { id: 'a', text: 'Ese usuario obtiene privilegios equivalentes a root en el host.', correct: true },
            { id: 'b', text: 'Nada: el grupo solo permite leer logs.', feedback: 'Con acceso al socket puedes montar `/` del host en un contenedor. Es poder de root.' },
            { id: 'c', text: 'Desactiva el firewall de Ubuntu.', feedback: 'No toca el firewall.' },
          ],
          explanation: 'La documentación oficial lo advierte: *el grupo docker otorga privilegios de nivel root*. En un equipo personal de laboratorio es un compromiso razonable; tenlo presente.',
        },
        {
          id: 'u1-l2-usermod',
          type: 'type-command',
          prompt: 'Escribe el comando que agrega **tu usuario actual** al grupo `docker`',
          placeholder: 'sudo …',
          hint: 'Se usa `usermod` con `-aG` (append + group) y la variable de tu usuario.',
          accept: ['sudo usermod -aG docker $USER', 'sudo usermod -aG docker ${USER}', 'sudo usermod -a -G docker $USER'],
          explanation: '`-a` agrega sin quitarte de otros grupos (¡sin `-a` te sacaría de ellos!) y `-G docker` indica el grupo. Luego cierra sesión o ejecuta `newgrp docker`.',
        },
        {
          id: 'u1-l2-mission',
          type: 'mission',
          missionId: 'm-docker-engine',
          node: 'docker',
          title: 'Instala Docker Engine',
          goal: 'Dejar Docker Engine instalado desde el repo oficial, usable sin sudo y arrancando con el sistema.',
          steps: [
            {
              text: 'Desinstala paquetes en conflicto (si no hay ninguno, no pasa nada):',
              code: {
                lang: 'bash',
                code: 'sudo apt remove $(dpkg --get-selections docker.io docker-compose docker-compose-v2 docker-doc podman-docker containerd runc | cut -f1)',
              },
            },
            {
              text: 'Agrega la llave GPG y el repositorio oficial de Docker:',
              code: {
                lang: 'bash',
                code: md`
                  sudo apt update
                  sudo apt install ca-certificates curl
                  sudo install -m 0755 -d /etc/apt/keyrings
                  sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
                  sudo chmod a+r /etc/apt/keyrings/docker.asc

                  sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
                  Types: deb
                  URIs: https://download.docker.com/linux/ubuntu
                  Suites: $(. /etc/os-release && echo "\${UBUNTU_CODENAME:-$VERSION_CODENAME}")
                  Components: stable
                  Architectures: $(dpkg --print-architecture)
                  Signed-By: /etc/apt/keyrings/docker.asc
                  EOF

                  sudo apt update
                `,
              },
            },
            {
              text: 'Instala los paquetes:',
              code: { lang: 'bash', code: 'sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin' },
            },
            {
              text: 'Usa Docker sin sudo (luego cierra sesión y vuelve a entrar, o usa `newgrp`):',
              code: { lang: 'bash', code: 'sudo usermod -aG docker $USER\nnewgrp docker' },
            },
            {
              text: 'Prueba de humo y arranque automático:',
              code: { lang: 'bash', code: 'docker run hello-world\nsystemctl is-enabled docker' },
            },
          ],
          expected: { lang: 'text', code: 'Hello from Docker!\nThis message shows that your installation appears to be working correctly.\n…\nenabled' },
          checklist: [
            'Instalé docker-ce desde el repositorio oficial',
            'Puedo usar `docker` sin sudo',
            '`docker run hello-world` mostró "Hello from Docker!"',
            '`systemctl is-enabled docker` responde `enabled`',
          ],
          verify: {
            instruction: 'Pega la salida de este comando:',
            command: 'docker run --rm hello-world',
            patterns: ['Hello from Docker!'],
            success: 'Docker Engine responde. ¡Tu primer contenedor!',
            failure: 'No encuentro "Hello from Docker!". ¿Te dio "permission denied"? Revisa el grupo docker y vuelve a iniciar sesión.',
          },
        },
      ],
      resources: [
        { title: 'Install Docker Engine on Ubuntu', url: 'https://docs.docker.com/engine/install/ubuntu/', kind: 'docs', lang: 'en' },
        { title: 'Linux post-installation steps', url: 'https://docs.docker.com/engine/install/linux-postinstall/', kind: 'docs', lang: 'en' },
        { title: 'You need to learn Docker RIGHT NOW (NetworkChuck)', url: 'https://www.youtube.com/watch?v=eGz9DS-aIeY', kind: 'video', lang: 'en' },
      ],
      frontHint: {
        title: 'El botón "Copiar" de los bloques de código',
        body: 'Usa la Clipboard API (`navigator.clipboard.writeText`), que solo existe en contextos seguros (https o localhost). El estado "¡Copiado!" es un `useState` que se reinicia con un `setTimeout`, limpiado en el cleanup del `useEffect`.',
        file: 'src/ui/CodeBlock.tsx',
      },
    },
  ],
}
