
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo({ collapsed, ...props }: SVGProps<SVGSVGElement> & { collapsed?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={collapsed ? "0 0 50 50" : "0 0 250 50"}
      width={collapsed ? 40 : 200}
      height="40"
      className={cn("transition-all duration-300", props.className)}
      {...props}
    >
      <g transform={collapsed ? 'translate(0,0)' : 'translate(0,0)'}>
        <path
            d="M25 10 C15 10, 10 15, 10 25 C10 45, 25 50, 25 50 C25 50, 40 45, 40 25 C40 15, 35 10, 25 10 Z"
            fill="hsl(var(--primary))"
        />
        <circle cx="25" cy="22" r="6" fill="hsl(var(--background))" />
      </g>
      {!collapsed && (
        <text
            x="55"
            y="35"
            fontFamily="Inter, sans-serif"
            fontSize="30"
            fontWeight="bold"
            fill="hsl(var(--foreground))"
        >
            VisiTrack Pro
        </text>
      )}
    </svg>
  );
}
