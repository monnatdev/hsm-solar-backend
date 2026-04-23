import { getCustomers, getStatusCounts } from "@/lib/data/customers"
import { CustomerStatus } from "@/lib/supabase/types"
import { daysInCurrentStatus, daysLabel } from "@/lib/utils/status"
import { StatusBadge } from "./_components/StatusBadge"
import { StatusFilter } from "./_components/StatusFilter"
import { AddCustomerButton } from "./_components/AddCustomerButton"
import { SearchInput } from "./_components/SearchInput"
import { Pagination } from "./_components/Pagination"
import Link from "next/link"
import { Suspense } from "react"

const PAGE_SIZE = 20

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const status = params.status as CustomerStatus | undefined
  const search = params.search ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10))

  const [{ customers, total }, counts] = await Promise.all([
    getCustomers(status, search, page),
    getStatusCounts(),
  ])

  const plainParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ) as Record<string, string>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ลูกค้าทั้งหมด</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} ราย</p>
        </div>
        <AddCustomerButton />
      </div>

      <Suspense fallback={null}>
        <SearchInput defaultValue={search} />
      </Suspense>

      <StatusFilter current={params.status} counts={counts} />

      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {customers.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">ไม่พบลูกค้า</div>
        )}
        {customers.map((c) => (
          <Link
            key={c.id}
            href={`/customers/${c.id}`}
            className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3.5 active:bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{c.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.phone}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <StatusBadge status={c.status} />
              <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {daysLabel(daysInCurrentStatus(c))}
              </span>
            </div>
            <span className="text-gray-300 ml-1">›</span>
          </Link>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">เบอร์โทร</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">สถานะ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">วันที่ติดต่อ</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ในสถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">ไม่พบลูกค้า</td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(c.created_at).toLocaleDateString("th-TH", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                    {daysLabel(daysInCurrentStatus(c))}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline font-medium">
                    ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} searchParams={plainParams} />
    </div>
  )
}
