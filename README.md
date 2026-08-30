# FitCore — Full-Stack Gym Management System

Complete rebuild: React frontend + Supabase backend, from scratch.

## File structure
```
fitcore-full/
├── backend/
│   └── sql/
│       ├── schema.sql        # run 1st — all 11 tables + RLS
│       └── seed.sql          # run 2nd — sample data
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example           # copy to .env, fill in your Supabase keys
    │
    └── src/
        ├── main.jsx
        ├── App.jsx             # all routes
        ├── index.css
        │
        ├── context/
        │   └── AuthContext.jsx
        ├── routes/
        │   └── ProtectedRoute.jsx
        │
        ├── api/                # 13 files — one per feature + shared CRUD
        │   ├── supabaseClient.js
        │   ├── crudFactory.js
        │   ├── authApi.js
        │   ├── memberApi.js
        │   ├── trainerApi.js
        │   ├── membershipApi.js
        │   ├── attendanceApi.js
        │   ├── paymentApi.js
        │   ├── classApi.js
        │   ├── staffApi.js
        │   ├── leadApi.js
        │   ├── reportApi.js
        │   ├── activityApi.js
        │   └── storageApi.js
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   ├── Topbar.jsx
        │   │   └── DashboardLayout.jsx
        │   ├── common/
        │   │   ├── StatCard.jsx
        │   │   ├── StatusBadge.jsx
        │   │   ├── SearchBar.jsx
        │   │   ├── Pagination.jsx
        │   │   └── DataTable.jsx
        │   └── charts/
        │       ├── BarChartCard.jsx
        │       └── DonutChartCard.jsx
        │
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── members/{MembersList,MemberDetail}.jsx
            ├── trainers/{TrainersList,TrainerDetail}.jsx
            ├── memberships/{MembershipsList,MembershipDetail}.jsx
            ├── attendance/Attendance.jsx
            ├── payments/Payments.jsx
            ├── classes/Classes.jsx
            ├── staff/{StaffList,StaffDetail}.jsx
            ├── leads/Leads.jsx
            ├── reports/Reports.jsx
            ├── settings/Settings.jsx
            └── notifications/Notifications.jsx
```

## Setup — step by step

### 1. Create Supabase project
supabase.com → New Project → save the **Project URL** and **anon public key** (Settings → API).

### 2. Run the database
Dashboard → SQL Editor → New Query → paste + run `backend/sql/schema.sql`, then `backend/sql/seed.sql`.

### 3. Create your first login
Dashboard → Authentication → Users → Add user → email + password. This auto-creates your `profiles` row.

### 4. Install frontend
```bash
cd frontend
npm install
cp .env.example .env
# edit .env with your Supabase URL + anon key
npm run dev
```

### 5. Open the app
`http://localhost:5173` → redirects to `/login` → sign in with the user you created in step 3 → lands on `/dashboard`.

## What's real vs what's a starting point
| Module | Status |
|---|---|
| Auth, routing, layout | Fully working |
| Members (list + detail) | Fully working — full CRUD, real DB |
| Trainers (list + detail) | Fully working |
| Memberships (list + detail) | Fully working |
| Attendance | Fully working — check-in/out live |
| Payments | Fully working (read + stats; add a form to create new ones) |
| Classes | Fully working (read + stats; booking logic in `classApi.js` ready to wire to a button) |
| Staff (list + detail) | Fully working |
| Leads | Fully working |
| Reports | Fully working — real aggregated queries |
| Notifications | Fully working — real activity feed |
| Settings | General tab has real fields (not yet saved to DB — add a `gym_settings` table if needed); other tabs are placeholders |

## Still needs your input (can't be scripted)
- Supabase Storage bucket for avatars (Dashboard → Storage → New bucket `avatars`, set Public) — `storageApi.js` is ready once this exists
- "Add Member / Add Trainer / etc." forms — buttons are in place, forms/modals aren't built yet
- Deploy: `npm run build` → deploy `frontend/dist` to Vercel/Netlify (free tier is enough)

## Design system used
- Colors: brand green `#84c22a` (buttons, active states), cream background `#f7f9ef`, white cards, standard status colors (green/yellow/red/gray) — matches your original Stitch design
- All pages follow the same structure: header → stat cards → filterable table — so extending any module means copying an existing page, not inventing a new pattern
