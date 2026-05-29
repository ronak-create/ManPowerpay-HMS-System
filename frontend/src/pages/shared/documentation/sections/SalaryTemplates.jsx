import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function SalaryTemplates() {
  return (
    <>
      <DocSection
        title="Salary Templates"
        description="Create and manage reusable salary structures for payroll automation."
      >
        <DocCard title="Module Overview">
          <p>
            Salary Templates define how employee salary is calculated. Instead
            of manually configuring salary components for every employee,
            administrators can create reusable templates.
          </p>

          <p>
            Templates contain earnings, deductions, statutory rules, and payroll
            formulas that are automatically applied during payroll generation.
          </p>

          <TipBox>
            Standardized salary templates reduce payroll errors and improve
            consistency.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Creating a Salary Template"
        description="Admins can configure templates for different employee groups."
      >
        <DocCard title="Template Creation Process">
          <StepList
            steps={[
              "Navigate to Salary Templates.",
              "Click Create Template.",
              "Enter template name.",
              "Add earning components.",
              "Add deduction components.",
              "Configure statutory rules if required.",
              "Save template.",
            ]}
          />
        </DocCard>

        <DocCard title="Required Information">
          <InfoTable
            headers={["Field", "Purpose"]}
            rows={[
              ["Template Name", "Unique salary structure name"],
              ["Earnings", "Salary additions"],
              ["Deductions", "Salary reductions"],
              ["Formula Logic", "Defines calculations"],
              ["Payroll Rules", "Attendance/statutory handling"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect salary component setup may result in inaccurate payroll
          calculations.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Salary Components"
        description="Templates are built using earnings and deduction components."
      >
        <DocCard title="Common Earnings Components">
          <InfoTable
            headers={["Component", "Description"]}
            rows={[
              ["Basic Salary", "Primary fixed salary amount"],
              ["House Rent Allowance (HRA)", "Housing-related allowance"],
              ["Special Allowance", "Additional compensation"],
              ["Travel Allowance", "Travel-related reimbursement"],
              ["Bonus", "Performance or company bonus"],
              ["Overtime", "Additional working hours pay"],
            ]}
          />
        </DocCard>

        <DocCard title="Common Deduction Components">
          <InfoTable
            headers={["Component", "Description"]}
            rows={[
              ["PF", "Provident Fund deduction"],
              ["ESIC", "Employee State Insurance"],
              ["Professional Tax", "State-specific payroll tax"],
              ["TDS", "Income tax deduction"],
              ["Advance Recovery", "Salary advance adjustment"],
              ["Penalty / Fine", "Custom deduction"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Assigning Templates to Employees"
        description="Employees must be mapped to salary templates for payroll processing."
      >
        <DocCard title="Assignment Process">
          <StepList
            steps={[
              "Open Employee Profile.",
              "Navigate to Salary Information.",
              "Choose Salary Template.",
              "Verify salary structure.",
              "Save employee profile.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Employees without assigned salary templates cannot be included in
          payroll calculations.
        </WarningBox>

        <TipBox>
          Use separate templates for different departments, grades, or salary
          structures.
        </TipBox>
      </DocSection>

      <DocSection
        title="Attendance-Based Salary Impact"
        description="Templates interact with attendance during payroll processing."
      >
        <DocCard title="Attendance Integration">
          <InfoTable
            headers={["Attendance Type", "Salary Impact"]}
            rows={[
              ["Present", "Full salary applied"],
              ["Paid Leave", "No deduction"],
              ["Half Day", "Partial salary adjustment"],
              ["Absent", "Possible deduction"],
              ["LWP", "Salary reduced automatically"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Payroll calculations depend on finalized attendance records.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Template Best Practices"
        description="Follow these practices for accurate payroll management."
      >
        <DocCard title="Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Keep template names clear and descriptive.</li>

            <li>Avoid frequent modifications to active templates.</li>

            <li>Review statutory components regularly.</li>

            <li>Use separate templates for different employee levels.</li>

            <li>Test payroll after major template changes.</li>
          </ul>
        </DocCard>

        <TipBox>
          Maintain one standard template per employee category for easier
          payroll administration.
        </TipBox>
      </DocSection>

      <DocSection
        title="Common Issues"
        description="Typical problems related to salary templates."
      >
        <DocCard title="Troubleshooting Examples">
          <InfoTable
            headers={["Issue", "Possible Cause"]}
            rows={[
              ["Payroll Not Generated", "Missing salary template"],
              ["Incorrect Salary", "Wrong component setup"],
              ["Missing Deductions", "Statutory rules not configured"],
              ["Employee Excluded", "Template not assigned"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Always verify template setup before final payroll approval.
        </WarningBox>
      </DocSection>
    </>
  );
}
