
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateLocationModal } from "@/components/dashboard/create-location-modal";
import { cn } from "@/lib/utils";
import type { MainLocation } from "@/lib/types";
import { locations as initialLocations } from "@/lib/data";

export default function LocationMasterPage() {
  const [locations, setLocations] = React.useState<MainLocation[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    const storedLocations = localStorage.getItem("locations");
    if (storedLocations) {
      try {
        const parsedLocations: MainLocation[] = JSON.parse(storedLocations);
        // Basic validation
        if (Array.isArray(parsedLocations)) {
           setLocations(parsedLocations);
           return;
        }
      } catch (e) {
        console.error("Failed to parse locations from localStorage", e);
      }
    }
    // Fallback to initial mock data
    setLocations(initialLocations);
    localStorage.setItem("locations", JSON.stringify(initialLocations));
  }, []);

  const handleLocationCreated = (newLocation: MainLocation) => {
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    localStorage.setItem("locations", JSON.stringify(updatedLocations));
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">
          Location Master
        </h1>
        <CreateLocationModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onLocationCreated={handleLocationCreated}
        >
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Master Location
            </span>
          </Button>
        </CreateLocationModal>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Master Locations</CardTitle>
          <CardDescription>
            A list of all unique location identifiers in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location ID</TableHead>
                <TableHead>Configuration Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => {
                const isConfigured = !!location.descriptiveName;
                return (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          isConfigured
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        )}
                      >
                        {isConfigured ? "Configured" : "Not Configured"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
