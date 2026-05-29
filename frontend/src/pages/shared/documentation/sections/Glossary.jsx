
import DocSection from '../ui/DocSection';
import DocCard from '../ui/DocCard';
import InfoTable from '../ui/InfoTable';
import TipBox from '../ui/TipBox';

export default function Glossary() {
  return (
    <>
      <DocSection
        title="Glossary"
        description="Definitions of commonly used HR, payroll, attendance, and compliance terms used throughout ManPowerPay HMS."
      >
        <DocCard title="Why This Matters">
          <p>
            HR and payroll systems often contain
            technical terms that may be unfamiliar
            to employees or new administrators.
          </p>

          <p>
            This glossary explains commonly used
            terminology to help users better
            understand platform workflows and
            payroll operations.
          </p>

          <TipBox>
            Refer to this section whenever you
            encounter unfamiliar HR or payroll terms.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Payroll Terms"
        description="Common salary and payroll terminology."
      >
        <InfoTable
          headers={[
            'Term',
            'Meaning'
          ]}
          rows={[
            [
              'Gross Salary',
              'Total salary before deductions.'
            ],
            [
              'Net Salary',
              'Final payable salary after deductions.'
            ],
            [
              'Basic Salary',
              'Primary fixed component of salary.'
            ],
            [
              'Payroll',
              'Monthly employee salary processing.'
            ],
            [
              'Salary Template',
              'Predefined salary structure used for payroll.'
            ],
            [
              'Payroll Lock',
              'Finalized payroll that should not be modified.'
            ],
            [
              'Bonus',
              'Additional payment to employee.'
            ],
            [
              'Deduction',
              'Reduction from employee salary.'
            ],
            [
              'Overtime',
              'Additional payment for extra work.'
            ]
          ]}
        />
      </DocSection>

      <DocSection
        title="Attendance Terms"
        description="Attendance-related concepts and abbreviations."
      >
        <InfoTable
          headers={[
            'Term',
            'Meaning'
          ]}
          rows={[
            [
              'Attendance Register',
              'Record of employee attendance.'
            ],
            [
              'Present (P)',
              'Employee attended work.'
            ],
            [
              'Absent (A)',
              'Employee did not attend work.'
            ],
            [
              'Half Day (HD)',
              'Employee worked partial day.'
            ],
            [
              'Week Off (WO)',
              'Scheduled non-working day.'
            ],
            [
              'Holiday (HO)',
              'Organization-approved holiday.'
            ],
            [
              'LWP',
              'Leave Without Pay; unpaid leave affecting salary.'
            ],
            [
              'Payable Days',
              'Days considered for salary calculation.'
            ]
          ]}
        />
      </DocSection>

      <DocSection
        title="Leave Management Terms"
        description="Common leave-related terminology."
      >
        <InfoTable
          headers={[
            'Term',
            'Meaning'
          ]}
          rows={[
            [
              'Casual Leave (CL)',
              'Short-term personal leave.'
            ],
            [
              'Sick Leave (SL)',
              'Medical or health-related leave.'
            ],
            [
              'Paid Leave (PL)',
              'Approved leave without salary deduction.'
            ],
            [
              'Leave Balance',
              'Remaining leave availability.'
            ],
            [
              'Leave Approval',
              'Admin acceptance of leave request.'
            ],
            [
              'Leave Rejection',
              'Admin denial of leave request.'
            ]
          ]}
        />
      </DocSection>

      <DocSection
        title="Employee Management Terms"
        description="Employee lifecycle and HR terminology."
      >
        <InfoTable
          headers={[
            'Term',
            'Meaning'
          ]}
          rows={[
            [
              'Employee Code',
              'Unique employee identifier.'
            ],
            [
              'Onboarding',
              'Process of adding new employees.'
            ],
            [
              'Designation',
              'Official employee job title.'
            ],
            [
              'Department',
              'Functional team within organization.'
            ],
            [
              'LWD',
              'Last Working Date of employee.'
            ],
            [
              'Inactive Employee',
              'Employee with disabled access.'
            ],
            [
              'Offboarding',
              'Exit process after resignation.'
            ]
          ]}
        />
      </DocSection>

      <DocSection
        title="Compliance Terms"
        description="Payroll and statutory terminology."
      >
        <InfoTable
          headers={[
            'Term',
            'Meaning'
          ]}
          rows={[
            [
              'PF',
              'Provident Fund contribution for retirement savings.'
            ],
            [
              'ESIC',
              'Employee State Insurance benefit.'
            ],
            [
              'Professional Tax (PT)',
              'State-level payroll tax.'
            ],
            [
              'TDS',
              'Tax Deducted at Source.'
            ],
            [
              'Statutory Compliance',
              'Mandatory payroll regulations.'
            ],
            [
              'Tax Projection',
              'Estimated annual taxable income.'
            ]
          ]}
        />
      </DocSection>

      <DocSection
        title="Reporting & Security Terms"
        description="MIS, reporting, and audit terminology."
      >
        <InfoTable
          headers={[
            'Term',
            'Meaning'
          ]}
          rows={[
            [
              'MIS Report',
              'Management Information System report.'
            ],
            [
              'Audit Log',
              'History of system activity.'
            ],
            [
              'Export',
              'Download report in external format.'
            ],
            [
              'Role Permission',
              'Access control based on role.'
            ],
            [
              'Authentication',
              'Secure user login process.'
            ],
            [
              'OTP',
              'One-Time Password used for verification.'
            ]
          ]}
        />
      </DocSection>

      <DocSection
        title="Final Note"
        description="Understanding terminology improves system usage."
      >
        <DocCard title="Helpful Recommendation">
          <p>
            Familiarity with payroll, attendance,
            and HR terminology helps administrators
            avoid operational mistakes and improves
            overall platform efficiency.
          </p>

          <TipBox>
            New HR staff and employees should
            review this glossary before using
            advanced modules.
          </TipBox>
        </DocCard>
      </DocSection>
    </>
  );
}
