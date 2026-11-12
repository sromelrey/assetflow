"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Employee } from "@/store/api/employeeApi";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <span className="font-medium">{row.original.firstName}</span>,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <span className="font-medium">{row.original.lastName}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email || <span className="text-muted-foreground italic">No email</span>,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => row.original.position || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    accessorFn: employee => employee.status?.trim().toLowerCase() || undefined,
    sortUndefined: 'last',
    sortingFn: (a, b) => (a.original.status || '').toLowerCase().localeCompare((b.original.status || '').toLowerCase()) || a.original.lastName.localeCompare(b.original.lastName) || a.original.firstName.localeCompare(b.original.firstName) || a.original.id - b.original.id,
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
      const variant = status === "active" ? "default" : "secondary";
      return (
        <Badge variant={variant} className="capitalize">
          {status || "Unknown"}
        </Badge>
      );
    },
  },
];
