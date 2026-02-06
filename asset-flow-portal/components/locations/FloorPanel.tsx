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
  useGetFloorsQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
  Floor,
} from '@/store/api/locationsApi';
import { Pencil, Trash2, Plus, Loader2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface FloorPanelProps {
  buildingId?: number;
}

export function FloorPanel({ buildingId }: FloorPanelProps) {
  const { data: floors, isLoading } = useGetFloorsQuery(
    buildingId ? { buildingId } : undefined,
    { skip: !buildingId }
  );
  const [createFloor, { isLoading: isCreating }] = useCreateFloorMutation();
  const [updateFloor, { isLoading: isUpdating }] = useUpdateFloorMutation();
  const [deleteFloor, { isLoading: isDeleting }] = useDeleteFloorMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);

  const [formData, setFormData] = useState({
    floorNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingId) return;
    try {
      if (editingFloor) {
        await updateFloor({
          id: editingFloor.id,
          data: formData,
        }).unwrap();
        toast.success('Floor updated successfully');
      } else {
        await createFloor({ ...formData, buildingId }).unwrap();
        toast.success('Floor created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save floor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this floor?')) return;
    try {
      await deleteFloor(id).unwrap();
      toast.success('Floor deleted successfully');
    } catch (error) {
      toast.error('Failed to delete floor');
    }
  };

  const startEdit = (floor: Floor) => {
    setEditingFloor(floor);
    setFormData({ floorNumber: floor.floorNumber });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFloor(null);
    setFormData({ floorNumber: '' });
  };

  if (!buildingId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Floors</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Select a building to view floors
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Floors</h3>
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
              <DialogTitle>{editingFloor ? 'Edit Floor' : 'Add New Floor'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Floor Number</Label>
                <Input
                  required
                  value={formData.floorNumber}
                  onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                  placeholder="e.g. 1, 2, B1, G"
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
        ) : floors?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No floors found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Floor</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors?.map((floor) => (
                <TableRow key={floor.id}>
                  <TableCell className="font-medium">Floor {floor.floorNumber}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(floor)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(floor.id)}
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
