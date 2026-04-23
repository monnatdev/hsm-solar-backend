"use client"

import { useRouter, usePathname } from "next/navigation"
import { CustomerStatus, STATUS_LABELS } from "@/lib/supabase/types"

const ALL_STATUSES: CustomerStatus[] = [
  "new", "talking", "need_quote", "quoted",
  "survey_scheduled", "surveyed", "install_scheduled", "installed",
  "cleaning_scheduled", "cleaning_done", "closed",
]

export function StatusFilter({ current, counts = {} }: { current?: string; counts?: Partial<Record<CustomerStatus, number>> }) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(status?: string) {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleChange()}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          !current ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        ทั้งหมด
      </button>
      {ALL_STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            current === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {STATUS_LABELS[s]}
          {counts[s] ? <span className="ml-1 opacity-70">{counts[s]}</span> : null}
        </button>
      ))}
    </div>
  )
}
