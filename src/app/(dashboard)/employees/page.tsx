import { getEmployees } from "@/lib/data";
import { EmployeesTable } from "@/components/EmployeesTable";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-cream-50">Employees</h2>
        <p className="text-sm text-cream-400">
          {employees.length === 1 ? "1 employee" : `${employees.length} employees`} being tracked.
        </p>
      </div>
      <EmployeesTable employees={employees} />
    </div>
  );
}
