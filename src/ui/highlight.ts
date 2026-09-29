/**
 * Resaltador de sintaxis mínimo para bash, YAML y .env.
 * No pretende ser completo: colorea lo suficiente para leer comandos y
 * configuraciones de un vistazo, sin cargar una librería de 100 KB.
 */
import type { Lang } from '../content/schema'

export type TokenClass = 'cmd' | 'flag' | 'str' | 'com' | 'var' | 'key' | 'lit' | 'op'
export interface Token {
  text: string
  cls?: TokenClass
}

const BASH_RE =
  /(#.*$)|('[^']*'?|"(?:[^"\\]|\\.)*"?)|(\$\{[^}]*\}|\$\([^)]*\)|\$\w+)|(&&|\|\||[|;<>])|(--?[A-Za-z][\w-]*(?:=\S*)?)|([^\s'"$|;<>&]+|&)|(\s+)/g

function bashLine(line: string): Token[] {
  const out: Token[] = []
  let expectCmd = true
  for (const m of line.matchAll(BASH_RE)) {
    const [text, com, str, variable, op, flag, word] = m
    if (com) out.push({ text, cls: 'com' })
    else if (str) out.push({ text, cls: 'str' })
    else if (variable) out.push({ text, cls: 'var' })
    else if (op) {
      out.push({ text, cls: 'op' })
      expectCmd = true
    } else if (flag && !expectCmd) out.push({ text, cls: 'flag' })
    else if (word || flag) {
      out.push({ text, cls: expectCmd ? 'cmd' : undefined })
      // `sudo docker …`: el comando real es la palabra siguiente.
      if (!(expectCmd && text === 'sudo')) expectCmd = false
    } else out.push({ text })
  }
  return out
}

const YAML_VALUE_RE = /(\s#.*$)|(\$\{[^}]*\})|('[^']*'|"[^"]*")|(\b(?:true|false|null|\d+[smh]?)\b)|([^$'"#]+|.)/g

function yamlValue(value: string): Token[] {
  const out: Token[] = []
  for (const m of value.matchAll(YAML_VALUE_RE)) {
    const [text, com, variable, str, lit] = m
    out.push({ text, cls: com ? 'com' : variable ? 'var' : str ? 'str' : lit ? 'lit' : undefined })
  }
  return out
}

function yamlLine(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ text: line, cls: 'com' }]
  const kv = line.match(/^(\s*)(- )?([\w.\-/]+)(:)(.*)$/)
  if (kv) {
    const [, indent = '', dash, key = '', colon = '', rest = ''] = kv
    return [
      { text: indent },
      ...(dash ? [{ text: dash, cls: 'op' as const }] : []),
      { text: key, cls: 'key' },
      { text: colon, cls: 'op' },
      ...yamlValue(rest),
    ]
  }
  const item = line.match(/^(\s*)(- )(.*)$/)
  if (item) return [{ text: item[1] ?? '' }, { text: item[2] ?? '', cls: 'op' }, ...yamlValue(item[3] ?? '')]
  return yamlValue(line)
}

function iniLine(line: string): Token[] {
  if (/^\s*#/.test(line)) return [{ text: line, cls: 'com' }]
  const kv = line.match(/^(\s*[\w.]+)(=)(.*)$/)
  if (kv) return [{ text: kv[1] ?? '', cls: 'key' }, { text: '=', cls: 'op' }, { text: kv[3] ?? '', cls: 'str' }]
  return [{ text: line }]
}

export function highlight(code: string, lang: Lang): Token[][] {
  const lines = code.split('\n')
  switch (lang) {
    case 'bash':
      return lines.map(bashLine)
    case 'yaml':
      return lines.map(yamlLine)
    case 'ini':
      return lines.map(iniLine)
    default:
      return lines.map((l) => [{ text: l }])
  }
}
