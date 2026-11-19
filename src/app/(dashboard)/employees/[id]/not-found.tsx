import Link from "next/link";
import { UserX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";

export default function EmployeeNotFound() {
  return (
    <Card>
      <EmptyState
        icon={UserX}
        title="Employee not found"
        description="This employee doesn't exist or you don't have access to their activity."
        action={
          <Link href="/employees" className="text-sm font-medium text-brand-300 hover:text-brand-200">
            Back to employees
          </Link>
        }
      />
    </Card>
  );
}
