import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function ResignationExit() {
  return (
    <>
      <DocSection
        title="Resignation & Exit Management"
        description="Manage employee resignations, approvals, exit workflow, and offboarding procedures."
      >
        <DocCard title="Module Overview">
          <p>
            The Resignation & Exit module helps organizations manage employee
            separation in a structured and transparent manner.
          </p>

          <p>
            Employees can submit resignation requests, while administrators
            review approvals, define Last Working Date (LWD), and complete
            offboarding procedures.
          </p>

          <TipBox>
            Maintain clear communication during resignation to ensure smooth
            employee offboarding.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Employee Resignation Request"
        description="Employees can initiate resignation directly from the portal."
      >
        <DocCard title="Resignation Submission Process">
          <StepList
            steps={[
              "Login to Employee Portal.",
              "Navigate to Resignation.",
              "Enter resignation reason.",
              "Select Last Working Date (LWD).",
              "Review request details.",
              "Submit resignation request.",
            ]}
          />
        </DocCard>

        <DocCard title="Required Information">
          <InfoTable
            headers={["Field", "Purpose"]}
            rows={[
              ["Reason for Resignation", "Provides resignation context"],
              ["Last Working Date", "Defines final working day"],
              ["Remarks", "Additional explanation if required"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Once submitted, resignation requests may require HR approval before
          changes can be made.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Resignation Approval Workflow"
        description="Administrators review and manage resignation requests."
      >
        <DocCard title="Admin Approval Process">
          <StepList
            steps={[
              "Navigate to Resignation Management.",
              "Review pending resignation request.",
              "Verify employee details.",
              "Review Last Working Date.",
              "Approve or reject request.",
              "Provide remarks if necessary.",
            ]}
          />
        </DocCard>

        <DocCard title="Request Statuses">
          <InfoTable
            headers={["Status", "Meaning"]}
            rows={[
              ["Pending", "Awaiting HR/Admin review"],
              ["Approved", "Resignation accepted"],
              ["Rejected", "Resignation denied"],
              ["Completed", "Employee exit finalized"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Last Working Date (LWD)"
        description="The Last Working Date defines when an employee officially leaves the organization."
      >
        <DocCard title="Understanding LWD">
          <p>
            The LWD represents the employee’s final active working day within
            the organization.
          </p>

          <p>
            Payroll, attendance, access permissions, and exit formalities are
            often aligned with the selected LWD.
          </p>

          <InfoTable
            headers={["Impact Area", "Effect"]}
            rows={[
              ["Attendance", "Stops after LWD"],
              ["Payroll", "Final salary calculation"],
              ["Portal Access", "Temporary access may remain"],
              ["Documents", "Final records availability"],
            ]}
          />
        </DocCard>

        <TipBox>
          Choose a realistic LWD to allow proper transition and knowledge
          transfer.
        </TipBox>
      </DocSection>

      <DocSection
        title="Employee Access After Resignation"
        description="Portal access may continue temporarily depending on organization policy."
      >
        <DocCard title="Access Management">
          <p>
            In many cases, approved resignations do not immediately disable
            employee access.
          </p>

          <p>
            Employees may retain temporary access for downloading payslips,
            resignation documents, and personal records until the exit process
            is completed.
          </p>

          <WarningBox>
            Portal access is automatically revoked once the employee becomes
            inactive.
          </WarningBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Final Settlement & Offboarding"
        description="Organizations may complete financial and operational exit activities."
      >
        <DocCard title="Offboarding Workflow">
          <StepList
            steps={[
              "Confirm Last Working Date.",
              "Finalize attendance records.",
              "Calculate final payroll.",
              "Recover company assets if applicable.",
              "Complete clearance process.",
              "Deactivate employee account.",
            ]}
          />
        </DocCard>

        <DocCard title="Typical Offboarding Activities">
          <InfoTable
            headers={["Activity", "Purpose"]}
            rows={[
              ["Final Salary", "Pending salary settlement"],
              ["Document Handover", "Provide resignation-related documents"],
              ["Asset Return", "Recover company devices/access"],
              ["Account Deactivation", "Secure organization systems"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Final payroll should only be processed after attendance verification.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Automatic Employee Deactivation"
        description="Employees are automatically moved to inactive status after exit completion."
      >
        <DocCard title="Deactivation Process">
          <p>
            Once the Last Working Date has passed and resignation is completed,
            the employee may automatically move to inactive status.
          </p>

          <p>This prevents unauthorized access to employee and company data.</p>

          <InfoTable
            headers={["Status", "Meaning"]}
            rows={[
              ["Active", "Employee currently working"],
              ["Resigned", "Exit initiated"],
              ["Inactive", "Access disabled"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Best Practices"
        description="Recommended resignation handling process."
      >
        <DocCard title="Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Approve resignations after proper review.</li>

            <li>Verify attendance before final payroll.</li>

            <li>Ensure complete asset recovery.</li>

            <li>Maintain proper resignation records.</li>

            <li>Communicate clearly with employees during exit.</li>
          </ul>
        </DocCard>

        <TipBox>
          A structured exit process reduces compliance and payroll issues.
        </TipBox>
      </DocSection>
    </>
  );
}
