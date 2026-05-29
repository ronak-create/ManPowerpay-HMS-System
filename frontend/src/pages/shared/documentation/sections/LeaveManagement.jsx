import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function LeaveManagement() {
  return (
    <>
      <DocSection
        title="Leave Management"
        description="Manage employee leave requests, balances, approvals, and leave-related payroll impact."
      >
        <DocCard title="Module Overview">
          <p>
            The Leave Management module enables employees to request leave and
            allows administrators to review, approve, or reject requests.
          </p>

          <p>
            The module helps organizations maintain transparency in leave
            allocation while ensuring attendance and payroll accuracy.
          </p>

          <TipBox>
            Leave approvals should be completed before payroll generation to
            avoid attendance mismatches.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Applying for Leave"
        description="Employees can submit leave requests directly from their portal."
      >
        <DocCard title="Leave Application Process">
          <StepList
            steps={[
              "Navigate to Leave Management.",
              "Click Apply Leave.",
              "Choose leave type.",
              "Select start and end dates.",
              "Provide reason for leave.",
              "Review request details.",
              "Submit application.",
            ]}
          />
        </DocCard>

        <DocCard title="Required Information">
          <InfoTable
            headers={["Field", "Purpose"]}
            rows={[
              ["Leave Type", "Determines applicable policy"],
              ["Start Date", "Beginning of leave period"],
              ["End Date", "Last leave date"],
              ["Reason", "Explanation for absence"],
              ["Supporting Document", "Optional proof if required"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Employees cannot submit leave requests exceeding available leave
          balance.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Leave Types"
        description="Organizations may define different leave categories."
      >
        <DocCard title="Common Leave Categories">
          <InfoTable
            headers={["Leave Type", "Description"]}
            rows={[
              ["Casual Leave (CL)", "Short-term personal leave"],
              ["Sick Leave (SL)", "Medical or health-related leave"],
              ["Paid Leave (PL)", "Approved paid leave"],
              ["Emergency Leave", "Unexpected urgent leave"],
              [
                "Leave Without Pay (LWP)",
                "Unpaid leave with payroll deduction",
              ],
            ]}
          />
        </DocCard>

        <TipBox>
          Leave availability depends on organization-specific policies.
        </TipBox>
      </DocSection>

      <DocSection
        title="Leave Approval Workflow"
        description="Administrators manage leave approval and rejection."
      >
        <DocCard title="Admin Approval Process">
          <StepList
            steps={[
              "Open Leave Management.",
              "Review pending requests.",
              "Verify leave balance.",
              "Check leave reason and dates.",
              "Approve or reject request.",
              "Add remarks if necessary.",
            ]}
          />
        </DocCard>

        <DocCard title="Approval Status Types">
          <InfoTable
            headers={["Status", "Meaning"]}
            rows={[
              ["Pending", "Waiting for admin action"],
              ["Approved", "Leave accepted"],
              ["Rejected", "Leave denied"],
              ["Cancelled", "Withdrawn by employee or admin"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Rejected leave applications may require employees to mark attendance
          manually if absent.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Leave Balance Management"
        description="Admins can configure and maintain employee leave balances."
      >
        <DocCard title="Balance Configuration">
          <p>
            Leave balances are typically assigned annually or monthly depending
            on company policy.
          </p>

          <p>
            Administrators may initialize leave balances for CL, SL, and PL at
            the beginning of a leave cycle.
          </p>

          <InfoTable
            headers={["Balance Type", "Example"]}
            rows={[
              ["Annual Allocation", "12 Casual Leaves per year"],
              ["Monthly Credit", "1 Leave added monthly"],
              ["Carry Forward", "Unused leaves transferred"],
              ["Expiry Rule", "Unused leave expires"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Leave Cancellation"
        description="Employees may cancel leave requests depending on approval status."
      >
        <DocCard title="Cancellation Rules">
          <InfoTable
            headers={["Condition", "Allowed"]}
            rows={[
              ["Pending Leave", "Yes"],
              ["Approved Leave", "Depends on company policy"],
              ["Rejected Leave", "No cancellation needed"],
              ["Completed Leave", "No"],
            ]}
          />
        </DocCard>

        <TipBox>
          Employees should notify HR when cancelling approved leave to prevent
          attendance issues.
        </TipBox>
      </DocSection>

      <DocSection
        title="Leave & Payroll Relationship"
        description="Leave directly affects attendance and salary calculations."
      >
        <DocCard title="Payroll Impact">
          <InfoTable
            headers={["Leave Type", "Salary Effect"]}
            rows={[
              ["Paid Leave", "No deduction"],
              ["Casual Leave", "Depends on balance"],
              ["Sick Leave", "Depends on company rules"],
              ["LWP", "Salary deduction applied"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Leave Without Pay (LWP) will reduce employee salary during payroll
          processing.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Recommended Workflow"
        description="Suggested leave management process for smooth HR operations."
      >
        <DocCard title="Best Practice Sequence">
          <div className="space-y-4 text-sm text-zinc-700">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>1. Employee Applies</strong>
              <p>Employee submits leave request.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>2. Admin Review</strong>
              <p>HR verifies leave balance and request details.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>3. Approval / Rejection</strong>
              <p>Request status is updated.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>4. Attendance Sync</strong>
              <p>Approved leaves reflect in attendance.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>5. Payroll Processing</strong>
              <p>Payroll uses final attendance data.</p>
            </div>
          </div>
        </DocCard>

        <TipBox>
          Regular leave monitoring reduces payroll disputes and attendance
          errors.
        </TipBox>
      </DocSection>
    </>
  );
}
