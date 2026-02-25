import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateAssetMutation, AssetStatus } from '@/store/api/assetsApi';
import { useGetUnitsQuery } from '@/store/api/organizationApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function AddAssetModal() {
  const [open, setOpen] = useState(false);
  
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

  const { data: units = [] } = useGetUnitsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createAsset, { isLoading }] = useCreateAssetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !unitId || !categoryId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      await createAsset({
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
        }
      }).unwrap();

      toast.success('Asset created successfully.');
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to create asset. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setCategoryId('');
    setUnitId('');
    setStatus('Active');
    setAssetType('');
    setPurchaseDate('');
    setAssetNo('');
    setSerialNo('');
    setBrand('');
    setModel('');
    setProcessor('');
    setMemory('');
    setStorage('');
    setComputerName('');
    setIpAddress('');
    setMacAddress('');
    setOperatingSystem('');
    setPoNumber('');
    setInvoiceNumber('');
    setSupplier('');
    setRemarks('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Enter the comprehensive details of the new asset below. Click save when you're done.
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
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Dell XPS 15" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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
                  <Label htmlFor="category">Category *</Label>
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
                  <Label htmlFor="unit">Unit *</Label>
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
                  <Label htmlFor="assetType">Asset Type</Label>
                  <Input id="assetType" value={assetType} onChange={e => setAssetType(e.target.value)} placeholder="e.g. Laptop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetNo">Asset No</Label>
                  <Input id="assetNo" value={assetNo} onChange={e => setAssetNo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNo">Serial No</Label>
                  <Input id="serialNo" value={serialNo} onChange={e => setSerialNo(e.target.value)} />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="hardware" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Dell" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. Latitude 5420" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="processor">Processor</Label>
                  <Input id="processor" value={processor} onChange={e => setProcessor(e.target.value)} placeholder="e.g. Intel Core i7-1185G7" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memory">Memory</Label>
                  <Input id="memory" value={memory} onChange={e => setMemory(e.target.value)} placeholder="e.g. 16GB DDR4" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage">Storage</Label>
                  <Input id="storage" value={storage} onChange={e => setStorage(e.target.value)} placeholder="e.g. 512GB NVMe SSD" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="computerName">Computer Name</Label>
                  <Input id="computerName" value={computerName} onChange={e => setComputerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input id="ipAddress" value={ipAddress} onChange={e => setIpAddress(e.target.value)} placeholder="e.g. 192.168.1.100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macAddress">MAC Address</Label>
                  <Input id="macAddress" value={macAddress} onChange={e => setMacAddress(e.target.value)} placeholder="e.g. 00:1B:44:11:3A:B7" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="operatingSystem">Operating System</Label>
                  <Input id="operatingSystem" value={operatingSystem} onChange={e => setOperatingSystem(e.target.value)} placeholder="e.g. Windows 11 Pro" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poNumber">PO Number</Label>
                  <Input id="poNumber" value={poNumber} onChange={e => setPoNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" value={supplier} onChange={e => setSupplier(e.target.value)} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input id="remarks" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any additional details..." />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
