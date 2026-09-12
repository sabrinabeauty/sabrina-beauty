import Image from 'next/image'
import type { Product } from '@/lib/products'

export default function ProductCard({ product }: { product: Product }) {
  const price = (product.pricePence / 100).toFixed(2)
  return (
    <div className="border border-sage/30 rounded-xl2 overflow-hidden bg-white/60">
      <div className="relative h-56 bg-cream">
        {product.imagePath ? (
          <Image src={product.imagePath} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-charcoal/30 text-sm">
            No image yet
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-serif text-xl">{product.name}</h3>
          <span className="font-medium text-sage">&pound;{price}</span>
        </div>
        <p className="text-charcoal/80 leading-relaxed">{product.description}</p>
      </div>
    </div>
  )
}
