'use client';

import React from 'react';
import { DataTable } from '@/components/data-table';
import StatCard from '@/components/StatCard';
import { columns } from './column';
import { useGetAssetStatusHistoryQuery } from '@/store/api/assetsHistoryApi';
import { History, Package, Clock, ArrowRightLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function AssetStatusHistoryPage() {
  const searchParams = useSearchParams();
  const assetIdParam = searchParams.get('assetId');
  const assetId = assetIdParam ? Number(assetIdParam) : undefined;

  const { data: history = [], isLoading, isError } = useGetAssetStatusHistoryQuery(assetId);

  // Basic stats for the history page
  const stats = [
    {
      label: 'Total Changes',
      value: history.length,
      icon: History,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Assets Affected',
      value: new Set(history.map(h => h.asset.id)).size,
      icon: Package,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Recent Updates',
      value: history.filter(h => {
        const date = new Date(h.createdAt);
        const now = new Date();
        return (now.getTime() - date.getTime()) < (24 * 60 * 60 * 1000);
      }).length,
      icon: Clock,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load status history. Please ensure the API is running.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-muted/30 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Asset Status History</h1>
        <p className="text-muted-foreground">
          Track lifecycle changes and status transitions across all assets.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} title={stat.label} />
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <DataTable
          columns={columns}
          data={history}
          searchKey="asset.name"
          searchPlaceholder="Search by asset name..."
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
