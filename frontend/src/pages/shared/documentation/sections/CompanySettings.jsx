import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function CompanySettings() {
  return (
    <>
      <DocSection
        title="Company Settings"
        description="Configure organization-level settings such as company details, payroll preferences, holidays, branding, and system-wide policies."
      >
        <DocCard title="Module Overview">
          <p>
            Company Settings acts as the central configuration area of
            ManPowerPay HMS.
          </p>

          <p>
            Administrators can configure organization details, payroll
            preferences, statutory settings, branding, holidays, and other
            operational defaults.
          </p>

          <TipBox>
            Configure company settings during initial setup to avoid payroll and
            compliance issues later.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Company Profile Configuration"
        description="Maintain official organization information used throughout the platform."
      >
        <DocCard title="Company Information">
          <InfoTable
            headers={["Setting", "Purpose"]}
            rows={[
              ["Company Name", "Official organization identity"],
              ["Company Address", "Used in reports and documents"],
              ["Email Address", "Communication contact"],
              ["Phone Number", "Official contact details"],
              ["GST / Registration Details", "Compliance documentation"],
            ]}
          />
        </DocCard>

        <TipBox>
          Company information appears automatically in appointment letters,
          payslips, and reports.
        </TipBox>
      </DocSection>

      <DocSection
        title="Company Branding"
        description="Customize company identity within the platform."
      >
        <DocCard title="Branding Options">
          <InfoTable
            headers={["Feature", "Purpose"]}
            rows={[
              ["Company Logo", "Displayed in documents"],
              ["Brand Name", "System identity"],
              ["Document Header", "Official formatting"],
              ["Letterhead Settings", "Appointment letter styling"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect branding setup may affect document formatting and
          professional appearance.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Payroll Configuration"
        description="Set payroll preferences and organization-wide salary processing rules."
      >
        <DocCard title="Payroll Settings">
          <InfoTable
            headers={["Setting", "Purpose"]}
            rows={[
              ["Payroll Cycle", "Monthly payroll frequency"],
              ["Salary Processing Date", "Payroll generation timing"],
              ["Working Days", "Salary calculation reference"],
              ["Overtime Rules", "Extra work calculation"],
              ["LWP Policy", "Leave deduction handling"],
            ]}
          />
        </DocCard>

        <TipBox>
          Configure payroll settings before running the first payroll cycle.
        </TipBox>
      </DocSection>

      <DocSection
        title="Holiday Management"
        description="Configure organizational holidays used in attendance and payroll."
      >
        <DocCard title="Holiday Setup Workflow">
          <StepList
            steps={[
              "Navigate to Company Settings.",
              "Open Holiday Management.",
              "Add holiday date.",
              "Enter holiday name.",
              "Save configuration.",
              "Review holiday calendar.",
            ]}
          />
        </DocCard>

        <InfoTable
          headers={["Holiday Type", "Example"]}
          rows={[
            ["National Holiday", "Republic Day"],
            ["Festival Holiday", "Diwali"],
            ["Company Holiday", "Annual Foundation Day"],
            ["Optional Holiday", "Department-specific leave"],
          ]}
        />

        <WarningBox>
          Holidays directly affect attendance and payroll calculations.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Statutory Configuration"
        description="Configure organization-level compliance rules."
      >
        <DocCard title="Compliance Settings">
          <InfoTable
            headers={["Setting", "Purpose"]}
            rows={[
              ["PF Rules", "Provident Fund configuration"],
              ["ESIC Settings", "Insurance deduction setup"],
              ["Professional Tax", "State-specific PT slabs"],
              ["TDS Rules", "Tax deduction logic"],
            ]}
          />
        </DocCard>

        <TipBox>
          Review statutory settings regularly to remain compliant with updated
          regulations.
        </TipBox>
      </DocSection>

      <DocSection
        title="Permissions & Role Management"
        description="Define who can access different modules."
      >
        <DocCard title="Role Access Control">
          <InfoTable
            headers={["Role", "Typical Access"]}
            rows={[
              ["Admin", "Full system control"],
              ["HR Manager", "Employee & attendance management"],
              ["Payroll Manager", "Payroll & deductions"],
              ["Employee", "Self-service portal access"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect permission setup may expose sensitive employee data.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Updating Company Settings"
        description="Admins can update organization settings at any time."
      >
        <DocCard title="Update Process">
          <StepList
            steps={[
              "Navigate to Company Settings.",
              "Open desired setting category.",
              "Modify information.",
              "Review changes.",
              "Save configuration.",
              "Verify reflected updates.",
            ]}
          />
        </DocCard>

        <TipBox>
          Review payroll and statutory settings after major policy changes.
        </TipBox>
      </DocSection>

      <DocSection
        title="Best Practices"
        description="Recommended configuration practices."
      >
        <DocCard title="Suggestions">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Keep company information updated.</li>

            <li>Review holiday calendars annually.</li>

            <li>Verify payroll settings before salary processing.</li>

            <li>Restrict admin permissions carefully.</li>

            <li>Audit compliance settings periodically.</li>
          </ul>
        </DocCard>

        <TipBox>
          Proper company configuration reduces operational and payroll errors
          significantly.
        </TipBox>
      </DocSection>
    </>
  );
}
