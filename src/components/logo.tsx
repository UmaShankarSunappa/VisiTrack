import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

export function Logo({ collapsed, ...props }: SVGProps<SVGSVGElement> & { collapsed?: boolean }) {

    if (collapsed) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <MapPin className="w-6 h-6 text-primary" />
            </div>
        )
    }

  return (
    <div className="flex items-center gap-2" {...props}>
      <MapPin className="w-7 h-7 text-primary" />
      <span className="text-xl font-bold tracking-tight">FrontDesk 360</span>
    </div>
  );
}
