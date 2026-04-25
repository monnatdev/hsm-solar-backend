import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { daysInCurrentStatus, daysLabel } from "@/lib/utils/status"
import type { Customer } from "@/lib/supabase/types"

describe("daysInCurrentStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-04-25T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("คืน 0 เมื่อ status_history ว่าง", () => {
    const customer = { status: "new", status_history: {} } as Customer
    expect(daysInCurrentStatus(customer)).toBe(0)
  })

  it("คืน 0 เมื่อ status เปลี่ยนวันนี้", () => {
    const customer = {
      status: "new",
      status_history: { new: "2026-04-25T06:00:00.000Z" },
    } as Customer
    expect(daysInCurrentStatus(customer)).toBe(0)
  })

  it("คืน 3 เมื่อ status เปลี่ยน 3 วันที่แล้ว", () => {
    const customer = {
      status: "talking",
      status_history: { talking: "2026-04-22T12:00:00.000Z" },
    } as Customer
    expect(daysInCurrentStatus(customer)).toBe(3)
  })
})

describe("daysLabel", () => {
  it("คืน 'วันนี้' เมื่อ 0 วัน", () => {
    expect(daysLabel(0)).toBe("วันนี้")
  })

  it("คืน '1 วัน' เมื่อ 1 วัน", () => {
    expect(daysLabel(1)).toBe("1 วัน")
  })

  it("คืน '30 วัน' เมื่อ 30 วัน", () => {
    expect(daysLabel(30)).toBe("30 วัน")
  })
})
