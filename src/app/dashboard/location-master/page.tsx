
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MainLocation } from '@/lib/types';
import { locations as defaultLocations } from '@/lib/data';

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
  onLocationUpdated: (updatedLocation: MainLocation) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [descriptiveName, setDescriptiveName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (location) {
      setDescriptiveName(location.descriptiveName || '');
    }
  }, [location]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!location) return;

    const updatedLocation: MainLocation = {
      ...location,
      descriptiveName,
    };
    onLocationUpdated(updatedLocation);
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
            Update the descriptive name for this master location.
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
                value={location.name}
                readOnly
                className="col-span-3 bg-muted"
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
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocations = localStorage.getItem('locations');
      if (storedLocations) {
        setLocations(JSON.parse(storedLocations));
      } else {
        setLocations(defaultLocations);
        localStorage.setItem('locations', JSON.stringify(defaultLocations));
      }
    }
  }, []);

  const handleLocationCreated = (newLocation: MainLocation) => {
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    localStorage.setItem('locations', JSON.stringify(updatedLocations));
  };

  const handleLocationUpdated = (updatedLocation: MainLocation) => {
    const updatedLocations = locations.map(loc => 
      loc.id === updatedLocation.id ? updatedLocation : loc
    );
    setLocations(updatedLocations);
    localStorage.setItem('locations', JSON.stringify(updatedLocations));
    setEditingLocation(null);
  };

  const isConfigured = (location: MainLocation) => {
    return !!location.macAddress && location.cardStart != null && location.cardEnd != null;
  }

  return (
    <div className="flex flex-1 flex-col w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Location Master</h1>
          <p className="text-muted-foreground">
            Manage your master locations here.
          </p>
        </div>
        <CreateLocationModal onLocationCreated={handleLocationCreated} />
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
                       <Badge variant={isConfigured(location) ? 'default' : 'destructive'}>
                         {isConfigured(location) ? 'Configured' : 'Not Configured'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setEditingLocation(location)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
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
    </div>
  );
}
