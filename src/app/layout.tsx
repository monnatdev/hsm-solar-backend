import type { Metadata } from "next"
import { Sarabun } from "next/font/google"
import "./globals.css"

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
})

export const metadata: Metadata = {
  title: "HSM Solar Admin",
  description: "ระบบจัดการลูกค้า HSM Solar",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full`}>
      <body className="font-[family-name:var(--font-sarabun)] min-h-full antialiased">
        {children}
      </body>
    </html>
  )
}
