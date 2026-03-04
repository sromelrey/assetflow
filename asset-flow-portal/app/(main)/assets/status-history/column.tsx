'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { AssetStatusLog } from '@/store/api/assetsHistoryApi';

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Deployed: 'bg-blue-100 text-blue-700 border-blue-200',
  Decommissioned: 'bg-red-100 text-red-700 border-red-200',
  'For Repair': 'bg-amber-100 text-amber-700 border-amber-200',
  'For Deployment': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'In Storage': 'bg-slate-100 text-slate-700 border-slate-200',
};

export const columns: ColumnDef<AssetStatusLog>[] = [
  {
    header: 'Asset Name',
    accessorKey: 'asset.name',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex flex-col text-left">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{item.asset.name}</span>
          <span className="text-xs text-gray-500">{item.asset.assetNo || 'No Asset No.'}</span>
        </div>
      );
    },
  },
  {
    header: 'Old Status',
    accessorKey: 'oldStatus',
    cell: ({ row }) => {
      const value = row.original.oldStatus;
      return (
        <Badge variant="outline" className={STATUS_COLORS[value] || ''}>
          {value}
        </Badge>
      );
    },
  },
  {
    header: 'New Status',
    accessorKey: 'newStatus',
    cell: ({ row }) => {
      const value = row.original.newStatus;
      return (
        <Badge variant="outline" className={STATUS_COLORS[value] || ''}>
          {value}
        </Badge>
      );
    },
  },
  {
    header: 'Remarks',
    accessorKey: 'remarks',
    cell: ({ row }) => {
      const value = row.original.remarks;
      return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || <span className="italic text-gray-400">No remarks</span>}
        </span>
      );
    },
  },
  {
    header: 'Changed By',
    accessorKey: 'changedBy',
    cell: ({ row }) => {
      const user = row.original.changedBy;
      if (!user) return <span className="text-sm text-muted-foreground">System</span>;
      
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.name;
        
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium">{fullName}</span>
          <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 bg-muted/50 text-muted-foreground border-transparent">
            User ID: {user.id}
          </Badge>
        </div>
      );
    },
  },
  {
    header: 'Changed At',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-right">
          <div className="text-sm font-medium">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">
            {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    },
  },
];
