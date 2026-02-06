"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SiteTab } from '@/components/locations/SiteTab';
import { BuildingTab } from '@/components/locations/BuildingTab';
import { FloorTab } from '@/components/locations/FloorTab';
import { MapPin } from 'lucide-react';

export default function LocationsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Locations</h1>
            <p className="text-muted-foreground">Manage sites, buildings, and floors</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border border-border p-6">
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="sites">Sites</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="floors">Floors</TabsTrigger>
          </TabsList>
          <TabsContent value="sites">
            <SiteTab />
          </TabsContent>
          <TabsContent value="buildings">
            <BuildingTab />
          </TabsContent>
          <TabsContent value="floors">
            <FloorTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
