"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateCleaningSchedule } from "@/lib/data/customers"

export function CleaningScheduleForm({ customerId, initialDate }: {
  customerId: string
  initialDate?: string
}) {
  const [date, setDate] = useState(initialDate ?? "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!date) return
    setLoading(true)
    await updateCleaningSchedule(customerId, date)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>วันที่นัดล้างแผง <span className="text-red-500">*</span></Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={loading || !date}>
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
        {saved && <span className="text-sm text-green-600">บันทึกแล้ว ✓</span>}
      </div>
    </form>
  )
}
