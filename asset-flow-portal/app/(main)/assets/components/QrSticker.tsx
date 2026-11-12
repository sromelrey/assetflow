'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Asset } from '@/store/api/assetsApi';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

const STICKER_SIZES = {
  small:  { label: 'Small (2×1 in)',   qr: 72,  widthClass: 'w-[150px]', heightClass: 'h-[90px]'  },
  medium: { label: 'Medium (2.5×1.5 in)', qr: 96,  widthClass: 'w-[190px]', heightClass: 'h-[120px]' },
  large:  { label: 'Large (3×2 in)',    qr: 120, widthClass: 'w-[240px]', heightClass: 'h-[160px]' },
} as const;

export type StickerSize = keyof typeof STICKER_SIZES;

interface QrStickerProps {
  asset: Asset;
  size: StickerSize;
  selected: boolean;
  onToggle: (id: number) => void;
  isPrintMode?: boolean;
}

export function QrSticker({ asset, size, selected, onToggle, isPrintMode }: QrStickerProps) {
  const { qr, widthClass, heightClass } = STICKER_SIZES[size];
  const url = `${APP_BASE_URL}/assets/${asset.id}`;

  return (
    <div
      className={cn(
        'relative group border-2 rounded-lg bg-white transition-all duration-150 cursor-pointer select-none',
        selected
          ? 'border-primary shadow-md shadow-primary/20'
          : 'border-border hover:border-primary/50',
        !isPrintMode && 'print:hidden'
      )}
      onClick={() => onToggle(asset.id)}
    >
      {!isPrintMode && (
        <div
          className={cn(
            'absolute top-1.5 right-1.5 z-10 transition-opacity outline-none',
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
          )}
        >
          <div
            className={cn(
              'h-4 w-4 rounded border-2 flex items-center justify-center',
              selected ? 'border-primary bg-primary' : 'border-muted-foreground bg-white'
            )}
          >
            {selected && <CheckSquare className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
        </div>
      )}

      <div className={cn('flex items-center gap-2 p-2', widthClass, heightClass)}>
        <div className="shrink-0">
          <QRCodeSVG value={url} size={qr} level="M" includeMargin={false} />
        </div>

        <div className="flex flex-col justify-center overflow-hidden gap-0.5 min-w-0">
          <p className="text-[10px] font-bold leading-tight text-gray-900 truncate">
            {asset.name}
          </p>
          {asset.assetNo && (
            <p className="text-[9px] font-mono text-gray-600 truncate">
              #{asset.assetNo}
            </p>
          )}
          <p className="text-[9px] text-gray-500 truncate">
            {asset.category?.name}
          </p>
          <p className="text-[8px] text-gray-400 truncate">
            {asset.unit?.name}
          </p>
        </div>
      </div>
    </div>
  );
}

export { STICKER_SIZES };
