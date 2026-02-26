"use client";

import { useMemo } from "react";
import { EntityManager } from "@/components/entity-manager";
import { columns } from "./column";
import { getFormFields } from "./form-fields";
import { Users } from "lucide-react";
import { 
  useGetEmployeesQuery, 
  useCreateEmployeeMutation, 
  useUpdateEmployeeMutation, 
  useDeleteEmployeeMutation 
} from "@/store/api/employeeApi";
import { toast } from "sonner";

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useGetEmployeesQuery();
  
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const formFields = useMemo(() => getFormFields(), []);

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

  const handleCreate = async (data: any) => {
    try {
      await createEmployee(data).unwrap();
      toast.success("Employee created successfully");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to create employee");
    }
  };

  const handleUpdate = async (id: string | number, data: any) => {
    try {
      await updateEmployee({ id: Number(id), data }).unwrap();
      toast.success("Employee updated successfully");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to update employee");
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteEmployee(Number(id)).unwrap();
      toast.success("Employee deleted successfully");
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to delete employee");
    }
  };

  return (
    <EntityManager
      entityName="Employee"
      entityNamePlural="Employees"
      data={employees}
      columns={columns}
      formFields={formFields}
      keyExtractor={(item) => item.id}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      stats={stats}
      isLoading={isLoading}
      searchPlaceholder="Search employees..."
    />
  );
}
