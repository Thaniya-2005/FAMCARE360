# FamCare360 - Family Health & Wellness Platform

Comprehensive enterprise-ready family health monitoring application featuring real-time health dashboards, vital signs tracking, daily routine planning, medication adherence, appointment scheduling, and emergency SOS alerts.

Built with:
- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Radix UI (shadcn/ui)
- **Backend & Database:** Supabase (PostgreSQL with Row Level Security, Auth, Realtime, Triggers)
- **State & Networking:** TanStack Query v5, React Context API, React Router v6

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 22 LTS)
- npm or pnpm

### 2. Environment Configuration
Create a `.env` file in the project root:
```env
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_URL="https://your_supabase_project_id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_anon_key"
```

### 3. Database Migration
Run the consolidated SQL migration located at `supabase/migrations/20261118000000_famcare360_full_schema.sql` in your Supabase SQL Editor. This sets up all 11 tables with RLS policies, helper functions, and triggers:
- `profiles`
- `families`
- `family_members`
- `children`
- `health_reports`
- `vital_signs`
- `meals`
- `exercises`
- `medications`
- `appointments`
- `sos_alerts`
- `notifications`

### 4. Development & Build Commands

```bash
npm install        # Install project dependencies
npm run dev        # Start development server on port 8080 (http://localhost:8080)
npm run lint       # Run ESLint validation
npm run build      # Build optimized production bundle to dist/
npm run test       # Run Vitest unit tests
```

---

## Architectural Highlights

- **Role-Aware Security:** Client and database routes enforce granular RBAC separating `parent` and `child` views.
- **Family Pairing:** Children sign up and connect using their parent's Family Invite Code (`FC-XXXXXX`).
- **Resilient Offline-First Data Layer:** `healthService` persists to Supabase and seamlessly caches to `localStorage` if network connectivity or backend tables are unavailable.
- **Emergency SOS:** Real-time alert dispatch to the family dashboard with clear SMS carrier disclosure if SMS gateways are unconfigured.
- **100% UI/UX Preservation:** All design tokens, animations, color palettes, and component structures are strictly preserved.
