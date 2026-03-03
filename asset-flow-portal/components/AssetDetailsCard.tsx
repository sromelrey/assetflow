import React, { useState } from 'react';
import { Asset, useUpdateAssetStatusByNoMutation, AssetStatus } from '@/store/api/assetsApi';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
// Using Edit (Pencil) icon instead of general Package
import { X, Package, MapPin, User, Calendar, Cpu, HardDrive, Monitor, Hash, FileText, Settings, Pencil, Loader2, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditAssetModal } from '@/app/(main)/assets/EditAssetModal';

interface AssetDetailsCardProps {
  asset: Asset | null;
  onClose?: () => void;
}

const StatusBadge = ({ asset }: { asset: Asset }) => {
  const [updateStatus, { isLoading }] = useUpdateAssetStatusByNoMutation();
  const status = asset.status;

  const variants = {
    Active: { variant: "default" as const, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
    Decommissioned: { variant: "default" as const, className: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
    Deployed: { variant: "default" as const, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
    "For Repair": { variant: "default" as const, className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
    "For Deployment": { variant: "default" as const, className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
    "In Storage": { variant: "default" as const, className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  };

  const config = variants[status];
  const statuses: AssetStatus[] = ['Active', 'Decommissioned', 'Deployed', 'For Repair', 'For Deployment', 'In Storage'];

  const handleStatusChange = async (newStatus: AssetStatus) => {
    if (newStatus === status || !asset.assetNo) return;
    try {
      await updateStatus({ assetNo: asset.assetNo, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (!asset.assetNo) {
    return (
      <Badge variant={config?.variant || "outline"} className={config?.className}>
        {status}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none disabled:opacity-50" disabled={isLoading}>
        <Badge variant={config?.variant || "outline"} className={`${config?.className} cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity`}>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin inline-block" />}
          {status}
          <ChevronDown className="h-3 w-3 opacity-50 inline-block" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statuses.map((s) => (
          <DropdownMenuItem 
            key={s} 
            onClick={() => handleStatusChange(s)}
            className={s === status ? "bg-accent" : ""}
          >
            {s}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function AssetDetailsCard({ asset, onClose }: AssetDetailsCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!asset) {
    return (
      <Card className="h-full min-h-[400px] flex items-center justify-center bg-card">
        <CardContent className="text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            Select an asset from the table to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return <span className="text-muted-foreground italic">N/A</span>;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const details = asset.assetDetails;

  return (
    <>
      <Card className="h-full animate-in fade-in-50 duration-300 bg-card overflow-y-auto max-h-[calc(100vh-8rem)]">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex flex-col items-center gap-3 mb-1 mt-1">
                <CardTitle className="text-2xl text-foreground leading-tight break-all">{asset.name}</CardTitle>
                <div className="flex items-center gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Link href={`/assets/${asset.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Full Page
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {asset.assetNo || "No Asset #"}
                </Badge>
                {asset.serialNo && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    S/N: {asset.serialNo}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 sm:pt-1">
              <StatusBadge asset={asset} />
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground -mr-2"
                  aria-label="Close details"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Core Information */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            Core Information
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="text-sm font-medium text-foreground">
                {asset.category?.name || <span className="text-muted-foreground italic">None</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Asset Type</p>
              <p className="text-sm font-medium text-foreground">
                {asset.assetType || <span className="text-muted-foreground italic">N/A</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Purchase Date</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(asset.purchaseDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Unit Assignment</p>
              <p className="text-sm font-medium text-foreground">
                {asset.unit?.name || <span className="text-muted-foreground italic">Unassigned</span>}
              </p>
            </div>
          </div>
        </div>

        {details && (
          <>
            <Separator />
            {/* Hardware Specifications */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5" />
                Hardware Specifications
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                {details.brand && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Brand</p>
                    <p className="text-sm font-medium text-foreground">{details.brand}</p>
                  </div>
                )}
                {details.model && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Model</p>
                    <p className="text-sm font-medium text-foreground">{details.model}</p>
                  </div>
                )}
                {details.processor && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Cpu className="h-3 w-3" /> Processor</p>
                    <p className="text-sm font-medium text-foreground">{details.processor}</p>
                  </div>
                )}
                {details.memory && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><HardDrive className="h-3 w-3" /> Memory</p>
                    <p className="text-sm font-medium text-foreground">{details.memory}</p>
                  </div>
                )}
                {details.storage && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><HardDrive className="h-3 w-3" /> Storage</p>
                    <p className="text-sm font-medium text-foreground">{details.storage}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />
            
            {/* Network & System */}
            <div>
               <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5" />
                Network & System
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {details.computerName && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Computer Name</p>
                    <p className="text-sm font-medium text-foreground">{details.computerName}</p>
                  </div>
                )}
                {details.ipAddress && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                    <p className="text-sm font-medium text-foreground">{details.ipAddress}</p>
                  </div>
                )}
                 {details.macAddress && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">MAC Address</p>
                    <p className="text-sm font-medium text-foreground">{details.macAddress}</p>
                  </div>
                )}
                {details.operatingSystem && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Settings className="h-3 w-3" /> Operating System</p>
                    <p className="text-sm font-medium text-foreground">{details.operatingSystem}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Admin Details */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Administrative
              </h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 {details.poNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">PO Number</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1"><Hash className="h-3 w-3 text-muted-foreground"/>{details.poNumber}</p>
                  </div>
                )}
                 {details.invoiceNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Invoice Number</p>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1"><Hash className="h-3 w-3 text-muted-foreground"/>{details.invoiceNumber}</p>
                  </div>
                )}
                {details.supplier && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Supplier</p>
                    <p className="text-sm font-medium text-foreground">{details.supplier}</p>
                  </div>
                )}
               </div>
               {details.remarks && (
                 <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Remarks</p>
                    <p className="text-sm text-foreground/90">{details.remarks}</p>
                 </div>
               )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
      {isEditModalOpen && (
        <EditAssetModal
          asset={asset}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}
    </>
  );
}
