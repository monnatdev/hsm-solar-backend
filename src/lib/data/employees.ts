"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Employee } from "@/lib/supabase/types"

export async function getEmployees(): Promise<Employee[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("first_name", { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createEmployee(data: Omit<Employee, "id" | "created_at">) {
  const supabase = await createClient()
  const { error } = await supabase.from("employees").insert(data)
  if (error) throw new Error(error.message)
  revalidatePath("/employees")
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("employees").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/employees")
}
