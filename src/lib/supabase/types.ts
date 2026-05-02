export type CustomerStatus =
  | "new"
  | "talking"
  | "need_quote"
  | "quoted"
  | "survey_scheduled"
  | "surveyed"
  | "waiting_for_stock"
  | "install_scheduled"
  | "installed"
  | "cleaning_scheduled"
  | "cleaning_done"
  | "closed"

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  new: "ใหม่",
  talking: "กำลังคุย",
  need_quote: "ต้องการใบเสนอราคา",
  quoted: "ส่งใบเสนอราคาแล้ว",
  survey_scheduled: "นัดสำรวจแล้ว",
  surveyed: "สำรวจแล้ว",
  waiting_for_stock: "รอของเข้า",
  install_scheduled: "นัดติดตั้งแล้ว",
  installed: "ติดตั้งเสร็จ",
  cleaning_scheduled: "นัดล้างแผง",
  cleaning_done: "ล้างแผงแล้ว",
  closed: "ปิด",
}

export const STATUS_COLORS: Record<CustomerStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  talking: "bg-yellow-100 text-yellow-700",
  need_quote: "bg-orange-100 text-orange-700",
  quoted: "bg-purple-100 text-purple-700",
  survey_scheduled: "bg-cyan-100 text-cyan-700",
  surveyed: "bg-teal-100 text-teal-700",
  waiting_for_stock: "bg-amber-100 text-amber-700",
  install_scheduled: "bg-indigo-100 text-indigo-700",
  installed: "bg-green-100 text-green-700",
  cleaning_scheduled: "bg-sky-100 text-sky-700",
  cleaning_done: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-600",
}

export interface Employee {
  id: string
  created_at: string
  first_name: string
  last_name: string
  age?: number | null
  phone: string
  position: string
}

export interface CleaningScheduleItem {
  id: string
  date: string
  supervisor?: string[]
  photos?: string[]
  slip_photos?: string[]
  notes?: string
}

export interface PanelCleaning {
  id: string
  date: string
  supervisor: string[]
  photos: string[]
  slip_photos: string[]
  notes: string
  created_at: string
}

export type PurchaseSource = "shopee" | "lazada" | "facebook" | "contractor" | "other"

export const PURCHASE_SOURCE_LABELS: Record<PurchaseSource, string> = {
  shopee: "Shopee",
  lazada: "Lazada",
  facebook: "Facebook",
  contractor: "ผู้รับเหมา",
  other: "อื่นๆ",
}

export interface PurchaseItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  source: PurchaseSource
  store_name?: string
  product_url?: string
  warranty_years?: number
  warranty_by?: string
  purchase_slip_photos?: string[]
  reimbursement_status: "pending" | "reimbursed"
  reimbursement_slip_photos?: string[]
  notes?: string
}

export type SystemType = "on_grid" | "hybrid" | "off_grid"

export type ProductCategory = "solar_panel" | "battery" | "inverter" | "cable"

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  solar_panel: "แผงโซลาร์",
  battery: "แบตเตอรี่",
  inverter: "อินเวอร์เตอร์",
  cable: "สายไฟ",
}

export interface Product {
  id: string
  created_at: string
  updated_at: string
  name: string
  brand?: string
  sku?: string
  category: ProductCategory
  unit_price: number
  description?: string
}

export interface InstallationProduct {
  product_id: string
  name: string
  brand: string
  category: ProductCategory
  quantity: number
  unit_price: number
}

export interface ThaiLocation {
  address: string
  subdistrict: string
  district: string
  province: string
  postal_code: string
}

export interface Survey {
  date: string
  time: string
  location: ThaiLocation
  surveyor: string[]
}

export interface Installation {
  date: string
  time: string
  location: ThaiLocation
  size_kw: number
  phase: number
  system_type: SystemType
  installer?: string[]
  products: InstallationProduct[]
  notes?: string
}

export interface Customer {
  id: string
  created_at: string
  updated_at: string
  name: string
  phone: string
  email?: string
  address?: string
  source?: string
  status: CustomerStatus
  status_history: Partial<Record<CustomerStatus, string>>
  notes?: string
  assigned_to?: string
  survey?: Survey | null
  installation?: Installation | null
  site_photos?: string[]
  product_photos?: string[]
  payment_photos?: string[]
  serial_number_photos?: string[]
  serial_number_notes?: string
  panel_cleanings?: PanelCleaning[]
  cleaning_schedules?: CleaningScheduleItem[]
  purchase_items?: PurchaseItem[]
}
