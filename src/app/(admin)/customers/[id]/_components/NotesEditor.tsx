"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateCustomerNotes } from "@/lib/data/customers"

export function NotesEditor({ customerId, initialNotes }: { customerId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    await updateCustomerNotes(customerId, notes)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="บันทึกข้อมูลการติดต่อ เช่น โทรแล้ว นัดวัน..."
        rows={4}
      />
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={loading || !notes.trim()}>
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
        {saved && <span className="text-sm text-green-600">บันทึกแล้ว ✓</span>}
      </div>
    </div>
  )
}
