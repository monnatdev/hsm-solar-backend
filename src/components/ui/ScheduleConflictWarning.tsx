import type { ScheduleConflict } from "@/lib/data/customers"

const TYPE_LABELS: Record<ScheduleConflict["type"], string> = {
  survey: "นัดสำรวจ",
  installation: "นัดติดตั้ง",
  cleaning: "นัดล้างแผง",
}

export function ScheduleConflictWarning({ conflicts }: { conflicts: ScheduleConflict[] }) {
  if (conflicts.length === 0) return null

  return (
    <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm">
      <span className="shrink-0 text-amber-500">⚠️</span>
      <div className="space-y-0.5">
        <p className="font-medium text-amber-800">
          วันที่เลือกมีนัดลูกค้าอยู่แล้ว {conflicts.length} รายการ — โปรดตรวจสอบก่อนบันทึก
        </p>
        <ul className="text-amber-700 space-y-0.5">
          {conflicts.map((c, i) => (
            <li key={i}>• {c.customerName} — {TYPE_LABELS[c.type]}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
