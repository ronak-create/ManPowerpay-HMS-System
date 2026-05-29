import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function EmployeePortal() {
  return (
    <>
      <DocSection
        title="Employee Portal"
        description="The Employee Portal allows employees to access personal HR information, payslips, attendance, leave requests, and important documents."
      >
        <DocCard title="Portal Overview">
          <p>
            The Employee Portal is designed to provide employees with
            self-service access to HR-related information.
          </p>

          <p>
            Employees can view attendance, download payslips, manage leave,
            update profile details, and track resignation requests.
          </p>

          <TipBox>
            Employees should regularly review their profile and payslip
            information for accuracy.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Employee Dashboard"
        description="The dashboard provides a quick overview of employee activity."
      >
        <DocCard title="Dashboard Features">
          <InfoTable
            headers={["Feature", "Purpose"]}
            rows={[
              ["Profile Summary", "Basic employee information"],
              ["Attendance Overview", "Track attendance records"],
              ["Leave Status", "Monitor leave requests"],
              ["Payslips", "Quick salary access"],
              ["Notifications", "Important updates"],
            ]}
          />
        </DocCard>

        <TipBox>
          The dashboard is the fastest way to track HR-related updates.
        </TipBox>
      </DocSection>

      <DocSection
        title="Managing Employee Profile"
        description="Employees can view and maintain personal profile information."
      >
        <DocCard title="Profile Information">
          <InfoTable
            headers={["Section", "Examples"]}
            rows={[
              ["Personal Information", "Name, contact details, address"],
              ["Employment Details", "Department, designation, joining date"],
              ["Bank Details", "Salary account information"],
              ["Emergency Contact", "Emergency phone details"],
              ["Documents", "Uploaded employee records"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect bank information may affect salary processing.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Attendance Records"
        description="Employees can review attendance information."
      >
        <DocCard title="Attendance Access">
          <StepList
            steps={[
              "Login to employee portal.",
              "Navigate to Attendance.",
              "Select date range.",
              "Review attendance records.",
              "Report discrepancies to HR if needed.",
            ]}
          />
        </DocCard>

        <InfoTable
          headers={["Attendance Type", "Meaning"]}
          rows={[
            ["P", "Present"],
            ["A", "Absent"],
            ["PL", "Paid Leave"],
            ["SL", "Sick Leave"],
            ["WO", "Week Off"],
            ["HO", "Holiday"],
            ["LWP", "Leave Without Pay"],
          ]}
        />
      </DocSection>

      <DocSection
        title="Payslip Access"
        description="Employees can download salary slips after payroll processing."
      >
        <DocCard title="Downloading Payslips">
          <StepList
            steps={[
              "Open Employee Portal.",
              "Navigate to Payslips.",
              "Select payroll month.",
              "Review salary details.",
              "Download payslip PDF.",
            ]}
          />
        </DocCard>

        <DocCard title="Payslip Includes">
          <InfoTable
            headers={["Information", "Description"]}
            rows={[
              ["Gross Salary", "Total earnings"],
              ["Deductions", "Tax and payroll deductions"],
              ["Net Salary", "Final payable amount"],
              ["Attendance Summary", "Working day calculation"],
            ]}
          />
        </DocCard>

        <TipBox>
          Keep monthly payslips for tax, loans, and financial verification.
        </TipBox>
      </DocSection>

      <DocSection
        title="Leave Management"
        description="Employees can apply for and track leave requests."
      >
        <DocCard title="Applying for Leave">
          <StepList
            steps={[
              "Go to Leave Management.",
              "Click Apply Leave.",
              "Choose leave type.",
              "Select dates.",
              "Provide reason.",
              "Submit request.",
            ]}
          />
        </DocCard>

        <InfoTable
          headers={["Status", "Meaning"]}
          rows={[
            ["Pending", "Waiting for approval"],
            ["Approved", "Leave accepted"],
            ["Rejected", "Leave denied"],
          ]}
        />
      </DocSection>

      <DocSection
        title="Resignation Management"
        description="Employees can submit resignation requests directly from the portal."
      >
        <DocCard title="Resignation Workflow">
          <StepList
            steps={[
              "Navigate to Resignation.",
              "Enter resignation reason.",
              "Choose Last Working Date.",
              "Submit request.",
              "Track approval status.",
            ]}
          />
        </DocCard>

        <WarningBox>
          Approved resignations may still allow temporary access until final
          exit processing.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Documents & Downloads"
        description="Employees can access important HR documents."
      >
        <DocCard title="Available Documents">
          <InfoTable
            headers={["Document", "Purpose"]}
            rows={[
              ["Payslips", "Monthly salary records"],
              ["Appointment Letter", "Employment proof"],
              ["ID Card", "Employee identity"],
              ["Tax Documents", "Financial compliance"],
            ]}
          />
        </DocCard>

        <TipBox>
          Download important documents regularly for personal records.
        </TipBox>
      </DocSection>

      <DocSection
        title="Best Practices"
        description="Recommendations for employees using the portal."
      >
        <DocCard title="Suggested Guidelines">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Keep profile details updated.</li>

            <li>Review attendance regularly.</li>

            <li>Download payslips monthly.</li>

            <li>Apply for leave in advance.</li>

            <li>Notify HR of any discrepancies.</li>
          </ul>
        </DocCard>

        <TipBox>
          Regular portal usage helps avoid payroll and attendance confusion.
        </TipBox>
      </DocSection>
    </>
  );
}
