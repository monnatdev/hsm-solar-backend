import type { Customer } from "@/lib/supabase/types"

export function daysInCurrentStatus(customer: Customer): number {
  const ts = customer.status_history?.[customer.status]
  if (!ts) return 0
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000)
}

export function daysLabel(days: number): string {
  if (days === 0) return "วันนี้"
  return `${days} วัน`
}
