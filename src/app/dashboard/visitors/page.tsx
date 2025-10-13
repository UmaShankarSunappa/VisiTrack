
"use client"

import * as React from "react"
import { VisitorTable } from "@/components/dashboard/visitor-table";
import { mockVisitors } from "@/lib/data";
import type { Visitor } from "@/lib/types";

export default function VisitorsPage() {
    const [allVisitors, setAllVisitors] = React.useState<Visitor[]>([]);
    const [locationName, setLocationName] = React.useState<string | null>(null);
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        let visitors: Visitor[] = [];
        const storedVisitors = localStorage.getItem('visitors');
        
        const baseVisitors = mockVisitors.map(v => ({
            ...v,
            checkInTime: new Date(v.checkInTime),
            checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
        }));

        if (storedVisitors) {
            try {
                const parsedStoredVisitors = JSON.parse(storedVisitors).map((v: any) => ({
                    ...v,
                    checkInTime: new Date(v.checkInTime),
                    checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
                }));
                const visitorMap = new Map();
                [...baseVisitors, ...parsedStoredVisitors].forEach(v => visitorMap.set(v.id, v));
                visitors = Array.from(visitorMap.values());
            } catch (e) {
                console.error("Failed to parse visitors from localStorage", e);
                visitors = baseVisitors;
            }
        } else {
           visitors = baseVisitors;
        }

        // Save the potentially combined list back to localStorage
        localStorage.setItem('visitors', JSON.stringify(visitors));
        
        if (typeof window !== "undefined") {
            const storedLocation = localStorage.getItem('receptionistLocation');
            const storedRole = localStorage.getItem('userRole');
            setLocationName(storedLocation);
            setUserRole(storedRole);

            if (storedRole !== 'admin' && storedLocation) {
                 visitors = visitors.filter(visitor => {
                    const visitorLocationString = `${visitor.location.main}${visitor.location.sub ? ` - ${visitor.location.sub}` : ''}`;
                    return visitorLocationString === storedLocation;
                });
            }
        }

        setAllVisitors(visitors.sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime()));
    }, []);

    return (
        <>
            <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">All Visitors</h1>
            </div>
            <VisitorTable visitors={allVisitors} />
        </>
    )
}
