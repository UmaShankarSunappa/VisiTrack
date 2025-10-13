import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="160"
      height="40"
      {...props}
    >
      <rect width="200" height="50" fill="transparent" />
      <path
        d="M25 10 C15 10, 10 15, 10 25 C10 45, 25 50, 25 50 C25 50, 40 45, 40 25 C40 15, 35 10, 25 10 Z"
        fill="hsl(var(--primary))"
      />
      <circle cx="25" cy="22" r="6" fill="hsl(var(--background))" />
      <text
        x="55"
        y="35"
        fontFamily="Inter, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="hsl(var(--foreground))"
      >
        Smart Lobby
      </text>
    </svg>
  );
}
