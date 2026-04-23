"use client"

import { useState } from "react"
import { PRODUCT_CATEGORY_LABELS, type Product, type InstallationProduct } from "@/lib/supabase/types"

interface Props {
  products: Product[]
  selected: InstallationProduct[]
  onChange: (items: InstallationProduct[]) => void
}

export function ProductPicker({ products, selected = [], onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  function addProduct(p: Product) {
    if (selected.find((s) => s.product_id === p.id)) return
    onChange([
      ...selected,
      { product_id: p.id, name: p.name, brand: p.brand, category: p.category, quantity: 1, unit_price: p.unit_price },
    ])
    setOpen(false)
    setSearch("")
  }

  function updateQty(product_id: string, qty: number) {
    onChange(selected.map((s) => s.product_id === product_id ? { ...s, quantity: Math.max(1, qty) } : s))
  }

  function remove(product_id: string) {
    onChange(selected.filter((s) => s.product_id !== product_id))
  }

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const alreadySelected = new Set(selected.map((s) => s.product_id))

  return (
    <div className="space-y-3">
      {/* Selected products */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map((item) => (
            <div key={item.product_id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.brand && <span>{item.brand} · </span>}
                  {item.unit_price.toLocaleString("th-TH")} บาท/หน่วย
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateQty(item.product_id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQty(item.product_id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.product_id)}
                  className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
      >
        + เพิ่มสินค้า
      </button>

      {/* Product selector modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">เลือกสินค้า</h3>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setSearch("") }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อสินค้า แบรนด์ หรือรหัส..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 && (
                <p className="text-center py-10 text-sm text-gray-400">ไม่พบสินค้า</p>
              )}
              {filtered.map((p) => {
                const added = alreadySelected.has(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={added}
                    onClick={() => addProduct(p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition-colors ${
                      added ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="bg-gray-100 rounded px-1.5 py-0.5 mr-1">
                          {PRODUCT_CATEGORY_LABELS[p.category]}
                        </span>
                        {p.brand && <span>{p.brand}</span>}
                        {p.sku && <span className="text-gray-400 ml-1 font-mono">{p.sku}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">{p.unit_price.toLocaleString("th-TH")}</p>
                      <p className="text-xs text-gray-400">บาท</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
