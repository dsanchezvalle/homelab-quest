/**
 * Parser de comandos para calificar respuestas.
 *
 * `docker run -d --name ha img` y `docker run --name ha -d img` son el mismo
 * comando: el parser separa subcomando, opciones y argumentos, ordena las
 * opciones y produce una forma canónica comparable.
 */

/** Alias largos → forma corta canónica. */
const GLOBAL_ALIASES: Record<string, string> = {
  '--detach': '-d',
  '--env': '-e',
  '--volume': '-v',
  '--publish': '-p',
  '--interactive': '-i',
  '--tty': '-t',
  '--net': '--network',
  '--all': '-a',
  '--quiet': '-q',
}

/** Alias que dependen del subcomando (`-f` significa cosas distintas). */
const CONTEXT_ALIASES: Record<string, Record<string, string>> = {
  logs: { '--follow': '-f', '--tail': '-n' },
  inspect: { '--format': '-f' },
  ps: { '--format': '--format' },
  rm: { '--force': '-f' },
  prune: { '--force': '-f', '--all': '-a' },
}

/** Opciones que consumen el siguiente token como valor. */
const VALUE_FLAGS = new Set([
  '--name', '-e', '-v', '-p', '--restart', '--network', '-f', '--format',
  '--mount', '--stop-timeout', '-w', '--workdir', '--entrypoint', '-u', '--user',
  '-n', '--tail', '--since', '--env-file', '--project-name', '--profile', '-t',
  '--time', '--filter', '--label', '-l', '--cpus', '--memory', '-m', '--device',
])

/** Subcomandos después de cuyo primer argumento todo es literal (el comando del contenedor). */
const TAIL_COMMANDS = new Set(['run', 'exec'])

/** Flags que en ciertos subcomandos son booleanos aunque en otros lleven valor. */
const BOOLEAN_IN: Record<string, Set<string>> = {
  logs: new Set(['-f', '-t']), // --follow, --timestamps
  rm: new Set(['-f']), // --force
  prune: new Set(['-f', '-a']),
  run: new Set(['-t']), // -t = --tty
  exec: new Set(['-t']),
  create: new Set(['-t']),
}

export function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ''
  let quote: '"' | "'" | null = null
  let hasToken = false
  const src = input.replace(/\\\s*\n/g, ' ') // continuación de línea con "\"

  for (const ch of src) {
    if (quote) {
      if (ch === quote) quote = null
      else current += ch
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      hasToken = true
      continue
    }
    if (/\s/.test(ch)) {
      if (hasToken) tokens.push(current)
      current = ''
      hasToken = false
      continue
    }
    current += ch
    hasToken = true
  }
  if (hasToken) tokens.push(current)
  return tokens
}

export interface ParsedCommand {
  /** Palabras iniciales: ["docker", "compose", "up"]. */
  command: string[]
  /** Opciones canónicas como "flag" o "flag=valor", ordenadas. */
  options: string[]
  /** Argumentos posicionales y cola literal, en orden. */
  args: string[]
}

export function parseCommand(input: string): ParsedCommand {
  const tokens = tokenize(input.trim())
  const command: string[] = []
  const options: string[] = []
  const args: string[] = []

  let i = 0
  // `sudo` no cambia el significado del comando.
  if (tokens[0] === 'sudo') i++
  while (i < tokens.length && !tokens[i]!.startsWith('-')) {
    // En `docker logs homeassistant` la tercera palabra ya es un argumento:
    // solo agrupamos como comando las palabras "conocidas" del CLI.
    if (command.length >= 2 && !isSubcommandWord(command, tokens[i]!)) break
    command.push(tokens[i]!)
    i++
  }

  const sub = command[command.length - 1] ?? ''
  const aliases = { ...GLOBAL_ALIASES, ...(CONTEXT_ALIASES[sub] ?? {}) }
  let tailStarted = false

  for (; i < tokens.length; i++) {
    const tok = tokens[i]!
    if (tailStarted || !tok.startsWith('-') || tok === '-') {
      args.push(tok)
      if (TAIL_COMMANDS.has(sub)) tailStarted = true
      continue
    }

    // --flag=valor
    const eq = tok.indexOf('=')
    if (tok.startsWith('--') && eq > 0) {
      const flag = aliases[tok.slice(0, eq)] ?? tok.slice(0, eq)
      options.push(`${flag}=${tok.slice(eq + 1)}`)
      continue
    }

    // Flags cortos combinados: -it → -i -t
    if (/^-[a-zA-Z]{2,}$/.test(tok)) {
      for (const c of tok.slice(1)) options.push(`-${c}`)
      continue
    }

    const flag = aliases[tok] ?? tok
    const takesValue = VALUE_FLAGS.has(flag) && !BOOLEAN_IN[sub]?.has(flag)
    if (takesValue && i + 1 < tokens.length) {
      options.push(`${flag}=${tokens[i + 1]}`)
      i++
    } else {
      options.push(flag)
    }
  }

  options.sort()
  return { command, options, args }
}

const SUBCOMMANDS: Record<string, string[]> = {
  docker: [
    'run', 'ps', 'logs', 'inspect', 'exec', 'stop', 'start', 'restart', 'rm', 'pull',
    'images', 'image', 'volume', 'network', 'stats', 'top', 'system', 'compose',
    'container', 'version', 'info', 'create', 'kill', 'rmi', 'tag', 'push', 'build',
  ],
  compose: ['up', 'down', 'ps', 'logs', 'pull', 'stop', 'start', 'restart', 'config', 'exec', 'top', 'ls'],
  volume: ['create', 'ls', 'inspect', 'rm', 'prune'],
  network: ['create', 'ls', 'inspect', 'rm', 'prune', 'connect', 'disconnect'],
  image: ['ls', 'pull', 'prune', 'rm', 'inspect'],
  system: ['df', 'prune', 'info'],
  container: ['ls', 'prune', 'inspect', 'rm'],
  systemctl: ['status', 'enable', 'disable', 'start', 'stop', 'restart', 'is-enabled', 'is-active'],
  git: ['add', 'commit', 'push', 'pull', 'clone', 'status', 'log', 'diff'],
}

function isSubcommandWord(command: string[], word: string): boolean {
  const parent = command[command.length - 1] ?? ''
  return SUBCOMMANDS[parent]?.includes(word) ?? false
}

export function canonical(input: string): string {
  const p = parseCommand(input)
  return [...p.command, '|', ...p.options, '|', ...p.args].join(' ')
}

export function sameCommand(a: string, b: string): boolean {
  return canonical(a) === canonical(b)
}

/** Comparación estricta (solo normaliza espacios y comillas). */
export function sameExact(a: string, b: string): boolean {
  return tokenize(a).join(' ') === tokenize(b).join(' ')
}
