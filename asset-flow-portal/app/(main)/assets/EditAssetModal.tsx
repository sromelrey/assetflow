import React, { useState, useEffect, useMemo } from 'react';
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
import { useUpdateAssetMutation, AssetStatus, Asset } from '@/store/api/assetsApi';
import { useGetUnitsQuery } from '@/store/api/organizationApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { toast } from 'sonner';

interface EditAssetModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAssetModal({ asset, open, onOpenChange }: EditAssetModalProps) {
  // Core Information
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [status, setStatus] = useState<AssetStatus>('Active');
  const [assetType, setAssetType] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [assetNo, setAssetNo] = useState('');
  const [serialNo, setSerialNo] = useState('');

  // Hardware Specifications
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [processor, setProcessor] = useState('');
  const [memory, setMemory] = useState('');
  const [storage, setStorage] = useState('');

  // Network & System
  const [computerName, setComputerName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');

  // Administrative
  const [poNumber, setPoNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [remarks, setRemarks] = useState('');

  // Desktop Accessories
  const [hasMouse, setHasMouse] = useState(true);
  const [hasKeyboard, setHasKeyboard] = useState(true);
  const [hasAntivirus, setHasAntivirus] = useState(true);

  const { data: units = [] } = useGetUnitsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [updateAsset, { isLoading }] = useUpdateAssetMutation();

  // Find Desktop category ID
  const desktopCategoryId = useMemo(() => {
    const desktopCategory = categories.find(cat => cat.name.toLowerCase() === 'desktop');
    return desktopCategory ? desktopCategory.id.toString() : null;
  }, [categories]);

  useEffect(() => {
    if (asset && open) {
      setName(asset.name || '');
      setCategoryId(asset.category?.id?.toString() || '');
      setUnitId(asset.unit?.id?.toString() || '');
      setStatus(asset.status || 'Active');
      setAssetType(asset.assetType || '');
      
      // Handle date formatting if necessary (assuming YYYY-MM-DD for input type="date")
      if (asset.purchaseDate) {
        setPurchaseDate(new Date(asset.purchaseDate).toISOString().split('T')[0]);
      } else {
        setPurchaseDate('');
      }

      setAssetNo(asset.assetNo || '');
      setSerialNo(asset.serialNo || '');

      const d = asset.assetDetails;
      setBrand(d?.brand || '');
      setModel(d?.model || '');
      setProcessor(d?.processor || '');
      setMemory(d?.memory || '');
      setStorage(d?.storage || '');

      setComputerName(d?.computerName || '');
      setIpAddress(d?.ipAddress || '');
      setMacAddress(d?.macAddress || '');
      setOperatingSystem(d?.operatingSystem || '');

      setPoNumber(d?.poNumber || '');
      setInvoiceNumber(d?.invoiceNumber || '');
      setSupplier(d?.supplier || '');
      setRemarks(d?.remarks || '');

      // Populate desktop accessories from metadata
      const metadata = d?.metadata as { hasMouse?: boolean; hasKeyboard?: boolean; hasAntivirus?: boolean } | undefined;
      setHasMouse(metadata?.hasMouse ?? true);
      setHasKeyboard(metadata?.hasKeyboard ?? true);
      setHasAntivirus(metadata?.hasAntivirus ?? true);
    }
  }, [asset, open]);

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
          serialNo: serialNo || undefined,
          assetNo: assetNo || undefined,
          assetType: assetType || undefined,
          purchaseDate: purchaseDate || undefined,
          status,
          unitId: parseInt(unitId, 10),
          categoryId: parseInt(categoryId, 10),
          details: {
            brand: brand || undefined,
            model: model || undefined,
            processor: processor || undefined,
            memory: memory || undefined,
            storage: storage || undefined,
            computerName: computerName || undefined,
            ipAddress: ipAddress || undefined,
            macAddress: macAddress || undefined,
            operatingSystem: operatingSystem || undefined,
            poNumber: poNumber || undefined,
            invoiceNumber: invoiceNumber || undefined,
            supplier: supplier || undefined,
            remarks: remarks || undefined,
            metadata: desktopCategoryId === categoryId ? {
              hasMouse,
              hasKeyboard,
              hasAntivirus
            } : undefined
          }
        }
      }).unwrap();

      toast.success('Asset updated successfully.');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update asset. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update the details of the asset below. Click save when you're done.
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
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
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
                          checked={hasMouse}
                          onChange={(e) => setHasMouse(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-sm">Mouse</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasKeyboard}
                          onChange={(e) => setHasKeyboard(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span className="text-sm">Keyboard</span>
                      </label>
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
