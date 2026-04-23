"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ThaiAddressInput } from "@/components/ui/ThaiAddressInput"
import { ProductPicker } from "./ProductPicker"
import { updateInstallation } from "@/lib/data/customers"
import type { Installation, Product, SystemType, ThaiLocation } from "@/lib/supabase/types"

const SYSTEM_TYPES: { value: SystemType; label: string }[] = [
  { value: "on_grid", label: "On Grid" },
  { value: "hybrid", label: "Hybrid" },
  { value: "off_grid", label: "Off Grid" },
]

const EMPTY_LOCATION: ThaiLocation = { address: "", subdistrict: "", district: "", province: "", postal_code: "" }

const DEFAULT: Installation = {
  date: "", time: "", location: EMPTY_LOCATION,
  size_kw: 0, phase: 0, system_type: "on_grid",
  products: [],
  notes: "",
}

function isComplete(d: Installation) {
  return !!(d.date && d.time && d.size_kw > 0 && d.phase > 0 && d.location.province)
}

export function InstallationForm({
  customerId,
  initialData,
  allProducts,
}: {
  customerId: string
  initialData?: Installation | null
  allProducts: Product[]
}) {
  const [data, setData] = useState<Installation>({
    ...DEFAULT,
    ...initialData,
    products: initialData?.products ?? [],
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof Installation>(key: K, value: Installation[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isComplete(data)) return
    setLoading(true)
    await updateInstallation(customerId, data)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>วันที่ติดตั้ง <span className="text-red-500">*</span></Label>
          <Input type="date" value={data.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>เวลา <span className="text-red-500">*</span></Label>
          <Input type="time" value={data.time} onChange={(e) => set("time", e.target.value)} />
        </div>
      </div>

      <ThaiAddressInput
        value={data.location}
        onChange={(loc) => set("location", loc)}
      />

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>ขนาดระบบ (kW) <span className="text-red-500">*</span></Label>
          <Input
            type="number" step="0.1" min="0"
            value={data.size_kw || ""}
            onChange={(e) => set("size_kw", parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Phase <span className="text-red-500">*</span></Label>
          <Input
            type="number" min="1" step="1"
            value={data.phase || ""}
            onChange={(e) => set("phase", parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>ประเภทระบบ</Label>
          <div className="flex gap-2 pt-1">
            {SYSTEM_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => set("system_type", t.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  data.system_type === t.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>สินค้าที่ใช้ในงาน</Label>
        <ProductPicker
          products={allProducts}
          selected={data.products}
          onChange={(items) => set("products", items)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>หมายเหตุ</Label>
        <Textarea value={data.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={loading || !isComplete(data)}>
          {loading ? "กำลังบันทึก..." : "บันทึกการติดตั้ง"}
        </Button>
        {saved && <span className="text-sm text-green-600">บันทึกแล้ว ✓</span>}
        {!isComplete(data) && <span className="text-xs text-gray-400">กรุณากรอกวันที่ เวลา ขนาดระบบ Phase และจังหวัด</span>}
      </div>
    </form>
  )
}
