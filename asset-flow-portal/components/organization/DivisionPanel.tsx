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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
  Division,
} from '@/store/api/organizationApi';
import { useGetFloorsQuery, useGetBuildingsQuery, useGetSitesQuery } from '@/store/api/locationsApi';
import { Pencil, Trash2, Plus, Loader2, GitBranch } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DivisionPanelProps {
  selectedId?: number;
  onSelect: (id: number) => void;
}

export function DivisionPanel({ selectedId, onSelect }: DivisionPanelProps) {
  const { data: sites } = useGetSitesQuery();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const { data: buildings } = useGetBuildingsQuery(
    selectedSiteId ? { siteId: parseInt(selectedSiteId) } : undefined,
    { skip: !selectedSiteId }
  );
  const { data: floors } = useGetFloorsQuery(
    selectedBuildingId ? { buildingId: parseInt(selectedBuildingId) } : undefined,
    { skip: !selectedBuildingId }
  );
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');

  const { data: divisions, isLoading } = useGetDivisionsQuery(
    selectedFloorId ? { floorId: parseInt(selectedFloorId) } : undefined,
    { skip: !selectedFloorId }
  );
  const [createDivision, { isLoading: isCreating }] = useCreateDivisionMutation();
  const [updateDivision, { isLoading: isUpdating }] = useUpdateDivisionMutation();
  const [deleteDivision, { isLoading: isDeleting }] = useDeleteDivisionMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFloorId) return;
    try {
      if (editingDivision) {
        await updateDivision({
          id: editingDivision.id,
          data: formData,
        }).unwrap();
        toast.success('Division updated successfully');
      } else {
        await createDivision({ ...formData, floorId: parseInt(selectedFloorId) }).unwrap();
        toast.success('Division created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save division');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this division?')) return;
    try {
      await deleteDivision(id).unwrap();
      toast.success('Division deleted successfully');
    } catch (error) {
      toast.error('Failed to delete division');
    }
  };

  const startEdit = (division: Division, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDivision(division);
    setFormData({ name: division.name, status: division.status || 'active' });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDivision(null);
    setFormData({ name: '', status: 'active' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Divisions</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1" disabled={!selectedFloorId}>
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDivision ? 'Edit Division' : 'Add New Division'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Operations"
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

      {/* Floor Selector */}
      <div className="p-3 border-b space-y-2">
        <Select value={selectedSiteId} onValueChange={(v) => { setSelectedSiteId(v); setSelectedBuildingId(''); setSelectedFloorId(''); }}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select site" />
          </SelectTrigger>
          <SelectContent>
            {sites?.map((site) => (
              <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedBuildingId} onValueChange={(v) => { setSelectedBuildingId(v); setSelectedFloorId(''); }} disabled={!selectedSiteId}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select building" />
          </SelectTrigger>
          <SelectContent>
            {buildings?.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedFloorId} onValueChange={setSelectedFloorId} disabled={!selectedBuildingId}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select floor" />
          </SelectTrigger>
          <SelectContent>
            {floors?.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>Floor {f.floorNumber}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        {!selectedFloorId ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Select a floor to view divisions
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
          </div>
        ) : divisions?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No divisions found
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
              {divisions?.map((division) => (
                <TableRow
                  key={division.id}
                  onClick={() => onSelect(division.id)}
                  className={cn("cursor-pointer", selectedId === division.id && "bg-primary/10")}
                >
                  <TableCell className="font-medium">{division.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => startEdit(division, e)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => handleDelete(division.id, e)} disabled={isDeleting}>
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
