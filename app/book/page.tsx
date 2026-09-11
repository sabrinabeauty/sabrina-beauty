import BookingForm from '@/components/BookingForm'

export default function BookPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-4">Book Your Pampering Facial Online</h1>
      <p className="text-center text-charcoal/70 mb-12">
        Choose your treatment, pick a convenient date and time, and leave the rest to us.
      </p>
      <BookingForm />
    </div>
  )
}
