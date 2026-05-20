import { PRODUCT_CATALOG } from '@/lib/products/catalog'

export default function AdminProducts() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[#e8e5de]">Product Reference Catalog</h1>
        <p className="mt-1 text-sm text-[#9c9890]">
          View mapped products, slugs, pricing, delivery types, and assets.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Object.entries(PRODUCT_CATALOG).map(([slug, product]) => (
          <div
            key={slug}
            className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-6 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#e8e5de]">{product.name}</h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  product.type === 'zip'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : product.type === 'bundle'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : product.type === 'intake'
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}>
                  {product.type}
                </span>
              </div>
              
              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-[#2e2d2a] pb-1.5">
                  <span className="text-[#6b6861]">Product Slug</span>
                  <span className="font-mono text-xs text-[#9c9890]">{slug}</span>
                </div>
                <div className="flex justify-between border-b border-[#2e2d2a] pb-1.5">
                  <span className="text-[#6b6861]">Price</span>
                  <span className="font-semibold text-[#e8e5de]">
                    {(product.price / 100).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#2e2d2a] pb-1.5">
                  <span className="text-[#6b6861]">Email Template</span>
                  <span className="font-mono text-xs text-[#9c9890]">{product.emailTemplate}</span>
                </div>

                {product.r2Keys.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1.5">
                    <span className="text-[#6b6861]">R2 Storage Keys</span>
                    <ul className="space-y-1">
                      {product.r2Keys.map((key) => (
                        <li key={key} className="rounded bg-[#171614] px-2 py-1 font-mono text-xs text-[#c9c7c0] break-all">
                          {key}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
