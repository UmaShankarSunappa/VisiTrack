
"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { locations as mockLocations } from '@/lib/data';
import type { MainLocation } from '@/lib/types';

interface LocationContextType {
  locations: string[];
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [allLocations, setAllLocations] = useState<string[]>([]);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

    const isConfigured = (location: MainLocation) => {
        return !!location.macAddress && location.cardStart != null && location.cardEnd != null;
    }

    const loadLocations = useCallback(() => {
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
        
        const configuredLocations = loadedLocations.filter(isConfigured);

        const locationNames = configuredLocations.flatMap(loc => 
            loc.subLocations && loc.subLocations.length > 0 
            ? loc.subLocations.map(sub => `${loc.descriptiveName || loc.name} - ${sub.name}`)
            : `${loc.descriptiveName || loc.name}`
        );
        
        const uniqueLocationNames = [...new Set(locationNames)];
        setAllLocations(uniqueLocationNames);
        
        // Preserve selection if possible, otherwise reset
        setSelectedLocations(prevSelected => {
            const newSelection = prevSelected.filter(l => uniqueLocationNames.includes(l));
            if (newSelection.length === 0) {
                return uniqueLocationNames; // Reset if all previous selections are gone
            }
            return newSelection;
        });
    }, []);

    useEffect(() => {
        loadLocations();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'locations') {
                loadLocations();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [loadLocations]);

    // This effect ensures that when allLocations is initialized, selectedLocations is also initialized.
    useEffect(() => {
      if (allLocations.length > 0 && selectedLocations.length === 0) {
        setSelectedLocations(allLocations);
      }
    }, [allLocations, selectedLocations]);


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
