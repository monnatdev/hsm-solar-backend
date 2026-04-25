"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import { uploadPhoto, deletePhoto } from "@/lib/data/storage"
import {
  addPurchaseItem,
  updatePurchaseItem,
  deletePurchaseItem,
  addPurchaseItemPhoto,
  removePurchaseItemPhoto,
} from "@/lib/data/customers"
import type { PurchaseItem, PurchaseSource, Product } from "@/lib/supabase/types"
import { PURCHASE_SOURCE_LABELS } from "@/lib/supabase/types"

type PhotoSlot = "purchase_slip" | "reimbursement_slip"

const REIMBURSEMENT_LABELS = { pending: "รอเบิก", reimbursed: "เบิกแล้ว" } as const
const REIMBURSEMENT_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  reimbursed: "bg-green-100 text-green-700",
} as const

interface ItemFormData {
  product_name: string
  quantity: string
  unit_price: string
  source: PurchaseSource
  store_name: string
  product_url: string
  warranty_years: string
  warranty_by: string
  reimbursement_status: "pending" | "reimbursed"
  notes: string
}

const EMPTY_FORM: ItemFormData = {
  product_name: "",
  quantity: "1",
  unit_price: "",
  source: "shopee",
  store_name: "",
  product_url: "",
  warranty_years: "",
  warranty_by: "",
  reimbursement_status: "pending",
  notes: "",
}

interface Props {
  customerId: string
  initialItems?: PurchaseItem[]
  products?: Product[]
}

export function PurchaseItemsSection({ customerId, initialItems = [], products = [] }: Props) {
  const [items, setItems] = useState<PurchaseItem[]>(initialItems)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<PurchaseItem | null>(null)
  const [form, setForm] = useState<ItemFormData>(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<Record<string, boolean>>({})

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditItem(null)
    setShowForm(true)
  }

  function openEdit(item: PurchaseItem) {
    setForm({
      product_name: item.product_name,
      quantity: String(item.quantity),
      unit_price: String(item.unit_price),
      source: item.source,
      store_name: item.store_name ?? "",
      product_url: item.product_url ?? "",
      warranty_years: item.warranty_years != null ? String(item.warranty_years) : "",
      warranty_by: item.warranty_by ?? "",
      reimbursement_status: item.reimbursement_status,
      notes: item.notes ?? "",
    })
    setEditItem(item)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
  }

  function setField<K extends keyof ItemFormData>(key: K, value: ItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        product_name: form.product_name.trim(),
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        source: form.source,
        store_name: form.store_name.trim() || undefined,
        product_url: form.product_url.trim() || undefined,
        warranty_years: form.warranty_years ? Number(form.warranty_years) : undefined,
        warranty_by: form.warranty_by.trim() || undefined,
        reimbursement_status: form.reimbursement_status,
        notes: form.notes.trim() || undefined,
      }

      if (editItem) {
        await updatePurchaseItem(customerId, editItem.id, payload)
        setItems((prev) => prev.map((i) => (i.id === editItem.id ? { ...i, ...payload } : i)))
      } else {
        const newItem = await addPurchaseItem(customerId, payload)
        setItems((prev) => [...prev, newItem])
        setExpandedId(newItem.id)
      }
      closeForm()
    } catch {
      alert("บันทึกไม่สำเร็จ กรุณาลองใหม่")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: PurchaseItem) {
    if (!confirm(`ลบ "${item.product_name}"?`)) return
    setDeletingId(item.id)
    try {
      await deletePurchaseItem(customerId, item.id)
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      if (expandedId === item.id) setExpandedId(null)
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่")
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePhotoUpload(itemId: string, slot: PhotoSlot, files: FileList | null) {
    if (!files || files.length === 0) return
    const key = `${itemId}-${slot}`
    setUploadingSlot((prev) => ({ ...prev, [key]: true }))
    try {
      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: "image/webp",
        })
        const fd = new FormData()
        fd.append("file", compressed)
        const url = await uploadPhoto(fd, `customers/${customerId}/purchases/${itemId}/${slot}`)
        await addPurchaseItemPhoto(customerId, itemId, slot, url)
        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== itemId) return i
            const field = slot === "purchase_slip" ? "purchase_slip_photos" : "reimbursement_slip_photos"
            return { ...i, [field]: [...(i[field] ?? []), url] }
          })
        )
      }
    } catch {
      alert("อัปโหลดไม่สำเร็จ กรุณาลองใหม่")
    } finally {
      setUploadingSlot((prev) => ({ ...prev, [key]: false }))
    }
  }

  async function handlePhotoRemove(itemId: string, slot: PhotoSlot, url: string) {
    if (!confirm("ลบรูปนี้?")) return
    try {
      await Promise.all([deletePhoto(url), removePurchaseItemPhoto(customerId, itemId, slot, url)])
      setItems((prev) =>
        prev.map((i) => {
          if (i.id !== itemId) return i
          const field = slot === "purchase_slip" ? "purchase_slip_photos" : "reimbursement_slip_photos"
          return { ...i, [field]: (i[field] ?? []).filter((p) => p !== url) }
        })
      )
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่")
    }
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const pendingTotal = items
    .filter((i) => i.reimbursement_status === "pending")
    .reduce((sum, i) => sum + i.quantity * i.unit_price, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 space-y-0.5">
          {items.length > 0 && (
            <>
              <p>
                รวม{" "}
                <span className="font-semibold text-gray-900">{total.toLocaleString("th-TH")} บาท</span>
              </p>
              {pendingTotal > 0 && (
                <p className="text-xs text-yellow-600">
                  รอเบิก {pendingTotal.toLocaleString("th-TH")} บาท
                </p>
              )}
            </>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + เพิ่มสินค้า
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-center py-6 text-sm text-gray-400">ยังไม่มีรายการสินค้า</p>
      )}

      <div className="space-y-2">
        {items.map((item) => {
          const isExpanded = expandedId === item.id
          const itemTotal = item.quantity * item.unit_price
          const isDeleting = deletingId === item.id

          return (
            <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantity} × {item.unit_price.toLocaleString("th-TH")} ={" "}
                    <span className="font-medium text-gray-700">
                      {itemTotal.toLocaleString("th-TH")} บาท
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REIMBURSEMENT_COLORS[item.reimbursement_status]}`}>
                    {REIMBURSEMENT_LABELS[item.reimbursement_status]}
                  </span>
                  <span className="text-gray-400 text-xs ml-1">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {item.store_name && (
                      <div>
                        <span className="text-gray-500">ร้านค้า:</span>{" "}
                        <span className="font-medium">{item.store_name}</span>
                      </div>
                    )}
                    {item.source && (
                      <div>
                        <span className="text-gray-500">แหล่งซื้อ:</span>{" "}
                        <span className="font-medium">{PURCHASE_SOURCE_LABELS[item.source]}</span>
                      </div>
                    )}
                    {item.product_url && (
                      <div>
                        <span className="text-gray-500">ลิงก์:</span>{" "}
                        <a
                          href={/^https?:\/\//i.test(item.product_url) ? item.product_url : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ดูสินค้า
                        </a>
                      </div>
                    )}
                    {(item.warranty_years != null || item.warranty_by) && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">รับประกัน:</span>{" "}
                        <span className="font-medium">
                          {item.warranty_years != null ? `${item.warranty_years} ปี` : ""}
                          {item.warranty_years != null && item.warranty_by ? " โดย " : ""}
                          {item.warranty_by ?? ""}
                        </span>
                      </div>
                    )}
                    {item.notes && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">หมายเหตุ:</span> <span>{item.notes}</span>
                      </div>
                    )}
                  </div>

                  <PhotoSlotSection
                    label="สลิปซื้อสินค้า"
                    photos={item.purchase_slip_photos ?? []}
                    uploading={!!uploadingSlot[`${item.id}-purchase_slip`]}
                    onUpload={(files) => handlePhotoUpload(item.id, "purchase_slip", files)}
                    onRemove={(url) => handlePhotoRemove(item.id, "purchase_slip", url)}
                    onLightbox={setLightbox}
                  />

                  <PhotoSlotSection
                    label="สลิปโอนจากบริษัท"
                    photos={item.reimbursement_slip_photos ?? []}
                    uploading={!!uploadingSlot[`${item.id}-reimbursement_slip`]}
                    onUpload={(files) => handlePhotoUpload(item.id, "reimbursement_slip", files)}
                    onRemove={(url) => handlePhotoRemove(item.id, "reimbursement_slip", url)}
                    onLightbox={setLightbox}
                  />

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={isDeleting}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? "กำลังลบ..." : "ลบ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-5">{editItem ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="ชื่อสินค้า" required>
                <ProductCombobox
                  value={form.product_name}
                  onChange={(v) => setField("product_name", v)}
                  onSelect={(name, unitPrice) => {
                    setField("product_name", name)
                    setField("unit_price", String(unitPrice))
                  }}
                  products={products}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="จำนวน" required>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    required
                  />
                </Field>
                <Field label="ราคา/หน่วย (บาท)" required>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={inputClass}
                    value={form.unit_price}
                    onChange={(e) => setField("unit_price", e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </Field>
              </div>

              {form.quantity && form.unit_price && (
                <p className="text-xs text-gray-500 -mt-1">
                  รวม{" "}
                  <span className="font-semibold text-gray-900">
                    {(Number(form.quantity) * Number(form.unit_price)).toLocaleString("th-TH")} บาท
                  </span>
                </p>
              )}

              <Field label="แหล่งซื้อ" required>
                <select
                  className={inputClass}
                  value={form.source}
                  onChange={(e) => setField("source", e.target.value as PurchaseSource)}
                >
                  {Object.entries(PURCHASE_SOURCE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </Field>

              <Field label="ชื่อร้าน">
                <input
                  className={inputClass}
                  value={form.store_name}
                  onChange={(e) => setField("store_name", e.target.value)}
                  placeholder="เช่น ABC Solar Official"
                />
              </Field>

              <Field label="ลิงก์สินค้า">
                <input
                  type="url"
                  className={inputClass}
                  value={form.product_url}
                  onChange={(e) => setField("product_url", e.target.value)}
                  placeholder="https://shopee.co.th/..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="รับประกัน (ปี)">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.warranty_years}
                    onChange={(e) => setField("warranty_years", e.target.value)}
                    placeholder="เช่น 25"
                  />
                </Field>
                <Field label="รับประกันโดย">
                  <input
                    className={inputClass}
                    value={form.warranty_by}
                    onChange={(e) => setField("warranty_by", e.target.value)}
                    placeholder="เช่น Jinko"
                  />
                </Field>
              </div>

              <Field label="สถานะเบิก" required>
                <select
                  className={inputClass}
                  value={form.reimbursement_status}
                  onChange={(e) => setField("reimbursement_status", e.target.value as "pending" | "reimbursed")}
                >
                  <option value="pending">รอเบิก</option>
                  <option value="reimbursed">เบิกแล้ว</option>
                </select>
              </Field>

              <Field label="หมายเหตุ">
                <textarea
                  rows={2}
                  className={`${inputClass} resize-none`}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative w-full h-full">
            <Image
              src={lightbox}
              alt=""
              fill
              className="object-contain rounded-xl"
            />
          </div>
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center text-xl transition-colors"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

const inputClass =
  "w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function ProductCombobox({
  value,
  onChange,
  onSelect,
  products,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (name: string, unitPrice: number) => void
  products: Product[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = products.filter((p) =>
    `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(value.toLowerCase())
  )

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <input
        className={inputClass}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="เช่น Jinko Tiger Neo 580W หรือพิมพ์ชื่อเอง"
        required
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-sm">
          {filtered.map((p) => (
            <li
              key={p.id}
              onMouseDown={() => { onSelect(p.name, p.unit_price); setOpen(false) }}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-gray-400">
                {p.brand && <span>{p.brand}</span>}
                {p.brand && p.unit_price ? " · " : ""}
                {p.unit_price ? `${p.unit_price.toLocaleString("th-TH")} บาท/หน่วย` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PhotoSlotSection({
  label,
  photos,
  uploading,
  onUpload,
  onRemove,
  onLightbox,
}: {
  label: string
  photos: string[]
  uploading: boolean
  onUpload: (files: FileList | null) => void
  onRemove: (url: string) => void
  onLightbox: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 100px"
                className="object-cover cursor-pointer"
                onClick={() => onLightbox(url)}
              />
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1"
      >
        {uploading ? "กำลังอัปโหลด..." : `+ เพิ่ม${label}`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onUpload(e.target.files)}
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />
    </div>
  )
}
