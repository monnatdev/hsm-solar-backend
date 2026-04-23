import type { Employee } from "@/lib/supabase/types"

interface Props {
  employees: Employee[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function EmployeeSelect({ employees, value, onChange, placeholder = "-- เลือกพนักงาน --" }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
    >
      <option value="">{placeholder}</option>
      {employees.map((emp) => (
        <option key={emp.id} value={`${emp.first_name} ${emp.last_name}`}>
          {emp.first_name} {emp.last_name}
          {emp.position ? ` (${emp.position})` : ""}
        </option>
      ))}
    </select>
  )
}
