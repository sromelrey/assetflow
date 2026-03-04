'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Asset,
  AssetStatus,
  useUpdateAssetStatusByNoMutation,
} from '@/store/api/assetsApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Pencil,
  ChevronDown,
  Loader2,
  Package,
  Cpu,
  HardDrive,
  Monitor,
  FileText,
  Hash,
  MapPin,
  QrCode,
  Printer,
} from 'lucide-react';
import { EditAssetModal } from '@/app/(main)/assets/EditAssetModal';
import { toast } from 'sonner';

interface AssetDetailViewProps {
  asset: Asset;
}

const STATUS_COLORS: Record<AssetStatus, string> = {
  Active: 'bg-emerald-500',
  Decommissioned: 'bg-slate-500',
  Deployed: 'bg-blue-500',
  'For Repair': 'bg-amber-500',
  'For Deployment': 'bg-indigo-500',
  'In Storage': 'bg-purple-500',
};

const STATUS_BADGE_CLASSES: Record<AssetStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Decommissioned: 'bg-slate-100 text-slate-800 border-slate-200',
  Deployed: 'bg-blue-100 text-blue-800 border-blue-200',
  'For Repair': 'bg-amber-100 text-amber-800 border-amber-200',
  'For Deployment': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'In Storage': 'bg-purple-100 text-purple-800 border-purple-200',
};

const ALL_STATUSES: AssetStatus[] = [
  'Active',
  'Decommissioned',
  'Deployed',
  'For Repair',
  'For Deployment',
  'In Storage',
];

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">
        {value || <span className="italic text-muted-foreground">N/A</span>}
      </p>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {children}
      </div>
    </div>
  );
}

export function AssetDetailView({ asset }: AssetDetailViewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAssetStatusByNoMutation();

  const APP_BASE_URL = 'https://assetflow-alpha.vercel.app';
  const qrUrl = `${APP_BASE_URL}/assets/${asset.id}`;

  const details = asset.assetDetails;
  const bannerColor = STATUS_COLORS[asset.status] ?? 'bg-slate-500';

  const handleStatusChange = async (newStatus: AssetStatus) => {
    if (newStatus === asset.status || !asset.assetNo) return;
    try {
      await updateStatus({ assetNo: asset.assetNo, status: newStatus }).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Status Banner */}
      <div className={`${bannerColor} w-full`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={isUpdating || !asset.assetNo}
              className="focus:outline-none disabled:opacity-60"
            >
              <div className="flex items-center gap-2 text-white">
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <span className="text-xs font-semibold tracking-widest uppercase opacity-70">
                  Status:
                </span>
                <span className="text-sm font-bold tracking-wide uppercase">
                  {asset.status}
                </span>
                <ChevronDown className="h-4 w-4 opacity-70" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {ALL_STATUSES.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={s === asset.status ? 'bg-accent font-medium' : ''}
                >
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2 mb-1">
              <Link href="/assets">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Assets
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {asset.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {asset.assetNo && (
                <Badge variant="outline" className="text-xs font-normal">
                  Asset # {asset.assetNo}
                </Badge>
              )}
              {asset.serialNo && (
                <Badge variant="secondary" className="text-xs font-normal">
                  S/N: {asset.serialNo}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-xs font-medium border ${STATUS_BADGE_CLASSES[asset.status]}`}
              >
                {asset.status}
              </Badge>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsQrOpen(true)}
              className="gap-2"
            >
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Asset
            </Button>
          </div>
        </div>

        <Separator />

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Core Information */}
          <SectionCard title="Core Information" icon={<Package className="h-3.5 w-3.5" />}>
            <InfoRow label="Category" value={asset.category?.name} />
            <InfoRow label="Asset Type" value={asset.assetType} />
            <InfoRow label="Purchase Date" value={formatDate(asset.purchaseDate)} />
            <InfoRow label="Unit Assignment" value={asset.unit?.name ?? 'Unassigned'} />
          </SectionCard>

          {/* Hardware Specifications */}
          {details && (
            <SectionCard title="Hardware Specifications" icon={<Cpu className="h-3.5 w-3.5" />}>
              <InfoRow label="Brand" value={details.brand} />
              <InfoRow label="Model" value={details.model} />
              {details.processor && (
                <div className="sm:col-span-2">
                  <InfoRow label="Processor" value={details.processor} />
                </div>
              )}
              <InfoRow label="Memory" value={details.memory} />
              <InfoRow label="Storage" value={details.storage} />
            </SectionCard>
          )}
        </div>

        {details && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Network & System */}
            <SectionCard title="Network & System" icon={<Monitor className="h-3.5 w-3.5" />}>
              {details.computerName && (
                <div className="sm:col-span-2">
                  <InfoRow label="Computer Name" value={details.computerName} />
                </div>
              )}
              <InfoRow label="IP Address" value={details.ipAddress} />
              <InfoRow label="MAC Address" value={details.macAddress} />
              {details.operatingSystem && (
                <div className="sm:col-span-2">
                  <InfoRow label="Operating System" value={details.operatingSystem} />
                </div>
              )}
            </SectionCard>

            {/* Administrative */}
            <SectionCard title="Administrative" icon={<FileText className="h-3.5 w-3.5" />}>
              {details.poNumber && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">PO Number</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    {details.poNumber}
                  </p>
                </div>
              )}
              {details.invoiceNumber && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Invoice Number</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    {details.invoiceNumber}
                  </p>
                </div>
              )}
              {details.supplier && (
                <div className="sm:col-span-2">
                  <InfoRow label="Supplier" value={details.supplier} />
                </div>
              )}
              {details.remarks && (
                <div className="sm:col-span-2 mt-2 p-3 bg-muted/50 rounded-md border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Remarks</p>
                  <p className="text-sm text-foreground/90">{details.remarks}</p>
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditAssetModal
          asset={asset}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}

      {/* QR Code Modal */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* QR Code */}
            <div className="p-4 bg-white rounded-xl border shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Asset info below QR */}
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">{asset.name}</p>
              {asset.assetNo && (
                <p className="text-sm text-muted-foreground font-mono">#{asset.assetNo}</p>
              )}
              <p className="text-xs text-muted-foreground">{asset.category?.name}</p>
            </div>

            {/* Print button */}
            <Button
              variant="default"
              className="gap-2 w-full"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" />
              Print Sticker
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
