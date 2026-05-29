import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";

export default function Troubleshooting() {
  return (
    <>
      <DocSection
        title="Troubleshooting"
        description="Common system issues, possible causes, and recommended solutions."
      >
        <DocCard title="Before You Begin">
          <p>
            Most issues in ManPowerPay HMS are caused by missing employee
            information, incomplete attendance, salary template mismatches, or
            permission-related access.
          </p>

          <p>
            Before escalating an issue, review the related employee profile,
            payroll setup, attendance data, and permissions.
          </p>

          <TipBox>
            Verify data completeness before reporting system issues.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Login & Access Issues"
        description="Problems related to authentication and account access."
      >
        <DocCard title="Common Login Problems">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Unable to Login",
                "Incorrect credentials",
                "Verify email and password",
              ],
              [
                "Forgot Password",
                "Password unavailable",
                "Use Forgot Password option",
              ],
              [
                "OTP Not Received",
                "Email delay or incorrect email",
                "Check spam folder or verify email",
              ],
              [
                "Access Denied",
                "Role permission issue",
                "Contact administrator",
              ],
              [
                "Inactive Account",
                "Employee status inactive",
                "Contact HR/Admin",
              ],
            ]}
          />
        </DocCard>

        <WarningBox>
          Multiple failed login attempts may temporarily restrict access.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Attendance Issues"
        description="Problems related to attendance records and payroll dependency."
      >
        <DocCard title="Attendance Problems">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Attendance Missing",
                "Attendance not entered",
                "Add missing records",
              ],
              [
                "Incorrect Attendance",
                "Wrong status selected",
                "Correct before payroll",
              ],
              [
                "Leave Not Reflected",
                "Pending approval",
                "Approve leave request",
              ],
              [
                "LWP Applied Incorrectly",
                "Attendance mismatch",
                "Verify attendance codes",
              ],
            ]}
          />
        </DocCard>

        <TipBox>
          Attendance should be finalized before payroll generation.
        </TipBox>
      </DocSection>

      <DocSection
        title="Payroll Issues"
        description="Common payroll-related problems and solutions."
      >
        <DocCard title="Payroll Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Payroll Generation Failed",
                "Missing attendance or salary template",
                "Verify employee setup",
              ],
              [
                "Employee Missing in Payroll",
                "Inactive employee or filter issue",
                "Check employee status",
              ],
              [
                "Incorrect Salary Amount",
                "Template mismatch",
                "Verify salary structure",
              ],
              [
                "Missing Deductions",
                "Compliance settings issue",
                "Review statutory setup",
              ],
              [
                "Payroll Not Locking",
                "Pending validations",
                "Review payroll errors",
              ],
            ]}
          />
        </DocCard>

        <WarningBox>
          Never lock payroll without verifying salary calculations.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Payslip Issues"
        description="Problems employees may face with payslip access."
      >
        <DocCard title="Payslip Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Payslip Missing",
                "Payroll not finalized",
                "Wait for payroll approval",
              ],
              ["Incorrect Salary", "Attendance mismatch", "Contact HR"],
              ["Download Failed", "Browser issue", "Refresh and retry"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Appointment Letter Issues"
        description="Document generation and formatting problems."
      >
        <DocCard title="Document Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Generation Failed",
                "Missing employee details",
                "Complete employee profile",
              ],
              [
                "Blank Fields",
                "Incomplete employee data",
                "Update employee information",
              ],
              [
                "Wrong Salary Details",
                "Salary template mismatch",
                "Verify salary mapping",
              ],
              [
                "Formatting Problem",
                "Template issue",
                "Review document template",
              ],
            ]}
          />
        </DocCard>

        <WarningBox>
          Missing joining date, salary information, or designation may prevent
          document generation.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Leave Management Issues"
        description="Common leave request problems."
      >
        <DocCard title="Leave Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Leave Request Rejected",
                "Insufficient balance",
                "Review leave quota",
              ],
              ["Unable to Apply Leave", "Policy restriction", "Contact HR"],
              [
                "Leave Not Visible",
                "Approval pending",
                "Wait for admin review",
              ],
              ["Attendance Not Updated", "Sync issue", "Verify leave approval"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Employee Profile Issues"
        description="Employee data and onboarding problems."
      >
        <DocCard title="Profile Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              [
                "Employee Not Visible",
                "Filter or inactive status",
                "Check employee filters",
              ],
              ["Duplicate Employee", "Repeated import", "Verify employee code"],
              [
                "Bank Details Missing",
                "Incomplete profile",
                "Update employee details",
              ],
              [
                "Profile Save Failed",
                "Required fields missing",
                "Complete mandatory fields",
              ],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="System Performance Issues"
        description="Performance-related concerns."
      >
        <DocCard title="Performance Troubleshooting">
          <InfoTable
            headers={["Issue", "Possible Cause", "Suggested Fix"]}
            rows={[
              ["Slow Loading", "Network issue", "Check internet connection"],
              ["Page Not Responding", "Temporary system issue", "Refresh page"],
              ["Export Taking Time", "Large dataset", "Wait for processing"],
            ]}
          />
        </DocCard>

        <TipBox>
          Large payroll or report exports may require additional processing
          time.
        </TipBox>
      </DocSection>

      <DocSection
        title="When to Contact Support"
        description="Situations requiring administrator or technical assistance."
      >
        <DocCard title="Escalation Cases">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Payroll generation repeatedly fails.</li>

            <li>Employee salary calculations appear incorrect.</li>

            <li>Account access remains blocked.</li>

            <li>Employee records are missing unexpectedly.</li>

            <li>Reports are generating incorrect information.</li>
          </ul>
        </DocCard>

        <TipBox>
          Include screenshots and employee details when reporting technical
          issues.
        </TipBox>
      </DocSection>
    </>
  );
}
