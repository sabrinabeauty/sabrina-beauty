import Link from 'next/link'

export default function StickyBookBar() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-20 p-3 bg-cream/95 backdrop-blur border-t border-sage/30">
      <Link
        href="/book"
        className="block text-center bg-blush text-charcoal py-3 rounded-xl2 font-medium"
      >
        Book Online
      </Link>
    </div>
  )
}
