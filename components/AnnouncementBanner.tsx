import { getSiteContent } from '@/lib/settings'

export default function AnnouncementBanner() {
  const { announcementEnabled, announcementMessage } = getSiteContent()
  if (!announcementEnabled || !announcementMessage.trim()) return null

  return (
    <div className="bg-charcoal text-cream text-center text-sm py-2 px-6">
      {announcementMessage}
    </div>
  )
}
