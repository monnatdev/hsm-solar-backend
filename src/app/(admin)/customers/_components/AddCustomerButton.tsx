"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCustomer } from "@/lib/data/customers"
import { CustomerSchema, CUSTOMER_SOURCES } from "@/lib/validations/schemas"

type FieldErrors = Partial<Record<string, string>>

export function AddCustomerButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = CustomerSchema.safeParse(Object.fromEntries(fd))

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ))
      return
    }

    setErrors({})
    setLoading(true)
    try {
      await createCustomer(result.data)
      setOpen(false)
    } catch {
      setErrors({ _form: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" })
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)} size="sm">+ เพิ่มลูกค้า</Button>
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-bold text-lg mb-5">เพิ่มลูกค้าใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>ชื่อ-นามสกุล *</Label>
            <Input name="name" />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>เบอร์โทรศัพท์</Label>
            <Input name="phone" type="tel" placeholder="081-234-5678" />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>อีเมล</Label>
            <Input name="email" type="email" />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>แหล่งที่มา *</Label>
            <select
              name="source"
              defaultValue=""
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="" disabled>-- เลือกแหล่งที่มา --</option>
              {CUSTOMER_SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.source && <p className="text-xs text-red-500">{errors.source}</p>}
          </div>
          {errors._form && <p className="text-xs text-red-500">{errors._form}</p>}
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
