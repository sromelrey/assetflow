'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useGetAssetsQuery, Asset, AssetStatus } from '@/store/api/assetsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { useGetSitesQuery, useGetBuildingsQuery, useGetFloorsQuery } from '@/store/api/locationsApi';
import { useGetDivisionsQuery, useGetDepartmentsQuery } from '@/store/api/organizationApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Printer, QrCode, CheckSquare, Square, Search, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

const ASSET_STATUSES: AssetStatus[] = [
  'Active',
  'Deployed',
  'Decommissioned',
  'For Repair',
  'For Deployment',
  'In Storage',
];

const STICKER_SIZES = {
  small:  { label: 'Small (2×1 in)',   qr: 72,  widthClass: 'w-[150px]', heightClass: 'h-[90px]'  },
  medium: { label: 'Medium (2.5×1.5 in)', qr: 96,  widthClass: 'w-[190px]', heightClass: 'h-[120px]' },
  large:  { label: 'Large (3×2 in)',    qr: 120, widthClass: 'w-[240px]', heightClass: 'h-[160px]' },
} as const;

type StickerSize = keyof typeof STICKER_SIZES;

interface QrStickerProps {
  asset: Asset;
  size: StickerSize;
  selected: boolean;
  onToggle: (id: number) => void;
  isPrintMode?: boolean;
}

function QrSticker({ asset, size, selected, onToggle, isPrintMode }: QrStickerProps) {
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

const NONE = '__all__';
const BATCH_LIMIT = 200; // Load more assets for batch printing

export default function QrPrintPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(NONE);
  const [filterCategory, setFilterCategory] = useState(NONE);
  
  // Location filters
  const [filterSite, setFilterSite] = useState(NONE);
  const [filterBuilding, setFilterBuilding] = useState(NONE);
  const [filterFloor, setFilterFloor] = useState(NONE);
  
  // Organization filters
  const [filterDivision, setFilterDivision] = useState(NONE);
  const [filterDepartment, setFilterDepartment] = useState(NONE);
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [stickerSize, setStickerSize] = useState<StickerSize>('medium');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Main Assets Query (Server-side Filtered)
  const queryParams = useMemo(() => ({
    limit: BATCH_LIMIT,
    search: debouncedSearch || undefined,
    status: filterStatus !== NONE ? filterStatus as AssetStatus : undefined,
    categoryId: filterCategory !== NONE ? Number(filterCategory) : undefined,
    siteId: filterSite !== NONE ? Number(filterSite) : undefined,
    buildingId: filterBuilding !== NONE ? Number(filterBuilding) : undefined,
    floorId: filterFloor !== NONE ? Number(filterFloor) : undefined,
    divisionId: filterDivision !== NONE ? Number(filterDivision) : undefined,
    departmentId: filterDepartment !== NONE ? Number(filterDepartment) : undefined,
  }), [debouncedSearch, filterStatus, filterCategory, filterSite, filterBuilding, filterFloor, filterDivision, filterDepartment]);

  const { data: assets = [], isLoading: isLoadingAssets, isError } = useGetAssetsQuery(queryParams);
  
  // Meta data for filters
  const { data: sites = [] } = useGetSitesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Cascading location queries
  const { data: buildings = [] } = useGetBuildingsQuery(
    filterSite !== NONE ? { siteId: Number(filterSite) } : undefined,
    { skip: filterSite === NONE }
  );
  const { data: floors = [] } = useGetFloorsQuery(
    filterBuilding !== NONE ? { buildingId: Number(filterBuilding) } : undefined,
    { skip: filterBuilding === NONE }
  );
  
  // Cascading organization queries
  const { data: divisions = [] } = useGetDivisionsQuery(
    filterFloor !== NONE ? { floorId: Number(filterFloor) } : undefined,
    { skip: filterFloor === NONE }
  );
  const { data: departments = [] } = useGetDepartmentsQuery(
    filterDivision !== NONE ? { divisionId: Number(filterDivision) } : undefined,
    { skip: filterDivision === NONE }
  );

  const clearFilters = () => {
    setSearch('');
    setFilterStatus(NONE);
    setFilterCategory(NONE);
    setFilterSite(NONE);
    setFilterBuilding(NONE);
    setFilterFloor(NONE);
    setFilterDivision(NONE);
    setFilterDepartment(NONE);
  };

  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    assets.length > 0 &&
    assets.every((a) => selectedIds.has(a.id));

  const toggleAsset = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        assets.forEach((a) => next.delete(a.id));
      } else {
        assets.forEach((a) => next.add(a.id));
      }
      return next;
    });
  };

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load assets. Please ensure the API is running.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #qr-print-area, #qr-print-area * { visibility: visible !important; }
          #qr-print-area { position: fixed; inset: 0; padding: 12px; background: white; }
          .print-sticker-grid { display: flex !important; flex-wrap: wrap !important; gap: 8px !important; }
          .print-sticker-grid > * { break-inside: avoid !important; }
        }
      `}</style>

      <div className="space-y-6 p-8 bg-muted/30 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <QrCode className="h-8 w-8 text-primary" />
              QR Sticker Print
            </h1>
            <p className="text-muted-foreground mt-1">
              Filter assets and generate sticker sheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
             <Select value={stickerSize} onValueChange={(v) => setStickerSize(v as StickerSize)}>
              <SelectTrigger className="w-48 bg-card">
                <SelectValue placeholder="Sticker Size" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STICKER_SIZES) as StickerSize[]).map((k) => (
                  <SelectItem key={k} value={k}>{STICKER_SIZES[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => window.print()}
              disabled={selectedCount === 0}
              size="lg"
              className="gap-2"
            >
              <Printer className="h-5 w-5" />
              Print ({selectedCount})
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-card rounded-xl border shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name/asset #/serial #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Statuses</SelectItem>
                {ASSET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Site */}
            <Select value={filterSite} onValueChange={(v) => { setFilterSite(v); setFilterBuilding(NONE); setFilterFloor(NONE); setFilterDivision(NONE); setFilterDepartment(NONE); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Sites</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Building */}
            <Select disabled={filterSite === NONE} value={filterBuilding} onValueChange={(v) => { setFilterBuilding(v); setFilterFloor(NONE); setFilterDivision(NONE); setFilterDepartment(NONE); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Buildings</SelectItem>
                {buildings.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Floor */}
            <Select disabled={filterBuilding === NONE} value={filterFloor} onValueChange={(v) => { setFilterFloor(v); setFilterDivision(NONE); setFilterDepartment(NONE); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Floors</SelectItem>
                {floors.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>{f.floorNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Division */}
            <Select disabled={filterFloor === NONE} value={filterDivision} onValueChange={(v) => { setFilterDivision(v); setFilterDepartment(NONE); }}>
              <SelectTrigger>
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Divisions</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select disabled={filterDivision === NONE} value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {allVisibleSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
              {allVisibleSelected ? 'Deselect All Visible' : 'Select All Visible'}
            </button>

            <div className="flex items-center gap-4">
               {selectedCount > 0 && (
                <button 
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-primary hover:underline"
                >
                  Clear Selection
                </button>
              )}
              <Badge variant="outline" className="font-mono bg-primary/5 text-primary border-primary/20">
                {assets.length} Available Items
              </Badge>
            </div>
          </div>
        </div>

        {/* Sticker Grid */}
        {isLoadingAssets ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading assets...</span>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-card rounded-xl border border-dashed gap-2">
            <Search className="h-10 w-10 opacity-20" />
            <p>No assets match current filters.</p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all filters</Button>
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
                  onToggle={toggleAsset}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div id="qr-print-area" className="hidden print:block">
        <div className="print-sticker-grid">
          {assets.filter(a => selectedIds.has(a.id)).map((asset) => (
            <QrSticker
              key={asset.id}
              asset={asset}
              size={stickerSize}
              selected={true}
              onToggle={() => {}}
              isPrintMode
            />
          ))}
        </div>
      </div>
    </>
  );
}
