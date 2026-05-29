import DocSection from "../ui/DocSection";
import FAQAccordion from "../ui/FAQAccordion";
import TipBox from "../ui/TipBox";

export default function FAQ() {
  const faqItems = [
    {
      question: "Why is my payslip not visible?",
      answer:
        "Payslips become available only after payroll has been generated, approved, and finalized. If payroll is still pending, the payslip may not appear yet.",
    },

    {
      question: "Why is payroll generation failing?",
      answer:
        "Payroll generation may fail due to missing attendance, unassigned salary templates, incomplete employee data, inactive employees, or missing statutory configuration.",
    },

    {
      question: "Can employees edit their salary details?",
      answer:
        "No. Salary information is controlled only by administrators and payroll managers.",
    },

    {
      question: "Why am I unable to login?",
      answer:
        "Login issues may happen because of incorrect credentials, inactive employee status, expired password, or temporary system restrictions. Use Forgot Password if required.",
    },

    {
      question: "How do I reset my password?",
      answer:
        "Use the Forgot Password option on the login screen. Enter your registered email, verify OTP, and create a new password.",
    },

    {
      question: "Can employees apply leave through the system?",
      answer:
        "Yes. Employees can submit leave requests through the Employee Portal under Leave Management.",
    },

    {
      question: "Why was my leave request rejected?",
      answer:
        "Leave requests may be rejected due to insufficient leave balance, overlapping leave dates, policy restrictions, or operational requirements.",
    },

    {
      question: "Can approved leave be cancelled?",
      answer:
        "Depending on company policy, approved leave cancellation may require administrator approval.",
    },

    {
      question: "Why is salary different this month?",
      answer:
        "Salary changes may occur due to attendance differences, Leave Without Pay (LWP), bonuses, deductions, overtime, or statutory calculations.",
    },

    {
      question: "What happens if attendance is incorrect?",
      answer:
        "Incorrect attendance may affect payroll calculations. Employees should notify HR immediately before payroll processing.",
    },

    {
      question: "Can attendance be corrected?",
      answer:
        "Yes. Administrators can update attendance records before payroll is finalized.",
    },

    {
      question: "What is Leave Without Pay (LWP)?",
      answer:
        "LWP refers to unpaid leave and may reduce payable salary during payroll generation.",
    },

    {
      question: "Why am I missing from payroll?",
      answer:
        "This may happen due to inactive status, missing salary template assignment, incomplete employee profile, or payroll filter settings.",
    },

    {
      question: "Can payroll be edited after locking?",
      answer:
        "Locked payroll is considered finalized. Administrative correction procedures may be required for changes.",
    },

    {
      question: "Why is appointment letter generation failing?",
      answer:
        "Missing employee details, incomplete salary information, or document template issues may cause generation failures.",
    },

    {
      question: "Can employees download appointment letters?",
      answer:
        "Depending on organization permissions, employees may access appointment documents from their portal.",
    },

    {
      question: "What happens after resignation approval?",
      answer:
        "Employees may retain temporary portal access until their Last Working Date (LWD) or offboarding completion.",
    },

    {
      question: "Can resigned employees still access payslips?",
      answer:
        "In many cases, yes. Temporary access may remain available until exit completion.",
    },

    {
      question: "What reports are available in the system?",
      answer:
        "The system includes attendance reports, payroll summaries, employee master reports, leave reports, statutory reports, and MIS analytics.",
    },

    {
      question: "Who can access audit logs?",
      answer:
        "Audit logs are generally restricted to administrators and authorized personnel only.",
    },
  ];

  return (
    <>
      <DocSection
        title="Frequently Asked Questions"
        description="Quick answers to common questions asked by employees, HR teams, and administrators."
      >
        <FAQAccordion items={faqItems} />

        <TipBox>
          If an issue is not listed here, contact your HR administrator or
          system administrator for assistance.
        </TipBox>
      </DocSection>
    </>
  );
}
