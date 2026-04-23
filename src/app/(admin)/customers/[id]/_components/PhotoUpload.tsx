"use client"

import { useState, useRef } from "react"

interface Photo {
  url: string
  pending?: boolean
}

interface Props {
  initialPhotos?: string[]
}

export function PhotoUpload({ initialPhotos = [] }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(
    initialPhotos.map((url) => ({ url }))
  )
  const [lightbox, setLightbox] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const previews: Photo[] = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      pending: true,
    }))
    setPhotos((prev) => [...prev, ...previews])
    // TODO: upload to R2, replace pending urls with real urls
  }

  function remove(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
          >
            <img
              src={photo.url}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightbox(photo.url)}
            />
            {photo.pending && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-xs font-medium">รอบันทึก</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-sm leading-none transition-colors"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors active:bg-gray-50"
        >
          <span className="text-2xl">📷</span>
          <span className="text-xs">เพิ่มรูป</span>
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
        // reset value so same file can be re-selected
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
