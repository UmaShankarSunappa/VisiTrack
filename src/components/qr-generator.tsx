"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { locations } from '@/lib/data';
import type { MainLocation, SubLocation } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, QrCode } from 'lucide-react';
import Link from 'next/link';

export function QrCodeGenerator() {
  const [mainLocationId, setMainLocationId] = useState<string | null>(null);
  const [subLocationId, setSubLocationId] = useState<string | null>(null);
  const [selectedMainLocation, setSelectedMainLocation] = useState<MainLocation | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin);
  }, []);

  const handleMainLocationChange = (id: string) => {
    setMainLocationId(id);
    const location = locations.find((loc) => loc.id === id);
    setSelectedMainLocation(location || null);
    setSubLocationId(null);
    setShowQr(false);
    if (location && location.subLocations.length === 0) {
      setSubLocationId('none');
    }
  };

  const qrCodePlaceholder = PlaceHolderImages.find(p => p.id === 'qr-code-placeholder');

  const checkinUrl = useMemo(() => {
    if (!mainLocationId || !subLocationId) return '';
    return `${appUrl}/check-in/${mainLocationId}-${subLocationId}`;
  }, [mainLocationId, subLocationId, appUrl]);

  const qrCodeUrl = useMemo(() => {
    if (!checkinUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(checkinUrl)}`;
  }, [checkinUrl]);

  const isReadyForQr = mainLocationId && subLocationId;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Main Location</label>
          <Select onValueChange={handleMainLocationChange} value={mainLocationId ?? undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select main location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sub Location</label>
          <Select
            onValueChange={(id) => { setSubLocationId(id); setShowQr(false); }}
            disabled={!selectedMainLocation || selectedMainLocation.subLocations.length === 0}
            value={subLocationId ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub-location" />
            </SelectTrigger>
            <SelectContent>
              {selectedMainLocation?.subLocations.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button onClick={() => setShowQr(true)} disabled={!isReadyForQr} className="w-full">
        <QrCode className="mr-2 h-4 w-4" />
        Generate QR Code
      </Button>

      {showQr && isReadyForQr && (
        <div className="p-6 mt-6 border-2 border-dashed rounded-lg bg-muted/50">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h3 className="font-semibold text-md">Scan to Check-in</h3>
            <div className="p-2 bg-white rounded-lg shadow-md">
              <Image
                src={qrCodeUrl}
                alt="Visitor Check-in QR Code"
                width={256}
                height={256}
                data-ai-hint="qr code"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Visitors can scan this code with their smartphone to begin the self check-in process.
            </p>
             <Button variant="outline" asChild>
                <Link href={checkinUrl}>
                    Proceed without QR code
                    <ArrowRight className="w-4 h-4 ml-2"/>
                </Link>
             </Button>
          </div>
        </div>
      )}

      {!showQr && !isReadyForQr && qrCodePlaceholder && (
        <div className="p-6 mt-6 border-2 border-dashed rounded-lg bg-muted/50">
          <div className="flex flex-col items-center justify-center gap-4 text-center opacity-50">
            <div className="p-2 bg-white rounded-lg shadow-md">
                <Image
                    src={qrCodePlaceholder.imageUrl}
                    alt={qrCodePlaceholder.description}
                    width={256}
                    height={256}
                    data-ai-hint={qrCodePlaceholder.imageHint}
                />
            </div>
             <p className="text-sm text-muted-foreground">
              Your QR code will appear here once you select a location.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
