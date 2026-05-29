import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function ReportsMIS() {
  return (
    <>
      <DocSection
        title="Reports & MIS"
        description="Generate HR, attendance, payroll, and compliance reports for operational insights and decision-making."
      >
        <DocCard title="Module Overview">
          <p>
            The Reports & MIS module provides administrators with detailed
            workforce and payroll insights.
          </p>

          <p>
            Reports help organizations monitor attendance, employee activity,
            payroll expenses, statutory deductions, and workforce trends.
          </p>

          <TipBox>
            Regular reporting improves payroll accuracy and management
            visibility.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Accessing Reports"
        description="Admins can generate reports from the Reports & MIS section."
      >
        <DocCard title="Report Generation Workflow">
          <StepList
            steps={[
              "Navigate to Reports & MIS.",
              "Select report category.",
              "Choose filters (date, employee, department, etc.).",
              "Generate report.",
              "Review report data.",
              "Export if required.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Large reports may take additional processing time depending on data
          volume.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Attendance Reports"
        description="Track workforce attendance and absentee trends."
      >
        <DocCard title="Available Attendance Reports">
          <InfoTable
            headers={["Report", "Purpose"]}
            rows={[
              ["Attendance Register", "Daily attendance overview"],
              ["Monthly Attendance", "Monthly working summary"],
              ["Absentee Report", "Track employee absences"],
              ["LWP Report", "Leave Without Pay tracking"],
            ]}
          />
        </DocCard>

        <TipBox>
          Attendance reports should be reviewed before payroll processing.
        </TipBox>
      </DocSection>

      <DocSection
        title="Payroll Reports"
        description="Review payroll expenses and employee salary details."
      >
        <DocCard title="Available Payroll Reports">
          <InfoTable
            headers={["Report", "Purpose"]}
            rows={[
              ["Payroll Summary", "Monthly payroll totals"],
              ["Salary Register", "Employee salary breakdown"],
              ["Deduction Report", "Tax and payroll deductions"],
              ["Net Salary Report", "Final payable salary"],
              ["Bank Transfer Report", "Salary disbursement details"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Payroll reports should only be generated after payroll approval.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Employee Reports"
        description="Generate employee-related operational reports."
      >
        <DocCard title="Employee Report Types">
          <InfoTable
            headers={["Report", "Purpose"]}
            rows={[
              ["Employee Master", "Complete employee list"],
              ["Department Report", "Department-wise employees"],
              ["Joining Report", "New employee tracking"],
              ["Exit Report", "Resigned employees"],
              ["Headcount Report", "Organization employee count"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Leave Reports"
        description="Monitor employee leave activity and balances."
      >
        <DocCard title="Leave Reporting">
          <InfoTable
            headers={["Report", "Purpose"]}
            rows={[
              ["Leave Summary", "Leave usage overview"],
              ["Pending Requests", "Unapproved leaves"],
              ["Approved Leaves", "Approved leave history"],
              ["Leave Balance", "Remaining leave availability"],
            ]}
          />
        </DocCard>

        <TipBox>
          Leave reports help identify workforce availability trends.
        </TipBox>
      </DocSection>

      <DocSection
        title="Statutory & Compliance Reports"
        description="Review payroll compliance and statutory deductions."
      >
        <DocCard title="Compliance Reports">
          <InfoTable
            headers={["Report", "Purpose"]}
            rows={[
              ["PF Report", "Provident Fund contributions"],
              ["ESIC Report", "Insurance deductions"],
              ["PT Report", "Professional Tax details"],
              ["TDS Report", "Tax deduction records"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Compliance reports should be reviewed before statutory filing.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Exporting Reports"
        description="Reports can be exported for sharing and external processing."
      >
        <DocCard title="Export Process">
          <StepList
            steps={[
              "Generate required report.",
              "Review report details.",
              "Click Export.",
              "Choose preferred format.",
              "Download generated file.",
            ]}
          />
        </DocCard>

        <DocCard title="Supported Export Types">
          <InfoTable
            headers={["Format", "Usage"]}
            rows={[
              ["Excel", "Further analysis"],
              ["CSV", "Bank or system upload"],
              ["PDF", "Official reporting"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Management Insights"
        description="Reports help leadership make informed decisions."
      >
        <DocCard title="Business Benefits">
          <InfoTable
            headers={["Area", "Insight"]}
            rows={[
              ["Payroll Cost", "Salary expense trends"],
              ["Attendance", "Employee availability"],
              ["Leaves", "Workforce planning"],
              ["Attrition", "Resignation trends"],
              ["Compliance", "Statutory monitoring"],
            ]}
          />
        </DocCard>

        <TipBox>
          Regular reporting improves workforce planning and payroll visibility.
        </TipBox>
      </DocSection>

      <DocSection
        title="Best Practices"
        description="Recommended reporting workflow."
      >
        <DocCard title="Suggestions">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Verify filters before generating reports.</li>

            <li>Review attendance reports monthly.</li>

            <li>Export payroll reports after approval.</li>

            <li>Maintain copies of compliance reports.</li>

            <li>Use MIS reports for workforce planning.</li>
          </ul>
        </DocCard>

        <TipBox>
          Monthly reporting helps identify operational issues early.
        </TipBox>
      </DocSection>
    </>
  );
}
