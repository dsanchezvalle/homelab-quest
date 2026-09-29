/**
 * Modelo de contenido de HomeLab Quest.
 *
 * Cada paso de una lección es una variante de la unión discriminada `Step`:
 * el campo `type` le dice a TypeScript (y al reproductor) qué forma tiene.
 * Agregar una lección = agregar datos, no componentes.
 */

export type Lang = 'bash' | 'yaml' | 'text' | 'ini'

export interface CodeSnippet {
  lang: Lang
  code: string
  caption?: string
}

export interface Resource {
  title: string
  url: string
  kind: 'docs' | 'article' | 'video' | 'tool'
  /** Idioma del recurso, para que sepas qué esperar. */
  lang?: 'es' | 'en'
}

export interface Callout {
  tone: 'tip' | 'warning' | 'info'
  title?: string
  body: string
}

interface StepBase {
  /** Único en toda la app. Convención: u<unidad>-l<lección>-<slug>. */
  id: string
}

/** Explicación: no se califica. */
export interface ConceptStep extends StepBase {
  type: 'concept'
  title: string
  body: string
  code?: CodeSnippet
  callouts?: Callout[]
}

export interface FlipCardData {
  id: string
  front: string
  back: string
  link?: Resource
}

/** Tarjetas para girar y profundizar. No se califica. */
export interface FlipStep extends StepBase {
  type: 'flip'
  title?: string
  cards: FlipCardData[]
}

export interface ChoiceOption {
  id: string
  text: string
  correct?: boolean
  /** Se muestra si eliges esta opción y fallas. */
  feedback?: string
}

/** Opción múltiple. Con `multiple`, hay que marcar todas las correctas. */
export interface ChoiceStep extends StepBase {
  type: 'choice'
  prompt: string
  code?: CodeSnippet
  multiple?: boolean
  options: ChoiceOption[]
  explanation: string
}

/** Emparejar columnas (se autocalifica par por par). */
export interface MatchStep extends StepBase {
  type: 'match'
  prompt: string
  pairs: { left: string; right: string }[]
  explanation: string
}

/**
 * Banco de fichas: armas un comando tocando fichas.
 * `solution` se compara con lo armado usando el parser de comandos,
 * así que el orden de los flags no importa en modo `docker`.
 */
export interface BuildCommandStep extends StepBase {
  type: 'build-command'
  prompt: string
  /** Fichas correctas, en un orden válido. */
  chips: string[]
  distractors: string[]
  /** `docker`: flags en cualquier orden. `exact`: orden estricto. */
  mode: 'docker' | 'exact'
  hint?: string
  explanation: string
}

export interface Blank {
  id: string
  /** Respuestas aceptadas (se normalizan: espacios, comillas, mayúsculas). */
  accept: string[]
  /** Si existe, el hueco es un desplegable con estas opciones. */
  options?: string[]
  placeholder?: string
  caseSensitive?: boolean
}

/** Código con huecos. Marca cada hueco en el template como [[id]] (las llaves quedan libres para Go templates y ${VAR}). */
export interface FillCodeStep extends StepBase {
  type: 'fill-code'
  prompt: string
  lang: Lang
  template: string
  blanks: Blank[]
  hint?: string
  explanation: string
}

/** Escribir el comando de memoria. */
export interface TypeCommandStep extends StepBase {
  type: 'type-command'
  prompt: string
  accept: string[]
  placeholder?: string
  hint?: string
  explanation: string
}

export interface MissionVerify {
  instruction: string
  command: string
  /** Expresiones regulares (fuente) que deben aparecer todas en la salida pegada. */
  patterns: string[]
  success: string
  failure: string
}

/** Tarea real en tu Ubuntu. Se completa con la checklist (y el verificador, si hay). */
export interface MissionStep extends StepBase {
  type: 'mission'
  missionId: string
  title: string
  goal: string
  /** Nodo del diagrama de arquitectura que se ilumina. Los laboratorios no tienen nodo. */
  node?: string
  steps: { text: string; code?: CodeSnippet }[]
  expected?: CodeSnippet
  checklist: string[]
  verify?: MissionVerify
  commit?: { files: string[]; message: string }
}

export type Step =
  | ConceptStep
  | FlipStep
  | ChoiceStep
  | MatchStep
  | BuildCommandStep
  | FillCodeStep
  | TypeCommandStep
  | MissionStep

export type StepType = Step['type']
export type GradableStep = ChoiceStep | BuildCommandStep | FillCodeStep | TypeCommandStep

export interface FrontHint {
  title: string
  body: string
  /** Ruta del archivo dentro de este repo. */
  file: string
}

export interface Lesson {
  id: string
  title: string
  summary: string
  steps: Step[]
  resources?: Resource[]
  frontHint?: FrontHint
}

export interface Unit {
  id: string
  order: number
  /** 1 = laboratorio actual, 1.5/2/3 = hoja de ruta. */
  level: 1 | 1.5 | 2 | 3
  title: string
  subtitle: string
  /** Nombre de icono de lucide-react (ver ui/Icon.tsx). */
  icon: string
  /** Las unidades de hoja de ruta se muestran como vista previa. */
  preview?: boolean
  lessons: Lesson[]
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  when:
    | { kind: 'unit'; unitId: string }
    | { kind: 'mission'; missionId: string }
    | { kind: 'xp'; amount: number }
    | { kind: 'streak'; days: number }
}

export interface ArchNode {
  id: string
  label: string
  sublabel?: string
  x: number
  y: number
  level: Unit['level']
  icon: string
}

export interface ArchEdge {
  from: string
  to: string
  label?: string
}
