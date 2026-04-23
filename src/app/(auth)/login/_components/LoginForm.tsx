"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Props {
  action: (formData: FormData) => Promise<{ error: string } | { success: true } | undefined>
}

export function LoginForm({ action }: Props) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = await action(new FormData(e.currentTarget))
      console.log("login result:", result)
      if (result && "error" in result) {
        setError(result.error)
        setLoading(false)
      } else {
        router.refresh()
        router.push("/customers")
      }
    } catch (err) {
      console.error("login error:", err)
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">อีเมล</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">รหัสผ่าน</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  )
}
