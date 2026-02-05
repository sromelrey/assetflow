import React from 'react';
import { Asset } from '@/app/(main)/assets/columns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Package, MapPin, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetDetailsCardProps {
  asset: Asset | null;
  onClose?: () => void;
}

const StatusBadge = ({ status }: { status: Asset["status"] }) => {
  const variants = {
    Active: { variant: "default" as const, className: "bg-accent hover:bg-accent/80 text-accent-foreground" },
    "Under Maintenance": { variant: "default" as const, className: "bg-accent hover:bg-accent/80 text-accent-foreground" },
    Retired: { variant: "default" as const, className: "bg-accent hover:bg-accent/80 text-accent-foreground" },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
};

export function AssetDetailsCard({ asset, onClose }: AssetDetailsCardProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="h-full animate-in fade-in-50 duration-300 bg-card">
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2 text-foreground">{asset.name}</CardTitle>
            <CardDescription className="text-base text-muted-foreground">{asset.assetTag}</CardDescription>
          </div>
          <div className="flex items-start gap-2">
            <StatusBadge status={asset.status} />
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Asset Information */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Asset Information
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Category</p>
                <p className="text-sm font-medium text-foreground">
                  {asset.category}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Acquisition Date</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(asset.acquisitionDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Assignment & Location */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Assignment & Location
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                <p className="text-sm font-medium text-foreground">
                  {asset.assignedTo || (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="text-sm font-medium text-foreground">
                  {asset.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Details Placeholder */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Additional Details
          </h3>
          <p className="text-xs text-muted-foreground italic pl-7">
            No additional details available
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
