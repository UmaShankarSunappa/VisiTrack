
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
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
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!locationId.trim()) {
      setError('Location ID cannot be empty.');
      return;
    }
    const newLocation: MainLocation = {
      id: locationId.toLowerCase().replace(/\s+/g, '-'),
      name: locationId,
      subLocations: [],
    };
    onLocationCreated(newLocation);
    toast({
      title: "Location Created",
      description: `Location "${locationId}" has been successfully created.`,
    });
    setLocationId('');
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
            Enter a unique ID for the new master location.
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
                placeholder="e.g. Main Office"
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


export default function LocationMasterPage() {
  const [locations, setLocations] = useState<MainLocation[]>([]);
  
  useEffect(() => {
    // Ensure this runs only on the client
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Location Master</h1>
          <p className="text-muted-foreground">
            Manage your master locations here.
          </p>
        </div>
        <CreateLocationModal onLocationCreated={handleLocationCreated} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Master Locations</CardTitle>
          <CardDescription>A list of all created master locations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>
                       <Badge variant={location.subLocations.length > 0 || location.descriptiveName ? 'default' : 'destructive'}>
                         {location.subLocations.length > 0 || location.descriptiveName ? 'Configured' : 'Not Configured'}
                       </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center h-24">
                    No locations created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
