"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "./input"
import { Label } from "./label"
import type { ThaiLocation } from "@/lib/supabase/types"

// Actual field names from thai-address-database package
interface Entry {
  district: string   // ตำบล/แขวง
  amphoe: string     // อำเภอ/เขต
  province: string
  zipcode: string
}

interface Props {
  value: ThaiLocation
  onChange: (loc: ThaiLocation) => void
}

export function ThaiAddressInput({ value, onChange }: Props) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Entry[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function handleSearch(q: string) {
    setQuery(q)
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }

    const { searchAddressByDistrict, searchAddressByAmphoe, searchAddressByProvince, searchAddressByZipcode } =
      await import("thai-address-database")

    const isZip = /^\d+$/.test(q)
    const raw = isZip
      ? searchAddressByZipcode(q)
      : [
          ...searchAddressByDistrict(q),
          ...searchAddressByAmphoe(q),
          ...searchAddressByProvince(q),
        ]

    const seen = new Set<string>()
    const results: Entry[] = []
    for (const r of raw as Entry[]) {
      const key = `${r.district}|${r.amphoe}|${r.province}`
      if (!seen.has(key)) { seen.add(key); results.push(r) }
      if (results.length >= 8) break
    }

    setSuggestions(results)
    setOpen(results.length > 0)
  }

  function select(entry: Entry) {
    onChange({
      ...value,
      subdistrict: entry.district,
      district: entry.amphoe,
      province: entry.province,
      postal_code: String(entry.zipcode),
    })
    setQuery(`${entry.district} › ${entry.amphoe} › ${entry.province} ${entry.zipcode}`)
    setOpen(false)
  }

  const displayQuery = query || (value.subdistrict
    ? `${value.subdistrict} › ${value.district} › ${value.province} ${value.postal_code}`
    : "")

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>ที่อยู่</Label>
        <Input
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder="เช่น 123/4 ซ.สุขุมวิท 21"
        />
      </div>

      <div className="space-y-1.5" ref={ref}>
        <Label>ตำบล / อำเภอ / จังหวัด <span className="text-red-500">*</span></Label>
        <div className="relative">
          <Input
            value={displayQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="พิมพ์ค้นหา ตำบล อำเภอ หรือ รหัสไปรษณีย์"
          />
          {open && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto text-sm">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                  onMouseDown={() => select(s)}
                >
                  <span className="font-medium">{s.district}</span>
                  <span className="text-gray-500"> › {s.amphoe} › {s.province} </span>
                  <span className="text-gray-400 text-xs">{s.zipcode}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {value.subdistrict && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1.5">
            <Label>รหัสไปรษณีย์ <span className="text-red-500">*</span></Label>
            <Input value={value.postal_code} onChange={(e) => onChange({ ...value, postal_code: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>จังหวัด <span className="text-red-500">*</span></Label>
            <Input value={value.province} onChange={(e) => onChange({ ...value, province: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  )
}
