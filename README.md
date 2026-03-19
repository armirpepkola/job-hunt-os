# Job Hunt OS

**A high-performance, AI-powered Kanban application for tracking the engineering job search lifecycle.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-orange?logo=playwright)](https://playwright.dev/)

🔗 **[Live Production Demo](https://jobhuntos.vercel.app/)**

<br />
<div align="center">
  <img src="./assets/demo.gif" alt="Job Hunt OS Demonstration" width="100%" style="border-radius: 8px;" />
</div>
<br />

---

## The Architecture

Job Hunt OS is not a standard CRUD application. It is engineered to handle complex state management, heavy document parsing, and seamless AI integration while maintaining an elite Lighthouse performance score.

### Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS.
- **State Management:** TanStack Query for optimistic UI updates during drag-and-drop operations.
- **Backend:** Serverless Next.js Server Actions.
- **Database & Auth:** Supabase (PostgreSQL) integrated via Drizzle ORM.
- **Storage:** Supabase Storage (RLS secured) for resumes, cover letters, and PDFs.
- **AI Engine:** Google Gemini (2.5 Flash) strictly typed with Zod via Vercel AI SDK.

---

## Key Engineering Decisions

### 1. Client-Side PDF Streaming over Server-Side Execution

Initially, PDF extraction was handled on the server via Node.js libraries. However, to eliminate bundle bloat and Vercel serverless timeout limits, the architecture was pivoted.
**The Solution:** The app dynamically imports `pdfjs-dist` to extract raw text entirely in the client's browser. Only the sanitized string payload is sent to the Gemini AI via Server Actions, resulting in faster parsing and zero server-side binary processing.

### 2. T-Shaped Quality Assurance Strategy

Rather than aiming for arbitrary 100% test coverage with brittle mocks, this repository employs a T-Shaped testing strategy optimized for ROI:

- **Narrow & Deep (Vitest):** Unit tests specifically target the core TypeScript `Zod` schemas, mathematically proving the API data layer is impenetrable.
- **Broad & Shallow (Playwright):** A robust End-to-End "Critical User Journey" test logs into a dedicated test account, executes a complex form submission, and verifies the full-stack loop (UI -> Server Action -> Drizzle ORM -> Supabase -> React UI Revalidation).

### 3. Optimistic UI Mutations

To ensure the Kanban board feels like a native desktop application, all drag-and-drop interactions utilize TanStack Query's `onMutate` lifecycle. When a user drags a card, the UI updates instantly in the cache, syncing with the Supabase database in the background and rolling back automatically if the network fails.

---

## Testing Protocol

This project utilizes both Unit and E2E testing.

```bash
# Run pure business-logic validation tests (Zod schemas)
pnpm test

# Run the End-to-End Critical User Journey (Requires local dev server running)
pnpm exec playwright test --ui
```

---

## Local Development Setup

**1. Clone the repository**

```bash
git clone [https://github.com/your-username/job-hunt-os.git](https://github.com/your-username/job-hunt-os.git)
cd job-hunt-os
pnpm install
```

**2. Configure Environment Variables**
Create a `.env.local` file in the root directory and add the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# For E2E Testing Only
PLAYWRIGHT_TEST_EMAIL=your_test_user_email
PLAYWRIGHT_TEST_PASSWORD=your_test_user_password
```

**3. Initialize Database & Run**

```bash
pnpm db:push
pnpm dev
```
