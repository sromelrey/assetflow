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
  useGetSitesQuery,
  useGetBuildingsQuery,
  useCreateBuildingMutation,
  useUpdateBuildingMutation,
  useDeleteBuildingMutation,
  Building,
} from '@/store/api/locationsApi';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export function BuildingTab() {
  const { data: sites } = useGetSitesQuery();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  
  const { data: buildings, isLoading } = useGetBuildingsQuery(
    selectedSiteId ? { siteId: parseInt(selectedSiteId) } : undefined,
    { skip: !selectedSiteId }
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
    if (!selectedSiteId) return;

    try {
      if (editingBuilding) {
        await updateBuilding({
          id: editingBuilding.id,
          data: formData,
        }).unwrap();
        toast.success('Building updated successfully');
      } else {
        await createBuilding({
          ...formData,
          siteId: parseInt(selectedSiteId),
        }).unwrap();
        toast.success('Building created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save building');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this building?')) return;
    try {
      await deleteBuilding(id).unwrap();
      toast.success('Building deleted successfully');
    } catch (error) {
      toast.error('Failed to delete building');
    }
  };

  const startEdit = (building: Building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBuilding(null);
    setFormData({ name: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-[250px]">
          <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a Site" />
            </SelectTrigger>
            <SelectContent>
              {sites?.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSiteId && (
          <div className="ml-auto">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Building
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
                      placeholder="e.g. Main Block"
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
        )}
      </div>

      {!selectedSiteId ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
          Please select a site to manage buildings
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No buildings found for this site
                  </TableCell>
                </TableRow>
              ) : (
                buildings?.map((building) => (
                  <TableRow key={building.id}>
                    <TableCell className="font-medium">{building.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(building)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(building.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
