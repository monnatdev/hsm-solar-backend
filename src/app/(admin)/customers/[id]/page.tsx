import { notFound } from "next/navigation"
import { getCustomerById } from "@/lib/data/customers"
import { getProducts } from "@/lib/data/products"
import { getEmployees } from "@/lib/data/employees"
import { daysInCurrentStatus, daysLabel } from "@/lib/utils/status"
import { StatusBadge } from "../_components/StatusBadge"
import { StatusChanger } from "./_components/StatusChanger"
import { NotesEditor } from "./_components/NotesEditor"
import { SurveyForm } from "./_components/SurveyForm"
import { InstallationForm } from "./_components/InstallationForm"
import { PhotoUpload } from "./_components/PhotoUpload"
import { CleaningScheduleForm } from "./_components/CleaningScheduleForm"
import Link from "next/link"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [customer, allProducts, employees] = await Promise.all([
    getCustomerById(id),
    getProducts(),
    getEmployees(),
  ])
  if (!customer) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-900">
          ← กลับ
        </Link>
        <h1 className="text-xl font-bold">{customer.name}</h1>
        <StatusBadge status={customer.status} />
        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
          {daysLabel(daysInCurrentStatus(customer))}
        </span>
      </div>

      {/* ข้อมูลพื้นฐาน */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">ข้อมูลลูกค้า</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">เบอร์โทร:</span> <span className="font-medium">{customer.phone}</span></div>
          {customer.email && <div><span className="text-gray-500">อีเมล:</span> <span className="font-medium">{customer.email}</span></div>}
          {customer.address && <div className="col-span-2"><span className="text-gray-500">ที่อยู่:</span> <span className="font-medium">{customer.address}</span></div>}
          {customer.source && <div><span className="text-gray-500">แหล่งที่มา:</span> <span className="font-medium">{customer.source}</span></div>}
          <div><span className="text-gray-500">วันที่ติดต่อ:</span> <span className="font-medium">{new Date(customer.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</span></div>
        </div>
      </div>

      {/* เปลี่ยนสถานะ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">เปลี่ยนสถานะ</h2>
        <StatusChanger customerId={customer.id} current={customer.status} />
      </div>

      {/* หมายเหตุ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">หมายเหตุ</h2>
        <NotesEditor customerId={customer.id} initialNotes={customer.notes ?? ""} />
      </div>

      {/* นัดสำรวจหน้างาน */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">นัดสำรวจหน้างาน</h2>
        <SurveyForm customerId={customer.id} initialData={customer.survey} employees={employees} />
      </div>

      {/* นัดติดตั้ง */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">รายละเอียดการติดตั้ง</h2>
        <InstallationForm customerId={customer.id} initialData={customer.installation} allProducts={allProducts} employees={employees} surveyLocation={customer.survey?.location} />
      </div>

      {/* รูปภาพหน้างาน */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">รูปภาพหน้างาน</h2>
        <PhotoUpload customerId={customer.id} type="site" initialPhotos={customer.site_photos ?? []} />
      </div>

      {/* รูปภาพสินค้า */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">รูปภาพสินค้า</h2>
        <PhotoUpload customerId={customer.id} type="product" initialPhotos={customer.product_photos ?? []} />
      </div>

      {/* สลิป / ใบเสร็จ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">สลิป / ใบเสร็จ</h2>
        <PhotoUpload customerId={customer.id} type="payment" initialPhotos={customer.payment_photos ?? []} />
      </div>

      {/* นัดล้างแผง */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">นัดล้างแผง</h2>
        <CleaningScheduleForm customerId={customer.id} schedules={customer.cleaning_schedules} employees={employees} />
      </div>

    </div>
  )
}
