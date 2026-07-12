# ManpowerPay HMS

**Human Resource & Payroll Management System for Manpower Supply Companies**

ManpowerPay HMS is a comprehensive **HR, Payroll, Attendance, and Workforce Management platform** designed specifically for **manpower supply companies, staffing agencies, contractors, and workforce-driven organizations**.

The platform streamlines **employee onboarding, attendance tracking, leave management, payroll automation, statutory compliance, appointment letters, reporting, and employee self-service** through a centralized web-based system.

---

## Features

### HR & Employee Management

* Employee onboarding & profile management
* Employee ID card generation with QR code
* Department & designation management
* Employee document storage
* Bulk employee import

### Attendance Management

* Daily attendance tracking
* Attendance register & reports
* Half-day / Leave Without Pay (LWP) handling
* Attendance correction workflow
* Holiday & week-off support

### Leave Management

* Leave request & approval system
* Paid Leave (PL), Sick Leave (SL), Casual Leave (CL)
* Leave balance tracking
* Admin approval workflow

### Payroll Management

* Automated payroll processing
* Salary templates & reusable salary structures
* Bonus & deduction support
* Attendance-based salary calculation
* Payslip generation & PDF export
* Payroll approval & locking

### Statutory Compliance

* PF (Provident Fund)
* ESIC
* Professional Tax (PT)
* TDS calculations
* Employee-specific statutory overrides

### Appointment Letters & Documents

* Appointment letter generation
* Dynamic document templates
* Employee document download

### Employee Self-Service Portal

Employees can:

* View profile information
* Download payslips
* Apply for leave
* Track attendance
* Submit resignation requests
* Access employment documents

### Reports & MIS

* Attendance reports
* Payroll reports
* Salary register
* Employee master reports
* Compliance reports
* Export to Excel / PDF

### Security & Audit

* JWT authentication
* Role-based access control
* Audit logs for system activity
* Secure password hashing

---

## Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | React 18 + Vite + Tailwind CSS |
| Backend          | Node.js + Express 5            |
| Database         | PostgreSQL + Prisma ORM        |
| Authentication   | JWT + bcrypt                   |
| State Management | React Hooks                    |
| Reports          | ExcelJS                        |
| PDF Generation   | pdfmake                        |

---

## Project Structure

```txt
manpowerpay/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── config/
│   │
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── layouts/
│   │   └── utils/
│
└── README.md
```

---

## Quick Start

### Prerequisites

Ensure the following are installed:

* Node.js **20+**
* PostgreSQL **15+**
* npm

---

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd manpowerpay
```

---

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env
```

Update `.env` with:

* Database credentials
* JWT secret
* SMTP configuration
* Cloud/storage settings (if applicable)

Install dependencies:

```bash
npm install
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

Seed demo data:

```bash
node prisma/seed.js
```

Start backend:

```bash
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## Credentials

There are no hard-coded demo credentials. The seed (`npm run db:seed`) creates the platform admin from the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_MOBILE` env vars. New companies self-register at `/signup`; employees receive one-time temporary passwords when created and must reset on first login.

---

## Environment Variables

Every variable is documented with comments in [`backend/.env.example`](backend/.env.example) — copy it to `backend/.env` and fill it in. Highlights: `DATABASE_URL`/`DIRECT_URL` (Postgres), `JWT_SECRET`, `ENCRYPTION_KEY` (PII encryption at rest), SMTP, and optional `RAZORPAY_*` (billing) and `SUPABASE_*` (file storage) — the optional integrations stay dormant until configured.

---

## Roles & Permissions

### Admin

* Full platform access
* Employee management
* Attendance & payroll management
* Reports & compliance access
* Company settings control

### Supervisor

* Team attendance management
* Employee monitoring
* Limited approvals

### Employee

* Self-service portal access
* Payslips & attendance view
* Leave applications
* Resignation requests

---

## Development Scripts

### Backend

```bash
npm run dev
```

Start development server

```bash
npm run start
```

Start production server

```bash
npx prisma studio
```

Open Prisma Studio

```bash
npm run db:seed:demo   # seed a realistic public demo tenant (Acme Facilities)
npm run prune:audit    # delete audit logs older than AUDIT_LOG_RETENTION_DAYS
npm run lint           # ESLint (flat config)
npm run format         # Prettier --write
npm test               # Vitest unit suite
```

---

### Frontend

```bash
npm run dev
```

Start development server

```bash
npm run build
```

Build for production

```bash
npm run preview
```

Preview production build

---

## Security

ManpowerPay HMS includes:

* JWT Authentication
* Password hashing with bcrypt
* Role-based authorization
* Protected API routes
* Audit logging
* Secure payroll access

---

## Multi-Tenant SaaS

The platform is multi-tenant: one deployment serves many companies with strict per-company data isolation (enforced automatically at the ORM layer).

* Self-serve company signup (`/signup`) with free / starter / growth plans
* Razorpay subscription billing with employee-limit enforcement
* Per-company statutory configuration (EPF/ESIC/PT/TDS rates, ceilings, toggles)
* Per-company branding (logo, accent color) across the app

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full production runbook (Supabase + Render + Vercel + Razorpay). CI runs lint, the backend test suite, and the frontend build on every push (`.github/workflows/ci.yml`).

## Documentation

* [`docs/API.md`](docs/API.md) — REST API reference (auth, tenancy, all endpoints)
* [`DEPLOYMENT.md`](DEPLOYMENT.md) — production runbook + operations (backups, audit pruning)
* [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md) — publishable privacy notice (template)
* [`docs/DPDP_COMPLIANCE.md`](docs/DPDP_COMPLIANCE.md) — DPDP Act 2023 mapping + pre-launch checklist
* [`docs/BACKUP_AND_RETENTION_POLICY.md`](docs/BACKUP_AND_RETENTION_POLICY.md) — backup, recovery & retention policy

## Future Improvements

* Mobile App
* Biometric Attendance Integration
* WhatsApp Notifications
* Bank Salary Transfer Automation
* Advanced Analytics Dashboard

---

## Troubleshooting

### Prisma migration issues

```bash
npx prisma generate
npx prisma migrate reset
```

### Database connection issue

Verify:

* PostgreSQL service is running
* Database credentials are correct
* `.env` file is configured properly

### Port already in use

Change ports inside:

```txt
backend/.env
frontend/vite.config.js
```

---

## License

This project is proprietary software developed for **ManpowerPay HMS**.

Unauthorized copying, modification, or redistribution may be restricted.

---

## Support

For technical issues or support:

```txt
Contact your system administrator
```

---

**Built for workforce-driven organizations to simplify HR & Payroll operations.**
