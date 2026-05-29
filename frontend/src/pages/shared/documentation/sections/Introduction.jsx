import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import TipBox from "../ui/TipBox";
import InfoTable from "../ui/InfoTable";

export default function Introduction() {
  return (
    <>
      <DocSection
        title="Welcome to ManPowerPay HMS"
        description="A complete Human Resource Management and Payroll platform designed to streamline employee management, attendance, payroll, compliance, and organizational operations."
      >
        <DocCard title="What is ManPowerPay HMS?">
          <p>
            ManPowerPay HMS is an integrated Human Management System (HMS) built
            to help organizations manage employees from onboarding to exit — all
            from a centralized platform.
          </p>

          <p>
            The system combines HR operations, payroll processing, employee
            self-service, attendance, statutory compliance, reporting, and audit
            tracking into a single secure environment.
          </p>

          <p>
            Whether you are an HR executive, payroll manager, administrator, or
            employee, the platform provides tools tailored specifically for your
            role.
          </p>
        </DocCard>

        <TipBox>
          ManPowerPay HMS works best when attendance, leave approvals, and
          employee data are updated regularly before payroll generation.
        </TipBox>
      </DocSection>

      <DocSection
        title="System Purpose"
        description="The platform is designed to simplify workforce management while reducing manual work and payroll errors."
      >
        <DocCard title="Core Objectives">
          <InfoTable
            headers={["Objective", "Description"]}
            rows={[
              [
                "Employee Management",
                "Centralize employee records, profiles, and employment information.",
              ],
              [
                "Payroll Automation",
                "Reduce manual payroll work using salary templates and attendance-based calculations.",
              ],
              [
                "Attendance Tracking",
                "Maintain accurate daily attendance records for salary processing.",
              ],
              [
                "Leave Management",
                "Allow employees to apply for leave with approval workflows.",
              ],
              [
                "Compliance",
                "Automate EPF, ESIC, PT, and taxation calculations.",
              ],
              [
                "Reporting",
                "Generate HR and payroll reports for management and audits.",
              ],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="Who Should Use This Platform?"
        description="Different modules are designed for different users within the organization."
      >
        <DocCard title="User Roles">
          <InfoTable
            headers={["Role", "Access Level"]}
            rows={[
              [
                "Administrator",
                "Full access to employee management, payroll, reports, settings, and compliance.",
              ],
              [
                "HR Executive",
                "Manage employee records, attendance, leave approvals, and HR operations.",
              ],
              [
                "Payroll Manager",
                "Handle salary templates, payroll processing, and statutory deductions.",
              ],
              [
                "Employee",
                "Access personal profile, payslips, leave requests, and resignation management.",
              ],
            ]}
          />
        </DocCard>
      </DocSection>

      <DocSection
        title="How the System Works"
        description="Understanding the overall workflow helps ensure accurate HR and payroll management."
      >
        <DocCard title="Employee Lifecycle Workflow">
          <div className="space-y-4 text-sm text-zinc-700 leading-7">
            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
              <strong>1. Employee Onboarding</strong>
              <p>
                Add employees manually or through bulk upload and assign salary
                templates.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
              <strong>2. Attendance & Leave</strong>
              <p>
                Daily attendance and leave requests are recorded throughout the
                month.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
              <strong>3. Payroll Processing</strong>
              <p>
                Salary is calculated using attendance, salary templates,
                deductions, bonuses, and compliance rules.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
              <strong>4. Payslip Generation</strong>
              <p>
                Employees receive downloadable payslips after payroll approval.
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
              <strong>5. Reports & Audit</strong>
              <p>
                HR and payroll reports are generated for compliance, audits, and
                decision-making.
              </p>
            </div>
          </div>
        </DocCard>
      </DocSection>

      <DocSection
        title="Recommended Workflow"
        description="Following the recommended process ensures accurate payroll and compliance."
      >
        <DocCard title="Best Practice Sequence">
          <ol className="list-decimal pl-5 space-y-3 text-sm text-zinc-700">
            <li>Create employee profiles correctly.</li>

            <li>Assign salary templates immediately.</li>

            <li>Maintain attendance daily.</li>

            <li>Review and approve leave requests.</li>

            <li>Verify payroll inputs before running payroll.</li>

            <li>Lock payroll only after verification.</li>

            <li>Generate reports for records and compliance.</li>
          </ol>
        </DocCard>

        <TipBox>
          Most payroll issues happen due to missing attendance or unassigned
          salary templates.
        </TipBox>
      </DocSection>
    </>
  );
}
