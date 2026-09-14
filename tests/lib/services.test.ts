import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { createService, updateService, deactivateService, listServices } from '../../lib/services'

beforeEach(async () => {
  await resetDbForTests()
})

describe('services data layer', () => {
  it('creates a service and lists it', async () => {
    await createService({
      name: 'Brow Shape',
      category: 'brow',
      description: 'Precision waxing.',
      pricePence: 1800,
      durationMinutes: 15,
      active: true,
    })
    const services = await listServices()
    expect(services).toHaveLength(1)
    expect(services[0].name).toBe('Brow Shape')
  })

  it('updateService changes the price and the change is reflected in listServices', async () => {
    const s = await createService({
      name: 'Brow Shape',
      category: 'brow',
      description: 'Precision waxing.',
      pricePence: 1800,
      durationMinutes: 15,
      active: true,
    })
    await updateService(s.id, { pricePence: 2200 })
    const updated = (await listServices()).find((x) => x.id === s.id)
    expect(updated?.pricePence).toBe(2200)
  })

  it('deactivateService hides it from activeOnly listing but keeps it in full listing', async () => {
    const s = await createService({
      name: 'Back Exfoliation',
      category: 'facial',
      description: 'Deep cleansing back treatment.',
      pricePence: 4500,
      durationMinutes: 35,
      active: true,
    })
    await deactivateService(s.id)
    expect(await listServices({ activeOnly: true })).toHaveLength(0)
    expect(await listServices({ activeOnly: false })).toHaveLength(1)
  })
})
