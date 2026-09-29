import type { Unit } from '../schema'
import { md } from '../md'
import { CONFIG_DIR, HOMELAB_DIR, HOMELAB_REPO } from '../config'

export const unit02: Unit = {
  id: 'u2',
  order: 2,
  level: 1,
  title: 'Preparar el terreno',
  subtitle: 'Carpetas, permisos, zona horaria y tu repo homelab-ha',
  icon: 'FolderTree',
  lessons: [
    {
      id: 'u2-l1',
      title: 'Dónde viven las cosas',
      summary: 'Qué va en el host, qué va en git y qué nunca debe salir de tu máquina.',
      steps: [
        {
          id: 'u2-l1-layout',
          type: 'concept',
          title: 'La estructura del homelab',
          body: md`
            Tu implementación vive en el repo **homelab-ha**, clonado en \`${HOMELAB_DIR}\`:

            \`\`\`text
            homelab-ha/
            ├── compose.yaml          ← lo escribirás en la Unidad 7
            ├── .env                  ← variables de ESTA máquina (no va a git)
            ├── .env.example          ← plantilla de variables (sí va a git)
            ├── homeassistant/config/ ← se monta en /config del contenedor
            ├── scripts/              ← backup y restore (Unidad 12)
            └── docs/
            \`\`\`

            La carpeta \`homeassistant/config\` es el **único estado importante**. Si la conservas, puedes destruir
            el contenedor, actualizar la imagen o mudarte a una Raspberry Pi sin perder nada.
          `,
        },
        {
          id: 'u2-l1-why-host',
          type: 'choice',
          prompt: '¿Por qué guardamos la configuración de HA en una carpeta del **host** y no dentro del contenedor?',
          options: [
            { id: 'a', text: 'Porque el contenedor es desechable: al actualizar la imagen se crea uno nuevo, vacío.', correct: true },
            { id: 'b', text: 'Porque dentro del contenedor no se puede escribir.', feedback: 'Sí se puede (capa escribible), pero se pierde al borrar el contenedor.' },
            { id: 'c', text: 'Porque así HA arranca más rápido.', feedback: 'El rendimiento es prácticamente igual. El motivo es la persistencia.' },
          ],
          explanation: 'Actualizar HA en Docker = **borrar el contenedor y crear otro** con la imagen nueva. Lo que no esté montado desde el host se pierde en el camino.',
        },
        {
          id: 'u2-l1-gitignore',
          type: 'choice',
          multiple: true,
          prompt: '¿Qué contenido de `/config` **NO** debería subirse a git? (marca todas)',
          options: [
            { id: 'a', text: '`secrets.yaml`', correct: true },
            { id: 'b', text: '`.storage/` (tokens, usuarios, integraciones)', correct: true },
            { id: 'c', text: '`home-assistant_v2.db` (historial)', correct: true },
            { id: 'd', text: '`configuration.yaml`', feedback: 'Este sí conviene versionarlo: es tu configuración declarativa. Los secretos van en secrets.yaml.' },
            { id: 'e', text: '`automations.yaml`', feedback: 'Versionar tus automatizaciones es de lo más útil: historial y posibilidad de revertir.' },
          ],
          explanation: 'Versiona lo **declarativo** (YAML) y deja fuera secretos, tokens y datos pesados. El `.gitignore` de homelab-ha usa una *allowlist*: ignora todo `config/` salvo los `*.yaml`.',
        },
        {
          id: 'u2-l1-perms',
          type: 'concept',
          title: 'Permisos y zona horaria',
          body: md`
            **Permisos:** el proceso de HA corre como **root dentro del contenedor**, así que los archivos que cree en
            \`/config\` quedarán a nombre de root en tu host. Para editarlos usa \`sudo\`, o cambia el dueño solo de los YAML que versionas:

            \`\`\`bash
            sudo chown $USER:$USER ${CONFIG_DIR}/*.yaml
            \`\`\`

            **Zona horaria:** las automatizaciones del tipo "a las 7:00 enciende la luz" dependen de ella, igual que los timestamps de los logs.
            Se la pasamos al contenedor con la variable \`TZ\`.
          `,
          callouts: [
            { tone: 'tip', title: 'Tip DevOps', body: 'Nunca hagas `chmod -R 777` "para que funcione". Es un parche que abre todo a todos.' },
          ],
        },
        {
          id: 'u2-l1-tz',
          type: 'type-command',
          prompt: '¿Qué comando muestra **solo** el nombre de tu zona horaria (p. ej. `America/Bogota`)?',
          placeholder: 'timedatectl …',
          hint: '`timedatectl show` con la propiedad `Timezone` y la opción que imprime solo el valor.',
          accept: ['timedatectl show -p Timezone --value', 'timedatectl show --property=Timezone --value', 'cat /etc/timezone'],
          explanation: '`timedatectl show -p Timezone --value` imprime solo el valor, ideal para scripts o para rellenar `TZ=` en tu `.env`.',
        },
        {
          id: 'u2-l1-flip',
          type: 'flip',
          cards: [
            { id: 'u2-flip-env', front: '`.env` vs `.env.example`', back: '`.env` tiene los valores de **esta** máquina y no va a git. `.env.example` es la plantilla documentada que sí se versiona.' },
            { id: 'u2-flip-git', front: '¿Por qué git para un homelab?', back: 'Historial de cada cambio, poder revertir un error y **portar todo** a la Raspberry Pi con un `git clone`.' },
            { id: 'u2-flip-home', front: '¿`~/homelab-ha` o `/opt`?', back: 'Ambos sirven. En tu home no necesitas sudo para git y es más simple en un equipo personal. `/opt` es más "de servidor" y multiusuario.' },
          ],
        },
      ],
      resources: [
        { title: 'Git: el libro Pro Git en español', url: 'https://git-scm.com/book/es/v2', kind: 'article', lang: 'es' },
      ],
      frontHint: {
        title: '¿Por qué la URL tiene un # (HashRouter)?',
        body: 'GitHub Pages sirve archivos estáticos: si recargas `/homelab-quest/leccion/u1-l1`, busca ese archivo y responde 404. Con `HashRouter`, la ruta va después del `#` y nunca llega al servidor, así que siempre se sirve `index.html` y React Router resuelve la ruta en el navegador.',
        file: 'src/App.tsx',
      },
    },
    {
      id: 'u2-l2',
      title: 'Tu repo en Ubuntu',
      summary: 'Clonar homelab-ha con la CLI de GitHub y preparar el archivo .env.',
      steps: [
        {
          id: 'u2-l2-gh',
          type: 'concept',
          title: 'Clonar un repo privado',
          body: md`
            \`homelab-ha\` es **privado** (tendrá tus IPs y automatizaciones). Para clonarlo en Ubuntu, la forma más simple
            es la CLI de GitHub: \`gh auth login\` te autentica por el navegador y \`gh repo clone\` hace el resto.
          `,
        },
        {
          id: 'u2-l2-clone',
          type: 'build-command',
          prompt: 'Arma el comando para clonar tu repo en la carpeta correcta',
          chips: ['gh', 'repo', 'clone', HOMELAB_REPO, HOMELAB_DIR],
          distractors: ['git', 'pull', '--force', '/config'],
          mode: 'exact',
          hint: 'gh + subcomando + acción + repo + destino',
          explanation: `\`gh repo clone ${HOMELAB_REPO} ${HOMELAB_DIR}\` clona el repo usando tu sesión de \`gh\`; el último argumento es la carpeta de destino.`,
        },
        {
          id: 'u2-l2-env',
          type: 'fill-code',
          prompt: 'Completa tu `.env` (usa la zona horaria de ejemplo)',
          lang: 'ini',
          template: 'TZ=[[tz]]\nHA_IMAGE_TAG=[[tag]]\nCONFIG_DIR=./homeassistant/config',
          blanks: [
            { id: 'tz', accept: ['America/Bogota'], placeholder: 'Región/Ciudad', caseSensitive: true },
            { id: 'tag', accept: ['stable'], options: ['latest', 'stable', 'dev', 'beta'] },
          ],
          hint: 'La zona tiene el formato Región/Ciudad. Para empezar, el tag recomendado por HA es el canal estable.',
          explanation: '`stable` sigue la última versión estable. Más adelante (Unidad 8) verás por qué conviene fijar una versión concreta.',
        },
        {
          id: 'u2-l2-mission',
          type: 'mission',
          missionId: 'm-repo-folders',
          node: 'config',
          title: 'Clona homelab-ha y prepara /config',
          goal: 'Tener el repo en Ubuntu, la carpeta de configuración lista y tu `.env` fuera de git.',
          steps: [
            { text: 'Instala git y la CLI de GitHub, y autentícate:', code: { lang: 'bash', code: 'sudo apt install git gh\ngh auth login' } },
            { text: 'Clona el repo:', code: { lang: 'bash', code: `gh repo clone ${HOMELAB_REPO} ${HOMELAB_DIR}\ncd ${HOMELAB_DIR}` } },
            { text: 'Crea tu `.env` a partir de la plantilla y ajusta `TZ`:', code: { lang: 'bash', code: 'cp .env.example .env\ntimedatectl show -p Timezone --value\nnano .env' } },
            { text: 'Comprueba que la carpeta existe y que `.env` está ignorado:', code: { lang: 'bash', code: 'ls -la homeassistant/config\ngit check-ignore -v .env' } },
          ],
          expected: { lang: 'text', code: '.gitignore:2:.env\t.env' },
          checklist: [
            'Clonaste homelab-ha en tu Ubuntu',
            'Existe `homeassistant/config`',
            'Creaste `.env` con tu zona horaria',
            '`git check-ignore` confirma que `.env` no va a git',
          ],
          verify: {
            instruction: 'Dentro de homelab-ha, pega la salida de:',
            command: 'git check-ignore -v .env',
            patterns: ['\\.gitignore:\\d+:', '\\.env'],
            success: 'Tu `.env` está protegido: nunca se subirá por accidente.',
            failure: 'No veo la regla del .gitignore. ¿Estás dentro de la carpeta del repo?',
          },
        },
      ],
      resources: [
        { title: 'gh repo clone', url: 'https://cli.github.com/manual/gh_repo_clone', kind: 'docs', lang: 'en' },
        { title: 'gh auth login', url: 'https://cli.github.com/manual/gh_auth_login', kind: 'docs', lang: 'en' },
      ],
    },
  ],
}
