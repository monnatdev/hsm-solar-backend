"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCustomer } from "@/lib/data/customers"

const SOURCES = ["Web", "LINE", "Facebook", "Instagram", "แนะนำ", "อื่นๆ"]

export function AddCustomerButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await createCustomer({
      name: fd.get("name") as string,
      phone: fd.get("phone") as string || undefined,
      email: fd.get("email") as string || undefined,
      source: fd.get("source") as string || undefined,
    })
    setOpen(false)
    setLoading(false)
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
            <Input name="name" required />
          </div>
          <div className="space-y-1.5">
            <Label>เบอร์โทรศัพท์ *</Label>
            <Input name="phone" type="tel" required />
          </div>
          <div className="space-y-1.5">
            <Label>อีเมล</Label>
            <Input name="email" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>แหล่งที่มา *</Label>
            <select
              name="source"
              required
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="" disabled>-- เลือกแหล่งที่มา --</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
