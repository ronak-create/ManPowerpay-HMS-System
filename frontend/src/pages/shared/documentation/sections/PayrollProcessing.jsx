import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function PayrollProcessing() {
  return (
    <>
      <DocSection
        title="Payroll Processing"
        description="Generate employee salaries accurately using attendance, salary templates, deductions, bonuses, and statutory calculations."
      >
        <DocCard title="Module Overview">
          <p>
            Payroll Processing is the core financial module of ManPowerPay HMS.
            It automates employee salary generation by combining attendance,
            leave records, salary templates, bonuses, deductions, and statutory
            rules.
          </p>

          <p>
            Before running payroll, ensure attendance and leave records are
            finalized to avoid incorrect salary calculations.
          </p>

          <TipBox>
            Payroll should only be processed after attendance and leave
            approvals are verified.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Payroll Lifecycle"
        description="Understanding the payroll workflow ensures accurate and error-free salary processing."
      >
        <DocCard title="Recommended Payroll Flow">
          <StepList
            steps={[
              "Verify employee attendance for the payroll period.",
              "Review approved and pending leave requests.",
              "Ensure salary templates are assigned.",
              "Review bonuses, penalties, and deductions.",
              "Generate draft payroll.",
              "Verify payroll calculations.",
              "Approve payroll.",
              "Lock payroll to finalize salary records.",
              "Generate payslips for employees.",
              "Export salary disbursement files if required.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Once payroll is locked, modifications may require administrative
          correction procedures.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Generating Payroll"
        description="Admins can process payroll for selected months."
      >
        <DocCard title="Payroll Generation Process">
          <StepList
            steps={[
              "Navigate to Payroll Processing.",
              "Select payroll month.",
              "Choose employee group if required.",
              "Review payroll preview.",
              "Click Generate Payroll.",
              "Review generated salary details.",
              "Approve payroll.",
            ]}
          />
        </DocCard>

        <DocCard title="Required Payroll Inputs">
          <InfoTable
            headers={["Requirement", "Purpose"]}
            rows={[
              ["Attendance Data", "Determines payable days"],
              ["Salary Template", "Defines earnings & deductions"],
              ["Leave Records", "Adjusts salary eligibility"],
              ["Bonuses", "Additional salary amount"],
              ["Penalties", "Salary reductions"],
              ["Statutory Rules", "PF, ESIC, PT, TDS calculations"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Missing attendance or salary templates may prevent payroll generation.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Salary Calculation Components"
        description="Payroll combines earnings and deductions to calculate final salary."
      >
        <DocCard title="Common Earnings">
          <InfoTable
            headers={["Component", "Description"]}
            rows={[
              ["Basic Salary", "Fixed monthly salary"],
              ["HRA", "House Rent Allowance"],
              ["Special Allowance", "Additional monthly benefit"],
              ["Bonus", "Extra compensation"],
              ["Overtime", "Extra work payment"],
            ]}
          />
        </DocCard>

        <DocCard title="Common Deductions">
          <InfoTable
            headers={["Component", "Description"]}
            rows={[
              ["PF", "Provident Fund contribution"],
              ["ESIC", "Employee State Insurance"],
              ["Professional Tax", "State payroll tax"],
              ["TDS", "Income tax deduction"],
              ["LWP Deduction", "Salary reduction for unpaid leave"],
              ["Advance Recovery", "Salary advance deduction"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Payroll Statuses"
        description="Payroll passes through multiple stages before completion."
      >
        <DocCard title="Status Definitions">
          <InfoTable
            headers={["Status", "Meaning"]}
            rows={[
              ["Draft", "Payroll generated but editable"],
              ["Pending Approval", "Awaiting admin verification"],
              ["Approved", "Payroll verified"],
              ["Locked", "Finalized payroll"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Locked payroll should only be finalized after thorough review.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Payslip Generation"
        description="Employees can access salary slips after payroll approval."
      >
        <DocCard title="Employee Payslip Access">
          <StepList
            steps={[
              "Login to employee portal.",
              "Navigate to Payslips.",
              "Choose payroll month.",
              "Review salary details.",
              "Download PDF payslip.",
            ]}
          />
        </DocCard>

        <DocCard title="Payslip Includes">
          <InfoTable
            headers={["Section", "Information"]}
            rows={[
              ["Employee Details", "Name, employee ID, designation"],
              ["Attendance Summary", "Present, absent, leave count"],
              ["Earnings", "Salary components"],
              ["Deductions", "Tax and reductions"],
              ["Net Salary", "Final payable amount"],
            ]}
          />
        </DocCard>

        <TipBox>
          Encourage employees to download monthly payslips for financial records
          and tax filing.
        </TipBox>
      </DocSection>

      <DocSection
        title="Bank Salary Disbursement"
        description="Payroll data can be exported for salary transfer processing."
      >
        <DocCard title="Bank Transfer Workflow">
          <StepList
            steps={[
              "Open payroll details.",
              "Review finalized salaries.",
              "Export bank transfer file.",
              "Verify employee bank details.",
              "Upload file to bank portal.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect bank account information may delay salary disbursement.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Payroll Errors & Troubleshooting"
        description="Common payroll issues and possible causes."
      >
        <DocCard title="Common Problems">
          <InfoTable
            headers={["Issue", "Possible Cause"]}
            rows={[
              ["Payroll Generation Failed", "Missing attendance or template"],
              ["Employee Missing", "Inactive status or missing mapping"],
              ["Wrong Salary Amount", "Incorrect template or deductions"],
              ["Payslip Missing", "Payroll not approved or locked"],
              [
                "Missing Statutory Deduction",
                "Compliance settings not configured",
              ],
            ]}
          />
        </DocCard>

        <WarningBox>
          Always review payroll before locking to avoid rework.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Payroll Best Practices"
        description="Recommended methods for reliable payroll management."
      >
        <DocCard title="Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Finalize attendance before payroll.</li>

            <li>Review leave approvals monthly.</li>

            <li>Verify salary templates regularly.</li>

            <li>Double-check bank details before disbursement.</li>

            <li>Lock payroll only after complete verification.</li>
          </ul>
        </DocCard>

        <TipBox>
          Maintaining a payroll review checklist helps reduce salary disputes.
        </TipBox>
      </DocSection>
    </>
  );
}
