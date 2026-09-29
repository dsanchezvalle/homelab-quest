/** Datos personales usados en los comandos de las misiones. Cámbialos aquí. */
export const GITHUB_USER = 'dsanchezvalle'
export const HOMELAB_REPO = `${GITHUB_USER}/homelab-ha`
export const QUEST_REPO_URL = `https://github.com/${GITHUB_USER}/homelab-quest`
/** Dónde vive el repo homelab-ha en tu Ubuntu. */
export const HOMELAB_DIR = '~/homelab-ha'
export const CONFIG_DIR = `${HOMELAB_DIR}/homeassistant/config`
/** Zona horaria de ejemplo: reemplázala por la tuya (`timedatectl show -p Timezone --value`). */
export const EXAMPLE_TZ = 'America/Bogota'
export const HA_IMAGE = 'ghcr.io/home-assistant/home-assistant:stable'
