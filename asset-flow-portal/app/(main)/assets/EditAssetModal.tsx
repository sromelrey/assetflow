import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAssetByIdQuery, useUpdateAssetMutation, AssetStatus, Asset } from '@/store/api/assetsApi';
import { useGetUnitsQuery } from '@/store/api/organizationApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { toast } from 'sonner';
import { HardwareExtras, HardwareValue } from '@/components/HardwareExtras';

interface EditAssetModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAssetModal(props: EditAssetModalProps) {
  const { currentData, isFetching, isError, refetch } = useGetAssetByIdQuery(props.asset?.id || 0, { skip: !props.open || !props.asset, refetchOnMountOrArgChange: true });
  if (!props.open || !props.asset) return null;
  if (!currentData || isFetching || isError) return <Dialog open onOpenChange={props.onOpenChange}><DialogContent><DialogHeader><DialogTitle>Edit Asset</DialogTitle><DialogDescription>{isError ? 'Unable to load this asset. Retry before editing.' : 'Loading current asset details…'}</DialogDescription></DialogHeader>{isError && <Button onClick={() => refetch()}>Retry</Button>}</DialogContent></Dialog>;
  return <EditAssetForm key={currentData.id} {...props} asset={currentData} />;
}

function EditAssetForm({ asset, open, onOpenChange }: EditAssetModalProps) {
  const metadata = asset?.assetDetails?.metadata as Record<string, unknown> | undefined;
  // Core Information
  const [name, setName] = useState(asset?.name || '');
  const [categoryId, setCategoryId] = useState<string>(asset?.category?.id?.toString() || '');
  const [unitId, setUnitId] = useState<string>(asset?.unit?.id?.toString() || '');
  const [status, setStatus] = useState<AssetStatus>(asset?.status || 'Active');
  const [assetType, setAssetType] = useState(asset?.assetType || '');
  const [purchaseDate, setPurchaseDate] = useState(asset?.purchaseDate?.slice(0,10) || '');
  const [assetNo, setAssetNo] = useState(asset?.assetNo || '');
  const [serialNo, setSerialNo] = useState(asset?.serialNo || '');

  const [hardware, setHardware] = useState<HardwareValue>({ components: Array.isArray(metadata?.components) ? metadata.components as string[] : [...(metadata?.hasMouse === true ? ['Mouse'] : []), ...(metadata?.hasKeyboard === true ? ['Keyboard'] : [])], chargerIncluded: typeof metadata?.chargerIncluded === 'boolean' ? metadata.chargerIncluded : undefined, ocsLink: typeof metadata?.ocsLink === 'string' ? metadata.ocsLink : '', monitors: asset?.monitors || [] });
  // Hardware Specifications
  const [brand, setBrand] = useState(asset?.assetDetails?.brand || '');
  const [model, setModel] = useState(asset?.assetDetails?.model || '');
  const [processor, setProcessor] = useState(asset?.assetDetails?.processor || '');
  const [memory, setMemory] = useState(asset?.assetDetails?.memory || '');
  const [storage, setStorage] = useState(asset?.assetDetails?.storage || '');

  // Network & System
  const [computerName, setComputerName] = useState(asset?.assetDetails?.computerName || '');
  const [ipAddress, setIpAddress] = useState(asset?.assetDetails?.ipAddress || '');
  const [macAddress, setMacAddress] = useState(String(metadata?.macAddress || asset?.assetDetails?.macAddress || ''));
  const [operatingSystem, setOperatingSystem] = useState(asset?.assetDetails?.operatingSystem || '');

  // Administrative
  const [poNumber, setPoNumber] = useState(asset?.assetDetails?.poNumber || '');
  const [invoiceNumber, setInvoiceNumber] = useState(String(metadata?.invoiceNumber || asset?.assetDetails?.invoiceNumber || ''));
  const [supplier, setSupplier] = useState(String(metadata?.supplier || asset?.assetDetails?.supplier || ''));
  const [remarks, setRemarks] = useState(asset?.assetDetails?.remarks || '');

  // Desktop Accessories


  const [hasAntivirus, setHasAntivirus] = useState(metadata?.hasAntivirus !== false);

  const { data: units = [] } = useGetUnitsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [updateAsset, { isLoading }] = useUpdateAssetMutation();

  // Find Desktop category ID
  const desktopCategoryId = useMemo(() => {
    const desktopCategory = categories.find(cat => cat.name.toLowerCase() === 'desktop');
    return desktopCategory ? desktopCategory.id.toString() : null;
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset) return;

    if (!name || !unitId || !categoryId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await updateAsset({
        id: asset.id,
        data: {
          name,
          expectedUpdatedAt: asset.updatedAt,
          serialNo: serialNo || undefined,
          assetNo: assetNo || undefined,
          assetType: assetType || undefined,
          purchaseDate: purchaseDate || undefined,
          status,
          unitId: parseInt(unitId, 10),
          categoryId: parseInt(categoryId, 10),
          monitorAssetIds: hardware.monitors.map(m => m.id),
          details: {
            brand: brand || undefined,
            model: model || undefined,
            processor: processor || undefined,
            memory: memory || undefined,
            storage: storage || undefined,
            computerName: computerName || undefined,
            ipAddress: ipAddress || undefined,

            operatingSystem: operatingSystem || undefined,
            poNumber: poNumber || undefined,

            remarks: remarks || undefined,
            metadata: {
              ...(desktopCategoryId === categoryId ? { hasAntivirus } : {}),
              components: hardware.components,
              macAddress, invoiceNumber, supplier,
              ...(hardware.chargerIncluded === undefined ? {} : { chargerIncluded: hardware.chargerIncluded }),
              ocsLink: hardware.ocsLink
            }
          }
        }
      }).unwrap();

      toast.success('Asset updated successfully.');
      onOpenChange(false);
    } catch (error) {
      toast.error((error as { data?: { message?: string } }).data?.message || 'Failed to update asset. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update the details of the asset below. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto flex flex-col gap-4 py-4 pr-4 pl-1">
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="core">Core Info</TabsTrigger>
              <TabsTrigger value="hardware">Hardware</TabsTrigger>
              <TabsTrigger value="network">Network/System</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="core" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Dell XPS 15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as AssetStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Deployed">Deployed</SelectItem>
                      <SelectItem value="For Deployment">For Deployment</SelectItem>
                      <SelectItem value="In Storage">In Storage</SelectItem>
                      <SelectItem value="For Repair">For Repair</SelectItem>
                      <SelectItem value="Decommissioned">Decommissioned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit *</Label>
                  <Select value={unitId} onValueChange={setUnitId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id.toString()}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assetType">Asset Type</Label>
                  <Input id="edit-assetType" value={assetType} onChange={e => setAssetType(e.target.value)} placeholder="e.g. Laptop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
                  <Input id="edit-purchaseDate" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-assetNo">Asset No</Label>
                  <Input id="edit-assetNo" value={assetNo} onChange={e => setAssetNo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-serialNo">Serial No</Label>
                  <Input id="edit-serialNo" value={serialNo} onChange={e => setSerialNo(e.target.value)} />
                </div>
                {categoryId === desktopCategoryId && (
                  <div className="col-span-2 space-y-3 pt-4 border-t">
                    <Label className="text-sm font-semibold">Desktop Accessories</Label>
                    <div className="flex gap-6">
                      
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasAntivirus}
                          onChange={(e) => setHasAntivirus(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-sm">Antivirus</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="hardware" className="space-y-4 mt-4">
              <HardwareExtras value={hardware} onChange={setHardware} category={categories.find(c => String(c.id) === categoryId)?.name || ''} assetId={asset?.id} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-brand">Brand</Label>
                  <Input id="edit-brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Dell" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Model</Label>
                  <Input id="edit-model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Latitude 5420" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-processor">Processor</Label>
                  <Input id="edit-processor" value={processor} onChange={e => setProcessor(e.target.value)} placeholder="e.g. Intel Core i7-1185G7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-memory">Memory</Label>
                  <Input id="edit-memory" value={memory} onChange={e => setMemory(e.target.value)} placeholder="e.g. 16GB DDR4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-storage">Storage</Label>
                  <Input id="edit-storage" value={storage} onChange={e => setStorage(e.target.value)} placeholder="e.g. 512GB NVMe SSD" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-computerName">Computer Name</Label>
                  <Input id="edit-computerName" value={computerName} onChange={e => setComputerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-ipAddress">IP Address</Label>
                  <Input id="edit-ipAddress" value={ipAddress} onChange={e => setIpAddress(e.target.value)} placeholder="e.g. 192.168.1.100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-macAddress">MAC Address</Label>
                  <Input id="edit-macAddress" value={macAddress} onChange={e => setMacAddress(e.target.value)} placeholder="e.g. 00:1B:44:11:3A:B7" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-operatingSystem">Operating System</Label>
                  <Input id="edit-operatingSystem" value={operatingSystem} onChange={e => setOperatingSystem(e.target.value)} placeholder="e.g. Windows 11 Pro" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-poNumber">PO Number</Label>
                  <Input id="edit-poNumber" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceNumber">Invoice Number</Label>
                  <Input id="edit-invoiceNumber" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Input id="edit-supplier" value={supplier} onChange={e => setSupplier(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-remarks">Remarks</Label>
                  <Input id="edit-remarks" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any additional details..." />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
