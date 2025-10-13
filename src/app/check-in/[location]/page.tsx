import { CheckInFlow } from "@/components/check-in-flow";
import { locations } from "@/lib/data";
import { Building } from "lucide-react";
import Link from 'next/link';

type CheckInPageProps = {
  params: {
    location: string;
  };
};

export default function CheckInPage({ params }: CheckInPageProps) {
  const [mainLocId, subLocId] = params.location.split('-');
  
  const mainLocation = locations.find(l => l.id === mainLocId);
  const subLocation = mainLocation?.subLocations.find(s => s.id === subLocId);

  const locationName = mainLocation
    ? `${mainLocation.name}${subLocation ? `, ${subLocation.name}` : ''}`
    : 'Unknown Location';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Building className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold">VisiTrack Pro</h1>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-0 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 px-4">
            <h2 className="text-3xl font-bold font-headline">Visitor Self Check-in</h2>
            <p className="text-muted-foreground mt-2">
              You are checking in at: <span className="font-semibold text-primary">{locationName}</span>
            </p>
          </div>
          <CheckInFlow locationName={locationName} />
        </div>
      </main>
    </div>
  );
}

export async function generateStaticParams() {
    const paths = locations.flatMap(main => {
        if (main.subLocations.length === 0) {
            return [{ location: `${main.id}-none` }];
        }
        return main.subLocations.map(sub => ({
            location: `${main.id}-${sub.id}`
        }));
    });

    return paths;
}
