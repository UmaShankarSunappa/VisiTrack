import { MapPin } from 'lucide-react';

export function Logo({ collapsed }: { collapsed?: boolean }) {

  if (collapsed) {
      return (
          <div className="flex items-center justify-center">
             <MapPin className="w-6 h-6 text-primary" />
          </div>
      )
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-7 h-7 text-primary" />
      <span className="text-xl font-bold tracking-tight">FrontDesk 360</span>
    </div>
  );
}
