import { getSiteContent } from '@/lib/settings'

export default async function AnnouncementBanner() {
  const { announcementEnabled, announcementMessage } = await getSiteContent()
  if (!announcementEnabled || !announcementMessage.trim()) return null

  return (
    <div className="bg-charcoal text-cream text-center text-sm py-2 px-6">
      {announcementMessage}
    </div>
  )
}
