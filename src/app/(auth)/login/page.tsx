import { login } from "@/lib/data/auth"
import { LoginForm } from "./_components/LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">HSM Solar Admin</h1>
        <p className="text-gray-500 text-sm mb-8">เข้าสู่ระบบจัดการลูกค้า</p>
        <LoginForm action={login} />
      </div>
    </div>
  )
}
