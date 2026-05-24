# ManpowerPay HMS

Human Resource & Payroll Management System for Manpower Supply Companies.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm

### Setup

```bash
# Clone / copy project
cd manpowerpay

# Backend
cd backend
cp .env.example .env   # edit with your DB and SMTP credentials
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev            # API on http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # App on http://localhost:5173
```

### Default Credentials
| Role | Email | Password |
|---|---|---|
| Admin | admin@manpowerpay.com | Admin@1234 |
| Supervisor | (created by Admin) | Supervisor@1234 |
| Employee | (created by Admin) | Welcome@1234 |

## Tech Stack
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express 5
- Database: PostgreSQL 15 + Prisma ORM
- Auth: JWT + bcrypt
- PDF: pdfmake
- Reports: ExcelJS
