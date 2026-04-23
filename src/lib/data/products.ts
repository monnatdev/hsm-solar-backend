"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Product, ProductCategory } from "@/lib/supabase/types"

export async function getBrands(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("brand")
    .neq("brand", "")
    .order("brand")
  const unique = [...new Set((data ?? []).map((r) => r.brand as string).filter(Boolean))]
  return unique
}

export async function getProducts(category?: ProductCategory): Promise<Product[]> {
  const supabase = await createClient()
  let query = supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })

  if (category) query = query.eq("category", category)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createProduct(data: Omit<Product, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .insert({ ...data, updated_at: new Date().toISOString() })

  if (error) throw new Error(error.message)
  revalidatePath("/products")
}

export async function updateProduct(id: string, data: Omit<Product, "id" | "created_at" | "updated_at">) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/products")
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/products")
}
