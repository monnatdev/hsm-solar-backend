"use client"

import { useRouter, usePathname } from "next/navigation"

interface Props {
  status: "survey_scheduled" | "install_scheduled"
  date?: string
  currentParams: Record<string, string>
}

const LABEL: Record<Props["status"], string> = {
  survey_scheduled: "วันนัดสำรวจ",
  install_scheduled: "วันนัดติดตั้ง",
}

export function DateRangeFilter({ status, date, currentParams }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(value: string) {
    const params = new URLSearchParams(currentParams)
    if (value) {
      params.set("date", value)
    } else {
      params.delete("date")
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium text-gray-500">{LABEL[status]}:</span>
      <input
        type="date"
        value={date ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      {date && (
        <button
          onClick={() => handleChange("")}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  )
}
