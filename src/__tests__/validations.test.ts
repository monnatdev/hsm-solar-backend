import { describe, it, expect } from "vitest"
import { CustomerSchema, EmployeeSchema, ProductSchema } from "@/lib/validations/schemas"

// ─── CustomerSchema ───────────────────────────────────────────
describe("CustomerSchema", () => {
  const valid = { name: "สมชาย ใจดี", phone: "0812345678", source: "LINE" }

  it("ผ่านเมื่อข้อมูลถูกต้อง", () => {
    expect(CustomerSchema.safeParse(valid).success).toBe(true)
  })

  it("ผ่านเมื่อ phone มีขีด", () => {
    expect(CustomerSchema.safeParse({ ...valid, phone: "081-234-5678" }).success).toBe(true)
  })

  it("ผ่านเมื่อ email ว่าง", () => {
    expect(CustomerSchema.safeParse({ ...valid, email: "" }).success).toBe(true)
  })

  it("ไม่ผ่านเมื่อชื่อสั้นเกิน", () => {
    const r = CustomerSchema.safeParse({ ...valid, name: "ก" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อเบอร์โทรผิดรูปแบบ", () => {
    const r = CustomerSchema.safeParse({ ...valid, phone: "021234567" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อเบอร์โทร 9 หลัก", () => {
    const r = CustomerSchema.safeParse({ ...valid, phone: "081234567" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อ email ผิดรูปแบบ", () => {
    const r = CustomerSchema.safeParse({ ...valid, email: "notanemail" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อไม่เลือก source", () => {
    const r = CustomerSchema.safeParse({ ...valid, source: "" })
    expect(r.success).toBe(false)
  })
})

// ─── EmployeeSchema ───────────────────────────────────────────
describe("EmployeeSchema", () => {
  const valid = { first_name: "สมชาย", last_name: "ใจดี", phone: "0891234567", position: "ช่างติดตั้ง" }

  it("ผ่านเมื่อข้อมูลถูกต้อง", () => {
    expect(EmployeeSchema.safeParse(valid).success).toBe(true)
  })

  it("ผ่านเมื่อไม่กรอกอายุ", () => {
    expect(EmployeeSchema.safeParse({ ...valid, age: "" }).success).toBe(true)
  })

  it("ผ่านเมื่ออายุอยู่ในช่วง 18-99", () => {
    expect(EmployeeSchema.safeParse({ ...valid, age: "30" }).success).toBe(true)
  })

  it("ไม่ผ่านเมื่ออายุน้อยกว่า 18", () => {
    const r = EmployeeSchema.safeParse({ ...valid, age: "17" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อไม่กรอกชื่อ", () => {
    const r = EmployeeSchema.safeParse({ ...valid, first_name: "" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อเบอร์โทรผิด", () => {
    const r = EmployeeSchema.safeParse({ ...valid, phone: "1234567890" })
    expect(r.success).toBe(false)
  })
})

// ─── ProductSchema ────────────────────────────────────────────
describe("ProductSchema", () => {
  const valid = { name: "Jinko 580W", category: "solar_panel", unit_price: "15000" }

  it("ผ่านเมื่อข้อมูลถูกต้อง", () => {
    expect(ProductSchema.safeParse(valid).success).toBe(true)
  })

  it("แปลง unit_price เป็นตัวเลข", () => {
    const r = ProductSchema.safeParse(valid)
    expect(r.success && r.data.unit_price).toBe(15000)
  })

  it("ผ่านเมื่อ unit_price เป็น 0", () => {
    expect(ProductSchema.safeParse({ ...valid, unit_price: "0" }).success).toBe(true)
  })

  it("ไม่ผ่านเมื่อไม่กรอกชื่อสินค้า", () => {
    const r = ProductSchema.safeParse({ ...valid, name: "" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อ category ไม่ถูกต้อง", () => {
    const r = ProductSchema.safeParse({ ...valid, category: "unknown" })
    expect(r.success).toBe(false)
  })

  it("ไม่ผ่านเมื่อ unit_price ติดลบ", () => {
    const r = ProductSchema.safeParse({ ...valid, unit_price: "-1" })
    expect(r.success).toBe(false)
  })
})
