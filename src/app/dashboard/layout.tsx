
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  Users,
  Settings,
  PanelLeft,
  MapPin,
  Shield,
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
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [locationName, setLocationName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocation = localStorage.getItem('receptionistLocation');
      const storedRole = localStorage.getItem('userRole');
      setLocationName(storedLocation);
      setUserRole(storedRole);
    }
  }, []);

  const isAdmin = userRole === 'admin';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
             <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/dashboard" isActive>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Users />
                Visitors
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
             {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton href="#">
                  <Shield />
                  Admin Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-full justify-start h-12 gap-2 p-2">
                   <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://picsum.photos/seed/${isAdmin ? 'admin' : 'receptionist'}/100/100`} />
                      <AvatarFallback>{isAdmin ? 'AD' : 'RD'}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <p className="text-sm font-medium">{isAdmin ? 'Admin' : 'Reception Desk'}</p>
                        <p className="text-xs text-muted-foreground">{isAdmin ? 'admin@example.com' : 'reception@example.com'}</p>
                    </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{isAdmin ? 'Admin' : 'Reception'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                       {isAdmin ? 'admin@example.com' : 'reception@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                 <Link href="/login">
                    <DropdownMenuItem>
                        Log out
                    </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger className="hidden md:flex" />
            
             {locationName && (
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{isAdmin ? "All Locations" : locationName}</span>
              </div>
            )}

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
                        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
                            <Home className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Users className="h-4 w-4" />
                            Visitors
                        </Link>
                        <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                         {isAdmin && (
                            <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                <Shield className="h-4 w-4" />
                                Admin Settings
                            </Link>
                        )}
                    </nav>
                </SheetContent>
            </Sheet>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
