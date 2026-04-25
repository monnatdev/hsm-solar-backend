"use client"

import { useState } from "react"
import { updateCustomerStatus } from "@/lib/data/customers"
import { CustomerStatus, STATUS_LABELS } from "@/lib/supabase/types"

const ALL_STATUSES: CustomerStatus[] = [
  "new", "talking", "need_quote", "quoted",
  "surveyed", "waiting_for_stock", "installed", "cleaning_done", "closed",
]

interface Props {
  customerId: string
  current: CustomerStatus
}

export function StatusChanger({ customerId, current }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleChange(status: CustomerStatus) {
    if (status === current) return
    setLoading(true)
    await updateCustomerStatus(customerId, status)
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
              current === s
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  )
}
