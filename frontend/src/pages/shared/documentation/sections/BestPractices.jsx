import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";

export default function BestPractices() {
  return (
    <>
      <DocSection
        title="Best Practices"
        description="Recommended guidelines for maintaining smooth HR, attendance, payroll, and employee management operations."
      >
        <DocCard title="Why Best Practices Matter">
          <p>
            Following recommended workflows helps organizations avoid payroll
            disputes, attendance errors, compliance issues, and operational
            confusion.
          </p>

          <p>
            Consistent data maintenance improves payroll accuracy, reporting
            quality, and employee satisfaction.
          </p>

          <TipBox>
            Small operational mistakes often become major payroll problems
            later.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="HR & Employee Management Best Practices"
        description="Guidelines for maintaining accurate employee records."
      >
        <DocCard title="Recommended HR Workflow">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Complete employee profiles during onboarding.</li>

            <li>Verify employee codes before creation.</li>

            <li>Assign salary templates immediately.</li>

            <li>Maintain updated bank and statutory details.</li>

            <li>Regularly review inactive employees.</li>

            <li>Use bulk upload templates carefully.</li>
          </ul>
        </DocCard>

        <WarningBox>
          Missing employee details may affect payroll, documents, and compliance
          calculations.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Attendance Management Best Practices"
        description="Improve payroll accuracy through proper attendance handling."
      >
        <DocCard title="Attendance Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Mark attendance daily.</li>

            <li>Verify half-day and absent entries carefully.</li>

            <li>Approve leave requests before payroll.</li>

            <li>Review attendance reports monthly.</li>

            <li>Correct attendance before payroll processing.</li>
          </ul>
        </DocCard>

        <TipBox>
          Attendance should always be finalized before generating payroll.
        </TipBox>
      </DocSection>

      <DocSection
        title="Payroll Best Practices"
        description="Recommended workflow for smooth salary processing."
      >
        <DocCard title="Payroll Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Verify attendance before payroll generation.</li>

            <li>Review leave approvals monthly.</li>

            <li>Confirm salary templates are assigned.</li>

            <li>Review statutory deductions carefully.</li>

            <li>Validate payroll preview before approval.</li>

            <li>Lock payroll only after final verification.</li>
          </ul>
        </DocCard>

        <WarningBox>
          Locked payroll should be treated as final and carefully reviewed.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Compliance Best Practices"
        description="Maintain payroll and statutory compliance."
      >
        <DocCard title="Compliance Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Review PF and ESIC applicability regularly.</li>

            <li>Verify Professional Tax settings annually.</li>

            <li>Review TDS projections every financial year.</li>

            <li>Maintain statutory reports securely.</li>

            <li>Audit payroll deductions periodically.</li>
          </ul>
        </DocCard>

        <TipBox>
          Small compliance errors can become costly during audits.
        </TipBox>
      </DocSection>

      <DocSection
        title="Employee Self-Service Best Practices"
        description="Recommendations for employees using the portal."
      >
        <DocCard title="Employee Guidelines">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Review attendance regularly.</li>

            <li>Download payslips monthly.</li>

            <li>Apply leave in advance whenever possible.</li>

            <li>Keep profile information updated.</li>

            <li>Report payroll discrepancies quickly.</li>
          </ul>
        </DocCard>

        <TipBox>
          Employees who regularly review their records face fewer payroll
          issues.
        </TipBox>
      </DocSection>

      <DocSection
        title="Security Best Practices"
        description="Protect employee and organization data."
      >
        <DocCard title="Security Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Never share login credentials.</li>

            <li>Use strong passwords.</li>

            <li>Log out after completing work.</li>

            <li>Avoid public/shared devices.</li>

            <li>Restrict admin access to trusted users.</li>
          </ul>
        </DocCard>

        <WarningBox>
          Sensitive payroll and employee information should only be accessed by
          authorized personnel.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Reporting Best Practices"
        description="Improve operational visibility through reporting."
      >
        <DocCard title="Reporting Recommendations">
          <ul className="list-disc pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Review attendance reports monthly.</li>

            <li>Export payroll reports after approval.</li>

            <li>Store compliance reports securely.</li>

            <li>Use MIS reports for workforce planning.</li>

            <li>Review audit logs periodically.</li>
          </ul>
        </DocCard>

        <TipBox>
          Monthly reporting helps identify issues before they affect payroll.
        </TipBox>
      </DocSection>

      <DocSection
        title="Final Recommendations"
        description="General recommendations for successful platform usage."
      >
        <DocCard title="Suggested Operational Workflow">
          <ol className="list-decimal pl-5 space-y-3 text-sm text-zinc-700 leading-7">
            <li>Onboard employees correctly.</li>

            <li>Maintain daily attendance.</li>

            <li>Process leave requests regularly.</li>

            <li>Verify payroll inputs monthly.</li>

            <li>Review reports and compliance.</li>

            <li>Audit sensitive changes periodically.</li>
          </ol>
        </DocCard>

        <TipBox>
          Consistency is the biggest factor behind accurate HR and payroll
          operations.
        </TipBox>
      </DocSection>
    </>
  );
}
