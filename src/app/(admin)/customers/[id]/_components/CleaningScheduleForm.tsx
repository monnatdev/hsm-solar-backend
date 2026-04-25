"use client"

import { useState, useRef } from "react"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmployeeMultiSelect } from "@/components/ui/EmployeeMultiSelect"
import { addCleaningScheduleItem, deleteCleaningScheduleItem } from "@/lib/data/customers"
import type { CleaningScheduleItem, Employee } from "@/lib/supabase/types"

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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onAdd(e.target.files)}
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />
    </div>
  )
}

function ScheduleCard({ item, index, customerId }: {
  item: CleaningScheduleItem
  index: number
  customerId: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteCleaningScheduleItem(customerId, item.id)
  }

  const hasDetails = (item.photos?.length ?? 0) > 0 || (item.slip_photos?.length ?? 0) > 0 || !!item.notes

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-white">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            นัดล้างแผงครั้งที่ {index + 1}
            <span className="ml-2 font-normal text-sky-600">
              {new Date(item.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </p>
          {item.supervisor && item.supervisor.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">ผู้ดูแล: {item.supervisor.join(", ")}</p>
          )}
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
          {hasDetails && (
            <button onClick={() => setExpanded((v) => !v)} className="text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="px-4 pb-4 space-y-3 bg-gray-50 border-t border-gray-100">
          {item.notes && (
            <p className="text-sm text-gray-600 pt-3">{item.notes}</p>
          )}
          {(item.photos?.length ?? 0) > 0 && (
            <div className="space-y-1.5 pt-3">
              <p className="text-xs font-medium text-gray-500">รูปล้างแผง ({item.photos!.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {item.photos!.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {(item.slip_photos?.length ?? 0) > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-500">สลิป ({item.slip_photos!.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {item.slip_photos!.map((url, i) => (
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

export function CleaningScheduleForm({ customerId, schedules = [], employees = [] }: {
  customerId: string
  schedules?: CleaningScheduleItem[]
  employees?: Employee[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState("")
  const [supervisor, setSupervisor] = useState<string[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [slips, setSlips] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!date) return
    setLoading(true)
    const notes = (e.currentTarget.elements.namedItem("notes") as HTMLTextAreaElement)?.value ?? ""
    await addCleaningScheduleItem(customerId, {
      date,
      supervisor,
      photos: photos.map((p) => p.url),
      slip_photos: slips.map((p) => p.url),
      notes,
    })
    setDate("")
    setSupervisor([])
    setPhotos([])
    setSlips([])
    setShowForm(false)
    setLoading(false)
  }

  const sorted = [...schedules].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-3">
      {sorted.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">ยังไม่มีนัดล้างแผง</p>
      )}

      {sorted.map((s, i) => (
        <ScheduleCard key={s.id} item={s} index={i} customerId={customerId} />
      ))}

      {showForm ? (
        <form onSubmit={handleAdd} className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
          <p className="text-sm font-semibold">นัดล้างแผงครั้งที่ {sorted.length + 1}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>วันที่นัด <span className="text-red-500">*</span></Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>ผู้ดูแล</Label>
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
              onClick={() => { setShowForm(false); setDate(""); setSupervisor([]); setPhotos([]); setSlips([]) }}>
              ยกเลิก
            </Button>
            <Button type="submit" size="sm" className="flex-1" disabled={loading || !date}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          + เพิ่มนัดล้างแผง
        </Button>
      )}
    </div>
  )
}
