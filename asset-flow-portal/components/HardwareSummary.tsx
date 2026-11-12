'use client';
import Link from 'next/link';
import { Asset, useGetAssetByIdQuery } from '@/store/api/assetsApi';
export function HardwareSummary({ asset }: { asset: Asset }) {
  const { currentData }=useGetAssetByIdQuery(asset.id);
  const record=currentData || asset;
  const meta=record.assetDetails?.metadata as Record<string, unknown> | undefined;
  const components=Array.isArray(meta?.components) ? meta.components.filter(x=>typeof x==='string') : [];
  let ocs: string | null=null;
  try{const url=new URL(String(meta?.ocsLink || ''));if(['http:','https:'].includes(url.protocol)&&!url.username&&!url.password)ocs=url.href}catch{}
  return <section className="space-y-2 text-sm"><h3 className="font-semibold">Included Hardware</h3><p>Components: {components.length ? components.join(', ') : 'Not recorded'}</p>
    {['laptop','mobile','noc'].includes(record.category?.name.trim().toLowerCase()) && <p>Charger Included: {typeof meta?.chargerIncluded === 'boolean' ? meta.chargerIncluded ? 'Yes' : 'No' : 'Not recorded'}</p>}
    {!!record.monitors?.length && <div>Monitors: {record.monitors.map(m=><div key={m.id}><Link className="text-primary underline" href={`/assets/${m.id}`}>{m.assetNo || m.name}</Link></div>)}</div>}
    {ocs && <a className="text-primary underline" href={ocs} target="_blank" rel="noopener noreferrer">View in OCS</a>}
  </section>;
}
