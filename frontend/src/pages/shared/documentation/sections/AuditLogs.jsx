import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";
import StepList from "../ui/StepList";

export default function AuditLogs() {
  return (
    <>
      <DocSection
        title="Audit Logs"
        description="Track system activity, user actions, and operational changes for accountability and transparency."
      >
        <DocCard title="Module Overview">
          <p>
            Audit Logs provide a historical record of important actions
            performed within ManPowerPay HMS.
          </p>

          <p>
            Every major activity such as employee creation, attendance updates,
            payroll actions, leave approvals, and profile modifications may be
            recorded for accountability and operational tracking.
          </p>

          <TipBox>
            Audit logs help organizations identify who performed an action and
            when it occurred.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Why Audit Logs Matter"
        description="Audit tracking improves operational visibility and accountability."
      >
        <DocCard title="Benefits of Audit Logs">
          <InfoTable
            headers={["Benefit", "Purpose"]}
            rows={[
              ["Transparency", "Track who performed actions"],
              ["Accountability", "Reduce unauthorized changes"],
              ["Troubleshooting", "Identify system mistakes"],
              ["Compliance", "Maintain organizational records"],
              ["Security", "Monitor suspicious activities"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Audit logs should not be deleted without proper authorization.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Tracked Activities"
        description="The system records major actions performed by users."
      >
        <DocCard title="Common Logged Actions">
          <InfoTable
            headers={["Activity Type", "Examples"]}
            rows={[
              ["Employee Management", "Employee created, edited, deleted"],
              ["Attendance", "Attendance added or modified"],
              ["Payroll", "Payroll generated, approved, locked"],
              ["Leave Management", "Leave approved or rejected"],
              ["Company Settings", "Configuration changes"],
              ["Authentication", "Login activity"],
              ["Document Actions", "Appointment letter generation"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Viewing Audit Logs"
        description="Admins can review activity history from the Audit Logs module."
      >
        <DocCard title="Access Workflow">
          <StepList
            steps={[
              "Navigate to Audit Logs.",
              "Choose date range if required.",
              "Apply filters (module, user, action).",
              "Review activity history.",
              "Investigate unusual activity if needed.",
            ]}
          />
        </DocCard>

        <TipBox>
          Use filters to quickly locate payroll or attendance-related actions.
        </TipBox>
      </DocSection>

      <DocSection
        title="Audit Log Information"
        description="Each log entry contains details about performed actions."
      >
        <DocCard title="Typical Log Details">
          <InfoTable
            headers={["Field", "Purpose"]}
            rows={[
              ["User", "Person who performed action"],
              ["Action", "Activity performed"],
              ["Module", "Related system section"],
              ["Timestamp", "Date and time of activity"],
              ["Status", "Successful or failed action"],
              ["Remarks", "Additional system details"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Timestamp accuracy is important for payroll and compliance
          investigations.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Using Logs for Troubleshooting"
        description="Audit logs can help identify operational mistakes."
      >
        <DocCard title="Common Investigation Examples">
          <InfoTable
            headers={["Issue", "How Logs Help"]}
            rows={[
              ["Incorrect Attendance", "Identify who modified records"],
              ["Payroll Errors", "Track payroll approval actions"],
              ["Leave Changes", "Verify approval/rejection history"],
              ["Profile Modification", "Identify edited employee data"],
              ["Unauthorized Access", "Monitor login activity"],
            ]}
          />
        </DocCard>

        <TipBox>
          Audit logs are especially useful during payroll disputes and HR
          investigations.
        </TipBox>
      </DocSection>

      <DocSection
        title="Security & Access"
        description="Audit logs are typically restricted to authorized personnel."
      >
        <DocCard title="Who Can Access Logs?">
          <InfoTable
            headers={["Role", "Access Level"]}
            rows={[
              ["Admin", "Full audit visibility"],
              ["HR Manager", "Limited operational visibility"],
              ["Payroll Manager", "Payroll-related logs"],
              ["Employee", "No audit access"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Audit data may contain sensitive information and should only be viewed
          by authorized users.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Best Practices"
        description="Recommended ways to use audit logs effectively."
      >
        <DocCard title="Suggestions">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Review payroll logs before salary finalization.</li>

            <li>Monitor attendance modifications regularly.</li>

            <li>Investigate unusual login activity.</li>

            <li>Keep audit records for compliance purposes.</li>

            <li>Restrict access to trusted administrators.</li>
          </ul>
        </DocCard>

        <TipBox>
          Weekly audit review helps identify operational mistakes early.
        </TipBox>
      </DocSection>
    </>
  );
}
