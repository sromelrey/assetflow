'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/data-table';
import { AssetDetailsCard } from '@/components/AssetDetailsCard';
import { columns, Asset } from './columns';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample mock data
const mockAssets: Asset[] = [
  {
    id: "1",
    assetTag: "LAP-001",
    name: "Dell XPS 15",
    category: "Laptop",
    status: "Active",
    assignedTo: "John Doe",
    location: "Office - Floor 3",
    acquisitionDate: "2023-01-15",
  },
  {
    id: "2",
    assetTag: "MON-045",
    name: "LG UltraWide 34\"",
    category: "Monitor",
    status: "Active",
    assignedTo: "Jane Smith",
    location: "Office - Floor 2",
    acquisitionDate: "2023-03-22",
  },
  {
    id: "3",
    assetTag: "LAP-012",
    name: "MacBook Pro 16\"",
    category: "Laptop",
    status: "Under Maintenance",
    assignedTo: null,
    location: "IT Department",
    acquisitionDate: "2022-11-08",
  },
  {
    id: "4",
    assetTag: "PHN-089",
    name: "iPhone 14 Pro",
    category: "Phone",
    status: "Active",
    assignedTo: "Mike Johnson",
    location: "Remote",
    acquisitionDate: "2023-09-12",
  },
  {
    id: "5",
    assetTag: "SRV-003",
    name: "Dell PowerEdge R740",
    category: "Server",
    status: "Active",
    assignedTo: null,
    location: "Data Center - Rack 5",
    acquisitionDate: "2021-06-30",
  },
  {
    id: "6",
    assetTag: "PRT-021",
    name: "HP LaserJet Pro",
    category: "Printer",
    status: "Active",
    assignedTo: null,
    location: "Office - Floor 1",
    acquisitionDate: "2022-04-18",
  },
  {
    id: "7",
    assetTag: "LAP-025",
    name: "Lenovo ThinkPad X1",
    category: "Laptop",
    status: "Retired",
    assignedTo: null,
    location: "Storage",
    acquisitionDate: "2019-02-14",
  },
  {
    id: "8",
    assetTag: "MON-067",
    name: "Samsung 27\" 4K",
    category: "Monitor",
    status: "Active",
    assignedTo: "Sarah Williams",
    location: "Office - Floor 3",
    acquisitionDate: "2023-05-10",
  },
  {
    id: "9",
    assetTag: "PHN-102",
    name: "Samsung Galaxy S23",
    category: "Phone",
    status: "Active",
    assignedTo: "David Brown",
    location: "Remote",
    acquisitionDate: "2023-07-25",
  },
  {
    id: "10",
    assetTag: "LAP-033",
    name: "HP EliteBook 840",
    category: "Laptop",
    status: "Active",
    assignedTo: "Emily Davis",
    location: "Office - Floor 2",
    acquisitionDate: "2023-02-28",
  },
  {
    id: "11",
    assetTag: "MON-078",
    name: "Dell UltraSharp 27\"",
    category: "Monitor",
    status: "Under Maintenance",
    assignedTo: null,
    location: "IT Department",
    acquisitionDate: "2022-08-15",
  },
  {
    id: "12",
    assetTag: "SRV-007",
    name: "HPE ProLiant DL380",
    category: "Server",
    status: "Active",
    assignedTo: null,
    location: "Data Center - Rack 3",
    acquisitionDate: "2022-01-20",
  },
  {
    id: "13",
    assetTag: "PRT-034",
    name: "Canon ImageCLASS",
    category: "Printer",
    status: "Active",
    assignedTo: null,
    location: "Office - Floor 4",
    acquisitionDate: "2023-06-05",
  },
  {
    id: "14",
    assetTag: "LAP-041",
    name: "ASUS ROG Zephyrus",
    category: "Laptop",
    status: "Active",
    assignedTo: "Chris Anderson",
    location: "Office - Floor 1",
    acquisitionDate: "2023-10-12",
  },
  {
    id: "15",
    assetTag: "MON-091",
    name: "BenQ PD2700U",
    category: "Monitor",
    status: "Active",
    assignedTo: "Lisa Martinez",
    location: "Office - Floor 3",
    acquisitionDate: "2023-04-08",
  },
  {
    id: "16",
    assetTag: "PHN-115",
    name: "Google Pixel 7",
    category: "Phone",
    status: "Retired",
    assignedTo: null,
    location: "Storage",
    acquisitionDate: "2022-10-20",
  },
  {
    id: "17",
    assetTag: "LAP-052",
    name: "Microsoft Surface Laptop 5",
    category: "Laptop",
    status: "Active",
    assignedTo: "Robert Taylor",
    location: "Remote",
    acquisitionDate: "2023-08-30",
  },
  {
    id: "18",
    assetTag: "MON-103",
    name: "Acer Predator X34",
    category: "Monitor",
    status: "Active",
    assignedTo: "Amanda White",
    location: "Office - Floor 2",
    acquisitionDate: "2023-11-15",
  },
];

export default function AssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Table Section */}
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <DataTable 
            columns={columns} 
            data={mockAssets}
            searchKey="name"
            searchPlaceholder="Search assets by name..."
            onRowClick={setSelectedAsset}
            selectedRowId={selectedAsset?.id}
          />
        </div>
        
        {/* Card Section - Sticky on desktop */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <AssetDetailsCard 
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        </div>
      </div>
    </div>
  );
}
