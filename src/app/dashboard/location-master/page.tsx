
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Upload, FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MainLocation } from '@/lib/types';
import { locations as defaultLocations } from '@/lib/data';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

function BulkUploadModal({ onLocationsUploaded }: { onLocationsUploaded: (newLocations: MainLocation[]) => void }) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Dynamically import xlsx library only on the client side
      const { read, utils } = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as { 'Location ID': string; 'Descriptive Name': string }[];

      if (!jsonData[0] || !('Location ID' in jsonData[0] && 'Descriptive Name' in jsonData[0])) {
          throw new Error("Invalid Excel format. Make sure you have 'Location ID' and 'Descriptive Name' columns.");
      }

      const newLocations: MainLocation[] = jsonData.map(row => ({
        id: (row['Location ID'] || '').toLowerCase().replace(/\s+/g, '-'),
        name: row['Location ID'] || '',
        descriptiveName: row['Descriptive Name'] || '',
        subLocations: [],
      })).filter(loc => loc.id && loc.name);

      if (newLocations.length > 0) {
        onLocationsUploaded(newLocations);
        toast({
          title: "Upload Successful",
          description: `${newLocations.length} locations have been imported.`,
        });
        setOpen(false);
      } else {
        throw new Error("No valid locations found in the file.");
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Upload Failed",
        description: error.message || "There was a problem processing your file.",
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Locations</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx) with columns "Location ID" and "Descriptive Name".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="file-upload" className="sr-only">Choose file</Label>
          <Input 
            id="file-upload" 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            disabled={isProcessing} 
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
        {isProcessing && <div className="flex items-center justify-center"><p>Processing file...</p></div>}
        <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function CreateLocationModal({ onLocationCreated }: { onLocationCreated: (newLocation: MainLocation) => void }) {
  const [open, setOpen] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [descriptiveName, setDescriptiveName] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationId.trim()) {
      setError('Location ID cannot be empty.');
      return;
    }
    if (!descriptiveName.trim()) {
      setError('Descriptive name cannot be empty.');
      return;
    }
    const newLocation: MainLocation = {
      id: locationId.toLowerCase().replace(/\s+/g, '-'),
      name: locationId,
      descriptiveName: descriptiveName,
      subLocations: [],
    };
    onLocationCreated(newLocation);
    toast({
      title: "Location Created",
      description: `Location "${locationId}" has been successfully created.`,
    });
    setLocationId('');
    setDescriptiveName('');
    setError('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Location</DialogTitle>
          <DialogDescription>
            Enter a unique ID and a descriptive name for the new master location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-id" className="text-right">
                Location ID
              </Label>
              <Input
                id="location-id"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="col-span-3"
                placeholder="e.g. ED-HYD-RO"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descriptive-name" className="text-right">
                Descriptive Name
              </Label>
              <Input
                id="descriptive-name"
                value={descriptiveName}
                onChange={(e) => setDescriptiveName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Corporate Office"
              />
            </div>
            {error && <p className="col-span-4 text-sm text-destructive text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditLocationModal({
  location,
  onLocationUpdated,
  onOpenChange,
}: {
  location: MainLocation | null;
  onLocationUpdated: (originalId: string, updatedLocation: MainLocation) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [descriptiveName, setDescriptiveName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (location) {
      setName(location.name);
      setDescriptiveName(location.descriptiveName || '');
    }
  }, [location]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!location) return;

    const updatedLocation: MainLocation = {
      ...location,
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      descriptiveName,
    };
    onLocationUpdated(location.id, updatedLocation);
    toast({
      title: "Location Updated",
      description: `Details for "${location.name}" have been updated.`,
    });
    onOpenChange(false);
  };
  
  if (!location) return null;

  return (
    <Dialog open={!!location} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Location: {location.name}</DialogTitle>
          <DialogDescription>
            Update the details for this master location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-id" className="text-right">
                Location ID
              </Label>
              <Input
                id="location-id"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descriptive-name" className="text-right">
                Descriptive Name
              </Label>
              <Input
                id="descriptive-name"
                value={descriptiveName}
                onChange={(e) => setDescriptiveName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Corporate Office"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function LocationMasterPage() {
  const [locations, setLocations] = useState<MainLocation[]>([]);
  const [editingLocation, setEditingLocation] = useState<MainLocation | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<MainLocation | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocations = localStorage.getItem('locations');
      if (storedLocations) {
        setLocations(JSON.parse(storedLocations));
      } else {
        localStorage.setItem('locations', JSON.stringify(defaultLocations));
        setLocations(defaultLocations);
      }
    }
  }, []);
  
  const updateLocalStorage = (updatedLocations: MainLocation[]) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('locations', JSON.stringify(updatedLocations));
      }
  };

  const handleLocationCreated = (newLocation: MainLocation) => {
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    updateLocalStorage(updatedLocations);
  };
  
  const handleLocationsUploaded = (newLocations: MainLocation[]) => {
    setLocations(prevLocations => {
      const existingIds = new Set(prevLocations.map(l => l.id));
      const uniqueNewLocations = newLocations.filter(nl => !existingIds.has(nl.id));
      const updatedLocations = [...prevLocations, ...uniqueNewLocations];
      updateLocalStorage(updatedLocations);
      return updatedLocations;
    });
  };

  const handleLocationUpdated = (originalId: string, updatedLocation: MainLocation) => {
    const updatedLocations = locations.map(loc => 
      loc.id === originalId ? updatedLocation : loc
    );
    setLocations(updatedLocations);
    updateLocalStorage(updatedLocations);
    setEditingLocation(null);
  };
  
  const handleLocationDeleted = () => {
    if (!deletingLocation) return;
    const updatedLocations = locations.filter(loc => loc.id !== deletingLocation.id);
    setLocations(updatedLocations);
    updateLocalStorage(updatedLocations);
    toast({
      title: "Location Deleted",
      description: `Location "${deletingLocation.name}" has been deleted.`,
    });
    setDeletingLocation(null);
  };


  const isConfigured = (location: MainLocation) => {
    return !!location.macAddress && location.cardStart != null && location.cardEnd != null;
  }
  
  const handleDownloadTemplate = () => {
    import('xlsx').then(({ utils, writeFile }) => {
        const sampleData = [
            { 'Location ID': 'CORP-HQ-NY', 'Descriptive Name': 'Corporate HQ New York' },
            { 'Location ID': 'WAREHOUSE-NJ', 'Descriptive Name': 'New Jersey Warehouse' }
        ];
        const worksheet = utils.json_to_sheet(sampleData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Locations');
        writeFile(workbook, 'location-template.xlsx');
         toast({
            title: "Template Downloaded",
            description: "location-template.xlsx has been downloaded.",
        });
    });
  };

  return (
    <div className="flex flex-1 flex-col w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Location Master</h1>
          <p className="text-muted-foreground">
            Manage your master locations here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BulkUploadModal onLocationsUploaded={handleLocationsUploaded} />
          <CreateLocationModal onLocationCreated={handleLocationCreated} />
           <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleDownloadTemplate}>
                    <FileDown className="h-4 w-4" />
                    <span className="sr-only">Download Template</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Excel Template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Master Locations</CardTitle>
          <CardDescription>A list of all created master locations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location ID</TableHead>
                <TableHead>Descriptive Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.descriptiveName || '-'}</TableCell>
                    <TableCell>
                       <Badge variant={isConfigured(location) ? 'secondary' : 'destructive'}>
                         {isConfigured(location) ? 'Configured' : 'Not Configured'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingLocation(location)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeletingLocation(location)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No locations created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditLocationModal 
        location={editingLocation}
        onLocationUpdated={handleLocationUpdated}
        onOpenChange={(open) => !open && setEditingLocation(null)}
      />

      <AlertDialog open={!!deletingLocation} onOpenChange={(open) => !open && setDeletingLocation(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                location "{deletingLocation?.name}".
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLocationDeleted} className="bg-destructive hover:bg-destructive/90">
                Delete
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}

    

    