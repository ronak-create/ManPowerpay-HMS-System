import DocSection from "../ui/DocSection";
import DocCard from "../ui/DocCard";
import TipBox from "../ui/TipBox";
import WarningBox from "../ui/WarningBox";
import InfoTable from "../ui/InfoTable";
import StepList from "../ui/StepList";

export default function StatutoryCompliance() {
  return (
    <>
      <DocSection
        title="Statutory Compliance"
        description="Manage mandatory payroll deductions and employee statutory compliance requirements."
      >
        <DocCard title="Module Overview">
          <p>
            Statutory compliance refers to legally required payroll deductions
            and employee contributions that organizations must manage according
            to applicable regulations.
          </p>

          <p>
            ManPowerPay HMS helps automate calculations for employee benefits,
            taxation, and government contributions during payroll processing.
          </p>

          <TipBox>
            Review statutory settings regularly to remain aligned with
            government regulation updates.
          </TipBox>
        </DocCard>
      </DocSection>

      <DocSection
        title="Provident Fund (PF)"
        description="PF helps employees build retirement savings through employer and employee contributions."
      >
        <DocCard title="PF Overview">
          <p>
            Provident Fund (PF) is a retirement savings contribution calculated
            based on employee salary structure and applicable rules.
          </p>

          <InfoTable
            headers={["Component", "Typical Rule"]}
            rows={[
              ["Employee Contribution", "Generally 12% of Basic Salary"],
              ["Employer Contribution", "Company contribution as applicable"],
              ["Eligibility", "Based on organization policy and salary rules"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Incorrect PF configuration may result in payroll discrepancies and
          compliance issues.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Employee State Insurance (ESIC)"
        description="ESIC provides medical and social security benefits to eligible employees."
      >
        <DocCard title="ESIC Overview">
          <p>
            Employee State Insurance (ESIC) is applicable for eligible employees
            depending on salary thresholds and company policies.
          </p>

          <InfoTable
            headers={["Factor", "Description"]}
            rows={[
              ["Eligibility", "Based on applicable salary threshold"],
              ["Employee Contribution", "Calculated automatically"],
              ["Employer Contribution", "Managed by organization"],
            ]}
          />
        </DocCard>

        <TipBox>
          ESIC applicability should be reviewed whenever employee salary
          changes.
        </TipBox>
      </DocSection>

      <DocSection
        title="Professional Tax (PT)"
        description="Professional Tax is a state-level payroll deduction."
      >
        <DocCard title="PT Overview">
          <p>
            Professional Tax (PT) may vary depending on state-specific
            regulations and salary slabs configured in the organization.
          </p>

          <InfoTable
            headers={["Factor", "Description"]}
            rows={[
              ["State Based", "Rules vary across regions"],
              ["Salary Slab", "Deduction based on income"],
              ["Monthly Deduction", "Automatically applied"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Ensure state-specific PT slabs are correctly configured before payroll
          generation.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Tax Deducted at Source (TDS)"
        description="TDS helps organizations manage employee income tax deductions."
      >
        <DocCard title="TDS Overview">
          <p>
            TDS is calculated based on employee income, applicable tax regime,
            and projected annual earnings.
          </p>

          <InfoTable
            headers={["Factor", "Purpose"]}
            rows={[
              ["Projected Income", "Estimated annual taxable income"],
              ["Tax Rules", "Applicable government tax slabs"],
              ["Monthly Deduction", "Spread across payroll cycle"],
            ]}
          />
        </DocCard>

        <TipBox>
          Employees should review projected income annually to reduce tax
          adjustment issues.
        </TipBox>
      </DocSection>

      <DocSection
        title="Employee Statutory Overrides"
        description="Admins can customize statutory settings for specific employees."
      >
        <DocCard title="Override Configuration">
          <p>
            In certain cases, organizations may need to customize statutory
            deductions for specific employees.
          </p>

          <StepList
            steps={[
              "Open Employee Profile.",
              "Navigate to Statutory Settings.",
              "Enable or disable PF/ESIC/PT applicability.",
              "Configure employee-specific values if required.",
              "Save settings.",
            ]}
          />
        </DocCard>

        <InfoTable
          headers={["Override Type", "Purpose"]}
          rows={[
            ["PF Exemption", "Disable PF deduction"],
            ["ESIC Override", "Modify ESIC applicability"],
            ["PT Customization", "Apply state-specific adjustment"],
            ["Projected TDS", "Custom annual tax setup"],
          ]}
        />

        <WarningBox>
          Employee overrides should be used carefully and only when officially
          approved.
        </WarningBox>
      </DocSection>

      <DocSection
        title="Compliance Workflow"
        description="Recommended compliance verification process."
      >
        <DocCard title="Suggested Process">
          <StepList
            steps={[
              "Verify employee statutory eligibility.",
              "Configure salary template deductions.",
              "Review state-specific tax rules.",
              "Apply employee overrides if necessary.",
              "Verify payroll preview.",
              "Approve payroll after compliance review.",
            ]}
          />
        </DocCard>

        <TipBox>
          Regular statutory audits reduce payroll compliance risks.
        </TipBox>
      </DocSection>

      <DocSection
        title="Common Compliance Issues"
        description="Frequent statutory problems and possible causes."
      >
        <DocCard title="Troubleshooting Examples">
          <InfoTable
            headers={["Issue", "Possible Cause"]}
            rows={[
              ["PF Not Calculated", "PF applicability disabled"],
              ["Incorrect ESIC", "Salary threshold mismatch"],
              ["Wrong PT Amount", "State slab configuration issue"],
              ["TDS Missing", "Projected income not configured"],
            ]}
          />
        </DocCard>

        <WarningBox>
          Compliance-related mistakes may affect payroll accuracy and legal
          reporting requirements.
        </WarningBox>
      </DocSection>
    </>
  );
}
