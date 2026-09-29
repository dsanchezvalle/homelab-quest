import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { units } from '../src/content'
import { archNodes, archEdges } from '../src/content/architecture'
import { badges } from '../src/content/badges'
import type { Resource, Step } from '../src/content/schema'
import { gradeBuildCommand, gradeFillCode, gradeTypeCommand } from '../src/engine/grading'
import { tokenize } from '../src/engine/commandParser'

const lessons = units.flatMap((u) => u.lessons)
const steps: Step[] = lessons.flatMap((l) => l.steps)

function allResources(): Resource[] {
  const out: Resource[] = []
  for (const l of lessons) {
    out.push(...(l.resources ?? []))
    for (const s of l.steps) if (s.type === 'flip') for (const c of s.cards) if (c.link) out.push(c.link)
  }
  return out
}

describe('integridad del contenido', () => {
  it('IDs únicos (unidades, lecciones, pasos, flip cards, misiones)', () => {
    const ids = [
      ...units.map((u) => u.id),
      ...lessons.map((l) => l.id),
      ...steps.map((s) => s.id),
      ...steps.flatMap((s) => (s.type === 'flip' ? s.cards.map((c) => c.id) : [])),
      ...steps.flatMap((s) => (s.type === 'mission' ? [s.missionId] : [])),
    ]
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(dupes).toEqual([])
  })

  it('los IDs de paso llevan el prefijo de su lección', () => {
    for (const l of lessons) for (const s of l.steps) expect(s.id.startsWith(l.id + '-'), s.id).toBe(true)
  })

  it('cada choice tiene al menos una opción correcta (y solo una si no es múltiple)', () => {
    for (const s of steps) {
      if (s.type !== 'choice') continue
      const n = s.options.filter((o) => o.correct).length
      expect(n, s.id).toBeGreaterThan(0)
      if (!s.multiple) expect(n, s.id).toBe(1)
    }
  })

  it('cada build-command se resuelve con sus propias fichas y las trampas no son parte de la solución', () => {
    for (const s of steps) {
      if (s.type !== 'build-command') continue
      expect(gradeBuildCommand(s, s.chips), s.id).toBe(true)
      for (const d of s.distractors) expect(s.chips.includes(d), `${s.id}: ${d}`).toBe(false)
    }
  })

  it('cada fill-code tiene todos sus huecos en el template y su primera respuesta aceptada es correcta', () => {
    for (const s of steps) {
      if (s.type !== 'fill-code') continue
      for (const b of s.blanks) {
        expect(s.template.includes(`[[${b.id}]]`), `${s.id}: [[${b.id}]]`).toBe(true)
        expect(b.accept.length, `${s.id}/${b.id}`).toBeGreaterThan(0)
        if (b.options) expect(b.options.includes(b.accept[0]!), `${s.id}/${b.id} options`).toBe(true)
      }
      const markers = [...s.template.matchAll(/\[\[(\w+)\]\]/g)].map((m) => m[1])
      expect(markers.sort(), s.id).toEqual(s.blanks.map((b) => b.id).sort())
      const values = Object.fromEntries(s.blanks.map((b) => [b.id, b.accept[0]!]))
      expect(gradeFillCode(s, values).ok, s.id).toBe(true)
    }
  })

  it('cada type-command acepta sus propias respuestas', () => {
    for (const s of steps) {
      if (s.type !== 'type-command') continue
      for (const a of s.accept) {
        expect(tokenize(a).length, `${s.id}: ${a}`).toBeGreaterThan(0)
        expect(gradeTypeCommand(s, a), `${s.id}: ${a}`).toBe(true)
      }
    }
  })

  it('cada match tiene lados únicos', () => {
    for (const s of steps) {
      if (s.type !== 'match') continue
      const left = s.pairs.map((p) => p.left)
      const right = s.pairs.map((p) => p.right)
      expect(new Set(left).size, s.id).toBe(left.length)
      expect(new Set(right).size, s.id).toBe(right.length)
    }
  })

  it('las misiones apuntan a nodos existentes y sus regex compilan', () => {
    const nodeIds = new Set(archNodes.map((n) => n.id))
    for (const s of steps) {
      if (s.type !== 'mission') continue
      if (s.node) expect(nodeIds.has(s.node), `${s.id} → ${s.node}`).toBe(true)
      expect(s.checklist.length, s.id).toBeGreaterThan(0)
      for (const p of s.verify?.patterns ?? []) expect(() => new RegExp(p, 'im'), p).not.toThrow()
    }
  })

  it('cada nodo del Nivel 1 tiene una misión que lo ilumina', () => {
    const lit = new Set(steps.flatMap((s) => (s.type === 'mission' && s.node ? [s.node] : [])))
    const allUnitsPresent = units.filter((u) => !u.preview).length >= 12
    for (const n of archNodes.filter((n) => n.level === 1)) {
      if (allUnitsPresent) expect(lit.has(n.id), n.id).toBe(true)
    }
  })

  it('las aristas del diagrama conectan nodos existentes', () => {
    const nodeIds = new Set(archNodes.map((n) => n.id))
    for (const e of archEdges) {
      expect(nodeIds.has(e.from), e.from).toBe(true)
      expect(nodeIds.has(e.to), e.to).toBe(true)
    }
  })

  it('las insignias apuntan a unidades/misiones existentes', () => {
    const unitIds = new Set(units.map((u) => u.id))
    const missionIds = new Set(steps.flatMap((s) => (s.type === 'mission' ? [s.missionId] : [])))
    for (const b of badges) {
      if (b.when.kind === 'unit') expect(unitIds.has(b.when.unitId), b.id).toBe(true)
      if (b.when.kind === 'mission' && units.length >= 12) expect(missionIds.has(b.when.missionId), b.id).toBe(true)
    }
  })

  it('todos los enlaces son https', () => {
    for (const r of allResources()) expect(r.url.startsWith('https://'), r.url).toBe(true)
  })

  it('las pistas front apuntan a archivos que existen', () => {
    for (const l of lessons) {
      if (!l.frontHint) continue
      expect(existsSync(resolve(__dirname, '..', l.frontHint.file)), `${l.id}: ${l.frontHint.file}`).toBe(true)
    }
  })
})
