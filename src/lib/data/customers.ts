"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Customer, CustomerStatus, Survey, Installation, PanelCleaning, CleaningScheduleItem, PurchaseItem } from "@/lib/supabase/types"

export async function getStatusCounts(): Promise<Partial<Record<CustomerStatus, number>>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("customers").select("status")
  if (error) throw new Error(error.message)
  const counts: Partial<Record<CustomerStatus, number>> = {}
  for (const row of data ?? []) {
    counts[row.status as CustomerStatus] = (counts[row.status as CustomerStatus] ?? 0) + 1
  }
  return counts
}

const PAGE_SIZE = 20

export async function getCustomers(
  status?: CustomerStatus,
  search?: string,
  page = 1,
  date?: string
): Promise<{ customers: Customer[]; total: number }> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .range(from, to)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = query as any
  if (status === "survey_scheduled") {
    query = q.order("survey->>date", { ascending: true })
    if (date) query = q.filter("survey->>date", "eq", date)
  } else if (status === "install_scheduled") {
    query = q.order("installation->>date", { ascending: true })
    if (date) query = q.filter("installation->>date", "eq", date)
  } else if (status === "cleaning_scheduled") {
    query = query.order("cleaning_schedule_date", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  if (status) query = query.eq("status", status)
  if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)
  return { customers: data ?? [], total: count ?? 0 }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}

export async function updateCustomerStatus(id: string, status: CustomerStatus) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: current } = await supabase
    .from("customers")
    .select("status_history")
    .eq("id", id)
    .single()

  const status_history = { ...(current?.status_history ?? {}), [status]: now }

  const { error } = await supabase
    .from("customers")
    .update({ status, status_history, updated_at: now })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/customers")
  revalidatePath(`/customers/${id}`)
}

export async function updateCustomerNotes(id: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
}

export async function updateSurvey(id: string, survey: Survey) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: current } = await supabase
    .from("customers")
    .select("status_history")
    .eq("id", id)
    .single()

  const status_history = { ...(current?.status_history ?? {}), survey_scheduled: now }

  const { error } = await supabase
    .from("customers")
    .update({
      survey,
      status: "survey_scheduled",
      status_history,
      updated_at: now,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
  revalidatePath("/customers")
}

export async function updateInstallation(id: string, installation: Installation) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: current } = await supabase
    .from("customers")
    .select("status_history")
    .eq("id", id)
    .single()

  const status_history = { ...(current?.status_history ?? {}), install_scheduled: now }

  const { error } = await supabase
    .from("customers")
    .update({
      installation,
      status: "install_scheduled",
      status_history,
      updated_at: now,
    })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
  revalidatePath("/customers")
}

export async function addCleaningScheduleItem(id: string, item: Omit<CleaningScheduleItem, "id">) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: row } = await supabase
    .from("customers")
    .select("cleaning_schedules, status_history")
    .eq("id", id)
    .single()

  const newItem: CleaningScheduleItem = { ...item, id: crypto.randomUUID() }
  const cleaning_schedules = [...(row?.cleaning_schedules ?? []), newItem]
  const status_history = { ...(row?.status_history ?? {}), cleaning_scheduled: now }

  const { error } = await supabase
    .from("customers")
    .update({ cleaning_schedules, status: "cleaning_scheduled", status_history, updated_at: now })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
  revalidatePath("/customers")
}

export async function deleteCleaningScheduleItem(id: string, scheduleId: string) {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("customers")
    .select("cleaning_schedules")
    .eq("id", id)
    .single()

  const cleaning_schedules = (row?.cleaning_schedules ?? []).filter(
    (s: CleaningScheduleItem) => s.id !== scheduleId
  )

  const { error } = await supabase
    .from("customers")
    .update({ cleaning_schedules, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
  revalidatePath("/customers")
}

export async function addPanelCleaning(
  customerId: string,
  cleaning: Omit<PanelCleaning, "id" | "created_at">
) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: row } = await supabase
    .from("customers")
    .select("panel_cleanings, status_history")
    .eq("id", customerId)
    .single()

  const newRecord: PanelCleaning = {
    ...cleaning,
    id: crypto.randomUUID(),
    created_at: now,
  }
  const panel_cleanings = [...(row?.panel_cleanings ?? []), newRecord]
  const status_history = { ...(row?.status_history ?? {}), cleaning_done: now }

  const { error } = await supabase
    .from("customers")
    .update({ panel_cleanings, status: "cleaning_done", status_history, updated_at: now })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
  revalidatePath("/customers")
}

export async function deletePanelCleaning(customerId: string, cleaningId: string) {
  const supabase = await createClient()
  const { data: row } = await supabase
    .from("customers")
    .select("panel_cleanings")
    .eq("id", customerId)
    .single()

  const panel_cleanings = (row?.panel_cleanings ?? []).filter(
    (c: PanelCleaning) => c.id !== cleaningId
  )

  const { error } = await supabase
    .from("customers")
    .update({ panel_cleanings, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
}

type PurchasePhotoSlot = "purchase_slip" | "reimbursement_slip"

function validatePurchaseItemFields(item: { product_name?: string; quantity?: number; unit_price?: number; product_url?: string }) {
  if (!item.product_name?.trim()) throw new Error("product_name required")
  if (!Number.isFinite(item.quantity) || (item.quantity ?? 0) <= 0) throw new Error("quantity must be > 0")
  if (!Number.isFinite(item.unit_price) || (item.unit_price ?? -1) < 0) throw new Error("unit_price must be >= 0")
  if (item.product_url) {
    try {
      const u = new URL(item.product_url)
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error()
    } catch {
      throw new Error("product_url must be a valid http/https URL")
    }
  }
}

export async function addPurchaseItem(
  customerId: string,
  item: Omit<PurchaseItem, "id" | "purchase_slip_photos" | "reimbursement_slip_photos">
): Promise<PurchaseItem> {
  validatePurchaseItemFields(item)
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("customers")
    .select("purchase_items")
    .eq("id", customerId)
    .single()

  const newItem: PurchaseItem = {
    ...item,
    id: crypto.randomUUID(),
    purchase_slip_photos: [],
    reimbursement_slip_photos: [],
  }
  const purchase_items = [...(row?.purchase_items ?? []), newItem]

  const { error } = await supabase
    .from("customers")
    .update({ purchase_items, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
  return newItem
}

export async function updatePurchaseItem(
  customerId: string,
  itemId: string,
  updates: Omit<PurchaseItem, "id" | "purchase_slip_photos" | "reimbursement_slip_photos">
) {
  validatePurchaseItemFields(updates)
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("customers")
    .select("purchase_items")
    .eq("id", customerId)
    .single()

  const purchase_items = (row?.purchase_items ?? []).map((i: PurchaseItem) =>
    i.id === itemId ? { ...i, ...updates } : i
  )

  const { error } = await supabase
    .from("customers")
    .update({ purchase_items, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
}

export async function deletePurchaseItem(customerId: string, itemId: string) {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("customers")
    .select("purchase_items")
    .eq("id", customerId)
    .single()

  const purchase_items = (row?.purchase_items ?? []).filter(
    (i: PurchaseItem) => i.id !== itemId
  )

  const { error } = await supabase
    .from("customers")
    .update({ purchase_items, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
}

export async function addPurchaseItemPhoto(
  customerId: string,
  itemId: string,
  slot: PurchasePhotoSlot,
  url: string
) {
  if (slot !== "purchase_slip" && slot !== "reimbursement_slip") throw new Error("Invalid slot")
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("customers")
    .select("purchase_items")
    .eq("id", customerId)
    .single()

  const field = slot === "purchase_slip" ? "purchase_slip_photos" : "reimbursement_slip_photos"
  const purchase_items = (row?.purchase_items ?? []).map((i: PurchaseItem) =>
    i.id === itemId ? { ...i, [field]: [...(i[field] ?? []), url] } : i
  )

  const { error } = await supabase
    .from("customers")
    .update({ purchase_items, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
}

export async function removePurchaseItemPhoto(
  customerId: string,
  itemId: string,
  slot: PurchasePhotoSlot,
  url: string
) {
  if (slot !== "purchase_slip" && slot !== "reimbursement_slip") throw new Error("Invalid slot")
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("customers")
    .select("purchase_items")
    .eq("id", customerId)
    .single()

  const field = slot === "purchase_slip" ? "purchase_slip_photos" : "reimbursement_slip_photos"
  const purchase_items = (row?.purchase_items ?? []).map((i: PurchaseItem) =>
    i.id === itemId
      ? { ...i, [field]: (i[field] ?? []).filter((p: string) => p !== url) }
      : i
  )

  const { error } = await supabase
    .from("customers")
    .update({ purchase_items, updated_at: new Date().toISOString() })
    .eq("id", customerId)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${customerId}`)
}

export interface ScheduleConflict {
  customerId: string
  customerName: string
  type: "survey" | "installation" | "cleaning"
}

export async function checkScheduleConflicts(date: string, excludeCustomerId: string): Promise<ScheduleConflict[]> {
  if (!date) return []
  const supabase = await createClient()
  const conflicts: ScheduleConflict[] = []

  // ดึง customers ทั้งหมด (ยกเว้น closed) รวมทั้ง current customer เพื่อเช็ค cross-type conflict
  const { data: allCustomers } = await supabase
    .from("customers")
    .select("id, name, survey, installation, cleaning_schedules")
    .neq("status", "closed")

  for (const c of allCustomers ?? []) {
    const isSelf = c.id === excludeCustomerId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((c.survey as any)?.date === date && !isSelf)
      conflicts.push({ customerId: c.id, customerName: c.name, type: "survey" })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((c.installation as any)?.date === date && !isSelf)
      conflicts.push({ customerId: c.id, customerName: c.name, type: "installation" })
    const hasCleaningDate = (c.cleaning_schedules ?? []).some((s: CleaningScheduleItem) => s.date === date)
    if (hasCleaningDate && !isSelf)
      conflicts.push({ customerId: c.id, customerName: c.name, type: "cleaning" })
  }

  return conflicts
}

export async function updateSerialNumberNotes(id: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .update({ serial_number_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
}

export async function createCustomer(data: Pick<Customer, "name"> & Partial<Pick<Customer, "phone" | "email" | "address" | "source">>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .insert({ ...data, status: "new", status_history: { new: new Date().toISOString() } })

  if (error) throw new Error(error.message)
  revalidatePath("/customers")
}
