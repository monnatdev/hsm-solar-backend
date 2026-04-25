"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/lib/data/auth"

const navItems = [
  { href: "/customers", label: "ลูกค้า", icon: "👥" },
  { href: "/products", label: "สินค้า", icon: "📦" },
  { href: "/employees", label: "พนักงาน", icon: "👤" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col shrink-0">
      <div className="px-5 py-6 border-b border-gray-100">
        <p className="font-bold text-sm">HSM Solar</p>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname.startsWith(item.href)
                ? "bg-gray-100 font-semibold text-gray-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span>🚪</span>
            ออกจากระบบ
          </button>
        </form>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
            pathname.startsWith(item.href)
              ? "text-gray-900 font-semibold"
              : "text-gray-400"
          }`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <form action={logout} className="flex-1">
        <button
          type="submit"
          className="w-full h-full flex flex-col items-center gap-1 py-3 text-xs text-gray-400"
        >
          <span className="text-lg leading-none">🚪</span>
          ออกจากระบบ
        </button>
      </form>
    </nav>
  )
}
