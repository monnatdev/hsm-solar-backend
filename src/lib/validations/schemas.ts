import { z } from "zod"

const thaiPhone = z
  .string()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .refine((v) => /^0[689]\d{8}$/.test(v), {
    message: "เบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)",
  })

export const CUSTOMER_SOURCES = ["Web", "LINE", "Facebook", "Instagram", "แนะนำ", "อื่นๆ"] as const

export const CustomerSchema = z.object({
  name: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  phone: z
    .string()
    .optional()
    .transform((v) => v?.replace(/[\s\-()]/g, "") ?? "")
    .refine((v) => v === "" || /^0[689]\d{8}$/.test(v), {
      message: "เบอร์โทรไม่ถูกต้อง (เช่น 081-234-5678)",
    })
    .transform((v) => (v === "" ? undefined : v)),
  email: z.string().email("อีเมลไม่ถูกต้อง").or(z.literal("")).optional(),
  source: z.enum(CUSTOMER_SOURCES, { error: "กรุณาเลือกแหล่งที่มา" }),
})

export const EmployeeSchema = z.object({
  first_name: z.string().min(1, "กรุณากรอกชื่อ"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  phone: thaiPhone,
  position: z.string().min(1, "กรุณากรอกตำแหน่ง"),
  age: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : null))
    .refine((v) => v === null || (v >= 18 && v <= 99), {
      message: "อายุต้องอยู่ระหว่าง 18-99 ปี",
    }),
})

export const ProductSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
  category: z.enum(["solar_panel", "battery", "inverter", "cable"], {
    error: "กรุณาเลือกหมวดสินค้า",
  }),
  brand: z.string().optional().transform((v) => v ?? ""),
  sku: z.string().optional().transform((v) => v ?? ""),
  unit_price: z
    .string()
    .refine((v) => parseFloat(v) >= 0, { message: "ราคาต้องไม่ติดลบ" })
    .transform((v) => parseFloat(v)),
  description: z.string().optional().transform((v) => v ?? ""),
})

export type CustomerFormData = z.infer<typeof CustomerSchema>
export type EmployeeFormData = z.infer<typeof EmployeeSchema>
export type ProductFormData = z.infer<typeof ProductSchema>
