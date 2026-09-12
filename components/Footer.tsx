import { getSiteContent } from '@/lib/settings'

export default function Footer() {
  const { contactEmail, contactWhatsapp, contactInstagram, contactTiktok, contactFacebook } =
    getSiteContent()
  const whatsappDigits = contactWhatsapp.replace(/[^\d]/g, '')

  return (
    <footer className="bg-charcoal text-cream mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <h3 className="font-serif text-xl mb-3">Sabrina Beauty</h3>
          <p className="text-cream/70">Your sanctuary for luxurious, results-focused facial treatments.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3">Get in touch</h4>
          <ul className="space-y-2 text-cream/70">
            <li>
              <a href={`mailto:${contactEmail}`} className="hover:text-blush">
                {contactEmail}
              </a>
            </li>
            {whatsappDigits && (
              <li>
                <a href={`https://api.whatsapp.com/send?phone=${whatsappDigits}`} className="hover:text-blush">
                  WhatsApp: {contactWhatsapp}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3">Follow</h4>
          <ul className="space-y-2 text-cream/70">
            {contactInstagram && (
              <li>
                <a href={contactInstagram} className="hover:text-blush">
                  Instagram
                </a>
              </li>
            )}
            {contactTiktok && (
              <li>
                <a href={contactTiktok} className="hover:text-blush">
                  TikTok
                </a>
              </li>
            )}
            {contactFacebook && (
              <li>
                <a href={contactFacebook} className="hover:text-blush">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        S1 Botanicals Ltd · Company No. 17182720
      </div>
    </footer>
  )
}
