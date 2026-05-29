import {
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
  BookOpen
} from 'lucide-react';

// Sections
import Introduction from './documentation/sections/Introduction';
import AccessSecurity from './documentation/sections/AccessSecurity';
import EmployeeManagement from './documentation/sections/EmployeeManagement';
import AttendanceManagement from './documentation/sections/AttendanceManagement';
import LeaveManagement from './documentation/sections/LeaveManagement';
import PayrollProcessing from './documentation/sections/PayrollProcessing';
import SalaryTemplates from './documentation/sections/SalaryTemplates';
import StatutoryCompliance from './documentation/sections/StatutoryCompliance';
import AppointmentLetters from './documentation/sections/AppointmentLetters';
import EmployeePortal from './documentation/sections/EmployeePortal';
import ResignationExit from './documentation/sections/ResignationExit';
import ReportsMIS from './documentation/sections/ReportsMIS';
import AuditLogs from './documentation/sections/AuditLogs';
import CompanySettings from './documentation/sections/CompanySettings';
import FAQ from './documentation/sections/FAQ';
import Troubleshooting from './documentation/sections/Troubleshooting';
import BestPractices from './documentation/sections/BestPractices';
import Glossary from './documentation/sections/Glossary';

export const docsSections = [
  {
    id: 'introduction',
    title: 'Introduction',
    category: 'Getting Started',
    icon: HelpCircle,
    component: Introduction
  },

  {
    id: 'access-security',
    title: 'Access & Security',
    category: 'Getting Started',
    icon: Lock,
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
    id: 'attendance-management',
    title: 'Attendance Register',
    category: 'HR Operations',
    icon: ShieldCheck,
    component: AttendanceManagement
  },

  {
    id: 'leave-management',
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
    id: 'payroll-processing',
    title: 'Payroll Processing',
    category: 'Payroll',
    icon: IndianRupee,
    component: PayrollProcessing
  },

  {
    id: 'statutory-compliance',
    title: 'Statutory Compliance',
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
    id: 'employee-portal',
    title: 'Employee Portal',
    category: 'Employee Self Service',
    icon: UserCircle,
    component: EmployeePortal
  },

  {
    id: 'resignation-exit',
    title: 'Resignation & Exit',
    category: 'HR Operations',
    icon: ClipboardList,
    component: ResignationExit
  },

  {
    id: 'reports-mis',
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
    id: 'faq',
    title: 'FAQ',
    category: 'Support',
    icon: CircleHelp,
    component: FAQ
  },

  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    category: 'Support',
    icon: Wrench,
    component: Troubleshooting
  },

  {
    id: 'best-practices',
    title: 'Best Practices',
    category: 'Support',
    icon: BadgeCheck,
    component: BestPractices
  },

  {
    id: 'glossary',
    title: 'Glossary',
    category: 'Reference',
    icon: BookOpen,
    component: Glossary
  }
];
