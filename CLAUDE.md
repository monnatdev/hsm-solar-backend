# HSM Solar — Admin Backend

## Business Context

**ระบบ:** Admin Dashboard สำหรับจัดการงานติดตั้งโซลาร์เซลล์ของ HSM Energy
**ใช้งานภายใน:** พนักงานและเจ้าของธุรกิจเท่านั้น ไม่ได้เปิดสาธารณะ
**เป้าหมาย:** ติดตาม pipeline ลูกค้า ตั้งแต่ติดต่อครั้งแรกจนถึงติดตั้งเสร็จและล้างแผง

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 + React 19 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| UI | shadcn/ui (base-nova) + Tailwind CSS v4 |
| Icons | Lucide React |
| Font | Sarabun (ภาษาไทย) |
| Address | thai-address-database |
| Deployment | (TBD) |

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/              # หน้า login
│   ├── (admin)/                # Protected routes ทั้งหมด
│   │   ├── layout.tsx          # Admin layout + Sidebar
│   │   ├── customers/
│   │   │   ├── page.tsx        # รายชื่อลูกค้า (list + filter + search)
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # รายละเอียดลูกค้า
│   │   │       └── _components/ # SurveyForm, InstallationForm, CleaningForm
│   │   ├── products/           # จัดการสินค้า
│   │   ├── employees/          # จัดการพนักงาน
│   │   └── quotes/             # (TODO: ใบเสนอราคา)
│   └── globals.css
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client (RSC + Server Actions)
│   │   └── types.ts            # Types ทั้งหมด — Customer, Employee, Product ฯลฯ
│   ├── data/                   # Server Actions (API layer)
│   │   ├── customers.ts        # CRUD + status management
│   │   ├── employees.ts        # CRUD
│   │   ├── products.ts         # CRUD + filter
│   │   └── auth.ts             # login/logout
│   └── utils/
│       ├── status.ts           # STATUS_LABELS, STATUS_COLORS
│       └── utils.ts            # cn() และ utils ทั่วไป
├── components/
│   ├── ui/                     # shadcn/ui components + custom
│   │   ├── ThaiAddressInput.tsx
│   │   ├── EmployeeSelect.tsx
│   │   └── EmployeeMultiSelect.tsx
│   └── layout/
│       └── Sidebar.tsx
└── middleware.ts               # Auth guard ทุก route
```

## Customer Workflow (11 สถานะ)

```
new → talking → need_quote → quoted → survey_scheduled → surveyed
→ install_scheduled → installed → cleaning_scheduled → cleaning_done → closed
```

| สถานะ | ความหมาย |
|---|---|
| `new` | ลูกค้าใหม่ เพิ่งติดต่อเข้ามา |
| `talking` | กำลังพูดคุย |
| `need_quote` | ต้องการใบเสนอราคา |
| `quoted` | ส่งใบเสนอราคาแล้ว |
| `survey_scheduled` | นัดสำรวจหน้างานแล้ว |
| `surveyed` | สำรวจหน้างานแล้ว |
| `install_scheduled` | นัดติดตั้งแล้ว |
| `installed` | ติดตั้งเสร็จแล้ว |
| `cleaning_scheduled` | นัดล้างแผงแล้ว |
| `cleaning_done` | ล้างแผงเสร็จแล้ว |
| `closed` | ปิดงาน |

## Database (Supabase)

### Tables
- `customers` — ข้อมูลลูกค้าทั้งหมด (JSONB fields: survey, installation, panel_cleanings)
- `employees` — ข้อมูลพนักงาน
- `products` — catalog สินค้า

### Key Types (src/lib/supabase/types.ts)
- `Customer` — type หลัก ครอบคลุมทุก field
- `CustomerStatus` — union type ของ 11 สถานะ
- `Survey`, `Installation`, `PanelCleaning` — nested objects ใน customer
- `Product`, `Employee` — standalone types
- `ThaiLocation` — address, subdistrict, district, province, postal_code

### Pattern การเรียก Supabase
```ts
// Server Component / Server Action
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()

// Client Component (เท่าที่จำเป็น)
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
```

## Coding Conventions

- TypeScript strict — ห้าม `any` (ยกเว้น Supabase JSON query workaround)
- Server Components by default — `"use client"` เฉพาะเมื่อต้องการ interactivity
- Server Actions ต้องขึ้นต้นด้วย `"use server"` และ `revalidatePath` หลัง mutation
- ห้าม query Supabase ตรงใน component — ใช้ผ่าน functions ใน `src/lib/data/` เสมอ
- Page-scoped components ให้วางใน `_components/` ของ route นั้น
- ใช้ `cn()` จาก `@/lib/utils/utils` สำหรับ className merging
- ภาษาไทยทุก UI label

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

หมายเหตุ: ANON key เป็น public ได้ เพราะ Supabase RLS enforce access control ที่ database level

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint check
```

## Features ที่ยังค้างอยู่ (TODO)

### Short-term
- [ ] **Photo Upload** — เชื่อม Supabase Storage สำหรับรูปหน้างาน/สินค้า/slip
- [ ] **Form Validation** — เพิ่ม zod schema validation
- [ ] **Tests** — ยังไม่มีเลย (Vitest + Playwright)
- [ ] **Error Handling** — Error boundaries + toast notifications
- [ ] **Loading States** — Skeleton/spinner ระหว่าง Server Action

### Future Features
- [ ] **Quotes (ใบเสนอราคา)** — สร้าง/แก้ไข/ส่งใบเสนอราคาให้ลูกค้า, export PDF, เชื่อมกับ status workflow
- [ ] **Expenses (เบิกจ่าย)** — บันทึกค่าใช้จ่ายในบริษัท, แยกตามโปรเจกต์/ลูกค้า, สรุปรายเดือน

---

## Image Management Strategy

ระบบนี้มีรูปจำนวนมาก (หน้างาน, สินค้า, slip) — ต้องจัดการให้ประหยัดทรัพยากร

### หลักการ: Compress ก่อน Upload เสมอ

ห้าม upload รูปต้นฉบับจากกล้องมือถือโดยตรง (อาจใหญ่ถึง 5-10MB/รูป)
ใช้ `browser-image-compression` compress ฝั่ง client ก่อน upload ทุกครั้ง

```ts
import imageCompression from "browser-image-compression"

const options = {
  maxSizeMB: 0.5,        // ไม่เกิน 500KB/รูป
  maxWidthOrHeight: 1280, // resize ให้ไม่เกิน 1280px
  useWebWorker: true,    // ไม่บล็อก UI
  fileType: "image/webp", // WebP ขนาดเล็กกว่า JPEG ~30%
}

const compressed = await imageCompression(file, options)
```

### Storage Structure (Supabase)

```
supabase-storage/
└── hsm-solar/
    ├── customers/{customerId}/site/       # รูปหน้างาน
    ├── customers/{customerId}/products/   # รูปสินค้า
    ├── customers/{customerId}/payments/   # slip ชำระเงิน
    └── customers/{customerId}/cleaning/   # รูปล้างแผง
```

### Display: ใช้ next/image เสมอ

```tsx
// ✅ ถูก — lazy load + optimize อัตโนมัติ
<Image src={url} alt="..." width={400} height={300} sizes="(max-width: 768px) 100vw, 400px" />

// ❌ ผิด — ไม่ผ่าน Next.js image optimization
<img src={url} />
```

### กฎที่ต้องทำตาม

| กฎ | เหตุผล |
|---|---|
| Compress ทุกรูปก่อน upload | ลด Supabase Storage cost |
| WebP format | ขนาดเล็กกว่า JPEG ~30% |
| Max 1280px, max 500KB | เพียงพอสำหรับ admin view |
| `next/image` ทุกรูป | lazy load + browser cache |
| เก็บแค่ path ใน DB ไม่ใช่ base64 | ป้องกัน DB ใหญ่เกิน |

---

## Agent Roles

### 🔍 Code Reviewer
ตรวจก่อน commit:
- Server Actions มี `revalidatePath` หลัง mutation ไหม?
- ไม่มี Supabase query ตรงใน component — ต้องผ่าน `src/lib/data/` เสมอ
- ไม่มี `any` โดยไม่มีเหตุผล
- `"use server"` / `"use client"` ถูก boundary ไหม?

### 🔒 Security Auditor
- RLS policy ครอบคลุม table ที่แก้ไหม?
- ไม่มี secret ใน `NEXT_PUBLIC_` prefix
- Server Actions validate input ก่อน query ไหม?
- Middleware protect ทุก admin route ไหม?

### 🎨 QA Agent
- ใช้ shadcn/ui components ก่อนสร้างเอง
- ภาษาไทยทุก label, placeholder, error message
- Responsive: ทดสอบ mobile (375px) ก่อนเสมอ
- Status badge ใช้ `STATUS_COLORS` จาก types.ts เสมอ

### 🧪 Tester Agent
- Unit: functions ใน `src/lib/data/` (mock Supabase client)
- E2E (Playwright): login, สร้างลูกค้า, เปลี่ยน status, เพิ่มสินค้า

### 🗂️ Secretary Agent
- "เพิ่ม feature" → Code Reviewer + QA + Tester
- "ตรวจ security" → Security Auditor
- สรุปผลงานลงไฟล์ `~/.claude/projects/-Users-monnatphanchaipol/memory/session-logs/YYYY-MM-DD.md` ทุกครั้งหลังทำงานเสร็จ
  - format: วันที่, โปรเจกต์, สิ่งที่ทำ, สิ่งที่เรียนรู้, next steps
