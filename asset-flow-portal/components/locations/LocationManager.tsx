import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin } from 'lucide-react';
import { SiteTab } from './SiteTab';
import { BuildingTab } from './BuildingTab';
import { FloorTab } from './FloorTab';

export function LocationManager() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          Manage Locations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Location Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="floors">Floors</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="sites">
              <SiteTab />
            </TabsContent>
            
            <TabsContent value="buildings">
              <BuildingTab />
            </TabsContent>
            
            <TabsContent value="floors">
              <FloorTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
