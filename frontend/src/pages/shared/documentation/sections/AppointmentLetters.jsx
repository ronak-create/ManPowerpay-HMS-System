import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function AppointmentLetters() {
  return (
    <>
      <DocSection
        title="Appointment Letters & Documents"
        description="Generate appointment letters and employee-related documents directly from the system."
      >
        <DocCard title="Module Overview">
          <p>
            The Appointment Letter module allows administrators to generate
            official employment documents for employees using predefined
            templates.
          </p>

          <p>
            Documents are generated automatically using employee profile
            information, salary structure, designation, joining details, and
            company configuration.
          </p>

          <TipBox>
            Ensure employee details are complete before generating appointment
            letters.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Generating an Appointment Letter"
        description="Admins can generate employee appointment letters directly from employee profiles."
      >
        <DocCard title="Generation Workflow">
          <StepList
            steps={[
              "Navigate to Employees.",
              "Open employee profile.",
              "Go to Documents section.",
              "Select Appointment Letter.",
              "Review employee information.",
              "Click Generate Document.",
              "Preview generated letter.",
              "Download or print the document.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Missing employee information may cause document generation failure.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Required Employee Information"
        description="The system uses employee details to populate appointment letters."
      >
        <DocCard title="Required Fields">
          <InfoTable
            headers={["Field", "Purpose"]}
            rows={[
              ["Employee Name", "Official employee identity"],
              ["Employee Code", "Unique employee reference"],
              ["Designation", "Job title"],
              ["Department", "Reporting department"],
              ["Date of Joining", "Employment start date"],
              ["Salary Details", "Compensation structure"],
              ["Company Details", "Employer information"],
            ]}
          />
        </DocCard>

        <TipBox>
          Review employee profile completeness before document generation.
        </TipBox>
      </DocSection>

      <DocSection
        title="Document Templates"
        description="Templates determine the structure and format of generated appointment letters."
      >
        <DocCard title="Template Features">
          <InfoTable
            headers={["Feature", "Description"]}
            rows={[
              ["Company Branding", "Company logo and identity"],
              ["Employee Details", "Auto-filled employee information"],
              ["Salary Structure", "Compensation details"],
              ["Terms & Conditions", "Employment rules"],
              ["Signatures", "Authorized approval section"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Editing templates incorrectly may affect document formatting.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Document Preview & Download"
        description="Generated documents can be reviewed before download."
      >
        <DocCard title="Preview Process">
          <StepList
            steps={[
              "Generate appointment letter.",
              "Open preview window.",
              "Verify employee details.",
              "Check salary information.",
              "Confirm formatting.",
              "Download or print document.",
            ]}
          />
        </DocCard>

        <TipBox>Always preview documents before sharing with employees.</TipBox>
      </DocSection>

      <DocSection
        title="Common Document Generation Errors"
        description="Typical issues and their causes."
      >
        <DocCard title="Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause"]}
            rows={[
              ["Generation Failed", "Missing employee information"],
              ["Blank Fields", "Employee data incomplete"],
              ["Incorrect Salary Details", "Salary template not assigned"],
              ["Formatting Issues", "Template configuration problem"],
              ["Document Not Downloading", "Browser or PDF issue"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Verify employee profile data if appointment letter generation fails.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Best Practices"
        description="Recommended workflow for appointment letter management."
      >
        <DocCard title="Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Complete employee profile before generating documents.</li>

            <li>Verify salary structure carefully.</li>

            <li>Review document preview before download.</li>

            <li>Maintain standardized templates.</li>

            <li>Store signed documents securely.</li>
          </ul>
        </DocCard>

        <TipBox>
          Keeping consistent appointment templates improves HR professionalism.
        </TipBox>
      </DocSection>
    </>
  );
}
