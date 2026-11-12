'use client';

import { use } from 'react';
import { useGetAssetByIdQuery } from '@/store/api/assetsApi';
import { AssetDetailView } from './AssetDetailView';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = use(params);
  const assetId = Number(id);

  const { data: asset, isLoading, isError } = useGetAssetByIdQuery(assetId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (isError || !asset) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to load asset.</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/assets">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assets
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <AssetDetailView asset={asset} />;
}
