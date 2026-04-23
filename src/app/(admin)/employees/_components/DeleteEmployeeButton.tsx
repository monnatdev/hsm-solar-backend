"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteEmployee } from "@/lib/data/employees"

export function DeleteEmployeeButton({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await deleteEmployee(id)
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleDelete} disabled={loading}
          className="text-xs text-red-500 font-medium disabled:opacity-50">
          {loading ? "กำลังลบ..." : "ยืนยัน"}
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-gray-400">ยกเลิก</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)} title={`ลบ ${name}`}
      className="text-gray-300 hover:text-red-500 transition-colors">
      <Trash2 size={15} />
    </button>
  )
}
