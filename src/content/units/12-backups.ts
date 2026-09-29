import type { Unit } from '../schema'
import { md } from '../md'
import { HOMELAB_DIR } from '../config'

export const BACKUP_SH = md`
  #!/usr/bin/env bash
  # Backup en frío de la configuración de Home Assistant.
  # Uso (desde cualquier carpeta): ~/homelab-ha/scripts/backup.sh
  set -euo pipefail

  cd "$(dirname "$0")/.."
  mkdir -p backups
  stamp=$(date +%Y%m%d-%H%M%S)
  file="backups/ha-config-\${stamp}.tar.gz"

  echo "⏸  Deteniendo Home Assistant…"
  docker compose stop homeassistant
  # Pase lo que pase (incluso si tar falla), HA vuelve a arrancar.
  trap 'echo "▶  Arrancando Home Assistant…"; docker compose start homeassistant' EXIT

  echo "📦 Empaquetando homeassistant/config → \${file}"
  sudo tar -czf "\${file}" -C homeassistant config
  sudo chown "$(id -u):$(id -g)" "\${file}"

  # Conserva solo los 7 backups más recientes.
  ls -1t backups/ha-config-*.tar.gz | tail -n +8 | xargs -r rm --

  echo "✅ Backup listo: \${file} ($(du -h "\${file}" | cut -f1))"
`

export const RESTORE_SH = md`
  #!/usr/bin/env bash
  # Restaura un backup creado con backup.sh.
  # Uso: ~/homelab-ha/scripts/restore.sh backups/ha-config-AAAAMMDD-HHMMSS.tar.gz
  set -euo pipefail

  cd "$(dirname "$0")/.."
  file="\${1:?Indica el .tar.gz a restaurar}"
  [[ -f "$file" ]] || { echo "No existe: $file" >&2; exit 1; }

  echo "⏸  Deteniendo Home Assistant…"
  docker compose stop homeassistant || true

  if [[ -d homeassistant/config ]]; then
    aside="homeassistant/config.before-restore-$(date +%Y%m%d-%H%M%S)"
    echo "↪  Guardando la config actual en \${aside}"
    sudo mv homeassistant/config "$aside"
  fi

  echo "📦 Restaurando $file"
  sudo tar -xzf "$file" -C homeassistant

  echo "▶  Levantando Home Assistant…"
  docker compose up -d
  echo "✅ Restaurado. Revisa: docker compose logs -f"
`

export const unit12: Unit = {
  id: 'u12',
  order: 12,
  level: 1,
  title: 'Backups y portabilidad',
  subtitle: 'Qué respaldar, cómo y el simulacro de restauración',
  icon: 'Archive',
  lessons: [
    {
      id: 'u12-l1',
      title: 'Qué respaldar',
      summary: 'Dos capas: git para lo declarativo y backups para el estado.',
      steps: [
        {
          id: 'u12-l1-layers',
          type: 'concept',
          title: 'Dos capas de protección',
          body: md`
            | Contenido de /config | ¿En git? | ¿En el backup? |
            |---|---|---|
            | \`*.yaml\` (configuración, automatizaciones) | ✅ | ✅ |
            | \`secrets.yaml\` | ❌ | ✅ |
            | \`.storage/\` (usuarios, integraciones, dispositivos, tokens) | ❌ | ✅ **crítico** |
            | \`home-assistant_v2.db\` (historial) | ❌ | ✅ (pesado) |

            **Git** te da historial y revisión de cambios. **El backup** te da todo lo demás.
            HA también trae **backups integrados** (*Ajustes → Sistema → Copias de seguridad*): cifrados, programables y
            con un *kit de emergencia* que contiene la clave. Complementan tu script; no lo reemplazan.
          `,
          callouts: [
            { tone: 'tip', title: 'Regla 3-2-1', body: '**3** copias, en **2** soportes distintos, **1** fuera de casa (o al menos fuera de ese equipo).' },
          ],
        },
        {
          id: 'u12-l1-lose',
          type: 'choice',
          prompt: 'Se muere el disco de Ubuntu. Tienes el repo en GitHub, pero **ningún backup**. ¿Qué recuperas?',
          options: [
            { id: 'a', text: 'Solo lo versionado (compose y YAML). Pierdes usuarios, integraciones y dispositivos (.storage) y el historial.', correct: true },
            { id: 'b', text: 'Todo: git lo guarda todo.', feedback: 'Tu .gitignore excluye .storage, secretos y la base de datos, y está bien que lo haga.' },
            { id: 'c', text: 'Nada.', feedback: 'El repo sí tiene compose.yaml y tus automatizaciones.' },
          ],
          explanation: 'Git no es un backup del estado. Por eso existen las dos capas.',
        },
        {
          id: 'u12-l1-stop',
          type: 'choice',
          prompt: '¿Por qué detener HA antes de empaquetar la carpeta con `tar`?',
          options: [
            { id: 'a', text: 'Para que la base SQLite no quede a medio escribir y el backup sea consistente.', correct: true },
            { id: 'b', text: 'Porque tar no puede leer archivos abiertos.', feedback: 'Puede leerlos, pero podría copiar una base de datos en un estado inconsistente.' },
            { id: 'c', text: 'Para liberar RAM.', feedback: 'No es el motivo.' },
          ],
          explanation: 'Es un backup **en frío**: unos segundos sin HA a cambio de una copia íntegra.',
        },
        {
          id: 'u12-l1-fill',
          type: 'fill-code',
          prompt: 'Completa el backup en frío manual',
          lang: 'bash',
          template: md`
            docker compose [[stop]]
            sudo tar -czf backups/ha-config.tar.gz -C homeassistant [[dir]]
            docker compose [[start]]
          `,
          blanks: [
            { id: 'stop', accept: ['stop'], options: ['down -v', 'stop', 'pause', 'rm'] },
            { id: 'dir', accept: ['config'], placeholder: 'carpeta' },
            { id: 'start', accept: ['start', 'up -d'], options: ['start', 'up -d', 'build', 'pull'] },
          ],
          explanation: '`stop`/`start` conservan el contenedor. `-C homeassistant config` hace que el tar guarde rutas relativas (`config/…`), fáciles de restaurar en otra máquina.',
        },
        {
          id: 'u12-l1-flip',
          type: 'flip',
          cards: [
            { id: 'u12-flip-restore', front: '¿Cuándo sabes que tu backup sirve?', back: 'Cuando lo **restauraste** y funcionó. Un backup sin prueba de restauración es una esperanza, no un plan.' },
            { id: 'u12-flip-ha-backup', front: 'Backup integrado de HA', back: 'Se guarda cifrado y requiere la clave del **kit de emergencia**. Se restaura desde el onboarding de una instalación nueva: útil para migrar a la Pi.' },
          ],
        },
      ],
      resources: [
        { title: 'Home Assistant: backups', url: 'https://www.home-assistant.io/common-tasks/general/#backups', kind: 'docs', lang: 'en' },
        { title: 'Backup integration', url: 'https://www.home-assistant.io/integrations/backup/', kind: 'docs', lang: 'en' },
      ],
    },
    {
      id: 'u12-l2',
      title: 'Backup y restore',
      summary: 'Scripts versionados y un simulacro real de restauración.',
      steps: [
        {
          id: 'u12-l2-script',
          type: 'concept',
          title: 'backup.sh',
          body: 'Este script automatiza lo que acabas de practicar y deja HA arrancado **pase lo que pase**:',
          code: { lang: 'bash', code: BACKUP_SH, caption: 'scripts/backup.sh' },
        },
        {
          id: 'u12-l2-trap',
          type: 'choice',
          prompt: '¿Qué hace `trap \'…\' EXIT` en backup.sh?',
          options: [
            { id: 'a', text: 'Ejecuta el arranque de HA al salir del script, aunque `tar` falle.', correct: true },
            { id: 'b', text: 'Atrapa errores y los oculta.', feedback: 'No oculta nada: `set -e` sigue abortando el script. `trap` solo garantiza la limpieza.' },
            { id: 'c', text: 'Evita que el usuario cancele con Ctrl+C.', feedback: 'Eso sería atrapar SIGINT para ignorarla. Aquí solo se actúa al salir.' },
          ],
          explanation: 'Patrón clásico de "limpieza garantizada": el equivalente en bash de un `finally`.',
        },
        {
          id: 'u12-l2-set',
          type: 'choice',
          prompt: '¿Qué significa `set -euo pipefail`?',
          options: [
            { id: 'a', text: 'Abortar ante cualquier error, ante variables no definidas y ante fallos dentro de un pipe.', correct: true },
            { id: 'b', text: 'Activar el modo verbose.', feedback: 'Eso sería `set -x`.' },
            { id: 'c', text: 'Ejecutar el script como root.', feedback: 'No cambia permisos.' },
          ],
          explanation: 'El "modo estricto" de bash. Todo script que toque tus datos debería empezar así.',
        },
        {
          id: 'u12-l2-mission',
          type: 'mission',
          missionId: 'm-backup',
          node: 'backup',
          title: 'Backup, restore y copia fuera del equipo',
          goal: 'Tener scripts versionados, un backup real, una restauración probada y una copia fuera de Ubuntu.',
          steps: [
            { text: 'Crea `scripts/backup.sh`:', code: { lang: 'bash', code: BACKUP_SH, caption: 'scripts/backup.sh' } },
            { text: 'Crea `scripts/restore.sh`:', code: { lang: 'bash', code: RESTORE_SH, caption: 'scripts/restore.sh' } },
            { text: 'Hazlos ejecutables y crea un backup:', code: { lang: 'bash', code: `cd ${HOMELAB_DIR}\nchmod +x scripts/*.sh\n./scripts/backup.sh\nls -lh backups/` } },
            { text: '**Simulacro:** restaura el backup recién creado y comprueba que HA funciona igual. Luego borra la carpeta `config.before-restore-*`:', code: { lang: 'bash', code: './scripts/restore.sh backups/ha-config-AAAAMMDD-HHMMSS.tar.gz\ndocker compose logs --tail 30' } },
            { text: 'Copia el backup **fuera** de Ubuntu (por ejemplo, desde tu Mac):', code: { lang: 'bash', code: 'scp usuario@IP-DE-UBUNTU:~/homelab-ha/backups/ha-config-*.tar.gz ~/Backups/' } },
            { text: 'Versiona los scripts:', code: { lang: 'bash', code: 'git add scripts/\ngit commit -m "feat: scripts de backup y restore de la configuración"\ngit push' } },
          ],
          checklist: [
            'backup.sh generó un .tar.gz en backups/',
            'Restauré ese backup y HA quedó igual',
            'Tengo una copia fuera del equipo',
            'Hice commit de los scripts',
          ],
          verify: {
            instruction: 'Pega la salida de:',
            command: `ls -lh ${HOMELAB_DIR}/backups`,
            patterns: ['ha-config-\\d{8}-\\d{6}\\.tar\\.gz'],
            success: 'Backup real, con nombre fechado. Ya puedes migrar a cualquier máquina.',
            failure: 'No veo un archivo `ha-config-AAAAMMDD-HHMMSS.tar.gz`. ¿Corriste ./scripts/backup.sh?',
          },
          commit: { files: ['scripts/backup.sh', 'scripts/restore.sh'], message: 'feat: scripts de backup y restore de la configuración' },
        },
      ],
      resources: [
        { title: 'Bash strict mode (set -euo pipefail)', url: 'https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html', kind: 'docs', lang: 'en' },
      ],
      frontHint: {
        title: 'Deploy automático a GitHub Pages',
        body: 'Cada push a `main` ejecuta un workflow de GitHub Actions: `npm ci` → typecheck → tests → `vite build` → publicación en Pages. Si un test de integridad del contenido falla (por ejemplo, una misión que apunta a un nodo inexistente), no se publica nada roto. Es CI/CD real aplicado a tu propia app.',
        file: '.github/workflows/deploy.yml',
      },
    },
  ],
}
