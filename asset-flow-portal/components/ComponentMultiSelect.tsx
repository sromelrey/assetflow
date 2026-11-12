'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const OPTIONS = ['Mouse', 'Keyboard', 'Headset', 'UPS/AVR', 'Camera', 'External HDD', 'USB Hub'];
export function ComponentMultiSelect({ value, onChange }: { value: string[]; onChange: (items: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [others, setOthers] = useState(false);
  const [custom, setCustom] = useState('');
  const toggle = (name: string) => onChange(value.includes(name) ? value.filter(x => x !== name) : [...value, name]);
  const add = () => {
    const name = custom.trim();
    if (!name || name.length > 80 || value.length >= 50) return;
    if (!value.some(x => x.toLowerCase() === name.toLowerCase())) onChange([...value, OPTIONS.find(x => x.toLowerCase() === name.toLowerCase()) || name]);
    setCustom('');
  };
  return <div className="space-y-2">
    <span className="text-sm font-medium">Included Components</span>
    <div className="flex flex-wrap gap-2" aria-live="polite">{value.map(name => <Button key={name} type="button" variant="secondary" size="sm" onClick={() => toggle(name)} aria-label={`Remove ${name}`}>{name} ×</Button>)}</div>
    <Button type="button" variant="outline" className="w-full justify-between" aria-expanded={open} onClick={() => setOpen(!open)}>Select components <span>⌄</span></Button>
    {open && <div className="border rounded-md p-3 space-y-2 bg-popover">
      <Input aria-label="Search components" placeholder="Search components…" value={search} onChange={e => setSearch(e.target.value)} />
      {[...new Set([...OPTIONS, ...value])].filter(x => x.toLowerCase().includes(search.toLowerCase())).map(name => <label key={name} className="flex items-center gap-2 p-1"><input type="checkbox" checked={value.includes(name)} onChange={() => toggle(name)} />{name}</label>)}
      <label className="flex items-center gap-2"><input type="checkbox" checked={others} onChange={e => setOthers(e.target.checked)} />Others</label>
      {others && <div className="flex gap-2"><Input aria-label="Other component name" placeholder="Other component name" maxLength={80} value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} /><Button type="button" onClick={add} disabled={!custom.trim() || value.length >= 50}>Add</Button></div>}
      <Button type="button" variant="outline" onClick={() => setOpen(false)}>Done</Button>
    </div>}
  </div>;
}
