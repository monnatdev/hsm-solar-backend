"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct } from "@/lib/data/products"
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/lib/supabase/types"

const CATEGORIES = Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]

function BrandCombobox({ brands }: { brands: string[] }) {
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = brands.filter(
    (b) => b.toLowerCase().includes(value.toLowerCase()) && b !== value
  )

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name="brand" value={value} />
      <Input
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="เช่น Jinko, Huawei, BYD"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
          {filtered.map((b) => (
            <li
              key={b}
              onMouseDown={() => { setValue(b); setOpen(false) }}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AddProductButton({ brands = [] }: { brands?: string[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await createProduct({
      name: fd.get("name") as string,
      brand: fd.get("brand") as string,
      sku: fd.get("sku") as string,
      category: fd.get("category") as ProductCategory,
      unit_price: parseFloat(fd.get("unit_price") as string) || 0,
      description: fd.get("description") as string,
    })
    setOpen(false)
    setLoading(false)
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)} size="sm">+ เพิ่มสินค้า</Button>
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-5">เพิ่มสินค้าใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>หมวดสินค้า <span className="text-red-500">*</span></Label>
            <select
              name="category"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="" disabled>-- เลือกหมวดสินค้า --</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>ชื่อสินค้า <span className="text-red-500">*</span></Label>
            <Input name="name" required placeholder="เช่น Jinko Tiger Neo 580W" />
          </div>
          <div className="space-y-1.5">
            <Label>แบรนด์</Label>
            <BrandCombobox brands={brands} />
          </div>
          <div className="space-y-1.5">
            <Label>รหัสสินค้า (SKU)</Label>
            <Input name="sku" placeholder="เช่น JKM580N-7RL4" />
          </div>
          <div className="space-y-1.5">
            <Label>ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span></Label>
            <Input name="unit_price" type="number" min="0" step="0.01" required placeholder="0.00" />
          </div>
          <div className="space-y-1.5">
            <Label>รายละเอียดเพิ่มเติม</Label>
            <textarea
              name="description"
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
              placeholder="สเปก หรือข้อมูลอื่นๆ"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
