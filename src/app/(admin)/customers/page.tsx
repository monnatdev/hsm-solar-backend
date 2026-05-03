import { getCustomers, getStatusCounts } from "@/lib/data/customers"
import type { Customer, CustomerStatus } from "@/lib/supabase/types"
import { daysInCurrentStatus, daysLabel } from "@/lib/utils/status"
import { StatusBadge } from "./_components/StatusBadge"
import { StatusFilter } from "./_components/StatusFilter"
import { DateRangeFilter } from "./_components/DateRangeFilter"
import { AddCustomerButton } from "./_components/AddCustomerButton"
import { SearchInput } from "./_components/SearchInput"
import { Pagination } from "./_components/Pagination"
import Link from "next/link"
import { Suspense } from "react"

const PAGE_SIZE = 20

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function toNames(val: string | string[] | undefined): string {
  if (!val) return ""
  const arr = Array.isArray(val) ? val : [val]
  return arr.filter(Boolean).join(", ")
}

function locationAddress(loc: { address?: string } | undefined): string {
  return loc?.address?.trim() ?? ""
}

function locationLine(loc: { subdistrict?: string; district?: string; province?: string; postal_code?: string } | undefined): string {
  if (!loc) return ""
  const parts = [loc.subdistrict, loc.district, loc.province, loc.postal_code].filter(Boolean)
  return parts.join(" › ")
}

type AppointmentStatus = "survey_scheduled" | "install_scheduled" | "cleaning_scheduled"

const APPT_COLUMN_LABEL: Record<AppointmentStatus, string> = {
  survey_scheduled: "วันนัดสำรวจ",
  install_scheduled: "วันนัดติดตั้ง",
  cleaning_scheduled: "วันนัดล้างแผง",
}

function getApptDate(c: Customer, status: AppointmentStatus): string | null {
  if (status === "survey_scheduled") return c.survey?.date ?? null
  if (status === "install_scheduled") return c.installation?.date ?? null
  if (status === "cleaning_scheduled") return c.cleaning_schedules?.[0]?.date ?? null
  return null
}

function ApptSubText({ c }: { c: Customer }) {
  if (c.status === "survey_scheduled" && c.survey?.date) {
    return (
      <div className="mt-1 space-y-0.5">
        <p className="text-xs text-cyan-600">
          {formatDate(c.survey.date)}{c.survey.time && ` · ${c.survey.time}`}
        </p>
        {locationAddress(c.survey.location) && (
          <p className="text-xs text-gray-500 truncate">{locationAddress(c.survey.location)}</p>
        )}
        {locationLine(c.survey.location) && (
          <p className="text-xs text-gray-400 truncate">{locationLine(c.survey.location)}</p>
        )}
        {toNames(c.survey.surveyor) && (
          <p className="text-xs text-gray-500 truncate">ผู้สำรวจ: {toNames(c.survey.surveyor)}</p>
        )}
      </div>
    )
  }
  if (c.status === "install_scheduled" && c.installation?.date) {
    return (
      <div className="mt-1 space-y-0.5">
        <p className="text-xs text-indigo-600">
          {formatDate(c.installation.date)}{c.installation.time && ` · ${c.installation.time}`}
        </p>
        {locationAddress(c.installation.location) && (
          <p className="text-xs text-gray-500 truncate">{locationAddress(c.installation.location)}</p>
        )}
        {locationLine(c.installation.location) && (
          <p className="text-xs text-gray-400 truncate">{locationLine(c.installation.location)}</p>
        )}
        {toNames(c.installation.installer) && (
          <p className="text-xs text-gray-500 truncate">ผู้ดูแล: {toNames(c.installation.installer)}</p>
        )}
      </div>
    )
  }
  if (c.status === "cleaning_scheduled" && c.cleaning_schedules?.[0]?.date) {
    return (
      <p className="text-xs text-sky-600 mt-1">
        นัดล้างแผง {formatDate(c.cleaning_schedules[0].date)}
      </p>
    )
  }
  return null
}

const APPT_STATUSES = new Set<string>(["survey_scheduled", "install_scheduled", "cleaning_scheduled"])

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string; date?: string }>
}) {
  const params = await searchParams
  const status = params.status as CustomerStatus | undefined
  const search = params.search ?? ""
  const page = Math.max(1, parseInt(params.page ?? "1", 10))
  const date = params.date

  const [{ customers, total }, counts] = await Promise.all([
    getCustomers(status, search, page, date),
    getStatusCounts(),
  ])

  const plainParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ) as Record<string, string>

  const showDateFilter = status === "survey_scheduled" || status === "install_scheduled"

  const isApptView = status ? APPT_STATUSES.has(status) : false
  const apptStatus = isApptView ? (status as AppointmentStatus) : null

  const dateColLabel = apptStatus ? APPT_COLUMN_LABEL[apptStatus] : "วันที่ติดต่อ"

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

      {showDateFilter && (
        <DateRangeFilter
          status={status as "survey_scheduled" | "install_scheduled"}
          date={date}
          currentParams={plainParams}
        />
      )}

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
              <p className="text-xs text-gray-500 mt-0.5">{c.phone ?? "—"}</p>
              <ApptSubText c={c} />
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
              <th className="text-left px-4 py-3 font-medium text-gray-600">{dateColLabel}</th>
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
            {customers.map((c) => {
              const apptDate = apptStatus ? getApptDate(c, apptStatus) : null
              return (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    {apptStatus === "survey_scheduled" && c.survey && (
                      <div className="mt-0.5 space-y-0.5">
                        {locationAddress(c.survey.location) && (
                          <p className="text-xs text-gray-500">{locationAddress(c.survey.location)}</p>
                        )}
                        {locationLine(c.survey.location) && (
                          <p className="text-xs text-gray-400">{locationLine(c.survey.location)}</p>
                        )}
                        {toNames(c.survey.surveyor) && (
                          <p className="text-xs text-gray-400">ผู้สำรวจ: {toNames(c.survey.surveyor)}</p>
                        )}
                      </div>
                    )}
                    {apptStatus === "install_scheduled" && c.installation && (
                      <div className="mt-0.5 space-y-0.5">
                        {locationAddress(c.installation.location) && (
                          <p className="text-xs text-gray-500">{locationAddress(c.installation.location)}</p>
                        )}
                        {locationLine(c.installation.location) && (
                          <p className="text-xs text-gray-400">{locationLine(c.installation.location)}</p>
                        )}
                        {toNames(c.installation.installer) && (
                          <p className="text-xs text-gray-400">ผู้ดูแล: {toNames(c.installation.installer)}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {apptDate
                      ? formatDate(apptDate)
                      : formatDate(c.created_at)}
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
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={total} pageSize={PAGE_SIZE} searchParams={plainParams} />
    </div>
  )
}
