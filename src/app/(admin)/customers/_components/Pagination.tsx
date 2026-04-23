import Link from "next/link"

interface Props {
  page: number
  total: number
  pageSize: number
  searchParams: Record<string, string>
}

export function Pagination({ page, total, pageSize, searchParams }: Props) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  function buildUrl(p: number) {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    return `?${params.toString()}`
  }

  const pages: (number | "...")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-gray-400">
        {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} จาก {total} ราย
      </p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={buildUrl(page - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            ← ก่อนหน้า
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-xs rounded-lg border border-gray-100 text-gray-300">← ก่อนหน้า</span>
        )}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
            ) : (
              <Link key={p} href={buildUrl(p)}
                className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition-colors ${
                  p === page ? "bg-gray-900 text-white" : "hover:bg-gray-50 border border-gray-200"
                }`}>
                {p}
              </Link>
            )
          )}
        </div>
        {page < totalPages ? (
          <Link href={buildUrl(page + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            ถัดไป →
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-xs rounded-lg border border-gray-100 text-gray-300">ถัดไป →</span>
        )}
      </div>
    </div>
  )
}
