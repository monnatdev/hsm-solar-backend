import { getBrands, getProducts } from "@/lib/data/products"
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/lib/supabase/types"
import { AddProductButton } from "./_components/AddProductButton"
import { DeleteProductButton } from "./_components/DeleteProductButton"

const CATEGORIES = Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]

const CATEGORY_ICONS: Record<ProductCategory, string> = {
  solar_panel: "☀️",
  battery: "🔋",
  inverter: "⚡",
  cable: "🔌",
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const [products, brands] = await Promise.all([
    getProducts(category as ProductCategory | undefined),
    getBrands(),
  ])

  const grouped = products.reduce<Partial<Record<ProductCategory, typeof products>>>(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = []
      acc[p.category]!.push(p)
      return acc
    },
    {}
  )

  const displayCategories = category
    ? [[category, PRODUCT_CATEGORY_LABELS[category as ProductCategory]] as [ProductCategory, string]]
    : CATEGORIES.filter(([cat]) => grouped[cat]?.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">สินค้า</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} รายการ</p>
        </div>
        <AddProductButton brands={brands} />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <a
          href="/products"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !category ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          ทั้งหมด
        </a>
        {CATEGORIES.map(([cat, label]) => (
          <a
            key={cat}
            href={`/products?category=${cat}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === cat ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {CATEGORY_ICONS[cat]} {label}
          </a>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">ยังไม่มีสินค้า</div>
      )}

      {/* Grouped list */}
      <div className="space-y-6">
        {displayCategories.map(([cat, label]) => {
          const items = grouped[cat]
          if (!items?.length) return null
          return (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>{CATEGORY_ICONS[cat]}</span> {label}
                <span className="font-normal text-gray-400">({items.length})</span>
              </h2>
              <div className="space-y-2">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.brand && <span>{p.brand}</span>}
                        {p.brand && p.sku && <span className="mx-1">·</span>}
                        {p.sku && <span className="font-mono">{p.sku}</span>}
                      </p>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-sm font-semibold">
                      {p.unit_price.toLocaleString("th-TH")}
                      <span className="text-xs font-normal text-gray-400 ml-1">บาท/หน่วย</span>
                    </p>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
