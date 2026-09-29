import type { Unit } from '../schema'
import { md } from '../md'
import { CONFIG_DIR } from '../config'

export const unit09: Unit = {
  id: 'u9',
  order: 9,
  level: 1,
  title: 'Onboarding de Home Assistant',
  subtitle: 'Tu usuario, tu casa, IPs fijas y la app del celular',
  icon: 'Smartphone',
  lessons: [
    {
      id: 'u9-l1',
      title: 'Primeros pasos en HA',
      summary: 'El asistente inicial, dónde se guarda lo que configuras y cómo habla HA.',
      steps: [
        {
          id: 'u9-l1-onboarding',
          type: 'concept',
          title: 'El asistente inicial',
          body: md`
            La primera vez que abres \`http://IP:8123\`, HA te guía para:

            1. **Crear el usuario dueño.** Guarda la contraseña en tu gestor de contraseñas: es la llave de tu casa.
            2. **Ubicar tu casa.** La ubicación alimenta la hora de salida y puesta del sol, el clima y las zonas.
            3. **Elegir unidades y moneda.**
            4. **Decidir sobre la analítica** (es opcional y anónima).
            5. **Ver los dispositivos descubiertos.** Gracias a la red host, puede que ya aparezca tu TV.

            Todo esto se guarda en \`/config/.storage\`, es decir, en tu bind mount. Por eso sobrevivió (y sobrevivirá)
            a recrear el contenedor.
          `,
        },
        {
          id: 'u9-l1-storage',
          type: 'choice',
          prompt: '¿Dónde queda guardado el usuario que creas en el onboarding?',
          options: [
            { id: 'a', text: 'En `/config/.storage`, dentro de tu bind mount.', correct: true },
            { id: 'b', text: 'En la imagen de Docker.', feedback: 'Las imágenes son inmutables; el contenedor nunca escribe en ellas.' },
            { id: 'c', text: 'En la nube de Home Assistant.', feedback: 'HA es local por diseño. Nada sale de tu red salvo que tú lo configures.' },
          ],
          explanation: 'Por eso `.storage` es lo más valioso de tu backup y, a la vez, lo que **nunca** va a git: contiene credenciales y tokens.',
        },
        {
          id: 'u9-l1-model',
          type: 'match',
          prompt: 'Empareja el vocabulario de Home Assistant',
          pairs: [
            { left: 'Integración', right: 'Conector con una marca o servicio (p. ej. LG webOS)' },
            { left: 'Dispositivo', right: 'El aparato físico (tu TV)' },
            { left: 'Entidad', right: 'Una capacidad concreta (media_player.tv_sala)' },
            { left: 'Automatización', right: 'Disparador + condiciones + acciones' },
          ],
          explanation: 'Una integración crea dispositivos; cada dispositivo expone entidades; las automatizaciones actúan sobre entidades.',
        },
        {
          id: 'u9-l1-dhcp',
          type: 'concept',
          title: 'IPs que no cambian',
          body: md`
            Tu router reparte IPs por DHCP y **pueden cambiar** tras un reinicio. Si cambia la IP de:

            - **Ubuntu**, la app y tus marcadores dejan de encontrar HA.
            - **La TV o la bombilla**, HA puede perderlas y el Wake-on-LAN puede fallar.

            La solución limpia es una **reserva DHCP** en el router: le asocias a cada MAC su IP de siempre. Se gestiona
            en un solo lugar y no tocas la configuración de red de cada equipo.
          `,
          callouts: [
            { tone: 'info', title: 'Cada router es distinto', body: 'Busca algo como *DHCP → Reserva de direcciones* o *Static lease*. Necesitarás la MAC de cada equipo.' },
          ],
        },
        {
          id: 'u9-l1-dhcp-q',
          type: 'choice',
          prompt: '¿Por qué conviene una reserva DHCP para tu Ubuntu?',
          options: [
            { id: 'a', text: 'Para que `http://IP:8123` no cambie y la app, los marcadores y las automatizaciones sigan funcionando.', correct: true },
            { id: 'b', text: 'Porque Docker exige IP fija.', feedback: 'Docker no lo exige; es tu red la que se beneficia.' },
            { id: 'c', text: 'Para que HA vaya más rápido.', feedback: 'No afecta al rendimiento.' },
          ],
          explanation: 'Predecible = mantenible. Es el mismo principio que fijar la versión de la imagen.',
        },
        {
          id: 'u9-l1-flip',
          type: 'flip',
          cards: [
            {
              id: 'u9-flip-companion',
              front: 'Companion App',
              back: 'La app oficial (iOS/Android). Además de controlar tu casa, convierte el celular en un **dispositivo** con sensores (batería, ubicación…) y recibe notificaciones.',
              link: { title: 'Companion App docs', url: 'https://companion.home-assistant.io/', kind: 'docs', lang: 'en' },
            },
            {
              id: 'u9-flip-remote',
              front: 'Acceso desde fuera de casa',
              back: '**No abras puertos en el router.** Usa Home Assistant Cloud (Nabu Casa) o una VPN como Tailscale o WireGuard. Por ahora, basta con la red local.',
              link: { title: 'Remote access', url: 'https://www.home-assistant.io/docs/configuration/remote/', kind: 'docs', lang: 'en' },
            },
          ],
        },
      ],
      resources: [
        { title: 'Onboarding Home Assistant', url: 'https://www.home-assistant.io/getting-started/onboarding/', kind: 'docs', lang: 'en' },
        { title: 'Concepts and terminology', url: 'https://www.home-assistant.io/getting-started/concepts-terminology/', kind: 'docs', lang: 'en' },
      ],
      frontHint: {
        title: 'Feedback accesible con aria-live',
        body: 'Cuando compruebas una respuesta, la hoja inferior usa `role="status"` y `aria-live="polite"`: un lector de pantalla anuncia "¡Correcto!" o "Casi…" sin mover el foco. El botón principal recibe `autoFocus` para que puedas seguir solo con Enter.',
        file: 'src/features/lesson/FeedbackSheet.tsx',
      },
    },
    {
      id: 'u9-l2',
      title: 'Conecta tu celular',
      summary: 'Onboarding real, reserva DHCP y app móvil.',
      steps: [
        {
          id: 'u9-l2-app-fail',
          type: 'choice',
          prompt: 'La app del celular no encuentra tu HA. ¿Qué revisas **primero**?',
          options: [
            { id: 'a', text: 'Que el celular esté en la misma Wi-Fi y que uses `http://IP:8123` (http, no https).', correct: true },
            { id: 'b', text: 'Reinstalar Home Assistant.', feedback: 'HA funciona en el navegador; el problema está en el camino entre el celular y el servidor.' },
            { id: 'c', text: 'Abrir el puerto 8123 en el router.', feedback: 'No hace falta para la red local, y exponerlo a internet es un riesgo.' },
          ],
          explanation: 'Sin certificado configurado, HA sirve por **http**. Muchos fallos vienen de escribir https o de estar en la red de invitados.',
        },
        {
          id: 'u9-l2-port',
          type: 'type-command',
          prompt: 'Desde Ubuntu, comprueba que HA responde en el puerto 8123 (solo cabeceras)',
          placeholder: 'curl …',
          hint: '`curl` con la opción que pide solo las cabeceras (HEAD).',
          accept: ['curl -I http://localhost:8123', 'curl -I localhost:8123', 'curl --head http://localhost:8123', 'curl -I http://127.0.0.1:8123'],
          explanation: 'Si responde `HTTP/1.1 200` (o una redirección), HA escucha. Si no responde, revisa `docker compose ps` y los logs.',
        },
        {
          id: 'u9-l2-mission',
          type: 'mission',
          missionId: 'm-onboarding',
          node: 'app',
          title: 'Onboarding y app móvil',
          goal: 'Tener tu usuario creado, la IP de Ubuntu reservada y el celular conectado a HA.',
          steps: [
            { text: 'Abre `http://IP-DE-TU-UBUNTU:8123` y completa el asistente (usuario, ubicación, unidades).' },
            { text: 'En tu router, crea una **reserva DHCP** para la MAC de tu Ubuntu. Para ver la MAC y la IP:', code: { lang: 'bash', code: 'ip -brief link\nhostname -I' } },
            { text: 'Instala **Home Assistant** (Companion App) en el celular, conéctate con `http://IP:8123` e inicia sesión.' },
            { text: 'Comprueba en HA que tu celular aparece en **Ajustes → Dispositivos y servicios → Aplicación móvil**.' },
          ],
          checklist: [
            'Completé el onboarding con una contraseña guardada en mi gestor',
            'Reservé la IP de Ubuntu en el router',
            'La app del celular está conectada',
            'Mi celular aparece como dispositivo en HA',
          ],
          verify: {
            instruction: 'Confirma que el onboarding quedó en tu bind mount:',
            command: `sudo ls ${CONFIG_DIR}/.storage`,
            patterns: ['\\bonboarding\\b', '\\bauth\\b'],
            success: 'Ahí está tu estado: usuarios, onboarding e integraciones, a salvo en el host.',
            failure: 'Espero ver archivos como `auth` y `onboarding`. ¿Completaste el asistente?',
          },
        },
      ],
      resources: [
        { title: 'Companion App: getting started', url: 'https://companion.home-assistant.io/docs/getting_started/', kind: 'docs', lang: 'en' },
      ],
    },
  ],
}
