/**
 * Template tag que quita la indentación común, para escribir markdown y
 * código indentados dentro del TS sin que la sangría llegue a la pantalla.
 *
 * Ojo al escribir bash dentro de un template literal:
 *  - `\${VAR}` para que JS no interpole.
 *  - `\\` al final de línea para la continuación de bash.
 */
export function md(strings: TemplateStringsArray, ...values: unknown[]): string {
  const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ''), '')
  const lines = text.replace(/^\n/, '').replace(/\n[ \t]*$/, '').split('\n')
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length)
  const min = indents.length ? Math.min(...indents) : 0
  return lines.map((l) => l.slice(min)).join('\n')
}
