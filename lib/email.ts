import { Resend } from 'resend'
import type { Booking } from './bookings'
import type { Service } from './services'
import { getSiteContent } from './settings'

export interface EmailClient {
  send(params: { to: string; subject: string; html: string; text: string }): Promise<void>
}

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// The site's own "From" domain isn't verified in Resend yet (that needs DNS
// records added at Fasthosts) — resend.dev's shared sandbox domain works
// immediately on the free tier without any domain verification, so booking
// alerts work today. Swap to a sabrinabeauty.uk address once the domain is
// verified in Resend (see README/DEPLOYMENT notes).
const FROM_ADDRESS = 'Sabrina Beauty Bookings <onboarding@resend.dev>'

const defaultClient: EmailClient = {
  async send({ to, subject, html, text }) {
    const client = getResendClient()
    const result = await client.emails.send({ from: FROM_ADDRESS, to, subject, html, text })
    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`)
    }
  },
}

function formatPrice(pricePence: number): string {
  return `£${(pricePence / 100).toFixed(2)}`
}

/**
 * Alerts the salon owner that a new booking came in. Deliberately never
 * throws past the caller it matters to (app/api/bookings/route.ts) without
 * that caller choosing to let it — a failed notification must never undo
 * or block a successful booking; the customer's slot is already reserved
 * and that has to stand regardless of whether this email goes out. Callers
 * are responsible for catching and logging, not this function pretending
 * failure is success.
 */
export async function sendBookingNotification(
  booking: Booking,
  service: Service,
  client: EmailClient = defaultClient,
): Promise<void> {
  const content = await getSiteContent()
  const to = content.contactEmail

  const subject = `New booking: ${service.name} on ${booking.date} at ${booking.time}`
  const text = [
    `New booking received.`,
    ``,
    `Service: ${service.name} (${formatPrice(service.pricePence)}, ${service.durationMinutes} min)`,
    `Date: ${booking.date} at ${booking.time}`,
    ``,
    `Client: ${booking.clientName}`,
    `Email: ${booking.clientEmail}`,
    `Phone: ${booking.clientPhone}`,
  ].join('\n')
  const html = `
    <p>New booking received.</p>
    <p><strong>Service:</strong> ${service.name} (${formatPrice(service.pricePence)}, ${service.durationMinutes} min)<br/>
    <strong>Date:</strong> ${booking.date} at ${booking.time}</p>
    <p><strong>Client:</strong> ${booking.clientName}<br/>
    <strong>Email:</strong> ${booking.clientEmail}<br/>
    <strong>Phone:</strong> ${booking.clientPhone}</p>
  `

  await client.send({ to, subject, html, text })
}
