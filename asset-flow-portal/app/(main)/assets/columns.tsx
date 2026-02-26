import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Asset, AssetStatus } from "@/store/api/assetsApi"

const StatusBadge = ({ status }: { status: Asset["status"] }) => {
  const colors: Record<AssetStatus, string> = {
    Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Decommissioned: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    Deployed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    "For Repair": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    "For Deployment": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    "In Storage": "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      {status}
    </span>
  )
}

export const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "assetNo",
    header: "Asset No",
    cell: ({ row }) => <div className="font-medium">{row.getValue("assetNo") || "-"}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "category",
    accessorFn: (row) => row.category?.name,
    header: "Category",
    cell: ({ row }) => row.original.category?.name || <span className="text-gray-400 italic">-</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "unit",
    accessorFn: (row) => row.unit?.name,
    header: "Unit",
    cell: ({ row }) => row.original.unit?.name || <span className="text-gray-400 italic">-</span>,
  },
  {
    accessorKey: "purchaseDate",
    header: "Purchase Date",
    cell: ({ row }) => {
      const dateVal = row.getValue("purchaseDate") as string;
      if (!dateVal) return <span className="text-gray-400 italic">-</span>;
      const date = new Date(dateVal)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const asset = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(asset.id.toString())}
            >
              Copy asset ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit asset</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400">
              Delete asset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
