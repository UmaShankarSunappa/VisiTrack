
"use client"

import * as React from "react"
import { format, isWithinInterval, startOfDay, endOfDay, addDays } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VisitorTable } from "@/components/dashboard/visitor-table";
import { mockVisitors } from "@/lib/data";
import type { Visitor } from "@/lib/types";


export default function DashboardPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(),
    })
    const [allVisitors, setAllVisitors] = React.useState<Visitor[]>([]);
    const [filteredVisitors, setFilteredVisitors] = React.useState<Visitor[]>([]);
    const [locationName, setLocationName] = React.useState<string | null>(null);
    const [userRole, setUserRole] = React.useState<string | null>(null);

    React.useEffect(() => {
        let visitors: Visitor[] = [];
        const storedVisitors = localStorage.getItem('visitors');
        
        // Use mock data as the base
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
                // Combine mock data with stored data, avoiding duplicates
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
        setAllVisitors(visitors);
        
        if (typeof window !== "undefined") {
            const storedLocation = localStorage.getItem('receptionistLocation');
            const storedRole = localStorage.getItem('userRole');
            setLocationName(storedLocation);
            setUserRole(storedRole);
        }
    }, []);

    React.useEffect(() => {
        let visitorsToFilter = allVisitors;
        
        // Filter by location if user is not admin
        if (userRole !== 'admin' && locationName) {
            visitorsToFilter = visitorsToFilter.filter(visitor => {
                if (!visitor.location) return false;
                const visitorLocationString = `${visitor.location.main}${visitor.location.sub ? ` - ${visitor.location.sub}` : ''}`;
                return visitorLocationString === locationName;
            });
        }
        
        // Filter by date range
        if (date?.from) {
          const range = {
            start: startOfDay(date.from),
            end: date.to ? endOfDay(date.to) : endOfDay(date.from),
          }
          visitorsToFilter = visitorsToFilter.filter(visitor => 
            isWithinInterval(visitor.checkInTime, range)
          );
        } else {
          // If no date is set, show nothing
          visitorsToFilter = [];
        }

        setFilteredVisitors(visitorsToFilter);
    }, [date, allVisitors, locationName, userRole]);

    return (
        <>
            <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(range) => {
                            if (range?.from && !range.to) {
                                setDate({from: range.from, to: range.from});
                            } else if (range?.from && range?.to) {
                                if (addDays(range.from, 30) < range.to) {
                                     setDate({from: range.from, to: addDays(range.from, 30)});
                                } else {
                                    setDate(range);
                                }
                            } else {
                                setDate(range);
                            }
                        }}
                        numberOfMonths={2}
                        disabled={(day) => day > new Date() || day < new Date("2000-01-01")}
                    />
                    </PopoverContent>
                </Popover>
                {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Reset</Button>}
            </div>
            <StatsCards visitors={filteredVisitors} />
            <VisitorTable visitors={filteredVisitors} />
        </>
    )
}
