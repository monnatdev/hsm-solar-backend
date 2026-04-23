"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEmployee } from "@/lib/data/employees"

export function AddEmployeeButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await createEmployee({
      first_name: fd.get("first_name") as string,
      last_name: fd.get("last_name") as string,
      age: fd.get("age") ? parseInt(fd.get("age") as string, 10) : null,
      phone: fd.get("phone") as string,
      position: fd.get("position") as string,
    })
    setOpen(false)
    setLoading(false)
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)} size="sm">+ เพิ่มพนักงาน</Button>
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-bold text-lg mb-5">เพิ่มพนักงานใหม่</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>ชื่อ <span className="text-red-500">*</span></Label>
              <Input name="first_name" required placeholder="ชื่อ" />
            </div>
            <div className="space-y-1.5">
              <Label>นามสกุล <span className="text-red-500">*</span></Label>
              <Input name="last_name" required placeholder="นามสกุล" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>อายุ</Label>
              <Input name="age" type="number" min="18" max="99" placeholder="25" />
            </div>
            <div className="space-y-1.5">
              <Label>เบอร์ติดต่อ <span className="text-red-500">*</span></Label>
              <Input name="phone" type="tel" required placeholder="0812345678" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>ตำแหน่ง <span className="text-red-500">*</span></Label>
            <Input name="position" required placeholder="เช่น ช่างติดตั้ง, หัวหน้าทีม" />
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
