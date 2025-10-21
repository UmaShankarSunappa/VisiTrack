
"use client"

import * as React from "react"
import { VisitorTable } from "@/components/dashboard/visitor-table";
import { mockData } from "@/lib/data";
import type { Visitor, Entry } from "@/lib/types";

export default function VisitorsPage() {
    const [allVisitors, setAllVisitors] = React.useState<Entry[]>([]);
    const [locationName, setLocationName] = React.useState<string | null>(null);
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        let entries: Entry[] = [];
        const storedEntries = localStorage.getItem('entries');
        
        const baseEntries = mockData.map(v => ({
            ...v,
            checkInTime: new Date(v.checkInTime),
            checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
        }));

        if (storedEntries) {
            try {
                const parsedStoredEntries = JSON.parse(storedEntries).map((v: any) => ({
                    ...v,
                    checkInTime: new Date(v.checkInTime),
                    checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
                }));
                const entryMap = new Map();
                [...baseEntries, ...parsedStoredEntries].forEach(v => entryMap.set(v.id, v));
                entries = Array.from(entryMap.values());
            } catch (e) {
                console.error("Failed to parse entries from localStorage", e);
                entries = baseEntries;
            }
        } else {
           entries = baseEntries;
        }

        let visitors = entries.filter(e => e.type === 'Visitor');

        // Save the potentially combined list back to localStorage
        localStorage.setItem('entries', JSON.stringify(entries));
        
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

    const handleEntryUpdated = (updatedEntry: Entry) => {
        const updatedList = allVisitors.map(e => e.id === updatedEntry.id ? updatedEntry : e);
        setAllVisitors(updatedList);
        // Also update the main entries list in local storage
        const allEntriesStored = localStorage.getItem('entries');
        if (allEntriesStored) {
            const allEntries = JSON.parse(allEntriesStored);
            const updatedAllEntries = allEntries.map((e: Entry) => e.id === updatedEntry.id ? updatedEntry : e);
            localStorage.setItem('entries', JSON.stringify(updatedAllEntries));
        }
    };


    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">All Visitors</h1>
            </div>
            <VisitorTable entries={allVisitors} onEntryUpdated={handleEntryUpdated} />
        </div>
    )
}
