
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { receptionists } from '@/lib/data';

interface LocationContextType {
  locations: string[];
  selectedLocations: string[];
  setSelectedLocations: React.Dispatch<React.SetStateAction<string[]>>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const allLocations = useMemo(() => receptionists
    .filter(r => r.locationId !== 'admin')
    .map(r => r.locationName), []);
  
  const [selectedLocations, setSelectedLocations] = useState<string[]>(allLocations);
  const [locations] = useState<string[]>(allLocations);

  return (
    <LocationContext.Provider value={{ locations, selectedLocations, setSelectedLocations }}>
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
