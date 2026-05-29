import { useState } from 'react';
import { 
  ChevronRight, Search, 
  User, ShieldCheck, IndianRupee, 
  Briefcase, FileText, Settings, 
  HelpCircle, ExternalLink, Lock,
  Users, Layers, FileCheck, ClipboardList,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';

const DOCS_CONTENT = {
  intro: {
    title: 'Introduction',
    icon: HelpCircle,
    sections: [
      {
        title: 'Platform Overview',
        content: 'ManpowerPay HMS is a full-featured Human Resource Management and Payroll solution. It is designed to handle the complete employee lifecycle: from the moment they are hired and onboarded, through daily attendance and leave management, to monthly payroll processing, statutory compliance, and final exit procedures.'
      },
      {
        title: 'System Scope',
        content: 'This manual is intended for both Administrators (who configure and manage organizational data) and Employees (who manage their personal profiles, attendance, leaves, and documents). The platform is built with a focus on auditability, compliance, and user self-service.'
      }
    ]
  },
  auth: {
    title: 'Access & Security',
    icon: Lock,
    sections: [
      {
        title: 'Logging In',
        content: 'Access the HMS portal using your official corporate email and assigned password. The platform utilizes secure token-based authentication (JWT) to ensure that your session remains protected while you navigate between modules.'
      },
      {
        title: 'Password Recovery',
        content: 'If you have forgotten your password, click the "Forgot Password" link on the login screen. Enter your registered email address to receive a 6-digit One-Time Password (OTP). Use this OTP to verify your identity and set a new password of at least 8 characters. For your security, OTPs expire after 10 minutes and can only be used once.'
      },
      {
        title: 'Role-Based Access Control',
        content: 'The platform strictly separates roles. Administrators have access to organizational settings, payroll generation, audit logs, and employee management. Employees have access only to their own profile, payslips, leave applications, and resignation workflows.'
      }
    ]
  },
  employees: {
    title: 'Employee Management',
    icon: Users,
    sections: [
      {
        title: 'Manual Onboarding (Admin)',
        content: 'To add an employee manually, navigate to "Employees" -> "Add Employee". You will need to provide basic personal info, employment details (Department, Site, Designation), and salary template mapping. The system creates both a User account (for login) and an Employee profile (for HR records) simultaneously.'
      },
      {
        title: 'Bulk Onboarding Workflow',
        content: 'For larger teams, use the Bulk Upload tool. 1. Download the template from the system. 2. Fill in all columns (mandatory: Name, Emp Code, Email, Mobile, Designation, DOJ, CTC). 3. Upload the file. 4. Review the staged list: the system validates uniqueness of Email/Mobile/EmpCode and attempts to match Departments/Sites. If a Department or Site does not exist, the system will automatically create it during the final import. 5. Click Import to finalize the creation of all selected employees.'
      },
      {
        title: 'Digital ID Cards',
        content: 'Employees can access their Digital ID card through their profile. It displays key information, including a QR code for quick identity verification by security or HR staff.'
      }
    ]
  },
  attendance: {
    title: 'Attendance Register',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Marking Daily Attendance',
        content: 'Admins can manage attendance under "Attendance Entry". The system supports manual entry or bulk uploads via Excel. Accuracy is vital because attendance data is directly queried by the payroll engine to calculate payable days.'
      },
      {
        title: 'Attendance Status Codes',
        content: 'Use the following codes: P (Present), A (Absent), H (Half Day), PL (Paid Leave), WO (Week Off), HO (Holiday), LWP (Leave Without Pay). LWP status in attendance will automatically trigger a reduction in the "Basic" salary component during the payroll run.'
      }
    ]
  },
  leaves: {
    title: 'Leave & Resignation',
    icon: Briefcase,
    sections: [
      {
        title: 'Applying for Leave (Employee)',
        content: 'Use the "Leave Application" page. Select the Leave Type and specify the From/To date range. The system calculates the total working days automatically (subtracting Sundays/Holidays) and prevents application if the leave balance is insufficient.'
      },
      {
        title: 'Approval Workflow (Admin)',
        content: 'Pending requests arrive in the "Leave Management" module. Admins can view the request, check the employee’s leave history, and approve or reject it. Remarks added during rejection are sent as a notification to the employee.'
      },
      {
        title: 'Leave Balance Management',
        content: 'Admins must initialize leave balances for employees annually. This is done via the leave balance initialization feature, setting quotas for CL, PL, and SL.'
      }
    ]
  },
  payroll: {
    title: 'Payroll Processing',
    icon: IndianRupee,
    sections: [
      {
        title: 'Template-Driven Payroll',
        content: 'Payroll is based on Salary Templates. A template contains defined components (Earnings like Basic/HRA, Deductions like PF/ESIC). When running payroll, the system maps the template to the specific employee, applies attendance factors, deducts LWP, and computes statutory contributions.'
      },
      {
        title: 'Payroll Lifecycle',
        content: '1. Create Draft: System compiles attendance and salary data. 2. Approve: Admins review the generated figures. 3. Lock: The final action. This generates permanent payslips, notifies employees, and updates balances.'
      },
      {
        title: 'Payslips & Disbursements',
        content: 'Employees download payslips from their portal. Admins generate a bank-ready CSV file from the "Payroll Run" details page, which contains all necessary bank account details and net payable amounts for salary disbursement.'
      }
    ]
  },
  statutory: {
    title: 'Statutory Compliance',
    icon: FileCheck,
    sections: [
      {
        title: 'EPF, ESIC, PT, TDS',
        content: 'The platform automates statutory calculations based on current regulations. EPF (12% of Basic, capped at ₹15k), ESIC (0.75% of Gross, if Gross <= ₹21k), and PT (based on state-specific slabs defined in Company Settings) are handled automatically during payroll runs.'
      },
      {
        title: 'Employee Overrides',
        content: 'In specific cases, you may need to override statutory rules for an employee. Use the "Statutory Overrides" tab in the Employee Form to toggle EPF/ESIC/PT applicability or to define a specific "Projected Annual Tax" (TDS) for that individual, bypassing system-wide defaults.'
      }
    ]
  },
  resignation: {
    title: 'Resignation & Exit',
    icon: ClipboardList,
    sections: [
      {
        title: 'Exit Workflow',
        content: 'Employees submit a resignation request, stating their intended Last Working Day (LWD). Admins review and approve this. Upon approval, the "Date of Leaving" is set.'
      },
      {
        title: 'Access & Offboarding',
        content: 'We prioritize employee convenience: "Approved" resignations DO NOT deactivate the user immediately. Employees retain access to download past payslips, resignation letters, and other documents until the end of their LWD.'
      },
      {
        title: 'Automated Deactivation',
        content: 'Once the LWD has passed, the system automatically marks the employee as inactive, revoking all portal access.'
      },
      {
        title: 'Data Purge',
        content: 'Admins have a secure option to purge sensitive data (bank account, PAN, Aadhaar) for offboarded employees. This complies with privacy regulations while keeping a minimal record for mandatory financial audit trails.'
      }
    ]
  },
  reports: {
    title: 'Reports & MIS',
    icon: FileText,
    sections: [
      {
        title: 'Standard Reports',
        content: 'Access various reports under "Reports & MIS", including Attendance Register, Monthly Payroll Summary, and Employee Headcount Master. These can be exported to Excel for external reporting.'
      },
      {
        title: 'Financial Audit',
        content: 'The platform provides a Salary Advance Ledger to track loan status and Form 16 generators to assist employees with income tax filings at the end of the financial year.'
      }
    ]
  }
};

export default function Documentation() {
  const [activeTopic, setActiveTopic] = useState('intro');
  const [search, setSearch] = useState('');

  const filteredTopics = Object.entries(DOCS_CONTENT).filter(([key, topic]) => 
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    topic.sections.some(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Sidebar Navigation */}
      <div className="lg:w-72 space-y-6 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search documentation..."
            className="input-base pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">Manual Sections</p>
          {filteredTopics.map(([key, topic]) => (
            <button
              key={key}
              onClick={() => setActiveTopic(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTopic === key 
                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/50 shadow-sm' 
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <topic.icon size={18} className={activeTopic === key ? 'text-amber-600' : 'text-zinc-400'} />
              <span className="flex-1 text-left">{topic.title}</span>
              {activeTopic === key && <ChevronRight size={14} className="text-amber-400" />}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-zinc-900 rounded-2xl text-white shadow-xl shadow-zinc-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-amber-400" />
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Helpdesk</p>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">Questions regarding policy or technical errors? Contact your HR administrator.</p>
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors">
            Contact Support
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              {(() => {
                const Icon = DOCS_CONTENT[activeTopic]?.icon || HelpCircle;
                return <Icon size={24} />;
              })()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{DOCS_CONTENT[activeTopic]?.title}</h1>
              <p className="text-zinc-500 text-sm">Official User Manual • ManpowerPay HMS v1.0</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {DOCS_CONTENT[activeTopic]?.sections.map((section, idx) => (
            <div key={idx} className="animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <h2 className="text-lg font-bold text-zinc-800 mb-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                {section.title}
              </h2>
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-card p-6 border-l-4 border-l-amber-500/30">
                <p className="text-zinc-600 leading-relaxed text-sm">{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© 2026 ManpowerPay HMS. Confidential & Organization-specific.</p>
        </div>
      </div>
    </div>
  );
}
