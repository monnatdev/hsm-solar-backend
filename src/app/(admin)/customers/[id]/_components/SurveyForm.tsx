"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThaiAddressInput } from "@/components/ui/ThaiAddressInput"
import { EmployeeMultiSelect } from "@/components/ui/EmployeeMultiSelect"
import { updateSurvey } from "@/lib/data/customers"
import type { Survey, ThaiLocation, Employee } from "@/lib/supabase/types"

const EMPTY_LOCATION: ThaiLocation = { address: "", subdistrict: "", district: "", province: "", postal_code: "" }

const DEFAULT: Survey = { date: "", time: "", location: EMPTY_LOCATION, surveyor: [] }

function isComplete(d: Survey) {
  return !!(d.date && d.time && d.surveyor.length > 0 && d.location.province && d.location.postal_code)
}

export function SurveyForm({ customerId, initialData, employees = [] }: {
  customerId: string
  initialData?: Survey | null
  employees?: Employee[]
}) {
  const [data, setData] = useState<Survey>(() => ({
    ...DEFAULT,
    ...(initialData ?? {}),
    surveyor: Array.isArray(initialData?.surveyor)
      ? initialData.surveyor
      : initialData?.surveyor
        ? [initialData.surveyor]
        : [],
  }))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof Survey>(key: K, value: Survey[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!isComplete(data)) return
    setLoading(true)
    await updateSurvey(customerId, data)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>วันที่ <span className="text-red-500">*</span></Label>
          <Input type="date" value={data.date} onChange={(e) => set("date", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>เวลา <span className="text-red-500">*</span></Label>
          <Input type="time" value={data.time} onChange={(e) => set("time", e.target.value)} />
        </div>
      </div>
      <ThaiAddressInput
        value={data.location}
        onChange={(loc) => set("location", loc)}
      />
      <div className="space-y-1.5">
        <Label>ผู้เข้าสำรวจ <span className="text-red-500">*</span></Label>
        <EmployeeMultiSelect
          employees={employees}
          value={data.surveyor}
          onChange={(v) => set("surveyor", v)}
          placeholder="-- เลือกผู้เข้าสำรวจ --"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={loading || !isComplete(data)}>
          {loading ? "กำลังบันทึก..." : "บันทึกการนัด"}
        </Button>
        {saved && <span className="text-sm text-green-600">บันทึกแล้ว ✓</span>}
        {!isComplete(data) && <span className="text-xs text-gray-400">กรุณากรอกวันที่ เวลา รหัสไปรษณีย์ จังหวัด และผู้สำรวจ</span>}
      </div>
    </form>
  )
}
