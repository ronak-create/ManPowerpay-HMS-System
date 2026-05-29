import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import WarningBox from "../ui/WarningBox";
import TipBox from "../ui/TipBox";
import InfoTable from "../ui/InfoTable";

export default function AttendanceManagement() {
  return (
    <>
      <DocSection
        title="Attendance Register"
        description="Manage employee attendance records accurately to ensure proper salary calculations and workforce tracking."
      >
        <DocCard title="Module Overview">
          <p>
            The Attendance Register module is responsible for recording employee
            working days, absences, leaves, holidays, and attendance exceptions.
          </p>

          <p>
            Attendance information is directly connected with payroll
            calculations. Incorrect attendance records may result in salary
            discrepancies.
          </p>

          <TipBox>
            Maintain attendance daily instead of waiting until month-end to
            avoid payroll errors.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Marking Daily Attendance"
        description="Administrators can manually record daily attendance for employees."
      >
        <DocCard title="Manual Attendance Workflow">
          <StepList
            steps={[
              "Navigate to Attendance Register.",
              "Select the attendance date.",
              "Choose employee(s).",
              "Assign attendance status.",
              "Review entries carefully.",
              "Save attendance.",
            ]}
          />
        </DocCard>

        <DocCard title="Attendance Entry Best Practices">
          <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-700">
            <li>Mark attendance daily whenever possible.</li>

            <li>Verify absences before saving.</li>

            <li>Double-check half-day entries.</li>

            <li>Sync leave approvals before payroll.</li>
          </ul>
        </DocCard>
      </DocSection>

      <DocSection
        title="Bulk Attendance Upload"
        description="Upload attendance records for multiple employees using Excel templates."
      >
        <DocCard title="Bulk Upload Process">
          <StepList
            steps={[
              "Open Attendance Register.",
              "Download the attendance template.",
              "Enter attendance data carefully.",
              "Upload the completed file.",
              "Review validation messages.",
              "Fix any failed entries.",
              "Finalize attendance upload.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect employee IDs or invalid attendance codes may cause upload
          failures.
        </WarningBox>

        <TipBox>
          Always use the latest attendance template downloaded from the system.
        </TipBox>
      </DocSection>

      <DocSection
        title="Attendance Status Codes"
        description="Different attendance statuses are used for payroll and reporting."
      >
        <DocCard title="Attendance Code Reference">
          <InfoTable
            headers={["Code", "Meaning", "Payroll Impact"]}
            rows={[
              ["P", "Present", "Full payable day"],
              ["A", "Absent", "Salary deduction possible"],
              ["H", "Half Day", "Partial salary impact"],
              ["PL", "Paid Leave", "Fully payable"],
              ["SL", "Sick Leave", "Depends on leave policy"],
              ["WO", "Week Off", "No deduction"],
              ["HO", "Holiday", "No deduction"],
              ["LWP", "Leave Without Pay", "Salary deduction applied"],
            ]}
          />
        </DocCard>

        <WarningBox>
          LWP (Leave Without Pay) directly affects payroll calculations and
          reduces payable salary.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Attendance Corrections"
        description="Attendance entries can be updated if mistakes occur."
      >
        <DocCard title="Correcting Attendance">
          <StepList
            steps={[
              "Open Attendance Register.",
              "Select the incorrect date.",
              "Locate the employee.",
              "Update attendance status.",
              "Save changes.",
              "Verify updated record.",
            ]}
          />
        </DocCard>

        <TipBox>
          Make attendance corrections before payroll generation for accurate
          salary computation.
        </TipBox>
      </DocSection>

      <DocSection
        title="Attendance & Payroll Relationship"
        description="Attendance directly impacts salary processing."
      >
        <DocCard title="How Attendance Affects Payroll">
          <InfoTable
            headers={["Attendance Type", "Payroll Effect"]}
            rows={[
              ["Present", "Full salary eligibility"],
              ["Absent", "Possible deduction"],
              ["Half Day", "Partial deduction"],
              ["Paid Leave", "Paid as normal day"],
              ["LWP", "Salary reduction"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Payroll should never be generated before attendance verification is
          completed.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Attendance Workflow"
        description="Recommended monthly attendance process."
      >
        <DocCard title="Suggested Process">
          <div className="space-y-4 text-sm text-zinc-700">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>1. Daily Attendance Entry</strong>
              <p>Record attendance every working day.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>2. Leave Synchronization</strong>
              <p>Ensure approved leaves are reflected.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>3. Final Verification</strong>
              <p>Review monthly attendance before payroll.</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <strong>4. Payroll Processing</strong>
              <p>Generate salary after attendance confirmation.</p>
            </div>
          </div>
        </DocCard>

        <TipBox>
          A verified attendance register significantly reduces payroll disputes.
        </TipBox>
      </DocSection>
    </>
  );
}
