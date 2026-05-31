import { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  ChevronRight,
  BookOpen,
  Shield,
  User,
  HelpCircle,
  Lock,
  Users,
  ShieldCheck,
  Briefcase,
  IndianRupee,
  Layers,
  FileCheck,
  FileText,
  ClipboardList,
  UserCircle,
  Building2,
  ScrollText,
  CircleHelp,
  Wrench,
  BadgeCheck,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

// ─── Inline Doc UI Components ────────────────────────────────────────────────

function DocSection({ title, description, children }) {
  return (
    <section className="mb-10">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-zinc-500 mt-1.5 text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function DocCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sm:p-6">
      {title && (
        <h3 className="text-base font-semibold text-zinc-900 mb-4">{title}</h3>
      )}
      <div className="text-sm text-zinc-600 leading-7 space-y-3">
        {children}
      </div>
    </div>
  );
}

function StepList({ steps = [] }) {
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5"
        >
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
            {i + 1}
          </div>
          <p className="text-sm text-zinc-700 leading-6">{step}</p>
        </div>
      ))}
    </div>
  );
}

function InfoTable({ headers = [], rows = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-zinc-100 hover:bg-zinc-50/50 transition-colors"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-zinc-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TipBox({ children }) {
  return (
    <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <Lightbulb className="text-emerald-600 shrink-0 mt-0.5" size={16} />
      <div className="text-sm text-emerald-900 leading-6">
        <strong className="font-semibold">Pro Tip: </strong>
        {children}
      </div>
    </div>
  );
}

function WarningBox({ children }) {
  return (
    <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
      <div className="text-sm text-amber-900 leading-6">
        <strong className="font-semibold">Important: </strong>
        {children}
      </div>
    </div>
  );
}

function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
            >
              <h3 className="font-medium text-zinc-900 text-sm pr-4">
                {item.question}
              </h3>
              <ChevronDown
                size={16}
                className={`text-zinc-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 text-sm text-zinc-600 leading-7 border-t border-zinc-100 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Section Content Components ──────────────────────────────────────────────

function IntroAdmin() {
  return (
    <>
      <DocSection
        title="Welcome, Administrator"
        description="Your complete guide to managing ManpowerPay HMS — from onboarding employees to running payroll and generating compliance reports."
      >
        <DocCard title="Platform Overview">
          <p>
            As an Admin, you have full access to all modules: Employee
            Management, Attendance, Payroll, Leave, Reports, Compliance, and
            System Settings.
          </p>
          <p>
            This manual walks you through each feature step by step, with tips
            and warnings to help you avoid common mistakes.
          </p>
          <TipBox>
            Configure Company Settings and create Salary Templates before
            onboarding your first employee — this ensures payroll runs correctly
            from day one.
          </TipBox>
        </DocCard>
      </DocSection>
      <DocSection
        title="Recommended Setup Order"
        description="Follow this sequence when setting up for the first time."
      >
        <StepList
          steps={[
            "Configure Company Settings (name, address, PAN, GSTIN)",
            "Add Sites and Departments",
            "Set Professional Tax slabs for your state",
            "Create Salary Templates for each employee grade",
            "Onboard Employees (manually or via bulk upload)",
            "Assign Salary Templates to employees",
            "Initialize Leave Balances for all active employees",
            "Start marking daily Attendance",
            "Run your first Payroll at month end",
          ]}
        />
      </DocSection>
    </>
  );
}

function IntroEmployee() {
  return (
    <>
      <DocSection
        title="Welcome to Your Employee Portal"
        description="Everything you need to manage your work life — payslips, leaves, profile, and more."
      >
        <DocCard title="What You Can Do Here">
          <InfoTable
            headers={["Feature", "Description"]}
            rows={[
              [
                "Dashboard",
                "View your pay summary, leave balance, and ID card",
              ],
              ["My Payslips", "Download monthly salary slips as PDF"],
              [
                "Leave Application",
                "Apply for CL, PL, SL or check leave history",
              ],
              ["My Profile", "View your work & bank details, change password"],
              ["Resignation", "Submit and track your resignation request"],
              ["Documents", "Download appointment letter, Form 16"],
            ]}
          />
        </DocCard>
        <TipBox>
          Download your payslips monthly and keep them for tax filing, loan
          applications, and financial records.
        </TipBox>
      </DocSection>
      <DocSection
        title="First Time Here?"
        description="Quick orientation to get started."
      >
        <StepList
          steps={[
            "Login with your email and password provided by HR",
            "Change your password immediately from My Profile → Change Password",
            "Check your leave balance on the Dashboard",
            "Explore My Payslips to see your salary history",
            "Update any missing profile details and report discrepancies to HR",
          ]}
        />
      </DocSection>
    </>
  );
}

function EmployeeManagementSection() {
  return (
    <>
      <DocSection
        title="Employee Management"
        description="Add, edit, and manage employee records throughout their lifecycle."
      >
        <DocCard title="Adding an Employee Manually">
          <StepList
            steps={[
              "Go to Employees → Add Employee",
              "Fill in Basic Info (name, email, mobile, emp code, designation, DOJ)",
              "Under Assignment, select Site, Department, Salary Template, and Annual CTC",
              "Fill Personal tab (DOB, gender, address)",
              "Add Statutory details (PAN, Aadhaar, PF, UAN, ESIC numbers)",
              "Set Statutory Overrides if this employee is exempt from PF/ESIC/PT",
              "Add Bank details for salary disbursement",
              "Save the employee",
            ]}
          />
          <WarningBox>
            Payroll cannot be generated for employees without an assigned Salary
            Template.
          </WarningBox>
        </DocCard>
        <DocCard title="Bulk Upload">
          <StepList
            steps={[
              "Click Bulk Upload on the Employees page",
              "Download the Excel template",
              "Fill in required columns: Name, Email, Mobile, Emp Code, Designation, CTC, DOJ",
              "Upload the file — it will show a preview with validation results",
              "Fix any red rows (errors shown on hover)",
              "Select valid rows and click Import",
            ]}
          />
          <TipBox>
            You can edit cells directly in the review table before finalizing
            the import.
          </TipBox>
        </DocCard>
      </DocSection>
      <DocSection title="Employee Status & Lifecycle">
        <InfoTable
          headers={["Status", "Meaning", "Action"]}
          rows={[
            ["Active", "Working employee", "Mark attendance, run payroll"],
            ["Inactive", "Disabled access", "Reactivate via toggle"],
            [
              "Resigned",
              "Resignation submitted",
              "Approve/reject from Resignations module",
            ],
          ]}
        />
      </DocSection>
    </>
  );
}

function AttendanceSection() {
  return (
    <>
      <DocSection
        title="Attendance Register"
        description="Mark and manage daily attendance. Attendance directly drives payroll calculations."
      >
        <DocCard title="Marking Daily Attendance">
          <StepList
            steps={[
              "Go to Attendance",
              "Select the date (cannot exceed today)",
              "Click the status button for each employee: P, A, H, PL, WO, HO",
              "Set OT Hours if applicable (0.5 increments)",
              "Click Save All",
            ]}
          />
          <TipBox>
            Mark attendance daily. Catching up at month-end leads to errors that
            affect payroll.
          </TipBox>
        </DocCard>
        <DocCard title="Status Codes">
          <InfoTable
            headers={["Code", "Meaning", "Payroll Impact"]}
            rows={[
              ["P", "Present", "Full payable day"],
              ["A", "Absent", "May trigger LWP deduction"],
              ["H", "Half Day", "0.5 day deduction"],
              ["PL", "Paid Leave", "No deduction (uses leave balance)"],
              ["WO", "Week Off", "Not counted"],
              ["HO", "Holiday", "Not counted"],
              ["LWP", "Leave Without Pay", "Salary deducted proportionally"],
            ]}
          />
        </DocCard>
        <DocCard title="Bulk Upload">
          <p>
            For large teams, download the attendance template and upload the
            filled Excel file using Bulk Upload.
          </p>
          <WarningBox>
            Attendance is locked once payroll is generated for that month.
            Corrections require a new payroll run.
          </WarningBox>
        </DocCard>
      </DocSection>
    </>
  );
}

function LeaveAdminSection() {
  return (
    <>
      <DocSection
        title="Leave Management (Admin)"
        description="Approve leave requests and set leave balances for employees."
      >
        <DocCard title="Approving / Rejecting Leaves">
          <StepList
            steps={[
              "Go to Leave Management → Pending Approvals",
              "Review the request (leave type, dates, reason)",
              "Click Approve or Reject",
              "Optionally add remarks",
              "Confirm the action",
            ]}
          />
          <WarningBox>
            Approve all leave requests before running payroll — approved
            PL/CL/SL won't cause LWP deductions; unapproved absences may.
          </WarningBox>
        </DocCard>
        <DocCard title="Setting Leave Balances">
          <StepList
            steps={[
              "Go to Leave Management → Balance Allocation",
              "Select an employee",
              "Set CL, PL, SL quotas and the year",
              "Click Save Balance",
              "Use 'Run Bulk Init' to set defaults for all active employees at once",
            ]}
          />
          <TipBox>
            Run Bulk Init at the start of each financial year to reset leave
            balances for all employees.
          </TipBox>
        </DocCard>
      </DocSection>
    </>
  );
}

function SalaryTemplatesSection() {
  return (
    <>
      <DocSection
        title="Salary Templates"
        description="Define reusable salary structures with earnings, deductions, and statutory components."
      >
        <DocCard title="Creating a Template">
          <StepList
            steps={[
              "Go to Salary Templates → New Template",
              "Enter a descriptive name (e.g. 'Standard Staff – PF + ESIC')",
              "Use a preset (Standard, Flat Wage, Contract Staff) or add components manually",
              "For each component, set: Name, Type (Earning/Deduction/Employer Contribution), Basis, Value",
              "Check EPF/ESIC applicable for earning components that count toward PF/ESIC wages",
              "Save the template",
            ]}
          />
        </DocCard>
        <DocCard title="Calculation Basis Reference">
          <InfoTable
            headers={["Basis", "How It Works"]}
            rows={[
              ["Fixed ₹", "Exact monthly amount"],
              ["% of Basic", "Percentage of the Basic component"],
              ["% of Gross", "Percentage of total gross earnings"],
              [
                "State Slab (PT)",
                "Auto-computed from PT slabs in Company Settings",
              ],
              ["TDS Formula", "Auto-computed from projected annual tax"],
              ["OT Formula", "Basic ÷ 26 ÷ 8 × OT hours × multiplier"],
              ["Manual", "Entered at payroll time"],
            ]}
          />
          <TipBox>
            For PT and TDS, set value to 0 — the system ignores it and computes
            automatically.
          </TipBox>
        </DocCard>
      </DocSection>
    </>
  );
}

function PayrollSection() {
  return (
    <>
      <DocSection
        title="Payroll Processing"
        description="Generate, review, approve, and lock monthly payroll."
      >
        <DocCard title="Running Payroll">
          <StepList
            steps={[
              "Verify attendance is complete and leaves are approved",
              "Go to Payroll Run → Click 'Run Payroll Now'",
              "The system generates draft payslips for all active employees",
              "Review the payslip table: working days, present days, LWP, gross, deductions, net pay",
              "Click Approve to move to Approved status",
              "Thoroughly verify salaries — check a few manually",
              "Click Lock Payroll to finalize (irreversible)",
              "Download Bank File (CSV) for salary transfer",
            ]}
          />
          <WarningBox>
            Locked payroll cannot be edited. Always verify before locking. Once
            locked, attendance records for that period are also locked.
          </WarningBox>
        </DocCard>
        <DocCard title="Payroll Status Flow">
          <InfoTable
            headers={["Status", "Meaning", "Next Action"]}
            rows={[
              ["Draft", "Freshly generated, editable", "Review → Approve"],
              ["Approved", "Verified by admin", "Lock → Disburse"],
              ["Locked", "Final, attendance locked", "Download bank file"],
            ]}
          />
        </DocCard>
        <TipBox>
          If a salary looks wrong, check the employee's salary template
          assignment, attendance records, and statutory overrides before
          re-running payroll.
        </TipBox>
      </DocSection>
    </>
  );
}

function CompanySettingsSection() {
  return (
    <>
      <DocSection
        title="Company Settings"
        description="Configure all organization-level settings that drive payroll and documents."
      >
        <DocCard title="Company Profile Tab">
          <p>
            Set your company name, registered address, GSTIN, PAN, EPF code,
            ESIC code, and PT state. This information appears on payslip PDFs
            and appointment letters.
          </p>
          <p>
            Upload your company logo (PNG/JPG, max 2MB) — it prints on payslips.
          </p>
        </DocCard>
        <DocCard title="Payroll Config Tab">
          <InfoTable
            headers={["Setting", "Options", "Recommendation"]}
            rows={[
              [
                "Working Days Base",
                "Fixed 26 or Calendar days",
                "26 for labour-heavy industries",
              ],
              [
                "OT Multiplier",
                "1× to 5×",
                "2× is the legal minimum under Factories Act",
              ],
              [
                "FY Start Month",
                "April, January, July",
                "April for Indian companies",
              ],
              [
                "Payroll Processing Day",
                "1–28",
                "Day you typically run payroll",
              ],
            ]}
          />
        </DocCard>
        <DocCard title="PT Slabs Tab">
          <p>
            Configure Professional Tax slabs for your state. Click{" "}
            <strong>Load Defaults</strong> for Gujarat, Karnataka, or
            Maharashtra pre-fills. Slabs must be contiguous with no gaps; leave
            Max blank for the highest slab.
          </p>
          <WarningBox>
            Incorrect PT slabs will cause wrong deductions for all employees.
            Test with one payroll first.
          </WarningBox>
        </DocCard>
        <DocCard title="Structure Tab">
          <p>
            Add Sites (client locations) and Departments. These are used to
            assign employees and filter payroll/attendance reports by location
            or team.
          </p>
        </DocCard>
      </DocSection>
    </>
  );
}

function ReportsSection() {
  return (
    <>
      <DocSection
        title="Reports & MIS"
        description="Download operational reports for HR, payroll, and compliance."
      >
        <InfoTable
          headers={["Report", "Tab", "Format"]}
          rows={[
            ["Attendance Register", "Attendance", "Excel"],
            ["Payroll Summary", "Payroll", "Excel"],
            ["Headcount / Employee Master", "Headcount", "Excel"],
            ["EPF ECR Export", "Statutory", "Text (in progress)"],
            ["ESIC Monthly Return", "Statutory", "Excel (in progress)"],
            ["Form 16 / Salary Certificate", "Statutory", "PDF"],
            ["Salary Advance Ledger", "Advance Ledger", "Excel"],
          ]}
        />
        <DocCard title="Generating Form 16">
          <StepList
            steps={[
              "Go to Reports → Statutory tab",
              "Select the Financial Year",
              "Click 'Generate All'",
              "The system creates Form 16 summaries for all employees",
              "Employees can then download their own Form 16 from My Profile → Documents",
            ]}
          />
          <TipBox>
            Run Form 16 generation after the financial year ends and all payroll
            for the year is locked.
          </TipBox>
        </DocCard>
      </DocSection>
    </>
  );
}

function ResignationAdminSection() {
  return (
    <>
      <DocSection
        title="Resignation Management"
        description="Review and action employee resignation requests."
      >
        <DocCard title="Approving a Resignation">
          <StepList
            steps={[
              "Go to Resignations",
              "Find the pending request",
              "Review the Last Working Date (LWD) and reason",
              "Click Approve — this sets the employee's leaving date in the system",
              "After LWD passes, download the Acceptance Letter PDF",
              "If LWD has passed, click Purge Data to remove sensitive personal info (cannot be undone)",
            ]}
          />
          <WarningBox>
            Approving a resignation automatically deactivates the employee
            account after the LWD. Ensure final payroll is processed before
            deactivation.
          </WarningBox>
        </DocCard>
        <DocCard title="Data Purge">
          <p>
            After an employee exits, use <strong>Purge Data</strong> to delete
            sensitive PII (PAN, Aadhaar, bank details) while retaining the
            employment record for audit purposes.
          </p>
        </DocCard>
      </DocSection>
    </>
  );
}

function AuditLogsSection() {
  return (
    <>
      <DocSection
        title="Audit Logs"
        description="Track all system actions for accountability and compliance."
      >
        <DocCard title="Using Audit Logs">
          <p>
            Every major action (employee creation, payroll generation, leave
            approval, attendance changes) is recorded with the user, action
            type, entity, and timestamp.
          </p>
          <StepList
            steps={[
              "Go to Audit Logs",
              "Set a date range using From and To filters",
              "Review the list sorted by timestamp",
              "Look up specific actions or users to investigate discrepancies",
            ]}
          />
        </DocCard>
        <InfoTable
          headers={["Use Case", "What to Look For"]}
          rows={[
            ["Who changed attendance?", "Filter by entity = Attendance"],
            ["Payroll modification", "Filter by action = PAYROLL_*"],
            ["Unauthorized login", "Filter by action = LOGIN"],
            ["Employee data edit", "Filter by entity = Employee"],
          ]}
        />
      </DocSection>
    </>
  );
}

// ─── Employee-facing sections ─────────────────────────────────────────────────

function MyPayslipsSection() {
  return (
    <>
      <DocSection
        title="My Payslips"
        description="View, expand, and download your monthly salary slips."
      >
        <DocCard title="Downloading a Payslip">
          <StepList
            steps={[
              "Go to My Payslips",
              "Select the year from the dropdown",
              "Find the month you need",
              "Click the expand arrow (↓) to see earnings and deductions breakdown",
              "Click Download to save the PDF",
            ]}
          />
          <TipBox>
            Keep at least 2 years of payslips saved — you'll need them for home
            loans, visa applications, and income tax filing.
          </TipBox>
        </DocCard>
        <DocCard title="Understanding Your Payslip">
          <InfoTable
            headers={["Section", "What It Shows"]}
            rows={[
              [
                "Present Days",
                "Days counted for salary (present + paid leave)",
              ],
              ["LWP Days", "Unpaid leave days that reduced your salary"],
              ["Earnings", "Basic, HRA, allowances, OT"],
              ["Deductions", "PF, ESIC, PT, TDS, advance recovery"],
              ["Net Pay", "Take-home amount after all deductions"],
            ]}
          />
        </DocCard>
        <WarningBox>
          Payslips are only available after the admin runs and locks payroll for
          that month. If a month is missing, check with HR.
        </WarningBox>
      </DocSection>
    </>
  );
}

function LeaveEmployeeSection() {
  return (
    <>
      <DocSection
        title="Leave Application"
        description="Apply for leave and track your leave history."
      >
        <DocCard title="How to Apply for Leave">
          <StepList
            steps={[
              "Go to Leave Application",
              "Check your balance cards (CL, PL, SL available days)",
              "Click 'Apply for Leave'",
              "Select leave type, from date, to date, and enter a reason",
              "Submit — your request goes to the admin for approval",
            ]}
          />
          <TipBox>
            Apply for leave at least a day in advance whenever possible to give
            HR time to approve before attendance is marked.
          </TipBox>
        </DocCard>
        <DocCard title="Leave Types">
          <InfoTable
            headers={["Type", "Meaning", "Salary Impact"]}
            rows={[
              [
                "CL – Casual Leave",
                "Short personal leave",
                "No deduction (uses balance)",
              ],
              [
                "PL – Privilege Leave",
                "Planned/annual leave",
                "No deduction (uses balance)",
              ],
              [
                "SL – Sick Leave",
                "Medical leave",
                "No deduction (uses balance)",
              ],
              [
                "LWP – Leave Without Pay",
                "When balance is 0",
                "Salary deducted proportionally",
              ],
            ]}
          />
        </DocCard>
        <DocCard title="Cancelling a Leave">
          <p>
            Pending leaves can be cancelled from the Leave History table. Click{" "}
            <strong>Cancel</strong> next to the pending request. Approved leaves
            may require HR to cancel on your behalf.
          </p>
        </DocCard>
      </DocSection>
    </>
  );
}

function MyProfileSection() {
  return (
    <>
      <DocSection
        title="My Profile"
        description="View your employment details, bank info, and change your password."
      >
        <DocCard title="Profile Tabs">
          <InfoTable
            headers={["Tab", "What's Here"]}
            rows={[
              ["Personal Info", "Name, email, mobile, DOB, gender, address"],
              [
                "Work Details",
                "Emp code, designation, department, site, DOJ, PF/ESIC/PAN",
              ],
              ["Bank Info", "Bank name, masked account number, IFSC"],
              [
                "Documents",
                "Appointment letter, Form 16, relieving letter download",
              ],
              ["Change Password", "Set a new password"],
            ]}
          />
        </DocCard>
        <DocCard title="Changing Your Password">
          <StepList
            steps={[
              "Go to My Profile → Change Password tab",
              "Enter your current password",
              "Enter and confirm your new password (minimum 8 characters)",
              "Click Update Password",
            ]}
          />
          <TipBox>
            Use a strong password: mix uppercase, lowercase, numbers, and
            symbols. Never share it with anyone.
          </TipBox>
        </DocCard>
        <DocCard title="Downloading Documents">
          <p>
            Under the <strong>Documents</strong> tab you can download:
          </p>
          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "1.25rem",
              marginTop: "0.5rem",
            }}
          >
            <li>Appointment Letter — your original employment offer</li>
            <li>
              Form 16 — annual tax certificate (available after admin generates
              it)
            </li>
            <li>
              Relieving Letter — available only after your exit is processed
            </li>
          </ul>
        </DocCard>
      </DocSection>
    </>
  );
}

function ResignationEmployeeSection() {
  return (
    <>
      <DocSection
        title="Resignation"
        description="Submit and track your resignation request."
      >
        <DocCard title="Submitting a Resignation">
          <StepList
            steps={[
              "Go to Resignation",
              "Click 'Apply for Resignation'",
              "Select your Last Working Day (must be a future date)",
              "Enter your reason for leaving",
              "Read the notice — your LWD will be set in the system upon approval",
              "Click Submit Resignation",
            ]}
          />
          <WarningBox>
            Once submitted, HR will review your request. Do not submit unless
            you're certain — withdrawing is only possible while status is
            Pending.
          </WarningBox>
        </DocCard>
        <DocCard title="After Approval">
          <p>
            Once approved, your Last Working Date is locked in the system. You
            can:
          </p>
          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "1.25rem",
              marginTop: "0.5rem",
            }}
          >
            <li>
              Download your <strong>Acceptance Letter</strong> PDF from the
              resignation card
            </li>
            <li>Continue using the portal until your LWD</li>
            <li>
              Download payslips and documents before your access is removed
            </li>
          </ul>
        </DocCard>
      </DocSection>
    </>
  );
}

function CommonFAQAdmin() {
  return (
    <DocSection
      title="Frequently Asked Questions"
      description="Common questions from administrators."
    >
      <FAQAccordion
        items={[
          {
            question: "Why did payroll generation fail?",
            answer:
              "Most common causes: (1) An active employee has no salary template assigned, (2) Working days base is misconfigured, (3) A salary component has an invalid formula. Check each employee's Assignment tab and ensure templates are saved correctly.",
          },
          {
            question: "An employee is missing from payroll — why?",
            answer:
              "The employee is likely marked Inactive. Go to Employees, switch the filter to 'All Status', find the employee, and reactivate them. Then re-run payroll.",
          },
          {
            question: "How do I correct attendance after payroll is locked?",
            answer:
              "Locked payroll cannot be directly edited. You'll need to make corrections in the next cycle. For major errors, create a corrective payroll adjustment component in the next run.",
          },
          {
            question: "PT is not deducting — what's wrong?",
            answer:
              "Check: (1) PT slabs are configured in Company Settings → PT Slabs, (2) The salary template includes a 'Professional Tax' component with basis = state_slab, (3) The employee's PT Applicable override isn't set to false.",
          },
          {
            question: "Can I run payroll for a past month?",
            answer:
              "Yes — the system currently defaults to the current month. You can run payroll for any month; check that attendance records exist for that period.",
          },
          {
            question: "How do I give an employee a bonus?",
            answer:
              "Add a 'Bonus' component (type: Earning, basis: Fixed, value: the bonus amount) to their salary template for that month. Remove it after — or create a separate one-time template.",
          },
        ]}
      />
    </DocSection>
  );
}

function CommonFAQEmployee() {
  return (
    <DocSection
      title="Frequently Asked Questions"
      description="Common questions from employees."
    >
      <FAQAccordion
        items={[
          {
            question: "My payslip shows a lower salary than expected — why?",
            answer:
              "Common reasons: LWP (unpaid leave) was applied due to unapproved absences, attendance was incorrectly marked, or a salary advance is being recovered. Check your payslip breakdown and compare LWP days.",
          },
          {
            question: "I can't see my payslip for last month.",
            answer:
              "Payslips are only visible after the admin runs and locks payroll. If the month has passed and you still don't see it, contact HR to confirm payroll was processed.",
          },
          {
            question: "My leave balance shows 0 but I haven't taken leave.",
            answer:
              "Leave balances need to be initialized by your administrator. If you see 0 for all types, contact HR to initialize your leave quota for the current year.",
          },
          {
            question: "How do I reset my password?",
            answer:
              "Click 'Forgot Password' on the login page, enter your registered email, and you'll receive an OTP. Enter the OTP and set a new password. OTPs expire quickly, so act fast.",
          },
          {
            question: "Can I edit my bank details?",
            answer:
              "No — bank details can only be changed by HR/Admin for security reasons. Contact your HR administrator with the correct bank information.",
          },
          {
            question: "When will my Form 16 be available?",
            answer:
              "Form 16 is generated after the financial year ends (April) and must be triggered by your admin. Once generated, it appears under My Profile → Documents.",
          },
        ]}
      />
    </DocSection>
  );
}

// ─── Section Registry ─────────────────────────────────────────────────────────

const ADMIN_SECTIONS = [
  {
    id: "intro",
    title: "Getting Started",
    icon: BookOpen,
    category: "Overview",
    component: IntroAdmin,
  },
  {
    id: "employees",
    title: "Employee Management",
    icon: Users,
    category: "HR Operations",
    component: EmployeeManagementSection,
  },
  {
    id: "attendance",
    title: "Attendance Register",
    icon: ShieldCheck,
    category: "HR Operations",
    component: AttendanceSection,
  },
  {
    id: "leaves",
    title: "Leave Management",
    icon: Briefcase,
    category: "HR Operations",
    component: LeaveAdminSection,
  },
  {
    id: "salary-templates",
    title: "Salary Templates",
    icon: Layers,
    category: "Payroll",
    component: SalaryTemplatesSection,
  },
  {
    id: "payroll",
    title: "Payroll Processing",
    icon: IndianRupee,
    category: "Payroll",
    component: PayrollSection,
  },
  {
    id: "company",
    title: "Company Settings",
    icon: Building2,
    category: "System",
    component: CompanySettingsSection,
  },
  {
    id: "reports",
    title: "Reports & MIS",
    icon: FileText,
    category: "Analytics",
    component: ReportsSection,
  },
  {
    id: "resignations",
    title: "Resignation Management",
    icon: ClipboardList,
    category: "HR Operations",
    component: ResignationAdminSection,
  },
  {
    id: "audit",
    title: "Audit Logs",
    icon: BadgeCheck,
    category: "Security",
    component: AuditLogsSection,
  },
  {
    id: "faq",
    title: "FAQ",
    icon: CircleHelp,
    category: "Support",
    component: CommonFAQAdmin,
  },
];

const EMPLOYEE_SECTIONS = [
  {
    id: "intro",
    title: "Getting Started",
    icon: BookOpen,
    category: "Overview",
    component: IntroEmployee,
  },
  {
    id: "payslips",
    title: "My Payslips",
    icon: IndianRupee,
    category: "Finance",
    component: MyPayslipsSection,
  },
  {
    id: "leaves",
    title: "Leave Application",
    icon: Briefcase,
    category: "HR",
    component: LeaveEmployeeSection,
  },
  {
    id: "profile",
    title: "My Profile",
    icon: UserCircle,
    category: "Account",
    component: MyProfileSection,
  },
  {
    id: "resignation",
    title: "Resignation",
    icon: ScrollText,
    category: "HR",
    component: ResignationEmployeeSection,
  },
  {
    id: "faq",
    title: "FAQ",
    icon: CircleHelp,
    category: "Support",
    component: CommonFAQEmployee,
  },
];

// ─── Main Documentation Component ────────────────────────────────────────────

export default function Documentation() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const allSections = isAdmin ? ADMIN_SECTIONS : EMPLOYEE_SECTIONS;

  const [activeSection, setActiveSection] = useState(allSections[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handler = (e) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return allSections;
    const q = searchQuery.toLowerCase();
    return allSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q),
    );
  }, [searchQuery, allSections]);

  const currentSection =
    allSections.find((s) => s.id === activeSection) || allSections[0];
  const ActiveComponent = currentSection?.component;

  // Group sections by category
  const grouped = useMemo(() => {
    const map = {};
    filteredSections.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, [filteredSections]);

  const handleNav = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    if (mainRef.current)
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="flex h-full relative"
      style={{ minHeight: "calc(100vh - 3.5rem)" }}
    >
      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className={`
    fixed top-0 left-0 h-full z-50 flex flex-col
    lg:sticky lg:top-4 lg:h-[calc(100vh-7.5rem)] lg:z-auto
    w-64 bg-white border border-zinc-200 rounded-2xl
    transition-transform duration-300 ease-out
    ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
  `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isAdmin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
            >
              {isAdmin ? <Shield size={14} /> : <User size={14} />}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 leading-tight">
                {isAdmin ? "Admin Manual" : "Employee Guide"}
              </p>
              <p className="text-[10px] text-zinc-400 leading-tight">
                ManpowerPay HMS
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-7 h-7 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 shrink-0 border-b border-zinc-100">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={13}
            />
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 placeholder-zinc-400 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {Object.entries(grouped).length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-6">
              No results found
            </p>
          ) : (
            Object.entries(grouped).map(([category, sections]) => (
              <div key={category} className="mb-4">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-1.5">
                  {category}
                </p>
                {sections.map(({ id, title, icon: Icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleNav(id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all mb-0.5 ${
                        isActive
                          ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                      }`}
                    >
                      <Icon
                        size={14}
                        className={
                          isActive ? "text-amber-600" : "text-zinc-400"
                        }
                      />
                      <span className="text-xs font-medium truncate">
                        {title}
                      </span>
                      {isActive && (
                        <ChevronRight
                          size={12}
                          className="text-amber-500 ml-auto shrink-0"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </nav>

        {/* Bottom badge */}
        <div className="px-3 pb-4 shrink-0">
          <div
            className={`rounded-xl p-3 text-white text-xs ${isAdmin ? "bg-gradient-to-br from-amber-700 to-amber-600" : "bg-gradient-to-br from-zinc-800 to-zinc-700"}`}
          >
            <p className="font-bold mb-0.5">
              {isAdmin ? "Admin Access" : "Employee Portal"}
            </p>
            <p className="text-white/60 text-[10px] leading-relaxed">
              Viewing role-specific documentation for your account.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div
        ref={mainRef}
        className="flex-1 min-w-0 flex flex-col overflow-y-auto"
      >
        {/* Mobile topbar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200 px-4 py-3 flex items-center justify-between lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition text-zinc-700"
          >
            <BookOpen size={14} />
            <span className="text-xs font-medium">Contents</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {currentSection?.icon && (
              <currentSection.icon
                size={14}
                className="text-amber-600 shrink-0"
              />
            )}
            <span className="text-xs font-semibold text-zinc-800 truncate">
              {currentSection?.title}
            </span>
          </div>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* Content area */}
        <div className="flex-1 px-4 sm:px-8 py-6 max-w-4xl mx-auto w-full">
          {/* Page header */}
          <div className="mb-8 pb-6 border-b border-zinc-100">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isAdmin ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}
              >
                {currentSection?.icon && <currentSection.icon size={22} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${isAdmin ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {currentSection?.category}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                  {currentSection?.title}
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  {isAdmin ? "Admin Manual" : "Employee Guide"} · ManpowerPay
                  HMS
                </p>
              </div>
            </div>
          </div>

          {/* Section component */}
          <div className="space-y-6">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
                <p className="text-zinc-500">
                  Section not found. Please select a topic from the sidebar.
                </p>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-between gap-4">
            {(() => {
              const idx = allSections.findIndex((s) => s.id === activeSection);
              const prev = idx > 0 ? allSections[idx - 1] : null;
              const next =
                idx < allSections.length - 1 ? allSections[idx + 1] : null;
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => handleNav(prev.id)}
                      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-700 transition group"
                    >
                      <ChevronRight
                        size={16}
                        className="rotate-180 group-hover:-translate-x-0.5 transition-transform"
                      />
                      <span className="text-xs">
                        <span className="text-zinc-400">Previous: </span>
                        {prev.title}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}
                  {next ? (
                    <button
                      onClick={() => handleNav(next.id)}
                      className="flex items-center gap-2 text-sm text-zinc-500 hover:text-amber-700 transition group"
                    >
                      <span className="text-xs">
                        <span className="text-zinc-400">Next: </span>
                        {next.title}
                      </span>
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  ) : (
                    <div />
                  )}
                </>
              );
            })()}
          </div>

          <p className="mt-8 text-[10px] text-zinc-300 text-center pb-4">
            © 2026 ManpowerPay HMS · Confidential & Organization-specific
          </p>
        </div>
      </div>
    </div>
  );
}
