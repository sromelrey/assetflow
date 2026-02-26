'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { AssetDetailsCard } from '@/components/AssetDetailsCard';
import { columns } from './columns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetAssetsQuery, Asset } from '@/store/api/assetsApi';

import { AddAssetModal } from './AddAssetModal';

export default function AssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // Temporarily relying on default pagination structure.
  // The 'limit: 50' fetches up to 50 items.
  const { data: assets = [], isLoading, isError } = useGetAssetsQuery({});

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your organization's assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddAssetModal />
        </div>
      </div>

      {/* Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Table Section */}
        <div className="bg-card rounded-lg shadow-sm border p-6">
          {isLoading ? (
             <div className="p-8 text-center text-muted-foreground">Loading assets...</div>
          ) : isError ? (
             <div className="p-8 text-center text-destructive">Failed to load assets. Please try again.</div>
          ) : (
            <DataTable 
              columns={columns} 
              data={assets}
              searchKey="name"
              searchPlaceholder="Search assets by name..."
              onRowClick={setSelectedAsset}
              selectedRowId={selectedAsset?.id?.toString()}
            />
          )}
        </div>
        
        {/* Card Section - Sticky on desktop */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <AssetDetailsCard 
            asset={(assets.find(a => a.id === selectedAsset?.id) || selectedAsset) as any}
            onClose={() => setSelectedAsset(null)}
          />
        </div>
      </div>
    </div>
  );
}
