'use client';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Asset } from '@/store/api/assetsApi';
import { Button } from './ui/button';
import { Input } from './ui/input';

type Settings = { width: number; height: number; landscape: boolean; offsetX: number; offsetY: number; copies: number };
const DEFAULT: Settings = { width: 50.8, height: 25.4, landscape: false, offsetX: 0, offsetY: 0, copies: 1 };
const KEY = 'assetflow-label-settings-v1';
export function validLabel(s: Settings) {
  return typeof s.landscape === 'boolean' && [s.width,s.height,s.offsetX,s.offsetY,s.copies].every(Number.isFinite) && s.width >= 24 && s.width <= 104 && s.height >= 24 && s.height <= 991 && Math.abs(s.offsetX) <= 10 && Math.abs(s.offsetY) <= 10 && Number.isInteger(s.copies) && s.copies >= 1 && s.copies <= 100 && (!s.landscape || s.height <= 104);
}
function dimensions(s: Settings) { return s.landscape ? { width: s.height, height: s.width } : s; }
function labelUrl(asset: Asset) {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) throw new Error('Configure NEXT_PUBLIC_APP_URL before printing QR labels.');
  const url = new URL(base);
  if (!['http:','https:'].includes(url.protocol) || ['localhost','127.0.0.1'].includes(url.hostname)) throw new Error('Use the deployed AssetFlow address for QR labels.');
  return `${url.href.replace(/\/$/,'')}/assets/${asset.id}`;
}
function Label({ asset, settings }: { asset: Asset; settings: Settings }) {
  const { width,height } = dimensions(settings);
  const availableWidth = width - 4 - Math.abs(settings.offsetX);
  const qr = Math.min(height - 4 - Math.abs(settings.offsetY), availableWidth * .55);
  return <div className="af-label" style={{ width: `${width}mm`, height: `${height}mm`, boxSizing: 'border-box', padding: '2mm', display: 'flex', alignItems: 'center', gap: '2mm', overflow: 'hidden', background: 'white', color: 'black', breakAfter: 'page', breakInside: 'avoid', fontFamily: 'Arial,sans-serif' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'2mm', transform:`translate(${settings.offsetX}mm,${settings.offsetY}mm)` }}>
      <QRCodeSVG value={labelUrl(asset)} size={qr * 96 / 25.4} marginSize={4} level="M" style={{ width: `${qr}mm`, height: `${qr}mm`, flexShrink:0 }} />
      <div style={{ width: `${Math.max(5, availableWidth - qr - 2)}mm`, overflowWrap:'anywhere', fontSize:'8pt' }}><div style={{ maxHeight:'10mm', overflow:'hidden', fontWeight:600 }}>{asset.name}</div><div>{asset.assetNo || `#${asset.id}`}</div></div>
    </div>
  </div>;
}
export function LabelPrintSettings({ assets }: { assets: Asset[] }) {
  const [settings,setSettings] = useState<Settings>(DEFAULT);
  const [unit,setUnit] = useState<'mm'|'in'>('in');
  const [message,setMessage] = useState('');
  const [preview,setPreview] = useState(false);
  const previewRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{try { const saved=JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && validLabel(saved)) setSettings(saved); } catch {}},[]);
  const update=(patch: Partial<Settings>)=>{const next={...settings,...patch};setSettings(next);if(validLabel(next)){try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}}};
  let error='';
  try { if(!validLabel(settings)) throw new Error('Enter supported dimensions: width 24–104 mm, height 24–991 mm, offsets within ±10 mm, and 1–100 copies.'); if(assets[0]) labelUrl(assets[0]); } catch(e){error=(e as Error).message;}
  const checkQR=(container: HTMLElement)=>{
    const svg=container.querySelector('svg'); if(!svg) return;
    const modules=Number(svg.getAttribute('viewBox')?.split(' ')[3]);
    const printedWidth=parseFloat(svg.style.width);
    if(!modules || Math.floor(printedWidth*8/modules)<2) throw new Error('Label is too small for this QR payload. Increase the label dimensions or reduce offsets.');
    const snapped = Math.floor(printedWidth * 8 / modules) * modules / 8;
    svg.style.width = `${snapped}mm`; svg.style.height = `${snapped}mm`;
    const qrBounds = svg.getBoundingClientRect();
    const labelBounds = container.getBoundingClientRect();
    if(qrBounds.left < labelBounds.left || qrBounds.top < labelBounds.top || qrBounds.right > labelBounds.right || qrBounds.bottom > labelBounds.bottom) throw new Error('Alignment would clip the QR code. Reduce the offsets or increase label size.');
  };
  const print=(test: boolean)=>{
    if(error || !assets.length) return;
    const popup=window.open('','_blank','width=700,height=600');
    if(!popup){setMessage('Allow the print window to open, then try again.');return;}
    popup.opener=null;
    try {
      const {width,height}=dimensions(settings);
      popup.document.title='AssetFlow labels';
      const style=popup.document.createElement('style');style.textContent=`@page{size:${width}mm ${height}mm;margin:0}html,body{margin:0;padding:0}.af-label:last-child{break-after:auto}@media screen{body{background:#ddd}.af-label{margin-bottom:8px}}`;
      popup.document.head.append(style);
      const mount=popup.document.createElement('div');popup.document.body.append(mount);
      const labels=test?assets.slice(0,1):assets.flatMap(a=>Array.from({length:settings.copies},()=>a));
      if(labels.length>2000) throw new Error('Print at most 2,000 labels in one batch.');
      const root=createRoot(mount);
      flushSync(()=>root.render(<>{labels.map((a,i)=><Label key={i} asset={a} settings={settings}/>)}</>));
      mount.querySelectorAll<HTMLElement>('.af-label').forEach(checkQR);
      popup.addEventListener('afterprint',()=>{root.unmount();popup.close()},{once:true});
      popup.focus();popup.setTimeout(()=>popup.print(),250);
      setMessage('Print dialog opened. Select the label printer and matching media size; use actual size with headers and footers disabled.');
    } catch(e){popup.close();setMessage((e as Error).message);}
  };
  return <section className="border rounded-lg p-4 space-y-3" aria-label="Label printer settings">
    <h3 className="font-semibold">Label printer</h3>
    <div className="flex flex-wrap gap-3 items-end"><Button variant="outline" type="button" onClick={()=>{update(DEFAULT);setUnit('in')}}>GK420t · 2″ × 1″</Button><label>Units<select aria-label="Units" className="block border rounded p-2 bg-background" value={unit} onChange={e=>setUnit(e.target.value as 'mm'|'in')}><option value="in">Inches</option><option value="mm">Millimeters</option></select></label>
      {(['width','height','offsetX','offsetY'] as const).map(key=><label key={key} className="w-28 text-sm">{{width:'Width',height:'Height',offsetX:'Horizontal offset',offsetY:'Vertical offset'}[key]} ({unit})<Input type="number" step={unit==='in'?'0.01':'0.1'} value={Number((settings[key]/(unit==='in'?25.4:1)).toFixed(4))} onChange={e=>update({[key]:Number(e.target.value)*(unit==='in'?25.4:1)})}/></label>)}
      <label className="text-sm">Orientation<select className="block border rounded p-2 bg-background" value={settings.landscape?'rotated':'normal'} onChange={e=>update({landscape:e.target.value==='rotated'})}><option value="normal">As entered</option><option value="rotated">Rotate 90°</option></select></label>
      <label className="w-24 text-sm">Copies<Input type="number" min={1} max={100} value={settings.copies} onChange={e=>update({copies:Number(e.target.value)})}/></label>
    </div>
    <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={!!error || !assets.length} onClick={()=>{setPreview(!preview);setTimeout(()=>{try{if(previewRef.current)checkQR(previewRef.current)}catch(e){setMessage((e as Error).message)}},0)}}>Preview</Button><Button type="button" variant="outline" disabled={!!error || !assets.length} onClick={()=>print(true)}>Print Test Label</Button><Button type="button" disabled={!!error || !assets.length} onClick={()=>print(false)}>Print {assets.length * settings.copies} labels</Button></div>
    {preview && !error && assets[0] && <div ref={previewRef} className="overflow-auto border p-2"><Label asset={assets[0]} settings={settings}/></div>}
    <p role="status" className="text-sm text-muted-foreground">{error || message || 'Select assets to print. Existing sheet/PDF printing remains available above.'}</p>
  </section>;
}
