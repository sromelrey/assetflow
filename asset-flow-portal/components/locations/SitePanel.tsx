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
  useGetSitesQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation,
  Site,
} from '@/store/api/locationsApi';
import { Pencil, Trash2, Plus, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SitePanelProps {
  selectedId?: number;
  onSelect: (id: number) => void;
}

export function SitePanel({ selectedId, onSelect }: SitePanelProps) {
  const { data: sites, isLoading } = useGetSitesQuery();
  const [createSite, { isLoading: isCreating }] = useCreateSiteMutation();
  const [updateSite, { isLoading: isUpdating }] = useUpdateSiteMutation();
  const [deleteSite, { isLoading: isDeleting }] = useDeleteSiteMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSite) {
        await updateSite({
          id: editingSite.id,
          data: formData,
        }).unwrap();
        toast.success('Site updated successfully');
      } else {
        await createSite(formData).unwrap();
        toast.success('Site created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save site');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this site?')) return;
    try {
      await deleteSite(id).unwrap();
      toast.success('Site deleted successfully');
    } catch (error) {
      toast.error('Failed to delete site');
    }
  };

  const startEdit = (site: Site, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSite(site);
    setFormData({
      name: site.name,
      address: site.address || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSite(null);
    setFormData({ name: '', address: '' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Sites</h3>
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
              <DialogTitle>{editingSite ? 'Edit Site' : 'Add New Site'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Headquarters"
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 123 Main St"
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
        ) : sites?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No sites found
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
              {sites?.map((site) => (
                <TableRow
                  key={site.id}
                  onClick={() => onSelect(site.id)}
                  className={cn(
                    "cursor-pointer",
                    selectedId === site.id && "bg-primary/10"
                  )}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{site.name}</div>
                      {site.address && (
                        <div className="text-xs text-muted-foreground truncate w-[250px]">{site.address}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => startEdit(site, e)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(site.id, e)}
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
