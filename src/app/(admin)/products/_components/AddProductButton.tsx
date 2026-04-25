"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProduct } from "@/lib/data/products"
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/lib/supabase/types"
import { ProductSchema } from "@/lib/validations/schemas"

const CATEGORIES = Object.entries(PRODUCT_CATEGORY_LABELS) as [ProductCategory, string][]

type FieldErrors = Partial<Record<string, string>>

export function AddProductButton({ brands: _brands = [] }: { brands?: string[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = ProductSchema.safeParse(Object.fromEntries(fd))

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ))
      return
    }

    setErrors({})
    setLoading(true)
    await createProduct(result.data)
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
              defaultValue=""
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="" disabled>-- เลือกหมวดสินค้า --</option>
              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>ชื่อสินค้า <span className="text-red-500">*</span></Label>
            <Input name="name" placeholder="เช่น Jinko Tiger Neo 580W" />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span></Label>
            <Input name="unit_price" type="number" min="0" step="0.01" placeholder="0.00" />
            {errors.unit_price && <p className="text-xs text-red-500">{errors.unit_price}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpen(false); setErrors({}) }}>
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
