
"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Mail, Key, UserCog } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { defaultUsers, locations as defaultLocations } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { MainLocation, User } from "@/lib/types";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
    const [error, setError] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isConfigured = (location: MainLocation) => {
        return !!location.macAddress && location.cardStart != null && location.cardEnd != null;
    }

    const generateReceptionists = (locations: MainLocation[]): User[] => {
      return locations.flatMap(loc => {
        // Only generate users for configured locations
        if (!isConfigured(loc)) return [];

        if (loc.subLocations && loc.subLocations.length > 0) {
          return loc.subLocations.map(sub => ({
            id: `${loc.id}-${sub.id}`,
            role: 'receptionist' as const,
            locationId: `${loc.id}-${sub.id}`,
            locationName: `${loc.descriptiveName || loc.name} - ${sub.name}`,
            email: `reception.${loc.id.slice(0,3)}.${sub.id.slice(0,2)}@example.com`,
            password: 'password123'
          }));
        }
        return {
          id: loc.id,
          role: 'receptionist' as const,
          locationId: loc.id,
          locationName: loc.descriptiveName || loc.name,
          email: `reception.${loc.id.slice(0,3)}@example.com`,
          password: 'password123'
        };
      });
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const storedUsers = localStorage.getItem('users');
        const storedLocations = localStorage.getItem('locations');
        
        let allStoredUsers: User[] = [];
        let loadedLocations = storedLocations ? JSON.parse(storedLocations) : defaultLocations;
        
        const dynamicReceptionists = generateReceptionists(loadedLocations);

        if (storedUsers) {
            allStoredUsers = JSON.parse(storedUsers);
        } else {
            allStoredUsers = [...defaultUsers, ...dynamicReceptionists];
            localStorage.setItem('users', JSON.stringify(allStoredUsers));
        }

        const userMap = new Map<string, User>();
        
        // Base users are default owners and dynamically generated receptionists
        defaultUsers.forEach(u => userMap.set(u.id, u));
        dynamicReceptionists.forEach(u => userMap.set(u.id, u));

        // Overwrite with any custom/stored users that are still valid
        const dynamicReceptionistIds = new Set(dynamicReceptionists.map(r => r.id));
        allStoredUsers.forEach(u => {
            if (u.role === 'process-owner') {
                userMap.set(u.id, u); // Always include process owners
            } else if (dynamicReceptionistIds.has(u.id)) {
                 // Only include receptionists if their location is still valid and configured
                userMap.set(u.id, u);
            }
        });
        
        const finalUsers = Array.from(userMap.values());

        setUsers(finalUsers);
        setIsLoading(false);
    }, [])

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (!selectedUserId) {
            setError("Please select a role/location.");
            return;
        }

        const user = users.find(r => r.id === selectedUserId);

        if (user && user.email === email && user.password === password) {
            toast({
                title: "Login Successful",
                description: `Welcome, ${user.locationName}!`,
            });
            
            if (typeof window !== "undefined") {
              localStorage.setItem('receptionistLocation', user.locationName);
              localStorage.setItem('userRole', user.role);
            }
            router.push('/dashboard');
        } else {
             setError("Invalid credentials. Please try again.");
        }
    }

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
         <Card className="w-full max-w-sm mx-auto shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4"><Logo /></div>
            <CardDescription>Loading VisiTrack...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2 h-16 bg-muted rounded-md animate-pulse" />
             <div className="space-y-2 h-16 bg-muted rounded-md animate-pulse" />
             <div className="space-y-2 h-16 bg-muted rounded-md animate-pulse" />
             <div className="h-10 bg-muted rounded-md animate-pulse" />
          </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardDescription>
            Login to VisiTrack
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="location">Role / Location</Label>
                <div className="relative">
                    <UserCog className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Select value={selectedUserId} onValueChange={(value) => {
                        setSelectedUserId(value)
                        const user = users.find(r => r.id === value);
                        if(user) {
                            setEmail(user.email);
                            setPassword(user.password || '');
                        }
                    }}>
                        <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select your role or location" />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.locationName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="user@example.com" required className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="inline-block ml-auto text-sm underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Key className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input id="password" type="password" required className="pl-10" value={password} onChange={e => setPassword(e.target.value)} placeholder="password123"/>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
