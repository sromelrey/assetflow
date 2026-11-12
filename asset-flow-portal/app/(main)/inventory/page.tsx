'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useGetInventoryQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useAdjustStockMutation,
  Inventory,
  CreateInventoryDto,
  UpdateInventoryDto,
  AdjustStockDto,
} from '@/store/api/inventoryApi';
import { useGetCategoriesQuery } from '@/store/api/categoriesApi';
import { useGetUnitsQuery } from '@/store/api/organizationApi';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { data: inventory = [], isLoading, refetch } = useGetInventoryQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: units = [] } = useGetUnitsQuery();
  const [createInventory] = useCreateInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();
  const [deleteInventory] = useDeleteInventoryMutation();
  const [adjustStock] = useAdjustStockMutation();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState<CreateInventoryDto>({
    sku: '',
    name: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    minStockLevel: 0,
    categoryId: undefined,
    unitId: undefined,
  });
  const [stockData, setStockData] = useState<AdjustStockDto>({
    quantity: 0,
    reason: '',
  });

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        unitPrice: typeof formData.unitPrice === 'string' ? parseFloat(formData.unitPrice) || 0 : (formData.unitPrice || 0),
      };
      await createInventory(dataToSend).unwrap();
      toast.success('Inventory item created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        sku: '',
        name: '',
        description: '',
        quantity: 0,
        unitPrice: 0,
        minStockLevel: 0,
        categoryId: undefined,
        unitId: undefined,
      });
      refetch();
    } catch {
      toast.error('Failed to create inventory item');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sku: _, ...updateData } = formData;
        const dataToSend = {
          ...updateData,
          unitPrice: Number(updateData.unitPrice) || 0,
        };
        console.log('Sending update data:', dataToSend);
        await updateInventory({ id: selectedItem.id, data: dataToSend }).unwrap();
        toast.success('Inventory item updated successfully');
        setIsEditModalOpen(false);
        setSelectedItem(null);
        refetch();
      } catch {
        toast.error('Failed to update inventory item');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteInventory(id).unwrap();
        toast.success('Inventory item deleted successfully');
        refetch();
      } catch {
        toast.error('Failed to delete inventory item');
      }
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      try {
        await adjustStock({ id: selectedItem.id, data: stockData }).unwrap();
        toast.success('Stock adjusted successfully');
        setIsStockModalOpen(false);
        setSelectedItem(null);
        setStockData({ quantity: 0, reason: '' });
        refetch();
      } catch {
        toast.error('Failed to adjust stock');
      }
    }
  };

  const openEditModal = (item: Inventory) => {
    setSelectedItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : (item.unitPrice || 0),
      minStockLevel: item.minStockLevel,
      categoryId: item.category?.id,
      unitId: item.unit?.id,
    });
    setIsEditModalOpen(true);
  };

  const openStockModal = (item: Inventory) => {
    setSelectedItem(item);
    setStockData({ quantity: 0, reason: '' });
    setIsStockModalOpen(true);
  };

  const isLowStock = (item: Inventory) => item.quantity <= item.minStockLevel && item.minStockLevel > 0;

  const resetInventoryForm = () => {
    setFormData({
      sku: '',
      name: '',
      description: '',
      quantity: 0,
      unitPrice: 0,
      minStockLevel: 0,
      categoryId: undefined,
      unitId: undefined,
    });
    setSelectedItem(null);
  };

  const resetStockForm = () => {
    setStockData({ quantity: 0, reason: '' });
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground mt-1">Manage stock and inventory items</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Create a new inventory item</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Min Stock Level</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit/Location</Label>
                  <select
                    id="unit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.unitId || ''}
                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value ? parseInt(e.target.value) : undefined })}
                  >
                    <option value="">Select unit</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Min Stock</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category?.name || '—'}</TableCell>
                  <TableCell>{item.unit?.name || '—'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.minStockLevel}</TableCell>
                  <TableCell>
                    {item.unitPrice ? `₱${item.unitPrice}` : '—'}
                  </TableCell>
                  <TableCell>
                    {isLowStock(item) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Low Stock
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openStockModal(item)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) resetInventoryForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>Update inventory item details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unitPrice">Unit Price</Label>
                <Input
                  id="edit-unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minStockLevel">Min Stock Level</Label>
                <Input
                  id="edit-minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit/Location</Label>
                <select
                  id="edit-unit"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.unitId || ''}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value ? parseInt(e.target.value) : undefined })}
                >
                  <option value="">Select unit</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={(open) => {
        setIsStockModalOpen(open);
        if (!open) resetStockForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust stock quantity for {selectedItem?.name} (Current: {selectedItem?.quantity})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Quantity Change *</Label>
              <Input
                id="stock-quantity"
                type="number"
                placeholder="Positive to add, negative to remove"
                value={stockData.quantity}
                onChange={(e) => setStockData({ ...stockData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">
                New quantity will be: {selectedItem ? selectedItem.quantity + stockData.quantity : 0}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-reason">Reason *</Label>
              <Input
                id="stock-reason"
                placeholder="e.g., Stock replenishment, Damaged items"
                value={stockData.reason}
                onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Adjust Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
