import { listProducts } from '@/lib/products'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const products = await listProducts({ activeOnly: true })

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-4xl text-center mb-4">Skincare Products</h1>
      <p className="text-center text-charcoal/70 mb-16">
        Vegan, cruelty-free products we use and love — available in-salon.
      </p>

      {products.length === 0 ? (
        <p className="text-center text-charcoal/60">Our product range is coming soon.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
