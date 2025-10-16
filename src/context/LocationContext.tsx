
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { receptionists, locations as mockLocations } from '@/lib/data';
import type { MainLocation } from '@/lib/types';

interface LocationContextType {
  locations: string[];
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [allLocations, setAllLocations] = useState<string[]>([]);
    
    useEffect(() => {
        const storedLocations = localStorage.getItem("locations");
        let loadedLocations: MainLocation[] = mockLocations;
        if (storedLocations) {
            try {
                const parsedLocations = JSON.parse(storedLocations);
                 if (Array.isArray(parsedLocations) && parsedLocations.every(l => l.id)) {
                   loadedLocations = parsedLocations;
                }
            } catch (e) {
                console.error("Failed to parse locations from localStorage", e);
            }
        }
        
        const locationNames = loadedLocations.flatMap(loc => 
            loc.subLocations && loc.subLocations.length > 0 
            ? loc.subLocations.map(sub => `${loc.descriptiveName || loc.name} - ${sub.name}`)
            : `${loc.descriptiveName || loc.name}`
        );
        
        const uniqueLocationNames = [...new Set(locationNames)];
        setAllLocations(uniqueLocationNames);
        setSelectedLocations(uniqueLocationNames);
    }, []);

  const [selectedLocations, setSelectedLocations] = useState<string[]>(allLocations);

  return (
    <LocationContext.Provider value={{ locations: allLocations, selectedLocations, setSelectedLocations }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
