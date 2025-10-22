
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  PanelLeft,
  MapPin,
  ChevronDown,
  List,
  UserCog,
  Building2,
  Settings,
  X,
  AreaChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { LocationProvider, useLocation } from "@/context/LocationContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


function LocationFilter() {
  const { locations, selectedLocations, setSelectedLocations } = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocation = localStorage.getItem('receptionistLocation');
      const storedRole = localStorage.getItem('userRole');
      setLocationName(storedLocation);
      setUserRole(storedRole);
      setIsLoading(false);
    }
  }, []);

  const isProcessOwner = userRole === 'process-owner';
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLocations(locations.map(l => l));
    } else {
      setSelectedLocations([]);
    }
  };
  
  const handleClearAll = () => {
    setSelectedLocations([]);
  }

  const handleLocationSelect = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };
  
  const getDisplayLabel = () => {
    if (locations.length > 0 && selectedLocations.length === locations.length) return "All Locations";
    if (selectedLocations.length === 1) return selectedLocations[0];
    if (selectedLocations.length > 1) return `${selectedLocations.length} locations selected`;
    return "No locations selected";
  }
  
  const areAllSelected = locations.length > 0 && selectedLocations.length === locations.length;

  if (isLoading) {
    return (
       <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-semibold text-foreground h-9 w-48 animate-pulse" />
    )
  }

  if (!isProcessOwner) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-semibold text-foreground">
        <MapPin className="h-4 w-4" />
        <span>{locationName}</span>
      </div>
    );
  }

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
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClearAll}>
                            <X className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Clear selection</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Clear selection</p>
                    </TooltipContent>
                </Tooltip>
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


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem('userRole');
      setUserRole(storedRole);
      setIsLoading(false);
    }
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  const isProcessOwner = userRole === 'process-owner';

  return (
    <LocationProvider>
      <div className={cn("min-h-screen w-full lg:grid", isSidebarCollapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[256px_1fr]")}>
        <div className={cn("hidden border-r bg-card lg:block transition-all duration-300", isSidebarCollapsed && "w-[80px]")}>
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-6">
              <Link href="#" className="flex items-center gap-2 font-semibold">
                <Logo collapsed={isSidebarCollapsed} />
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-4 text-sm font-medium">
                 <Link href="/dashboard" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard' ? 'bg-muted text-primary' : ''} ${isSidebarCollapsed && "justify-center"}`}>
                      <Home className="h-4 w-4" />
                      {!isSidebarCollapsed && "Dashboard"}
                  </Link>
                 <Link href="/dashboard/reports" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/reports' ? 'bg-muted text-primary' : ''} ${isSidebarCollapsed && "justify-center"}`}>
                    <AreaChart className="h-4 w-4" />
                    {!isSidebarCollapsed && "Reports"}
                  </Link>
                {isProcessOwner && (
                  <>
                    <Link href="/dashboard/location-master" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/location-master' ? 'bg-muted text-primary' : ''} ${isSidebarCollapsed && "justify-center"}`}>
                        <Building2 className="h-4 w-4" />
                        {!isSidebarCollapsed && "Location Master"}
                    </Link>
                    <Link href="/dashboard/location-management" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/location-management' ? 'bg-muted text-primary' : ''} ${isSidebarCollapsed && "justify-center"}`}>
                        <Settings className="h-4 w-4" />
                        {!isSidebarCollapsed && "Location Management"}
                    </Link>
                    <Link href="/dashboard/user-management" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/user-management' ? 'bg-muted text-primary' : ''} ${isSidebarCollapsed && "justify-center"}`}>
                        <UserCog className="h-4 w-4" />
                        {!isSidebarCollapsed && "User Management"}
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0 sm:max-w-xs">
                  <div className="p-4 border-b">
                    <Link href="#" className="flex items-center gap-2 font-semibold">
                      <Logo />
                    </Link>
                  </div>
                    <nav className="grid gap-2 text-lg font-medium p-4">
                      <Link href="/dashboard" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard' ? 'bg-muted text-primary' : ''}`}>
                          <Home className="h-4 w-4" />
                          Dashboard
                      </Link>
                       <Link href="/dashboard/reports" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/reports' ? 'bg-muted text-primary' : ''}`}>
                          <AreaChart className="h-4 w-4" />
                          Reports
                      </Link>
                      {isProcessOwner && (
                        <>
                          <Link href="/dashboard/location-master" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/location-master' ? 'bg-muted text-primary' : ''}`}>
                              <Building2 className="h-4 w-4" />
                              Location Master
                          </Link>
                          <Link href="/dashboard/location-management" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/location-management' ? 'bg-muted text-primary' : ''}`}>
                              <Settings className="h-4 w-4" />
                              Location Management
                          </Link>
                           <Link href="/dashboard/user-management" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${pathname === '/dashboard/user-management' ? 'bg-muted text-primary' : ''}`}>
                              <UserCog className="h-4 w-4" />
                              User Management
                          </Link>
                        </>
                      )}
                  </nav>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="icon" className="hidden lg:inline-flex" onClick={toggleSidebar}>
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            
            { pathname !== '/dashboard/reports' && <LocationFilter /> }
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://picsum.photos/seed/${userRole}/100/100`} />
                        <AvatarFallback>{userRole ? userRole.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userRole === 'process-owner' ? 'Process Owner' : 'Reception'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userRole === 'process-owner' ? 'owner@example.com' : 'reception@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Link href="/">
                      <DropdownMenuItem>
                          Log out
                      </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/40 p-4 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>
      </div>
    </LocationProvider>
  );
}
