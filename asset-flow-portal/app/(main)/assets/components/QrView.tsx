'use client';

import React, { useState } from 'react';
import { Loader2, Search, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrSticker, StickerSize, STICKER_SIZES } from './QrSticker';
import { Asset } from '@/store/api/assetsApi';

interface QrViewProps {
  assets: Asset[];
  isLoading: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  stickerSize: StickerSize;
  onStickerSizeChange: (size: StickerSize) => void;
  onGeneratePdf: () => void;
  onClearFilters: () => void;
  isGeneratingPdf: boolean;
}

export function QrView({
  assets,
  isLoading,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  onClearSelection,
  stickerSize,
  onStickerSizeChange,
  onGeneratePdf,
  onClearFilters,
  isGeneratingPdf,
}: QrViewProps) {
  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    assets.length > 0 &&
    assets.every((a) => selectedIds.has(a.id));

  return (
    <div className="space-y-6">
      {/* QR View Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">QR View</h2>
            <p className="text-muted-foreground text-sm">
              Select assets to generate QR code stickers
            </p>
          </div>

          <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
            {assets.length} Available Items
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {/* Sticker Size Selector */}
          <select
            value={stickerSize}
            onChange={(e) => onStickerSizeChange(e.target.value as StickerSize)}
            className="px-3 py-2 bg-card border rounded-md text-sm"
          >
            {(Object.keys(STICKER_SIZES) as StickerSize[]).map((k) => (
              <option key={k} value={k}>{STICKER_SIZES[k].label}</option>
            ))}
          </select>

          {/* PDF Generation Button */}
  <Button
  onClick={onGeneratePdf}
  disabled={
    selectedCount === 0 ||
    isGeneratingPdf
  }
  size="lg"
>
  {isGeneratingPdf ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      Generating...
    </>
  ) : (
    `Generate PDF (${selectedCount})`
  )}
</Button>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
        <button
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {allVisibleSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
          {allVisibleSelected ? 'Deselect All Visible' : 'Select All Visible'}
        </button>

        <div className="flex items-center gap-4">
          {selectedCount > 0 && (
            <button
              onClick={onClearSelection}
              className="text-xs text-primary hover:underline"
            >
              Clear Selection
            </button>
          )}
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* QR Sticker Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading assets...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card rounded-xl border border-dashed gap-2">
          <Search className="h-10 w-10 opacity-20" />
          <p>No assets match current filters.</p>
          <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear all filters</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm p-6 overflow-auto max-h-[calc(100vh-450px)]">
          <div className="flex flex-wrap gap-3">
            {assets.map((asset) => (
              <QrSticker
                key={asset.id}
                asset={asset}
                size={stickerSize}
                selected={selectedIds.has(asset.id)}
                onToggle={onToggleSelection}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
