import { describe, expect, it } from 'vitest'
import { canonical, parseCommand, sameCommand, tokenize } from '../src/engine/commandParser'
import { gradeBlank, gradeChoice, verifyOutput } from '../src/engine/grading'
import { levelFor, streak, unitState, xpForStep, dayKey } from '../src/engine/progression'
import type { ChoiceStep, Unit } from '../src/content/schema'

describe('tokenize', () => {
  it('respeta comillas y continuaciones de línea', () => {
    expect(tokenize(`docker inspect -f '{{.Name}} {{.Id}}' ha`)).toEqual(['docker', 'inspect', '-f', '{{.Name}} {{.Id}}', 'ha'])
    expect(tokenize('docker run \\\n  -d img')).toEqual(['docker', 'run', '-d', 'img'])
  })
})

describe('parseCommand / sameCommand', () => {
  it('ignora el orden de los flags en docker run', () => {
    expect(
      sameCommand(
        'docker run -d --name ha --restart=unless-stopped --network=host img:stable',
        'docker run --network host --restart unless-stopped -d --name ha img:stable',
      ),
    ).toBe(true)
  })

  it('distingue la imagen y el comando del contenedor', () => {
    expect(sameCommand('docker run --rm alpine echo hola', 'docker run --rm alpine echo chao')).toBe(false)
    const p = parseCommand('docker run --rm alpine sh -c "echo -n hi"')
    expect(p.args).toEqual(['alpine', 'sh', '-c', 'echo -n hi'])
  })

  it('resuelve alias largos y combinados', () => {
    expect(sameCommand('docker ps --all', 'docker ps -a')).toBe(true)
    expect(sameCommand('docker exec -it ha sh', 'docker exec -i -t ha sh')).toBe(true)
    expect(sameCommand('docker run --net=host img', 'docker run --network host img')).toBe(true)
  })

  it('-f en logs es booleano y en inspect lleva valor', () => {
    expect(sameCommand('docker logs -f homeassistant', 'docker logs homeassistant --follow')).toBe(true)
    expect(sameCommand('docker logs -f -n 100 homeassistant', 'docker logs --tail 100 -f homeassistant')).toBe(true)
    expect(parseCommand("docker inspect -f '{{.Name}}' ha").options).toEqual(['-f={{.Name}}'])
  })

  it('un flag de más invalida la respuesta', () => {
    expect(sameCommand('docker run -d -p 8123:8123 --network=host img', 'docker run -d --network=host img')).toBe(false)
  })

  it('sudo no cambia el significado', () => {
    expect(canonical('sudo systemctl is-enabled docker')).toBe(canonical('systemctl is-enabled docker'))
  })

  it('agrupa subcomandos de compose', () => {
    expect(parseCommand('docker compose up -d').command).toEqual(['docker', 'compose', 'up'])
    expect(parseCommand('docker logs homeassistant').command).toEqual(['docker', 'logs'])
  })
})

describe('grading', () => {
  const step: ChoiceStep = {
    id: 't',
    type: 'choice',
    prompt: '',
    multiple: true,
    explanation: '',
    options: [
      { id: 'a', text: '', correct: true },
      { id: 'b', text: '', correct: true },
      { id: 'c', text: '' },
    ],
  }
  it('choice múltiple exige todas las correctas y ninguna incorrecta', () => {
    expect(gradeChoice(step, ['b', 'a'])).toBe(true)
    expect(gradeChoice(step, ['a'])).toBe(false)
    expect(gradeChoice(step, ['a', 'b', 'c'])).toBe(false)
  })

  it('blanks normalizan comillas, espacios y mayúsculas', () => {
    expect(gradeBlank({ id: 'x', accept: ['unless-stopped'] }, ' "Unless-Stopped" ')).toBe(true)
    expect(gradeBlank({ id: 'x', accept: ['RestartPolicy'], caseSensitive: true }, 'restartpolicy')).toBe(false)
  })

  it('verifyOutput exige todos los patrones', () => {
    const v = { instruction: '', command: '', patterns: ['unless-stopped', '\\bhost\\b'], success: '', failure: '' }
    expect(verifyOutput(v, 'unless-stopped host true')).toBe(true)
    expect(verifyOutput(v, 'unless-stopped bridge true')).toBe(false)
    expect(verifyOutput(v, '')).toBe(false)
  })
})

describe('progression', () => {
  it('XP por intento', () => {
    expect(xpForStep(1, false)).toBe(10)
    expect(xpForStep(3, false)).toBe(5)
    expect(xpForStep(3, true)).toBe(0)
  })

  it('niveles', () => {
    expect(levelFor(0).title).toBe('Novato')
    expect(levelFor(250).title).toBe('Contenedorista')
    expect(levelFor(100).progress).toBeCloseTo(0.5)
    expect(levelFor(99999).next).toBeUndefined()
  })

  it('la racha tolera que hoy aún no hayas practicado', () => {
    const today = new Date(2026, 8, 29)
    const d = (offset: number) => dayKey(new Date(2026, 8, 29 + offset))
    expect(streak({ [d(0)]: 10, [d(-1)]: 5, [d(-2)]: 5 }, today)).toBe(3)
    expect(streak({ [d(-1)]: 5, [d(-2)]: 5 }, today)).toBe(2)
    expect(streak({ [d(-2)]: 5 }, today)).toBe(0)
  })

  it('desbloqueo secuencial y modo libre', () => {
    const mk = (id: string, order: number, preview = false): Unit => ({
      id, order, level: 1, title: id, subtitle: '', icon: 'X', preview,
      lessons: [{ id: `${id}-l1`, title: '', summary: '', steps: [] }],
    })
    const us = [mk('a', 1), mk('b', 2), mk('r', 99, true)]
    const base = { completedLessons: {}, missions: {}, xp: 0, freeMode: false }
    expect(unitState(base, us, us[0]!)).toBe('available')
    expect(unitState(base, us, us[1]!)).toBe('locked')
    expect(unitState(base, us, us[2]!)).toBe('locked')
    expect(unitState({ ...base, completedLessons: { 'a-l1': 1 } }, us, us[1]!)).toBe('available')
    expect(unitState({ ...base, freeMode: true }, us, us[1]!)).toBe('available')
  })
})
