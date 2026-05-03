"use client"

import { useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { CustomerStatus, STATUS_LABELS } from "@/lib/supabase/types"

const ALL_STATUSES: CustomerStatus[] = [
  "new", "talking", "need_quote", "quoted",
  "survey_scheduled", "surveyed", "waiting_for_stock", "install_scheduled", "installed",
  "cleaning_scheduled", "cleaning_done", "closed",
]

export function StatusFilter({ current, counts = {} }: { current?: string; counts?: Partial<Record<CustomerStatus, number>> }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleChange(status?: string) {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40">
          <svg className="animate-spin h-8 w-8 text-gray-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
      <div className={`flex flex-wrap gap-2 transition-opacity duration-200 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
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
    </>
  )
}
