import type {
  Blank,
  BuildCommandStep,
  ChoiceStep,
  FillCodeStep,
  GradableStep,
  MissionVerify,
  Step,
  TypeCommandStep,
} from '../content/schema'
import { sameCommand, sameExact } from './commandParser'

/** Respuesta que produce cada tipo de paso calificable. */
export type Answer =
  | { type: 'choice'; selected: string[] }
  | { type: 'build-command'; chips: string[] }
  | { type: 'fill-code'; values: Record<string, string> }
  | { type: 'type-command'; text: string }

export function isGradable(step: Step): step is GradableStep {
  return (
    step.type === 'choice' ||
    step.type === 'build-command' ||
    step.type === 'fill-code' ||
    step.type === 'type-command'
  )
}

export function emptyAnswer(step: GradableStep): Answer {
  switch (step.type) {
    case 'choice':
      return { type: 'choice', selected: [] }
    case 'build-command':
      return { type: 'build-command', chips: [] }
    case 'fill-code':
      return { type: 'fill-code', values: {} }
    case 'type-command':
      return { type: 'type-command', text: '' }
  }
}

/** ¿Hay algo que comprobar? (habilita el botón "Comprobar"). */
export function isAnswerReady(step: GradableStep, answer: Answer): boolean {
  switch (answer.type) {
    case 'choice':
      return answer.selected.length > 0
    case 'build-command':
      return answer.chips.length > 0
    case 'fill-code':
      return step.type === 'fill-code' && step.blanks.every((b) => (answer.values[b.id] ?? '').trim() !== '')
    case 'type-command':
      return answer.text.trim() !== ''
  }
}

export function gradeChoice(step: ChoiceStep, selected: string[]): boolean {
  const correct = step.options.filter((o) => o.correct).map((o) => o.id).sort()
  const picked = [...new Set(selected)].sort()
  return correct.length === picked.length && correct.every((id, i) => id === picked[i])
}

export function gradeBuildCommand(step: BuildCommandStep, chips: string[]): boolean {
  const built = chips.join(' ')
  const solution = step.chips.join(' ')
  return step.mode === 'docker' ? sameCommand(built, solution) : sameExact(built, solution)
}

export function normalizeBlank(value: string, caseSensitive = false): string {
  const v = value.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, ' ')
  return caseSensitive ? v : v.toLowerCase()
}

export function gradeBlank(blank: Blank, value: string): boolean {
  const v = normalizeBlank(value, blank.caseSensitive)
  return blank.accept.some((a) => normalizeBlank(a, blank.caseSensitive) === v)
}

export function gradeFillCode(step: FillCodeStep, values: Record<string, string>) {
  const perBlank: Record<string, boolean> = {}
  for (const b of step.blanks) perBlank[b.id] = gradeBlank(b, values[b.id] ?? '')
  return { ok: Object.values(perBlank).every(Boolean), perBlank }
}

export function gradeTypeCommand(step: TypeCommandStep, text: string): boolean {
  return step.accept.some((a) => sameCommand(text, a))
}

export function gradeStep(step: GradableStep, answer: Answer): boolean {
  if (step.type === 'choice' && answer.type === 'choice') return gradeChoice(step, answer.selected)
  if (step.type === 'build-command' && answer.type === 'build-command')
    return gradeBuildCommand(step, answer.chips)
  if (step.type === 'fill-code' && answer.type === 'fill-code') return gradeFillCode(step, answer.values).ok
  if (step.type === 'type-command' && answer.type === 'type-command')
    return gradeTypeCommand(step, answer.text)
  return false
}

/** Texto de la solución, para "Ver solución" tras varios intentos. */
export function describeSolution(step: GradableStep): string {
  switch (step.type) {
    case 'choice':
      return step.options
        .filter((o) => o.correct)
        .map((o) => `- ${o.text}`)
        .join('\n')
    case 'build-command':
      return '```bash\n' + step.chips.join(' ') + '\n```'
    case 'fill-code': {
      let code = step.template
      for (const b of step.blanks) code = code.replace(`[[${b.id}]]`, b.accept[0] ?? '')
      return '```' + step.lang + '\n' + code + '\n```'
    }
    case 'type-command':
      return '```bash\n' + (step.accept[0] ?? '') + '\n```'
  }
}

/** Valida la salida que pegas de tu terminal contra los patrones de la misión. */
export function verifyOutput(verify: MissionVerify, output: string): boolean {
  if (!output.trim()) return false
  return verify.patterns.every((p) => new RegExp(p, 'im').test(output))
}
