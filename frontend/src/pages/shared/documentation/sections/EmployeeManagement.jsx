import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function EmployeeManagement() {
  return (
    <>
      <DocSection
        title="Employee Management"
        description="Manage employee records, onboarding, profile updates, salary mapping, documents, and employee lifecycle operations."
      >
        <DocCard title="Module Overview">
          <p>
            The Employee Management module acts as the central employee database
            within the platform. Administrators can create, edit, manage, and
            track employee records from onboarding until exit.
          </p>

          <p>
            Employee data maintained here is directly connected with attendance,
            payroll, leave, resignation, reports, and statutory compliance.
          </p>

          <TipBox>
            Always complete employee details before assigning attendance or
            generating payroll.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Adding an Employee"
        description="Administrators can onboard employees manually using the Add Employee form."
      >
        <DocCard title="Manual Employee Creation">
          <StepList
            steps={[
              "Navigate to Employees.",
              "Click Add Employee.",
              "Enter personal details.",
              "Add employment details such as department and designation.",
              "Assign salary template.",
              "Add statutory and bank details.",
              "Save the employee profile.",
            ]}
          />
        </DocCard>

        <DocCard title="Required Employee Information">
          <InfoTable
            headers={["Field", "Purpose"]}
            rows={[
              ["Employee Code", "Unique employee identifier"],
              ["Full Name", "Official employee name"],
              ["Email Address", "Used for login and communication"],
              ["Mobile Number", "Employee contact number"],
              ["Department", "Defines reporting and structure"],
              ["Designation", "Employee role in organization"],
              ["Joining Date", "Used for payroll eligibility"],
              ["Salary Template", "Required for payroll calculation"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Payroll cannot be generated if an employee does not have a salary
          template assigned.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Bulk Employee Upload"
        description="Import multiple employees at once using the bulk upload system."
      >
        <DocCard title="Bulk Upload Workflow">
          <StepList
            steps={[
              "Go to Employees → Bulk Upload.",
              "Download the employee import template.",
              "Fill employee information carefully.",
              "Upload the completed file.",
              "Review validation results.",
              "Fix invalid rows if needed.",
              "Click Import to finalize onboarding.",
            ]}
          />
        </DocCard>

        <DocCard title="Recommended Template Fields">
          <InfoTable
            headers={["Column", "Required"]}
            rows={[
              ["Employee Name", "Yes"],
              ["Employee Code", "Yes"],
              ["Email", "Yes"],
              ["Mobile Number", "Yes"],
              ["Department", "Yes"],
              ["Designation", "Yes"],
              ["Date of Joining", "Yes"],
              ["Salary Template", "Recommended"],
              ["Bank Details", "Optional"],
              ["PAN / Aadhaar", "Optional"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Duplicate Employee Codes, Emails, or Mobile Numbers may block import.
        </WarningBox>

        <TipBox>
          Use the official bulk upload template downloaded from the platform to
          avoid formatting issues.
        </TipBox>
      </DocSection>

      <DocSection
        title="Employee Profile Management"
        description="Employee information can be updated at any time."
      >
        <DocCard title="Editable Information">
          <InfoTable
            headers={["Category", "Examples"]}
            rows={[
              ["Personal Details", "Name, contact number, address"],
              ["Employment Details", "Department, designation, site"],
              ["Salary Mapping", "Salary template assignment"],
              ["Bank Details", "Account number, IFSC"],
              ["Statutory Information", "PAN, Aadhaar, PF, ESIC"],
              ["Emergency Contact", "Emergency phone information"],
            ]}
          />
        </DocCard>

        <DocCard title="Profile Update Best Practices">
          <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-700">
            <li>Keep employee contact details updated.</li>

            <li>Verify bank account details carefully.</li>

            <li>Review salary template assignments after promotions.</li>

            <li>Update statutory information immediately.</li>
          </ul>
        </DocCard>
      </DocSection>

      <DocSection
        title="Salary Template Assignment"
        description="Salary templates define employee salary structures."
      >
        <DocCard title="How Salary Templates Work">
          <p>
            Each employee should be assigned a salary template that defines
            earnings and deductions.
          </p>

          <p>
            During payroll generation, the system automatically references this
            template to calculate salary.
          </p>

          <InfoTable
            headers={["Component Type", "Examples"]}
            rows={[
              ["Earnings", "Basic, HRA, Bonus, Allowances"],
              ["Deductions", "PF, ESIC, PT, TDS"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Missing salary templates can result in payroll generation failure.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Digital Employee ID Cards"
        description="Generate and manage digital employee identity cards."
      >
        <DocCard title="Employee ID Features">
          <p>
            The platform provides digital employee identity cards with QR
            verification support.
          </p>

          <InfoTable
            headers={["Feature", "Description"]}
            rows={[
              ["QR Code", "Quick employee verification"],
              ["Employee Details", "Name, ID, designation"],
              ["Print Support", "Download and print card"],
              ["Verification", "Useful for HR and security"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Appointment Letters & Documents"
        description="Generate employee appointment documents directly from the system."
      >
        <DocCard title="Document Generation">
          <StepList
            steps={[
              "Open employee profile.",
              "Navigate to Documents.",
              "Choose Appointment Letter.",
              "Review employee information.",
              "Generate document.",
              "Download or share PDF.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Missing employee information may cause document generation failure.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Employee Status Management"
        description="Track employment status across the employee lifecycle."
      >
        <DocCard title="Status Types">
          <InfoTable
            headers={["Status", "Meaning"]}
            rows={[
              ["Active", "Employee is currently working"],
              ["Inactive", "Employee access disabled"],
              ["Resigned", "Employee has submitted resignation"],
              ["Exited", "Employee officially left company"],
            ]}
          />
        </DocCard>

        <TipBox>
          Keep employee status updated to avoid payroll and attendance errors.
        </TipBox>
      </DocSection>
    </>
  );
}
