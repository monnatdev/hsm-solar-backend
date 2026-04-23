"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    }, 400)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ค้นหาชื่อหรือเบอร์โทร..."
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
      />
    </div>
  )
}
