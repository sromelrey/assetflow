"use client";

import React, { useState } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useGetBuildingsQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  Building,
} from '@/store/api/locationsApi';
import { Pencil, Trash2, Plus, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BuildingPanelProps {
  siteId?: number;
  selectedId?: number;
  onSelect: (id: number) => void;
}

export function BuildingPanel({ siteId, selectedId, onSelect }: BuildingPanelProps) {
  const { data: buildings, isLoading } = useGetBuildingsQuery(
    siteId ? { siteId } : undefined,
    { skip: !siteId }
  );
  const [createBuilding, { isLoading: isCreating }] = useCreateBuildingMutation();
  const [updateBuilding, { isLoading: isUpdating }] = useUpdateBuildingMutation();
  const [deleteBuilding, { isLoading: isDeleting }] = useDeleteBuildingMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const [formData, setFormData] = useState({
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;
    try {
      if (editingBuilding) {
        await updateBuilding({
          id: editingBuilding.id,
          data: formData,
        }).unwrap();
        toast.success('Building updated successfully');
      } else {
        await createBuilding({ ...formData, siteId }).unwrap();
        toast.success('Building created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save building');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this building?')) return;
    try {
      await deleteBuilding(id).unwrap();
      toast.success('Building deleted successfully');
    } catch (error) {
      toast.error('Failed to delete building');
    }
  };

  const startEdit = (building: Building, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBuilding(building);
    setFormData({ name: building.name });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBuilding(null);
    setFormData({ name: '' });
  };

  if (!siteId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Buildings</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select a site to view buildings
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Buildings</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBuilding ? 'Edit Building' : 'Add New Building'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Tower"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : buildings?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No buildings found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildings?.map((building) => (
                <TableRow
                  key={building.id}
                  onClick={() => onSelect(building.id)}
                  className={cn(
                    "cursor-pointer",
                    selectedId === building.id && "bg-primary/10"
                  )}
                >
                  <TableCell className="font-medium">{building.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => startEdit(building, e)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(building.id, e)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
