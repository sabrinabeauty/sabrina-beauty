import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createService, deactivateService, listServices } from '../../lib/services'

beforeEach(async () => {
  await resetDbForTests()
})

describe('admin service management reflects on public listing', () => {
  it('deactivating a service removes it from the active-only public listing', async () => {
    const s = await createService({
      name: 'Dermaplaning Glow Facial', category: 'facial', description: 'x',
      pricePence: 9000, durationMinutes: 60, active: true,
    })
    expect((await listServices({ activeOnly: true })).map((x) => x.id)).toContain(s.id)
    await deactivateService(s.id)
    expect((await listServices({ activeOnly: true })).map((x) => x.id)).not.toContain(s.id)
  })
})
