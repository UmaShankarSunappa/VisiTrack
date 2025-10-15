
"use client"

import * as React from "react"
import { format, isWithinInterval, startOfDay, endOfDay, addDays } from "date-fns"
import { Calendar as CalendarIcon, User, Briefcase, ListFilter } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VisitorTable } from "@/components/dashboard/visitor-table";
import { mockData } from "@/lib/data";
import type { Entry, EntryType } from "@/lib/types";


export default function DashboardPage() {
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: new Date(),
      to: new Date(),
    })
    const [allEntries, setAllEntries] = React.useState<Entry[]>([]);
    const [filteredEntries, setFilteredEntries] = React.useState<Entry[]>([]);
    const [locationName, setLocationName] = React.useState<string | null>(null);
    const [userRole, setUserRole] = React.useState<string | null>(null);
    const [typeFilter, setTypeFilter] = React.useState<EntryType | 'All'>('All');

    React.useEffect(() => {
        let entries: Entry[] = [];
        const storedEntries = localStorage.getItem('entries');
        
        // Use mock data as the base
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

        localStorage.setItem('entries', JSON.stringify(entries));
        setAllEntries(entries);
        
        if (typeof window !== "undefined") {
            const storedLocation = localStorage.getItem('receptionistLocation');
            const storedRole = localStorage.getItem('userRole');
            setLocationName(storedLocation);
            setUserRole(storedRole);
        }
    }, []);

    React.useEffect(() => {
        let entriesToFilter = allEntries;
        
        if (userRole !== 'admin' && locationName) {
            entriesToFilter = entriesToFilter.filter(entry => {
                if (!entry.location) return false;
                const entryLocationString = `${entry.location.main}${entry.location.sub ? ` - ${entry.location.sub}` : ''}`;
                return entryLocationString === locationName;
            });
        }
        
        if (date?.from) {
          const range = {
            start: startOfDay(date.from),
            end: date.to ? endOfDay(date.to) : endOfDay(date.from),
          }
          entriesToFilter = entriesToFilter.filter(entry => 
            isWithinInterval(entry.checkInTime, range)
          );
        } else {
          entriesToFilter = [];
        }

        if (typeFilter !== 'All') {
            entriesToFilter = entriesToFilter.filter(entry => entry.type === typeFilter);
        }

        setFilteredEntries(entriesToFilter);
    }, [date, allEntries, locationName, userRole, typeFilter]);

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
                        "w-[260px] justify-start text-left font-normal",
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter by Type
                        </span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked={typeFilter === 'All'} onSelect={() => setTypeFilter('All')}>All</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={typeFilter === 'Visitor'} onSelect={() => setTypeFilter('Visitor')}>Visitor</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem checked={typeFilter === 'Employee'} onSelect={() => setTypeFilter('Employee')}>Employee</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Reset</Button>}
            </div>
            <StatsCards entries={filteredEntries} />
            <VisitorTable entries={filteredEntries} />
        </>
    )
}
