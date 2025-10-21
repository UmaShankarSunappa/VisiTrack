
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { format, isWithinInterval, startOfDay, endOfDay, differenceInMinutes, addDays } from 'date-fns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, MapPin, ChevronDown, X as XIcon, Users, PieChartIcon, Clock, AlertTriangle } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import type { Entry, Department, Visitor } from '@/lib/types';
import { mockData, departments } from '@/lib/data';
import { useLocation } from '@/context/LocationContext';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


function ReportsLocationFilter() {
  const { locations, selectedLocations, setSelectedLocations } = useLocation();
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLocations(locations.map(l => l));
    } else {
      setSelectedLocations([]);
    }
  };

  const handleClearAll = () => setSelectedLocations([]);

  const handleLocationSelect = (location: string) => {
    setSelectedLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const getDisplayLabel = () => {
    if (locations.length > 0 && selectedLocations.length === locations.length) return "All Locations";
    if (selectedLocations.length === 1) return selectedLocations[0];
    if (selectedLocations.length > 1) return `${selectedLocations.length} locations selected`;
    return "Select Locations";
  };
  
  const areAllSelected = locations.length > 0 && selectedLocations.length === locations.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{getDisplayLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <div className="flex items-center justify-between pr-2">
          <DropdownMenuCheckboxItem
            className="flex-grow"
            checked={areAllSelected}
            onCheckedChange={handleSelectAll}
          >
            All Locations
          </DropdownMenuCheckboxItem>
          <TooltipProvider>
            <TooltipComponent>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearAll}>
                  <XIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Clear selection</p></TooltipContent>
            </TooltipComponent>
          </TooltipProvider>
        </div>
        <DropdownMenuSeparator />
        {locations.map(loc => (
          <DropdownMenuCheckboxItem
            key={loc}
            checked={selectedLocations.includes(loc)}
            onSelect={(e) => { e.preventDefault(); handleLocationSelect(loc); }}
          >
            {loc}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ReportsPage() {
    const [allEntries, setAllEntries] = useState<Entry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
    const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: new Date() });
    const [userRole, setUserRole] = useState<string | null>(null);
    const [receptionistLocation, setReceptionistLocation] = useState<string | null>(null);
    const { selectedLocations, setSelectedLocations } = useLocation();
    
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedEntries = localStorage.getItem('entries');
            const baseEntries = mockData.map(e => ({ ...e, checkInTime: new Date(e.checkInTime), checkOutTime: e.checkOutTime ? new Date(e.checkOutTime) : undefined }));
            let entries = storedEntries ? JSON.parse(storedEntries).map((e: any) => ({ ...e, checkInTime: new Date(e.checkInTime), checkOutTime: e.checkOutTime ? new Date(e.checkOutTime) : undefined })) : baseEntries;
            setAllEntries(entries);

            const role = localStorage.getItem('userRole');
            const location = localStorage.getItem('receptionistLocation');
            setUserRole(role);
            setReceptionistLocation(location);
        }
    }, []);

    useEffect(() => {
        let entriesToFilter = allEntries;
        
        // Filter by role and location
        if (userRole === 'receptionist' && receptionistLocation) {
             entriesToFilter = entriesToFilter.filter(entry => {
                 const entryLocationString = `${entry.location.main}${entry.location.sub ? ` - ${entry.location.sub}` : ''}`;
                 return entryLocationString === receptionistLocation;
            });
        } else if (userRole === 'process-owner') {
             if (selectedLocations.length > 0) {
                entriesToFilter = entriesToFilter.filter(entry => {
                    const entryLocationString = `${entry.location.main}${entry.location.sub ? ` - ${entry.location.sub}` : ''}`;
                    return selectedLocations.includes(entryLocationString);
                });
            } else {
                entriesToFilter = []; // No locations selected, show no data
            }
        }

        // Filter by date
        if (date?.from) {
            const range = { start: startOfDay(date.from), end: date.to ? endOfDay(date.to) : endOfDay(date.from) };
            entriesToFilter = entriesToFilter.filter(entry => isWithinInterval(entry.checkInTime, range));
        }

        setFilteredEntries(entriesToFilter);
    }, [date, allEntries, userRole, receptionistLocation, selectedLocations]);

    const departmentVisitData = useMemo(() => {
        const counts = departments.reduce((acc, dep) => ({ ...acc, [dep]: { name: dep, total: 0 } }), {} as Record<Department, {name: Department, total: number}>);
        filteredEntries.forEach(entry => {
            if (counts[entry.hostDepartment]) {
                counts[entry.hostDepartment].total += 1;
            }
        });
        return Object.values(counts);
    }, [filteredEntries]);

    const unreturnedCardsData = useMemo(() => {
        return filteredEntries.filter(e => e.type === 'Visitor' && e.status === 'Checked-out' && !e.visitorCardReturned) as Visitor[];
    }, [filteredEntries]);

    const trafficRatioData = useMemo(() => {
        const visitors = filteredEntries.filter(e => e.type === 'Visitor').length;
        const employees = filteredEntries.filter(e => e.type === 'Employee').length;
        if (visitors === 0 && employees === 0) return [];
        return [{ name: 'Visitors', value: visitors }, { name: 'Employees', value: employees }];
    }, [filteredEntries]);
    
    const frequentVisitorData = useMemo(() => {
        const visitorCounts: { [mobile: string]: { name: string; mobile: string; visits: number } } = {};
        filteredEntries.forEach(entry => {
            if (entry.type === 'Visitor') {
                if (visitorCounts[entry.mobile]) {
                    visitorCounts[entry.mobile].visits += 1;
                } else {
                    visitorCounts[entry.mobile] = { name: entry.name, mobile: entry.mobile, visits: 1 };
                }
            }
        });
        return Object.values(visitorCounts).filter(v => v.visits > 1).sort((a, b) => b.visits - a.visits);
    }, [filteredEntries]);
    
    const avgVisitDurationData = useMemo(() => {
        const durationData: { [key in Department]?: { totalMinutes: number, count: number } } = {};
        filteredEntries.filter(e => e.checkOutTime).forEach(entry => {
            if (!durationData[entry.hostDepartment]) {
                durationData[entry.hostDepartment] = { totalMinutes: 0, count: 0 };
            }
            const duration = differenceInMinutes(entry.checkOutTime!, entry.checkInTime);
            durationData[entry.hostDepartment]!.totalMinutes += duration;
            durationData[entry.hostDepartment]!.count += 1;
        });

        return departments.map(dep => ({
            name: dep,
            "Average Duration (mins)": durationData[dep] ? Math.round(durationData[dep]!.totalMinutes / durationData[dep]!.count) : 0
        }));
    }, [filteredEntries]);

    const PIE_COLORS = ['#8884d8', '#82ca9d'];

    return (
        <div className="flex-1 flex flex-col w-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-muted-foreground">Analytical tools to monitor visitor traffic.</p>
                </div>
                <div className="flex items-center gap-2">
                    {userRole === 'process-owner' && <ReportsLocationFilter />}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (date.to ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}` : format(date.from, "LLL dd, y")) : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(range) => {
                                    if (range?.from && !range.to) setDate({ from: range.from, to: range.from });
                                    else if (range?.from && range.to && addDays(range.from, 30) < range.to) setDate({ from: range.from, to: addDays(range.from, 30) });
                                    else setDate(range);
                                }}
                                numberOfMonths={2}
                                disabled={(day) => day > new Date() || day < new Date("2000-01-01")}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Department-wise Visit Summary</CardTitle>
                        <CardDescription>Total number of visits per host department.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentVisitData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#8884d8" name="Total Visits" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Visitor vs. Employee Ratio</CardTitle>
                        <CardDescription>Composition of office traffic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {trafficRatioData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={trafficRatioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {trafficRatioData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-[300px] text-muted-foreground">No data to display</div>
                        )}
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Average Visit Duration</CardTitle>
                        <CardDescription>Average time spent by visitors per department.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={avgVisitDurationData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Average Duration (mins)" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Frequent Visitor Report</CardTitle>
                        <CardDescription>Visitors with multiple check-ins.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Visitor Name</TableHead>
                                    <TableHead>Mobile Number</TableHead>
                                    <TableHead className="text-right"># of Visits</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {frequentVisitorData.length > 0 ? frequentVisitorData.map(v => (
                                    <TableRow key={v.mobile}>
                                        <TableCell>{v.name}</TableCell>
                                        <TableCell>{v.mobile}</TableCell>
                                        <TableCell className="text-right">{v.visits}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No frequent visitors found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Unreturned Visitor Card Report</CardTitle>
                        <CardDescription>Physical access cards not returned on departure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Visitor Name</TableHead>
                                    <TableHead>Card No.</TableHead>
                                    <TableHead>Check-out Time</TableHead>
                                    {userRole === 'process-owner' && <TableHead>Location</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {unreturnedCardsData.length > 0 ? unreturnedCardsData.map(v => (
                                    <TableRow key={v.id}>
                                        <TableCell>{v.name}</TableCell>
                                        <TableCell>{v.visitorCardNumber}</TableCell>
                                        <TableCell>{v.checkOutTime ? format(v.checkOutTime, 'PPp') : 'N/A'}</TableCell>
                                         {userRole === 'process-owner' && <TableCell>{v.location.main}</TableCell>}
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={userRole === 'process-owner' ? 4 : 3} className="text-center h-24">No unreturned cards found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
