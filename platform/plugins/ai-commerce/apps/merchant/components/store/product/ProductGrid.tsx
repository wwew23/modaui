"use client"

export interface Product {
  id?: string
  name: string
  price: string
  image: string
  description?: string
}

export interface ProductGridProps {
  title: string
  subtitle?: string
  columns?: number
  products: Product[]
}

export function ProductGrid({ 
  title, 
  subtitle, 
  columns = 3, 
  products = [] 
}: ProductGridProps) {
  const safeProducts = products || []
  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <div 
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {safeProducts.map((product, index) => (
            <div key={product.id || index} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted/50 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-foreground">{product.name}</h3>
                <p className="text-foreground font-semibold mt-1 text-lg">{product.price}</p>
                {product.description && (
                  <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const schema = {
  name: "ProductGrid",
  category: "product",
  description: "商品网格展示组件",
  props: {
    title: "string",
    subtitle: "string",
    columns: "number",
    products: "array"
  }
}

export const defaultProps: ProductGridProps = {
  title: "热门商品",
  subtitle: "精选好物，品质之选",
  columns: 3,
  products: [
    { name: "商品 1", price: "¥99", image: "https://picsum.photos/400/400?random=1" },
    { name: "商品 2", price: "¥199", image: "https://picsum.photos/400/400?random=2" },
    { name: "商品 3", price: "¥299", image: "https://picsum.photos/400/400?random=3" }
  ]
}
