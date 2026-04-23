"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import type { Employee } from "@/lib/supabase/types"

interface Props {
  employees: Employee[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function EmployeeMultiSelect({ employees, value, onChange, placeholder = "-- เลือกพนักงาน --" }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function toggle(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((v) => v !== name))
    } else {
      onChange([...value, name])
    }
  }

  function remove(name: string, e: React.MouseEvent) {
    e.stopPropagation()
    onChange(value.filter((v) => v !== name))
  }

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className="min-h-[38px] w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex flex-wrap gap-1.5 items-center cursor-pointer bg-white focus-within:ring-2 focus-within:ring-gray-900"
      >
        {value.length === 0 && (
          <span className="text-gray-400">{placeholder}</span>
        )}
        {value.map((name) => (
          <span key={name} className="flex items-center gap-1 bg-gray-100 text-gray-700 rounded-md px-2 py-0.5 text-xs font-medium">
            {name}
            <button type="button" onClick={(e) => remove(name, e)} className="text-gray-400 hover:text-gray-600">
              <X size={11} />
            </button>
          </span>
        ))}
        <ChevronDown size={14} className="ml-auto text-gray-400 shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {employees.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">ไม่มีพนักงาน</p>
          )}
          {employees.map((emp) => {
            const name = `${emp.first_name} ${emp.last_name}`
            const selected = value.includes(name)
            return (
              <button
                key={emp.id}
                type="button"
                onClick={() => toggle(name)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${selected ? "bg-gray-50" : ""}`}
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                  {selected && <span className="text-white text-[10px] leading-none">✓</span>}
                </span>
                <span>{name}</span>
                {emp.position && <span className="text-xs text-gray-400">({emp.position})</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
