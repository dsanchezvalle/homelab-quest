/**
 * Verifica que todos los enlaces del contenido respondan.
 * Depende de la red, así que `npm test` lo omite: usa `npm run check-links`.
 * Los videos de YouTube se validan con su endpoint oEmbed.
 */
import { describe, expect, it } from 'vitest'
import { units } from '../src/content'
import type { Resource } from '../src/content/schema'

const all = new Map<string, Resource>()
for (const l of units.flatMap((u) => u.lessons)) {
  for (const r of l.resources ?? []) all.set(r.url, r)
  for (const s of l.steps) if (s.type === 'flip') for (const c of s.cards) if (c.link) all.set(c.link.url, c.link)
}

/** Sitios que bloquean clientes no-navegador (403) aunque la página exista: verificados a mano. */
const BOT_PROTECTED = new Set(['www.raspberrypi.com'])

async function reachable(url: string): Promise<number> {
  const target = /youtube\.com\/watch/.test(url)
    ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`
    : url.split('#')[0]!
  const res = await fetch(target, { redirect: 'follow', headers: { 'user-agent': 'homelab-quest-link-check' } })
  return res.status
}

describe.runIf(process.env.CHECK_LINKS)('enlaces', () => {
  it.each([...all.keys()])('%s', async (url) => {
    const status = await reachable(url)
    if (status === 403 && BOT_PROTECTED.has(new URL(url).host)) return
    expect(status).toBeLessThan(400)
  }, 20_000)
})
