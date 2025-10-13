
"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VisitorTable } from "@/components/dashboard/visitor-table";
import { mockVisitors } from "@/lib/data";
import type { Visitor } from "@/lib/types";


export default function DashboardPage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [allVisitors] = React.useState<Visitor[]>(mockVisitors);
    const [filteredVisitors, setFilteredVisitors] = React.useState<Visitor[]>([]);
    const [locationName, setLocationName] = React.useState<string | null>(null);

     React.useEffect(() => {
        if (typeof window !== "undefined") {
            const storedLocation = localStorage.getItem('receptionistLocation');
            setLocationName(storedLocation);
        }
    }, []);

    React.useEffect(() => {
        let visitors = allVisitors;
        
        // Filter by location
        if (locationName) {
            visitors = visitors.filter(visitor => {
                const visitorLocationString = `${visitor.location.main}${visitor.location.sub ? ` - ${visitor.location.sub}` : ''}`;
                return visitorLocationString === locationName;
            });
        }
        
        // Filter by date
        const selectedDate = date || new Date();
        visitors = visitors.filter(visitor => isSameDay(new Date(visitor.checkInTime), selectedDate));

        setFilteredVisitors(visitors);
    }, [date, allVisitors, locationName]);

    return (
        <>
            <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}
            </div>
            <StatsCards visitors={filteredVisitors} />
            <VisitorTable visitors={filteredVisitors} />
        </>
    )
}
