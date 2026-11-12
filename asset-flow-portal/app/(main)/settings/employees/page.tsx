"use client";

import { useMemo, useState } from "react";
import { EntityManager } from "@/components/entity-manager";
import { columns } from "./column";
import { getFormFields } from "./form-fields";
import { Users, UserPlus, KeyRound } from "lucide-react";
import { 
  useGetEmployeesQuery, 
  useCreateEmployeeMutation, 
  useUpdateEmployeeMutation, 
  useDeleteEmployeeMutation 
} from "@/store/api/employeeApi";
import { useResetPasswordMutation, useUpgradeEmployeeMutation } from "@/store/api/userApi";
import { toast } from "sonner";
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/auth/authSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/store/api/employeeApi';
import type { Row } from '@tanstack/react-table';
import { Button } from "@/components/ui/button";

function message(error: unknown, fallback: string) { const text = (error as { data?: { message?: string | string[] } })?.data?.message; return Array.isArray(text) ? text.join(', ') : text || fallback; }

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useGetEmployeesQuery();
  
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [upgradeEmployee, { reset: clearUpgrade }] = useUpgradeEmployeeMutation();

  const formFields = useMemo(() => getFormFields(), []);

  const [resetPassword, { reset: clearReset }] = useResetPasswordMutation();
  const [pending, setPending] = useState<number | null>(null);
  const [credential, setCredential] = useState<{ name: string; password: string } | null>(null);
  const canManage = useAppSelector(selectCurrentUser)?.canManageAccounts === true;
  const handleUpgrade = async (employee: Employee) => {
    if (pending !== null) return;
    const resetting = !!employee.userAccount;
    if (!confirm(`${resetting ? 'Reset the password for' : 'Create a login account for'} ${employee.firstName} ${employee.lastName}? A unique temporary password will be shown once and expires in 24 hours.`)) return;
    setPending(employee.id);
    try {
      const result = employee.userAccount ? await resetPassword(employee.userAccount.id).unwrap() : await upgradeEmployee({ employeeId: employee.id, data: {} }).unwrap();
      setCredential({ name: `${employee.firstName} ${employee.lastName}`, password: result.temporaryPassword });
      toast.success(resetting ? 'Password reset successfully' : 'Employee upgraded successfully');
    } catch (err: unknown) { toast.error(message(err, 'Account action failed')); }
    finally { clearUpgrade(); clearReset(); setPending(null); }
  };

  const stats = [
    {
      label: "Total Employees",
      value: employees.length,
      icon: Users,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Active",
      value: employees.filter(e => e.status?.toLowerCase() === "active").length,
      icon: Users,
      color: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  const handleCreate = async (data: CreateEmployeeDto) => {
    try {
      await createEmployee(data).unwrap();
      toast.success("Employee created successfully");
    } catch (err: unknown) {
      toast.error(message(err, "Failed to create employee"));
    }
  };

  const handleUpdate = async (id: string | number, data: UpdateEmployeeDto) => {
    try {
      await updateEmployee({ id: Number(id), data }).unwrap();
      toast.success("Employee updated successfully");
    } catch (err: unknown) {
      toast.error(message(err, "Failed to update employee"));
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteEmployee(Number(id)).unwrap();
      toast.success("Employee deleted successfully");
    } catch (err: unknown) {
      toast.error(message(err, "Failed to delete employee"));
    }
  };

  return (
    <>
    <EntityManager
      entityName="Employee"
      entityNamePlural="Employees"
      data={employees}
      searchKey="firstName"
      columns={columns.map(col => 'accessorKey' in col && col.accessorKey === 'firstName' ? { ...col, filterFn: (row: Row<Employee>, _id: string, query: string) => `${row.original.firstName} ${row.original.lastName} ${row.original.email || ''} ${row.original.position || ''}`.toLowerCase().includes(query.trim().toLowerCase()) } : col)}
      formFields={formFields}
      keyExtractor={(item) => item.id}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      stats={stats}
      isLoading={isLoading}
      searchPlaceholder="Search employees..."
      extraActions={(item) => (
        <Button
          disabled={!canManage || pending !== null || item.accountLinkNeedsReview}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleUpgrade(item);
          }}
        >
          {item.userAccount ? <KeyRound className="h-4 w-4 mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
          {item.accountLinkNeedsReview ? "Account link needs review" : pending === item.id ? "Workingâ€¦" : item.userAccount ? "Reset Password" : "Upgrade"}
        </Button>
      )}
    />
    <Dialog open={!!credential} onOpenChange={open => { if (!open) setCredential(null); }}><DialogContent><DialogHeader><DialogTitle>Temporary password</DialogTitle><DialogDescription>{credential?.name} must change this password on their next sign-in. It expires in 24 hours and is shown only here.</DialogDescription></DialogHeader><code className="break-all select-all">{credential?.password}</code><Button onClick={async () => { try { await navigator.clipboard.writeText(credential?.password || ''); toast.success('Copied'); } catch { toast.error('Select and copy the password manually'); } }}>Copy password</Button><Button variant="outline" onClick={() => setCredential(null)}>Close</Button></DialogContent></Dialog>
    </>
  );
}
