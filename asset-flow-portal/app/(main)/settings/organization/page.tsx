"use client";

import React, { useState } from 'react';
import { DivisionPanel } from '@/components/organization/DivisionPanel';
import { DepartmentPanel } from '@/components/organization/DepartmentPanel';
import { UnitPanel } from '@/components/organization/UnitPanel';
import { GitBranch } from 'lucide-react';

export default function OrganizationPage() {
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | undefined>();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();

  const handleDivisionSelect = (id: number) => {
    setSelectedDivisionId(id);
    setSelectedDepartmentId(undefined);
  };

  const handleDepartmentSelect = (id: number) => {
    setSelectedDepartmentId(id);
  };

  return (
    <div className="p-8 h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <GitBranch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Organization</h1>
            <p className="text-muted-foreground">Manage divisions, departments, and units</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <DivisionPanel 
            selectedId={selectedDivisionId} 
            onSelect={handleDivisionSelect} 
          />
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <DepartmentPanel 
            divisionId={selectedDivisionId}
            selectedId={selectedDepartmentId}
            onSelect={handleDepartmentSelect}
          />
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <UnitPanel 
            departmentId={selectedDepartmentId}
          />
        </div>
      </div>
    </div>
  );
}
