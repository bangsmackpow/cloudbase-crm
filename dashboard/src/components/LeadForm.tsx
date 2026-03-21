// dashboard/src/components/LeadForm.tsx
export function LeadForm({ flavorConfig, leadData }) {
  return (
    <form>
      {/* Standard Fields */}
      <input name="company_name" defaultValue={leadData.name} />
      
      {/* Dynamic Flavor-Specific Fields */}
      {flavorConfig.custom_fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          <input type={field.type} name={field.name} />
        </div>
      ))}
    </form>
  );
}