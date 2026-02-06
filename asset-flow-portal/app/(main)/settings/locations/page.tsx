"use client";

import React, { useState } from 'react';
import { SitePanel } from '@/components/locations/SitePanel';
import { BuildingPanel } from '@/components/locations/BuildingPanel';
import { FloorPanel } from '@/components/locations/FloorPanel';
import { MapPin } from 'lucide-react';

export default function LocationsPage() {
  const [selectedSiteId, setSelectedSiteId] = useState<number | undefined>();
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | undefined>();

  const handleSiteSelect = (id: number) => {
    setSelectedSiteId(id);
    setSelectedBuildingId(undefined); // Reset building when site changes
  };

  const handleBuildingSelect = (id: number) => {
    setSelectedBuildingId(id);
  };

  return (
    <div className="p-8 h-full">
      {/* Header */}
      <div className="mb-6">
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

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <SitePanel 
            selectedId={selectedSiteId} 
            onSelect={handleSiteSelect} 
          />
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <BuildingPanel 
            siteId={selectedSiteId}
            selectedId={selectedBuildingId}
            onSelect={handleBuildingSelect}
          />
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <FloorPanel 
            buildingId={selectedBuildingId}
          />
        </div>
      </div>
    </div>
  );
}
