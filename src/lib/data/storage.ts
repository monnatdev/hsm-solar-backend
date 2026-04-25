"use server"

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { revalidatePath } from "next/cache"
import { r2 } from "@/lib/r2/client"
import { createClient } from "@/lib/supabase/server"

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB hard limit server-side
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"]

export async function uploadPhoto(formData: FormData, folder: string): Promise<string> {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")
  if (file.size > MAX_SIZE_BYTES) throw new Error("ไฟล์ใหญ่เกินไป (สูงสุด 5MB)")
  if (!ALLOWED_TYPES.includes(file.type)) throw new Error("ไฟล์ต้องเป็นรูปภาพเท่านั้น")

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.webp`

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: "image/webp",
  }))

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
}

export async function deletePhoto(url: string): Promise<void> {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!
  if (!url.startsWith(publicUrl)) throw new Error("Invalid photo URL")
  const key = url.slice(publicUrl.length + 1)

  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }))
}

type PhotoType = "site" | "product" | "payment"

const PHOTO_FIELD: Record<PhotoType, string> = {
  site: "site_photos",
  product: "product_photos",
  payment: "payment_photos",
}

export async function updateCustomerPhotos(id: string, type: PhotoType, urls: string[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("customers")
    .update({ [PHOTO_FIELD[type]]: urls, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath(`/customers/${id}`)
}
