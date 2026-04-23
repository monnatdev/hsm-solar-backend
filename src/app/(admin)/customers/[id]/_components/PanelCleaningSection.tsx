"use client"

import { useState, useRef } from "react"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addPanelCleaning, deletePanelCleaning } from "@/lib/data/customers"
import { EmployeeMultiSelect } from "@/components/ui/EmployeeMultiSelect"
import type { PanelCleaning, Employee } from "@/lib/supabase/types"

interface Photo { url: string }

function PhotoGrid({ photos, onAdd, onRemove }: {
  photos: Photo[]
  onAdd: (files: FileList) => void
  onRemove: (i: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((p, i) => (
        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img src={p.url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-sm"
          >×</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 transition-colors"
      >
        <span className="text-xl">📷</span>
        <span className="text-xs mt-1">เพิ่ม</span>
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => e.target.files && onAdd(e.target.files)}
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />
    </div>
  )
}

function CleaningCard({ record, customerId }: { record: PanelCleaning; customerId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deletePanelCleaning(customerId, record.id)
  }

  const supervisorList = Array.isArray(record.supervisor)
    ? record.supervisor
    : record.supervisor
      ? [record.supervisor]
      : []

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {new Date(record.date).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            ผู้ดูแล: {supervisorList.length > 0 ? supervisorList.join(", ") : "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {confirmDelete ? (
            <>
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs text-red-500 font-medium disabled:opacity-50">
                {deleting ? "กำลังลบ..." : "ยืนยัน"}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400">ยกเลิก</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t border-gray-100">
          {record.notes && (
            <p className="text-sm text-gray-600 pt-3">{record.notes}</p>
          )}
          {record.photos.length > 0 && (
            <div className="space-y-1.5 pt-3">
              <p className="text-xs font-medium text-gray-500">รูปล้างแผง ({record.photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {record.photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {record.slip_photos.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">สลิป ({record.slip_photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {record.slip_photos.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PanelCleaningSection({ customerId, cleanings, employees = [] }: {
  customerId: string
  cleanings: PanelCleaning[]
  employees?: Employee[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supervisor, setSupervisor] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [slips, setSlips] = useState<Photo[]>([])

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const date = fd.get("date") as string
    if (!date || supervisor.length === 0) return
    setLoading(true)
    await addPanelCleaning(customerId, {
      date,
      supervisor,
      notes: fd.get("notes") as string,
      photos: photos.map((p) => p.url),
      slip_photos: slips.map((p) => p.url),
    })
    setShowForm(false)
    setSupervisor([])
    setPhotos([])
    setSlips([])
    setLoading(false)
  }

  const sorted = [...cleanings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-3">
      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">ยังไม่มีประวัติการล้างแผง</p>
      )}

      {sorted.map((c) => (
        <CleaningCard key={c.id} record={c} customerId={customerId} />
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
          <p className="text-sm font-semibold">บันทึกการล้างแผงใหม่</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>วันที่ล้าง <span className="text-red-500">*</span></Label>
              <Input type="date" name="date" required />
            </div>
            <div className="space-y-1.5">
              <Label>ผู้ดูแล <span className="text-red-500">*</span></Label>
              <EmployeeMultiSelect
                employees={employees}
                value={supervisor}
                onChange={setSupervisor}
                placeholder="-- เลือกผู้ดูแล --"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>รูปล้างแผง</Label>
            <PhotoGrid
              photos={photos}
              onAdd={(files) => setPhotos((prev) => [...prev, ...Array.from(files).map((f) => ({ url: URL.createObjectURL(f) }))])}
              onRemove={(i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>สลิป</Label>
            <PhotoGrid
              photos={slips}
              onAdd={(files) => setSlips((prev) => [...prev, ...Array.from(files).map((f) => ({ url: URL.createObjectURL(f) }))])}
              onRemove={(i) => setSlips((prev) => prev.filter((_, idx) => idx !== i))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>หมายเหตุ</Label>
            <textarea
              name="notes"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none bg-white"
              placeholder="รายละเอียดเพิ่มเติม"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" className="flex-1"
              onClick={() => { setShowForm(false); setSupervisor([]); setPhotos([]); setSlips([]) }}>
              ยกเลิก
            </Button>
            <Button type="submit" size="sm" className="flex-1" disabled={loading || supervisor.length === 0}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          + เพิ่มการล้างแผง
        </Button>
      )}
    </div>
  )
}
