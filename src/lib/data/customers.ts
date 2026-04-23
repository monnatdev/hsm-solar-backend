"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Customer, CustomerStatus, Survey, Installation, PanelCleaning } from "@/lib/supabase/types"

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
  page = 1
): Promise<{ customers: Customer[]; total: number }> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

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

export async function updateCleaningSchedule(id: string, date: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data: current } = await supabase
    .from("customers")
    .select("status_history")
    .eq("id", id)
    .single()

  const status_history = { ...(current?.status_history ?? {}), cleaning_scheduled: now }

  const { error } = await supabase
    .from("customers")
    .update({ cleaning_schedule_date: date, status: "cleaning_scheduled", status_history, updated_at: now })
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

export async function createCustomer(data: Pick<Customer, "name"> & Partial<Pick<Customer, "phone" | "email" | "address" | "source">>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .insert({ ...data, status: "new", status_history: { new: new Date().toISOString() } })

  if (error) throw new Error(error.message)
  revalidatePath("/customers")
}
