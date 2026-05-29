import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import StepList from "../ui/StepList";
import WarningBox from "../ui/WarningBox";
import TipBox from "../ui/TipBox";
import InfoTable from "../ui/InfoTable";

export default function AccessSecurity() {
  return (
    <>
      <DocSection
        title="Access & Security"
        description="Learn how to securely access the platform, recover accounts, and understand permission-based access."
      >
        <DocCard title="Secure Platform Access">
          <p>
            ManPowerPay HMS uses secure authentication systems to ensure
            employee and company data remains protected.
          </p>

          <p>
            Every user receives role-based access, meaning employees and
            administrators only see features relevant to their permissions.
          </p>

          <TipBox>
            Never share your login credentials with anyone, including coworkers.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Logging Into the System"
        description="All users must log in using their registered credentials."
      >
        <DocCard title="Login Steps">
          <StepList
            steps={[
              "Open the HMS login page.",
              "Enter your registered email address.",
              "Enter your password.",
              "Click the Login button.",
              "You will be redirected to your dashboard based on your assigned role.",
            ]}
          />
        </DocCard>

        <DocCard title="Login Requirements">
          <InfoTable
            headers={["Requirement", "Description"]}
            rows={[
              [
                "Registered Email",
                "Must match the email assigned by HR or Admin.",
              ],
              ["Password", "Must be your current valid password."],
              [
                "Internet Access",
                "A stable internet connection is recommended.",
              ],
              ["Role Access", "Permissions depend on your assigned role."],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Forgot Password & Account Recovery"
        description="Users can securely reset passwords using OTP verification."
      >
        <DocCard title="Password Reset Workflow">
          <StepList
            steps={[
              'Click "Forgot Password" on the login page.',
              "Enter your registered email address.",
              "Receive a One-Time Password (OTP) in your email.",
              "Enter the OTP for verification.",
              "Create a new password.",
              "Login again using your new credentials.",
            ]}
          />
        </DocCard>

        <WarningBox>
          OTP codes expire after a limited time. If expired, request a new OTP.
        </WarningBox>

        <DocCard title="Password Requirements">
          <InfoTable
            headers={["Requirement", "Recommendation"]}
            rows={[
              ["Minimum Length", "At least 8 characters"],
              [
                "Strong Password",
                "Use uppercase, lowercase, numbers, and symbols",
              ],
              ["Password Sharing", "Never share passwords with others"],
              ["Reuse", "Avoid using old passwords repeatedly"],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Role-Based Access Control"
        description="The system uses permission-based access to protect sensitive information."
      >
        <DocCard title="User Permissions">
          <InfoTable
            headers={["Role", "Access Permissions"]}
            rows={[
              [
                "Admin",
                "Full access to employee management, payroll, attendance, reports, settings, and compliance.",
              ],
              [
                "HR Manager",
                "Manage employees, attendance, leave, onboarding, and HR operations.",
              ],
              [
                "Payroll Manager",
                "Access payroll, salary templates, deductions, and statutory settings.",
              ],
              [
                "Employee",
                "View personal profile, payslips, leave requests, attendance, and resignation.",
              ],
            ]}
          />
        </DocCard>

        <WarningBox>
          Employees cannot access payroll data of other employees.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Session Security"
        description="To protect organizational data, the system monitors active sessions."
      >
        <DocCard title="Automatic Session Protection">
          <p>
            Users may be automatically logged out after inactivity for security
            reasons.
          </p>

          <p>
            This helps prevent unauthorized access when devices are left
            unattended.
          </p>

          <InfoTable
            headers={["Security Feature", "Purpose"]}
            rows={[
              [
                "JWT Authentication",
                "Protects secure access between client and server",
              ],
              ["Role Permissions", "Restricts unauthorized module access"],
              ["Session Timeout", "Prevents unattended account misuse"],
              [
                "Secure Password Reset",
                "Protects against unauthorized account recovery",
              ],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Security Best Practices"
        description="Follow these practices to keep accounts safe."
      >
        <DocCard title="Recommended Guidelines">
          <ul className="space-y-3 text-sm text-zinc-700 leading-7 list-disc pl-5">
            <li>Always log out after completing work.</li>

            <li>Avoid logging in on public devices.</li>

            <li>Keep passwords private and updated.</li>

            <li>Report suspicious login activity to HR or Admin.</li>

            <li>Avoid saving passwords in shared browsers.</li>
          </ul>
        </DocCard>

        <TipBox>
          Using a strong password significantly reduces the risk of unauthorized
          access.
        </TipBox>
      </DocSection>
    </>
  );
}
