import type { CleaningScheduleItem } from "@/lib/supabase/types"
import { STATUS_LABELS } from "@/lib/supabase/types"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const PIPELINE_STATUSES = ["new", "talking", "need_quote", "quoted", "surveyed", "waiting_for_stock"] as const

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  survey_scheduled: "นัดสำรวจ",
  install_scheduled: "นัดติดตั้ง",
  cleaning_scheduled: "นัดล้างแผง",
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  })
}

function todayThai(): string {
  return new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  })
}

function todayDateString(): string {
  const now = new Date()
  const bkk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }))
  const y = bkk.getFullYear()
  const m = String(bkk.getMonth() + 1).padStart(2, "0")
  const d = String(bkk.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

async function sendLineMessage(message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN
  const groupId = process.env.LINE_GROUP_ID
  if (!token || !groupId) throw new Error("LINE env vars missing")

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: groupId,
      messages: [{ type: "text", text: message }],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LINE API error ${res.status}: ${body}`)
  }
}

async function handler(req: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not set" }, { status: 500 })


  const supabase = createServiceClient()
  const today = todayDateString()

  // Part 1: Pipeline — customers ที่ยังอยู่ในระหว่างดำเนินการ
  const { data: pipelineCustomers, error: e1 } = await supabase
    .from("customers")
    .select("id, name, status")
    .in("status", [...PIPELINE_STATUSES])
    .order("created_at", { ascending: false })

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 })

  // Part 2: Appointments — นัดที่กำลังจะมาถึง (วันนี้และหลังจากนี้)
  const { data: appointmentCustomers, error: e2 } = await supabase
    .from("customers")
    .select("id, name, status, survey, installation, cleaning_schedules")
    .in("status", ["survey_scheduled", "install_scheduled", "cleaning_scheduled"])

  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  // เก็บ appointments ทั้งหมดแล้วเรียง
  type Appointment = { date: string; name: string; type: string }
  const appointments: Appointment[] = []

  for (const c of appointmentCustomers ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const surveyDate = (c.survey as any)?.date
    if (surveyDate && surveyDate >= today) {
      appointments.push({ date: surveyDate, name: c.name, type: "survey_scheduled" })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const installDate = (c.installation as any)?.date
    if (installDate && installDate >= today) {
      appointments.push({ date: installDate, name: c.name, type: "install_scheduled" })
    }
    for (const s of (c.cleaning_schedules ?? []) as CleaningScheduleItem[]) {
      if (s.date && s.date >= today) {
        appointments.push({ date: s.date, name: c.name, type: "cleaning_scheduled" })
      }
    }
  }

  appointments.sort((a, b) => a.date.localeCompare(b.date))

  // สร้างข้อความ
  const lines: string[] = []
  lines.push(`📊 สรุปสถานะ HSM Energy`)
  lines.push(todayThai())
  lines.push("─────────────────────")

  // Part 1
  lines.push("")
  lines.push("🔄 Pipeline (รอดำเนินการ)")

  const grouped: Partial<Record<string, string[]>> = {}
  for (const c of pipelineCustomers ?? []) {
    if (!grouped[c.status]) grouped[c.status] = []
    grouped[c.status]!.push(c.name)
  }

  if (Object.keys(grouped).length === 0) {
    lines.push("  ไม่มีลูกค้าในระหว่างดำเนินการ")
  } else {
    for (const status of PIPELINE_STATUSES) {
      const names = grouped[status]
      if (!names || names.length === 0) continue
      lines.push(`  • ${STATUS_LABELS[status]} (${names.length} ราย)`)
      for (const name of names) lines.push(`    - ${name}`)
    }
    lines.push(`  รวม: ${pipelineCustomers?.length ?? 0} ราย`)
  }

  // Part 2
  lines.push("")
  lines.push("🗓️ นัดที่กำลังจะมาถึง")

  if (appointments.length === 0) {
    lines.push("  ไม่มีนัดที่กำลังจะมาถึง")
  } else {
    for (const a of appointments) {
      const isToday = a.date === today
      const label = APPOINTMENT_TYPE_LABELS[a.type] ?? a.type
      const dateLabel = isToday ? `วันนี้ 🔴` : formatDate(a.date)
      lines.push(`  • ${dateLabel} — ${label} — ${a.name}`)
    }
  }

  lines.push("")
  lines.push("─────────────────────")
  lines.push("🤖 HSM Energy Bot")

  const message = lines.join("\n")

  try {
    await sendLineMessage(message)
    return NextResponse.json({ ok: true, message })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
