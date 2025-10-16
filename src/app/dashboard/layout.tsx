
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
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
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


function LocationFilter() {
  const { locations, selectedLocations, setSelectedLocations } = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocation = localStorage.getItem('receptionistLocation');
      const storedRole = localStorage.getItem('userRole');
      setLocationName(storedLocation);
      setUserRole(storedRole);
    }
  }, []);

  const isProcessOwner = userRole === 'process-owner';
  
  const handleSelectAll = () => {
    if (selectedLocations.length === locations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locations);
    }
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };
  
  const getDisplayLabel = () => {
    if (selectedLocations.length === locations.length) return "All Locations";
    if (selectedLocations.length === 1) return selectedLocations[0];
    if (selectedLocations.length > 1) return `${selectedLocations.length} locations selected`;
    return "No locations selected";
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
        <DropdownMenuCheckboxItem
          checked={selectedLocations.length === locations.length}
          onSelect={(e) => { e.preventDefault(); handleSelectAll(); }}
        >
          All Locations
        </DropdownMenuCheckboxItem>
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
  const [locationName, setLocationName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <LocationProvider>
      <SidebarProvider defaultOpen={true}>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
               <Logo />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard" isActive={pathname === '/dashboard'}>
                  <Home />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
              <LocationFilter />

              <div className="w-full flex-1">
               {/* Search has been moved to page */}
              </div>
               <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="md:hidden">
                          <PanelLeft className="h-5 w-5" />
                          <span className="sr-only">Toggle navigation menu</span>
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col p-0">
                      <div className="p-4">
                          <Logo />
                      </div>
                       <nav className="grid gap-2 text-lg font-medium p-4">
                          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary data-[active=true]:bg-muted data-[active=true]:text-primary" data-active={pathname === '/dashboard'}>
                              <Home className="h-4 w-4" />
                              Dashboard
                          </Link>
                      </nav>
                  </SheetContent>
              </Sheet>
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
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </LocationProvider>
  );
}
