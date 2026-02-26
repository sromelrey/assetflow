"use client";

import React, { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { DataTable } from "./data-table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import StatCard from "./StatCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export interface FormOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "date";
  placeholder?: string;
  required?: boolean;
  options?: FormOption[];
  defaultValue?: any;
}

interface EntityManagerProps<T> {
  entityName: string;
  entityNamePlural?: string;
  data: T[];
  columns: any[];
  formFields: FormField[];
  keyExtractor: (item: T) => string | number;
  onCreate: (formData: any) => Promise<void>;
  onUpdate: (id: string | number, formData: any) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
  stats?: any[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  extraActions?: (item: T) => React.ReactNode;
}

export function EntityManager<T>({
  entityName,
  entityNamePlural,
  data,
  columns,
  formFields,
  keyExtractor,
  onCreate,
  onUpdate,
  onDelete,
  stats,
  searchPlaceholder = "Search...",
  isLoading = false,
  extraActions,
}: EntityManagerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pluralName = entityNamePlural || `${entityName}s`;

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentItem(null);
    const initialData: any = {};
    formFields.forEach((field) => {
      initialData[field.name] = field.defaultValue ?? "";
    });
    setFormData(initialData);
    setIsOpen(true);
  };

  const handleEdit = (item: T) => {
    setIsEditing(true);
    setCurrentItem(item);
    const editData: any = {};
    formFields.forEach((field) => {
      editData[field.name] = (item as any)[field.name] ?? "";
    });
    setFormData(editData);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && currentItem) {
        await onUpdate(keyExtractor(currentItem), formData);
      } else {
        await onCreate(formData);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save entity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 p-8 bg-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pluralName}</h1>
          <p className="text-muted-foreground">
            Manage and organize your {pluralName.toLowerCase()} here.
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add {entityName}
        </Button>
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} title={stat.label || stat.title} />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <DataTable
          columns={[
            ...columns,
            {
              id: "actions",
              header: () => <div className="text-right">Actions</div>,
              cell: ({ row }: any) => {
                return (
                  <div className="flex justify-end gap-2">
                    {extraActions && extraActions(row.original)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row.original);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete this ${entityName.toLowerCase()}?`)) {
                          onDelete(keyExtractor(row.original));
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={data}
          searchKey={formFields[0]?.name} // Default to first field for search if not specified
          searchPlaceholder={searchPlaceholder}
          isLoading={isLoading}
        />
      </div>

      {/* Slide-over / Dialog Form */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit ${entityName}` : `Add New ${entityName}`}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {isEditing ? "update" : "create"} the {entityName.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {formFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label} {field.required && <span className="text-destructive">*</span>}
                </Label>
                
                {field.type === "select" ? (
                  <Select
                    value={formData[field.name]?.toString()}
                    onValueChange={(val) => handleInputChange(field.name, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
