"use client"

import { useState, useRef } from "react"
import imageCompression from "browser-image-compression"
import { uploadPhoto, deletePhoto, updateCustomerPhotos } from "@/lib/data/storage"

type PhotoType = "site" | "product" | "payment"

interface Props {
  customerId: string
  type: PhotoType
  initialPhotos?: string[]
}

export function PhotoUpload({ customerId, type, initialPhotos = [] }: Props) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [expanded, setExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    try {
      const newUrls: string[] = []

      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: "image/webp",
        })

        const fd = new FormData()
        fd.append("file", compressed)
        const url = await uploadPhoto(fd, `customers/${customerId}/${type}`)
        newUrls.push(url)
      }

      const updated = [...photos, ...newUrls]
      setPhotos(updated)
      setExpanded(true)
      await updateCustomerPhotos(customerId, type, updated)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(url: string) {
    if (!confirm("ลบรูปนี้?")) return
    const updated = photos.filter((p) => p !== url)
    try {
      await Promise.all([
        deletePhoto(url),
        updateCustomerPhotos(customerId, type, updated),
      ])
      setPhotos(updated)
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่")
    }
  }

  if (!expanded && photos.length > 0) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-600"
      >
        <span>🖼️</span>
        <span>มี {photos.length} รูป — กดเพื่อแสดง</span>
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {expanded && photos.length > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          ซ่อนรูป
        </button>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((url) => (
          <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightbox(url)}
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-sm leading-none transition-colors"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <span className="text-xs">กำลังอัปโหลด...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📷</span>
              <span className="text-xs">เพิ่มรูป</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400">{photos.length} รูป</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => ((e.target as HTMLInputElement).value = "")}
      />

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-w-full max-h-full rounded-xl object-contain"
          />
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
