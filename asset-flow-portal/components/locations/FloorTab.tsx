import React, { useState, useEffect } from 'react';
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
  useGetFloorsQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
  Floor,
} from '@/store/api/locationsApi';
import { Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export function FloorTab() {
  const { data: sites } = useGetSitesQuery();
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  
  const { data: buildings } = useGetBuildingsQuery(
    selectedSiteId ? { siteId: parseInt(selectedSiteId) } : undefined,
    { skip: !selectedSiteId }
  );
  
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');

  // Reset building selection when site changes
  useEffect(() => {
    setSelectedBuildingId('');
  }, [selectedSiteId]);

  const { data: floors, isLoading } = useGetFloorsQuery(
    selectedBuildingId ? { buildingId: parseInt(selectedBuildingId) } : undefined,
    { skip: !selectedBuildingId }
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
    if (!selectedBuildingId) return;

    try {
      if (editingFloor) {
        await updateFloor({
          id: editingFloor.id,
          data: formData,
        }).unwrap();
        toast.success('Floor updated successfully');
      } else {
        await createFloor({
          ...formData,
          buildingId: parseInt(selectedBuildingId),
        }).unwrap();
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
    setFormData({
      floorNumber: floor.floorNumber,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFloor(null);
    setFormData({ floorNumber: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-[200px]">
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

        <div className="w-full sm:w-[200px]">
          <Select 
            value={selectedBuildingId} 
            onValueChange={setSelectedBuildingId}
            disabled={!selectedSiteId || !buildings?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Building" />
            </SelectTrigger>
            <SelectContent>
              {buildings?.map((building) => (
                <SelectItem key={building.id} value={building.id.toString()}>
                  {building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBuildingId && (
          <div className="sm:ml-auto">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Floor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFloor ? 'Edit Floor' : 'Add New Floor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Floor Number/Name</Label>
                    <Input
                      required
                      value={formData.floorNumber}
                      onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                      placeholder="e.g. 1st Floor, Level 2"
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

      {!selectedBuildingId ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md border-dashed">
          Please select a site and building to manage floors
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Floor Number</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No floors found for this building
                  </TableCell>
                </TableRow>
              ) : (
                floors?.map((floor) => (
                  <TableRow key={floor.id}>
                    <TableCell className="font-medium">{floor.floorNumber}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(floor)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(floor.id)}
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
