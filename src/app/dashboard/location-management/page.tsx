
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { MainLocation } from '@/lib/types';
import { locations as defaultLocations } from '@/lib/data';

function ConfigureLocationModal({
  location,
  allLocations,
  onLocationUpdated,
  onOpenChange,
}: {
  location: MainLocation | null;
  allLocations: MainLocation[];
  onLocationUpdated: (updatedLocation: MainLocation) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [descriptiveName, setDescriptiveName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [numberOfCards, setNumberOfCards] = useState<number | ''>('');
  const { toast } = useToast();

  useEffect(() => {
    if (location) {
      setDescriptiveName(location.descriptiveName || '');
      setMacAddress(location.macAddress || '');
      setNumberOfCards(location.numberOfCards || '');
    }
  }, [location]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!location) return;

    const cardsRequested = numberOfCards !== '' ? Number(numberOfCards) : 0;

    // Find the highest cardEnd number across all other locations
    const maxCardEnd = allLocations
      .filter(loc => loc.id !== location.id && loc.cardEnd)
      .reduce((max, loc) => Math.max(max, loc.cardEnd!), 0);
      
    const newCardStart = maxCardEnd + 1;
    const newCardEnd = newCardStart + cardsRequested - 1;

    const updatedLocation: MainLocation = {
      ...location,
      descriptiveName,
      macAddress,
      numberOfCards: cardsRequested,
      cardStart: cardsRequested > 0 ? newCardStart : undefined,
      cardEnd: cardsRequested > 0 ? newCardEnd : undefined,
    };
    onLocationUpdated(updatedLocation);
    toast({
      title: "Location Updated",
      description: `Configuration for "${location.name}" has been saved.`,
    });
    onOpenChange(false);
  };
  
  if (!location) return null;

  return (
    <Dialog open={!!location} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Configure Location: {location.name}</DialogTitle>
          <DialogDescription>
            Set the details for this master location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descriptive-name" className="text-right">
                Descriptive Name
              </Label>
              <Input
                id="descriptive-name"
                value={descriptiveName}
                onChange={(e) => setDescriptiveName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Corporate Office - 2nd Floor"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mac-address" className="text-right">
                MAC Address
              </Label>
              <Input
                id="mac-address"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                className="col-span-3"
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="num-cards" className="text-right">
                Cards Required
              </Label>
              <Input
                id="num-cards"
                type="number"
                value={numberOfCards}
                onChange={(e) => setNumberOfCards(e.target.value === '' ? '' : Number(e.target.value))}
                className="col-span-3"
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Configuration</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function LocationManagementPage() {
  const [locations, setLocations] = useState<MainLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MainLocation | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

  const handleLocationUpdated = (updatedLocation: MainLocation) => {
    const updatedLocations = locations.map(loc =>
      loc.id === updatedLocation.id ? updatedLocation : loc
    );
    setLocations(updatedLocations);
    updateLocalStorage(updatedLocations);
    setSelectedLocation(null);
  };
  
  return (
    <div className="flex flex-1 flex-col w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Location Management</h1>
        <p className="text-muted-foreground">
          Configure details for your master locations.
        </p>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>A list of all master locations for configuration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location ID</TableHead>
                <TableHead>Descriptive Name</TableHead>
                <TableHead>Associated MAC Address</TableHead>
                <TableHead>Cards Required</TableHead>
                <TableHead>Card Start</TableHead>
                <TableHead>Card End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.name}</TableCell>
                    <TableCell>{location.descriptiveName || '-'}</TableCell>
                    <TableCell>{location.macAddress || '-'}</TableCell>
                    <TableCell>{location.numberOfCards || '-'}</TableCell>
                    <TableCell>{location.cardStart || '-'}</TableCell>
                    <TableCell>{location.cardEnd || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedLocation(location)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit/Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No locations found. Create one in Location Master.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfigureLocationModal
        location={selectedLocation}
        allLocations={locations}
        onLocationUpdated={handleLocationUpdated}
        onOpenChange={(open) => !open && setSelectedLocation(null)}
      />
    </div>
  );
}
