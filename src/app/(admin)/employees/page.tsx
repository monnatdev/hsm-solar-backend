import { getEmployees } from "@/lib/data/employees"
import { AddEmployeeButton } from "./_components/AddEmployeeButton"
import { DeleteEmployeeButton } from "./_components/DeleteEmployeeButton"

export default async function EmployeesPage() {
  const employees = await getEmployees()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">พนักงาน</h1>
          <p className="text-sm text-gray-500 mt-0.5">{employees.length} คน</p>
        </div>
        <AddEmployeeButton />
      </div>

      {employees.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">ยังไม่มีข้อมูลพนักงาน</div>
      )}

      <div className="space-y-2">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
              {emp.first_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{emp.first_name} {emp.last_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {emp.position}
                {emp.age ? <span className="mx-1">·</span> : null}
                {emp.age ? <span>อายุ {emp.age} ปี</span> : null}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm text-gray-600">{emp.phone}</p>
            </div>
            <DeleteEmployeeButton id={emp.id} name={`${emp.first_name} ${emp.last_name}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
