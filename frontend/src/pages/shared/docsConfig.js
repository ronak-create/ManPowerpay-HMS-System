import {
  Shield,
  User,
  Users,
  CalendarDays,
  Briefcase,
  Layers,
  IndianRupee,
  FileCheck,
  ScrollText,
  FileText,
  BadgeCheck,
  Building2,
  Wrench,
  CircleHelp,
  BookOpen,
  UserCircle
} from 'lucide-react';

// Shared
import Introduction from './documentation/Introduction';
import AccessSecurity from './documentation/AccessSecurity';

// Admin
import EmployeeManagement from './documentation/admin/EmployeeManagement';
import AttendanceManagement from './documentation/admin/AttendanceManagement';
import LeaveManagement from './documentation/admin/LeaveManagement';
import SalaryTemplates from './documentation/admin/SalaryTemplates';
import PayrollProcessing from './documentation/admin/PayrollProcessing';
import StatutoryCompliance from './documentation/admin/StatutoryCompliance';
import AppointmentLetters from './documentation/admin/AppointmentLetters';
import ReportsMIS from './documentation/admin/ReportsMIS';
import AuditLogs from './documentation/admin/AuditLogs';
import CompanySettings from './documentation/admin/CompanySettings';
import BestPractices from './documentation/admin/BestPractices';
import TroubleshootingAdmin from './documentation/admin/Troubleshooting';

// Employee
import EmployeePortal from './documentation/sections/EmployeePortal';
import ResignationExit from './documentation/sections/ResignationExit';
import FAQ from './documentation/sections/FAQ';
import Glossary from './documentation/sections/Glossary';
export const adminDocsSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    category: 'Getting Started',
    icon: Shield,
    component: Introduction
  },
  {
    id: 'access-security',
    title: 'Access & Security',
    category: 'Getting Started',
    icon: Shield,
    component: AccessSecurity
  },
  {
    id: 'employee-management',
    title: 'Employee Management',
    category: 'HR Operations',
    icon: Users,
    component: EmployeeManagement
  },
  {
    id: 'attendance',
    title: 'Attendance',
    category: 'HR Operations',
    icon: CalendarDays,
    component: AttendanceManagement
  },
  {
    id: 'leave',
    title: 'Leave Management',
    category: 'HR Operations',
    icon: Briefcase,
    component: LeaveManagement
  },
  {
    id: 'salary-templates',
    title: 'Salary Templates',
    category: 'Payroll',
    icon: Layers,
    component: SalaryTemplates
  },
  {
    id: 'payroll',
    title: 'Payroll',
    category: 'Payroll',
    icon: IndianRupee,
    component: PayrollProcessing
  },
  {
    id: 'compliance',
    title: 'Compliance',
    category: 'Payroll',
    icon: FileCheck,
    component: StatutoryCompliance
  },
  {
    id: 'appointment-letters',
    title: 'Appointment Letters',
    category: 'Documents',
    icon: ScrollText,
    component: AppointmentLetters
  },
  {
    id: 'reports',
    title: 'Reports & MIS',
    category: 'Analytics',
    icon: FileText,
    component: ReportsMIS
  },
  {
    id: 'audit-logs',
    title: 'Audit Logs',
    category: 'Security',
    icon: BadgeCheck,
    component: AuditLogs
  },
  {
    id: 'company-settings',
    title: 'Company Settings',
    category: 'Administration',
    icon: Building2,
    component: CompanySettings
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    category: 'Support',
    icon: Wrench,
    component: TroubleshootingAdmin
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    category: 'Support',
    icon: BookOpen,
    component: BestPractices
  }
];

export const employeeDocsSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    category: 'Getting Started',
    icon: User,
    component: Introduction
  },
  {
    id: 'access-security',
    title: 'Access & Security',
    category: 'Getting Started',
    icon: Shield,
    component: AccessSecurity
  },
  {
    id: 'employee-portal',
    title: 'Employee Portal',
    category: 'My Account',
    icon: UserCircle,
    component: EmployeePortal
  },
  {
    id: 'resignation',
    title: 'Resignation',
    category: 'Employment',
    icon: Briefcase,
    component: ResignationExit
  },
  {
    id: 'faq',
    title: 'FAQ',
    category: 'Support',
    icon: CircleHelp,
    component: FAQ
  },
//   {
//     id: 'troubleshooting',
//     title: 'Troubleshooting',
//     category: 'Support',
//     icon: Wrench,
//     component: TroubleshootingEmployee
//   },
  {
    id: 'glossary',
    title: 'Glossary',
    category: 'Reference',
    icon: BookOpen,
    component: Glossary
  }
];