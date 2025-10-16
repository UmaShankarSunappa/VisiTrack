
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole, MainLocation } from '@/lib/types';
import { defaultUsers, locations as defaultLocations } from '@/lib/data';

function CreateUserModal({ onUserCreated }: { onUserCreated: (newUser: User) => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [locationId, setLocationId] = useState('');
  const [locations, setLocations] = useState<MainLocation[]>([]);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const storedLocations = localStorage.getItem('locations');
      setLocations(storedLocations ? JSON.parse(storedLocations) : defaultLocations);
    }
  }, [open]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setRole('');
    setLocationId('');
    setError('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    if (role === 'receptionist' && !locationId) {
      setError('Please select a location for the receptionist.');
      return;
    }

    let newUser: User;
    if (role === 'process-owner') {
      newUser = {
        id: `po-${new Date().getTime()}`,
        role: 'process-owner',
        email,
        password,
        locationName: 'Process Owner'
      };
    } else {
      const mainLoc = locations.find(l => l.subLocations.some(sub => `${l.id}-${sub.id}` === locationId) || l.id === locationId);
      if (!mainLoc) {
        setError('Invalid location selected.');
        return;
      }
      
      let locationName = mainLoc.descriptiveName || mainLoc.name;
      const subLoc = mainLoc.subLocations.find(sub => `${mainLoc.id}-${sub.id}` === locationId);
      if(subLoc){
        locationName = `${locationName} - ${subLoc.name}`;
      }

      newUser = {
        id: locationId,
        role: 'receptionist',
        email,
        password,
        locationName,
        locationId,
      };
    }

    onUserCreated(newUser);
    toast({
      title: "User Created",
      description: `User with email "${email}" has been successfully created.`,
    });
    resetForm();
    setOpen(false);
  };

  const allPossibleLocations = locations.flatMap(loc => {
    if(loc.subLocations && loc.subLocations.length > 0) {
        return loc.subLocations.map(sub => ({
            id: `${loc.id}-${sub.id}`,
            name: `${loc.descriptiveName || loc.name} - ${sub.name}`
        }))
    }
    return { id: loc.id, name: loc.descriptiveName || loc.name }
  });


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="process-owner">Process Owner</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'receptionist' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPossibleLocations.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            {error && <p className="col-span-4 text-sm text-destructive text-center">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);

    const generateReceptionists = (locations: MainLocation[]): User[] => {
      return locations.flatMap(loc => {
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
        const storedUsers = localStorage.getItem('users');
        const storedLocations = localStorage.getItem('locations');
        
        let allUsers: User[] = [];
        let loadedLocations = storedLocations ? JSON.parse(storedLocations) : defaultLocations;
        
        const dynamicReceptionists = generateReceptionists(loadedLocations);
        
        if (storedUsers) {
            allUsers = JSON.parse(storedUsers);
        } else {
            allUsers = [...defaultUsers, ...dynamicReceptionists];
            localStorage.setItem('users', JSON.stringify(allUsers));
        }

        const userMap = new Map<string, User>();
        // Add default process owner first
        defaultUsers.forEach(u => userMap.set(u.id, u));
        
        // Add dynamic receptionists
        dynamicReceptionists.forEach(u => userMap.set(u.id, u));
        
        // Overwrite with any custom/stored users
        allUsers.forEach(u => userMap.set(u.id, u));

        setUsers(Array.from(userMap.values()));
    }, [])

    const handleUserCreated = (newUser: User) => {
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    }

  return (
    <div className="flex flex-1 flex-col w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <CreateUserModal onUserCreated={handleUserCreated} />
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <Badge variant={user.role === 'process-owner' ? 'default' : 'secondary'}>
                                {user.role === 'process-owner' ? 'Process Owner' : 'Receptionist'}
                            </Badge>
                        </TableCell>
                        <TableCell>{user.locationName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right space-x-2">
                             <Button variant="outline" size="sm" disabled>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" disabled={user.role === 'process-owner' && users.filter(u => u.role === 'process-owner').length === 1}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
