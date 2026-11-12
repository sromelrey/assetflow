'use client';
import { useState } from 'react';
import { ComponentMultiSelect } from './ComponentMultiSelect';
import { useGetMonitorCandidatesQuery } from '@/store/api/assetsApi';
import { Button } from './ui/button';
import { Input } from './ui/input';
type Monitor = { id: number; name: string; assetNo?: string; serialNo?: string };
export interface HardwareValue { components: string[]; chargerIncluded?: boolean; ocsLink: string; monitors: Monitor[] }
export const initialHardware: HardwareValue = { components: [], ocsLink: '', monitors: [] };
export function HardwareExtras({ value, onChange, category, assetId }: { value: HardwareValue; onChange: (v: HardwareValue) => void; category: string; assetId?: number }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(0);
  const desktop = category.trim().toLowerCase() === 'desktop';
  const charger = ['laptop','mobile','noc'].includes(category.trim().toLowerCase());
  const { data = [], isFetching, isError, refetch } = useGetMonitorCandidatesQuery({ search, cursor, desktopId: assetId }, { skip: !desktop || !open });
  return <div className="space-y-4 border-b pb-4">
    <ComponentMultiSelect value={value.components} onChange={components => onChange({ ...value, components })} />
    {(desktop || value.monitors.length > 0) && <div className="space-y-2">
      <span className="text-sm font-medium">Monitors</span>
      <div className="flex flex-wrap gap-2">{value.monitors.map(m => <Button key={m.id} type="button" size="sm" variant="secondary" onClick={() => onChange({ ...value, monitors: value.monitors.filter(x=>x.id!==m.id) })}>{m.assetNo || m.name} ×</Button>)}</div>
      {!desktop && value.monitors.length > 0 && <p role="alert">Detach monitors before changing the desktop category.</p>}
      {desktop && <Button type="button" variant="outline" aria-expanded={open} onClick={()=>setOpen(!open)}>Select existing monitors ⌄</Button>}
      {desktop && open && <div className="border rounded-md p-3 space-y-2">
        <Input aria-label="Search monitor assets" placeholder="Name, asset number, or serial number" value={search} onChange={e=>{setSearch(e.target.value);setCursor(0)}} />
        {isError ? <Button type="button" onClick={()=>refetch()}>Retry loading monitors</Button> : isFetching ? <p>Loading…</p> : data.map(m=><label key={m.id} className="flex gap-2"><input type="checkbox" checked={value.monitors.some(x=>x.id===m.id)} onChange={e=>onChange({ ...value, monitors: e.target.checked ? [...value.monitors,m] : value.monitors.filter(x=>x.id!==m.id) })} />{m.assetNo || `#${m.id}`} — {m.name} {m.serialNo ? `— ${m.serialNo}` : ''}</label>)}
        {!isFetching && !isError && data.length===0 && <p>No available monitors.</p>}
        <div className="flex gap-2"><Button type="button" variant="outline" disabled={!cursor || isFetching} onClick={()=>setCursor(0)}>First page</Button><Button type="button" variant="outline" disabled={data.length<50 || isFetching} onClick={()=>setCursor(data[data.length-1].id)}>Next</Button></div>
      </div>}
    </div>}
    {charger && <label className="flex gap-2 items-center"><input type="checkbox" checked={value.chargerIncluded === true} onChange={e=>onChange({ ...value, chargerIncluded: e.target.checked })} />Charger Included {value.chargerIncluded === undefined && <span className="text-muted-foreground text-sm">(not recorded)</span>}</label>}
    <label className="block space-y-2"><span className="text-sm font-medium">OCS Link</span><Input type="url" maxLength={2048} placeholder="https://ocs.example.com/…" value={value.ocsLink} onChange={e=>onChange({ ...value, ocsLink: e.target.value })} /></label>
  </div>;
}
