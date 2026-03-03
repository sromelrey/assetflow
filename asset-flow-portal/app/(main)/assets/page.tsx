'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AssetDetailsCard } from '@/components/AssetDetailsCard';
import { Search, X, ChevronsUpDown, ChevronUp, ChevronDown, SlidersHorizontal, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetAssetsQuery, Asset, AssetStatus } from '@/store/api/assetsApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { useGetSitesQuery, useGetBuildingsQuery, useGetFloorsQuery } from '@/store/api/locationsApi';
import { useGetDivisionsQuery, useGetDepartmentsQuery } from '@/store/api/organizationApi';
import { AddAssetModal } from './AddAssetModal';

const LIMIT = 20;

const ASSET_STATUSES: AssetStatus[] = [
  'Active', 'Deployed', 'Decommissioned', 'For Repair', 'For Deployment', 'In Storage',
];

const STATUS_COLORS: Record<AssetStatus, string> = {
  Active:           'bg-emerald-100 text-emerald-800 border-emerald-200',
  Deployed:         'bg-blue-100 text-blue-800 border-blue-200',
  Decommissioned:   'bg-slate-100 text-slate-700 border-slate-200',
  'For Repair':     'bg-amber-100 text-amber-800 border-amber-200',
  'For Deployment': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'In Storage':     'bg-slate-100 text-slate-700 border-slate-200',
};

type SortKey = 'assetNo' | 'name' | 'category' | 'status' | 'unit' | 'department' | 'building' | 'site';
type SortDir = 'asc' | 'desc';

interface ColDef {
  key: SortKey;
  label: string;
  getValue: (a: Asset) => string;
  defaultVisible: boolean;
}

const ALL_COLUMNS: ColDef[] = [
  { key: 'assetNo',    label: 'Asset No',   getValue: (a) => a.assetNo ?? '—',  defaultVisible: true  },
  { key: 'name',       label: 'Name',        getValue: (a) => a.name ?? '—',     defaultVisible: true  },
  { key: 'category',   label: 'Category',    getValue: (a) => a.category?.name ?? '—', defaultVisible: true },
  { key: 'status',     label: 'Status',      getValue: (a) => a.status,          defaultVisible: true  },
  { key: 'unit',       label: 'Unit',        getValue: (a) => a.unit?.name ?? '—', defaultVisible: true },
  { key: 'department', label: 'Department',  getValue: (a) => a.unit?.departmentId?.name ?? '—', defaultVisible: false },
  { key: 'building',   label: 'Building',    getValue: (a) => (a.unit?.departmentId as any)?.divisionId?.floor?.building?.name ?? '—', defaultVisible: false },
  { key: 'site',       label: 'Site',        getValue: (a) => (a.unit?.departmentId as any)?.divisionId?.floor?.building?.site?.name ?? '—', defaultVisible: false },
];

const NONE = '__all__';

export default function AssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Basic filters
  const [search, setSearch]               = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter]   = useState<AssetStatus | ''>('');
  const [categoryId, setCategoryId]       = useState<number | undefined>(undefined);

  // Hierarchy filters (cascading)
  const [siteId,       setSiteId]       = useState<number | undefined>(undefined);
  const [buildingId,   setBuildingId]   = useState<number | undefined>(undefined);
  const [floorId,      setFloorId]      = useState<number | undefined>(undefined);
  const [divisionId,   setDivisionId]   = useState<number | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [hierarchyOpen, setHierarchyOpen] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Column visibility
  const [visibleCols, setVisibleCols] = useState<Set<SortKey>>(
    new Set(ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const toggleCol = (key: SortKey) =>
    setVisibleCols((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const activeCols = ALL_COLUMNS.filter((c) => visibleCols.has(c.key));

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };
  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="inline ml-1 h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ChevronUp className="inline ml-1 h-3.5 w-3.5" /> : <ChevronDown className="inline ml-1 h-3.5 w-3.5" />;
  };

  // Cascade reset: selecting a higher level resets lower levels
  const handleSiteChange = (v: string) => {
    setSiteId(v !== NONE ? Number(v) : undefined);
    setBuildingId(undefined); setFloorId(undefined); setDivisionId(undefined); setDepartmentId(undefined);
  };
  const handleBuildingChange = (v: string) => {
    setBuildingId(v !== NONE ? Number(v) : undefined);
    setFloorId(undefined); setDivisionId(undefined); setDepartmentId(undefined);
  };
  const handleFloorChange = (v: string) => {
    setFloorId(v !== NONE ? Number(v) : undefined);
    setDivisionId(undefined); setDepartmentId(undefined);
  };
  const handleDivisionChange = (v: string) => {
    setDivisionId(v !== NONE ? Number(v) : undefined);
    setDepartmentId(undefined);
  };

  // Hierarchy data (cascading)
  const { data: sites      = [] } = useGetSitesQuery();
  const { data: buildings  = [] } = useGetBuildingsQuery(siteId ? { siteId } : undefined);
  const { data: floors     = [] } = useGetFloorsQuery(buildingId ? { buildingId } : undefined);
  const { data: divisions  = [] } = useGetDivisionsQuery(floorId ? { floorId } : undefined);
  const { data: departments = [] } = useGetDepartmentsQuery(divisionId ? { divisionId } : undefined);
  const { data: categories = [] } = useGetCategoriesQuery();

  // Infinite scroll state
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [cursor, setCursor]       = useState<number | undefined>(undefined);
  const [hasMore, setHasMore]     = useState(true);
  const sentinelRef               = useRef<HTMLDivElement | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset list whenever any filter changes
  useEffect(() => {
    setAllAssets([]);
    setCursor(undefined);
    setHasMore(true);
  }, [debouncedSearch, statusFilter, categoryId, siteId, buildingId, floorId, divisionId, departmentId]);

  // Build query params (only defined values)
  const queryParams: Record<string, unknown> = { limit: LIMIT };
  if (cursor !== undefined)      queryParams.cursor       = cursor;
  if (debouncedSearch)           queryParams.search       = debouncedSearch;
  if (statusFilter)              queryParams.status       = statusFilter;
  if (categoryId !== undefined)  queryParams.categoryId   = categoryId;
  if (siteId !== undefined)      queryParams.siteId       = siteId;
  if (buildingId !== undefined)  queryParams.buildingId   = buildingId;
  if (floorId !== undefined)     queryParams.floorId      = floorId;
  if (divisionId !== undefined)  queryParams.divisionId   = divisionId;
  if (departmentId !== undefined) queryParams.departmentId = departmentId;

  const { data: pageData, isFetching, isError } = useGetAssetsQuery(queryParams as any);

  useEffect(() => {
    if (!pageData) return;
    setAllAssets((prev) => {
      const ids = new Set(prev.map((a) => a.id));
      return [...prev, ...pageData.filter((a) => !ids.has(a.id))];
    });
    setHasMore(pageData.length === LIMIT);
  }, [pageData]);

  const loadMore = useCallback(() => {
    if (isFetching || !hasMore || allAssets.length === 0) return;
    setCursor(allAssets[allAssets.length - 1].id);
  }, [isFetching, hasMore, allAssets]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((e) => { if (e[0].isIntersecting) loadMore(); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Client-side sort
  const sortedAssets = useMemo(() => {
    if (!sortKey) return allAssets;
    const col = ALL_COLUMNS.find((c) => c.key === sortKey);
    if (!col) return allAssets;
    return [...allAssets].sort((a, b) => {
      const av = col.getValue(a), bv = col.getValue(b);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [allAssets, sortKey, sortDir]);

  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setCategoryId(undefined);
    setSiteId(undefined); setBuildingId(undefined); setFloorId(undefined);
    setDivisionId(undefined); setDepartmentId(undefined);
  };

  const hierarchyFilterCount = [siteId, buildingId, floorId, divisionId, departmentId].filter(Boolean).length;
  const hasActiveFilters = !!(debouncedSearch || statusFilter || categoryId !== undefined || hierarchyFilterCount);

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your organization&apos;s assets</p>
        </div>
        <AddAssetModal />
      </div>

      {/* Primary Filter Bar */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="asset-search-input"
            placeholder="Search by name or asset no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryId !== undefined ? categoryId.toString() : NONE} onValueChange={(v) => setCategoryId(v !== NONE ? Number(v) : undefined)}>
          <SelectTrigger id="category-filter" className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={statusFilter || NONE} onValueChange={(v) => setStatusFilter(v !== NONE ? v as AssetStatus : '')}>
          <SelectTrigger id="status-filter" className="w-[160px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>All Statuses</SelectItem>
            {ASSET_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Hierarchy Filter Toggle */}
        <Button
          variant={hierarchyFilterCount > 0 ? 'default' : 'outline'}
          size="sm"
          id="hierarchy-filter-btn"
          onClick={() => setHierarchyOpen((o) => !o)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Location{hierarchyFilterCount > 0 ? ` (${hierarchyFilterCount})` : ''}
        </Button>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" id="column-visibility-btn">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_COLUMNS.map((col) => (
              <DropdownMenuCheckboxItem key={col.key} checked={visibleCols.has(col.key)} onCheckedChange={() => toggleCol(col.key)}>
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} id="clear-filters-btn">
            <X className="h-4 w-4 mr-1" /> Clear all
          </Button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">{allAssets.length} assets loaded</span>
      </div>

      {/* Hierarchy Filter Panel */}
      {hierarchyOpen && (
        <div className="mb-4 p-4 bg-card border rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Location Filters</p>
          <div className="flex flex-wrap gap-3">
            {/* Site */}
            <Select value={siteId !== undefined ? siteId.toString() : NONE} onValueChange={handleSiteChange}>
              <SelectTrigger id="site-filter" className="w-[180px]">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Sites</SelectItem>
                {sites.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Building — enabled only when site selected */}
            <Select value={buildingId !== undefined ? buildingId.toString() : NONE} onValueChange={handleBuildingChange} disabled={!siteId}>
              <SelectTrigger id="building-filter" className="w-[180px]">
                <SelectValue placeholder={siteId ? 'All Buildings' : 'Select site first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Buildings</SelectItem>
                {buildings.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Floor */}
            <Select value={floorId !== undefined ? floorId.toString() : NONE} onValueChange={handleFloorChange} disabled={!buildingId}>
              <SelectTrigger id="floor-filter" className="w-[180px]">
                <SelectValue placeholder={buildingId ? 'All Floors' : 'Select building first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Floors</SelectItem>
                {floors.map((f) => <SelectItem key={f.id} value={f.id.toString()}>{f.floorNumber}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Division */}
            <Select value={divisionId !== undefined ? divisionId.toString() : NONE} onValueChange={handleDivisionChange} disabled={!floorId}>
              <SelectTrigger id="division-filter" className="w-[180px]">
                <SelectValue placeholder={floorId ? 'All Divisions' : 'Select floor first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Divisions</SelectItem>
                {divisions.map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Department */}
            <Select value={departmentId !== undefined ? departmentId.toString() : NONE} onValueChange={(v) => setDepartmentId(v !== NONE ? Number(v) : undefined)} disabled={!divisionId}>
              <SelectTrigger id="department-filter" className="w-[180px]">
                <SelectValue placeholder={divisionId ? 'All Departments' : 'Select division first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Table */}
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
          {isError && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 border-b">
              Failed to load assets — check that the API server is running.
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  {activeCols.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {col.label}<SortIcon col={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`border-b cursor-pointer transition-colors hover:bg-muted/50 ${selectedAsset?.id === asset.id ? 'bg-muted' : ''}`}
                  >
                    {activeCols.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.key === 'status' ? (
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[asset.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {asset.status}
                          </span>
                        ) : (
                          <span className={col.getValue(asset) === '—' ? 'text-muted-foreground' : ''}>
                            {col.getValue(asset)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {isFetching && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b animate-pulse">
                    {activeCols.map((col) => (
                      <td key={col.key} className="px-4 py-3"><div className="h-4 bg-muted rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div ref={sentinelRef} className="h-4" />

          {!hasMore && !isFetching && (
            <p className="text-center text-sm text-muted-foreground py-4">
              {allAssets.length === 0 ? 'No assets match your filters.' : 'All assets loaded.'}
            </p>
          )}
        </div>

        {/* Detail Card */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <AssetDetailsCard asset={selectedAsset as any} onClose={() => setSelectedAsset(null)} />
        </div>
      </div>
    </div>
  );
}
