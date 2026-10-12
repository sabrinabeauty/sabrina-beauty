import { describe, it, expect, beforeEach } from 'vitest'
import { resetDbForTests } from '../../lib/db'
import { updateSiteContent, getSiteContent } from '../../lib/settings'
import { sendBookingNotification, type EmailClient } from '../../lib/email'
import type { Booking } from '../../lib/bookings'
import type { Service } from '../../lib/services'

beforeEach(async () => {
  await resetDbForTests()
})

function fakeClient() {
  const calls: Array<{ to: string; subject: string; html: string; text: string }> = []
  const client: EmailClient = {
    async send(params) {
      calls.push(params)
    },
  }
  return { client, calls }
}

const booking: Booking = {
  id: 1,
  serviceId: 1,
  clientName: 'Jo Bloggs',
  clientEmail: 'jo@example.com',
  clientPhone: '07000000000',
  date: '2026-09-15',
  time: '10:00',
  status: 'pending',
  createdAt: '2026-09-14T12:00:00.000Z',
}

const service: Service = {
  id: 1,
  name: 'Classic Cleanse & Glow Facial',
  category: 'facial',
  description: 'x',
  pricePence: 7500,
  durationMinutes: 60,
  active: true,
}

describe('sendBookingNotification', () => {
  it('sends to the site\'s configured contact email', async () => {
    await updateSiteContent({ contactEmail: 'owner@sabrinabeauty.uk' })
    const { client, calls } = fakeClient()

    await sendBookingNotification(booking, service, client)

    expect(calls).toHaveLength(1)
    expect(calls[0].to).toBe('owner@sabrinabeauty.uk')
  })

  it('includes the service, date/time, and client contact details in the message', async () => {
    await updateSiteContent({ contactEmail: 'owner@sabrinabeauty.uk' })
    const { client, calls } = fakeClient()

    await sendBookingNotification(booking, service, client)

    const { subject, text, html } = calls[0]
    expect(subject).toContain('Classic Cleanse & Glow Facial')
    expect(subject).toContain('2026-09-15')
    expect(subject).toContain('10:00')
    for (const body of [text, html]) {
      expect(body).toContain('Jo Bloggs')
      expect(body).toContain('jo@example.com')
      expect(body).toContain('07000000000')
      expect(body).toContain('£75.00')
    }
  })

  it('reflects whatever contact email is currently set, including the default', async () => {
    const { contactEmail } = await getSiteContent()
    const { client, calls } = fakeClient()

    await sendBookingNotification(booking, service, client)

    expect(calls[0].to).toBe(contactEmail)
  })
})
