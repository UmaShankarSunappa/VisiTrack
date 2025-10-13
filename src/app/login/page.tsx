
"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Mail, Key, Building } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { receptionists } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [locationId, setLocationId] = useState<string | undefined>();
    const [error, setError] = useState('');

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (!locationId) {
            setError("Please select a location.");
            return;
        }

        const user = receptionists.find(r => r.locationId === locationId);

        if (user && user.email === email && user.password === password) {
            toast({
                title: "Login Successful",
                description: `Welcome, ${user.locationName}!`,
            });
            // Store location info for dashboard
            if (typeof window !== "undefined") {
              localStorage.setItem('receptionistLocation', user.locationName);
              if (user.locationId === 'admin') {
                  localStorage.setItem('userRole', 'admin');
              } else {
                  localStorage.removeItem('userRole');
              }
            }
            router.push('/dashboard');
        } else {
             setError("Invalid credentials. Please try again.");
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl font-bold font-headline">Receptionist Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="location">Role / Location</Label>
                <div className="relative">
                    <Building className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Select value={locationId} onValueChange={(value) => {
                        setLocationId(value)
                        const user = receptionists.find(r => r.locationId === value);
                        if(user) {
                            setEmail(user.email);
                            // Clear password when role changes
                            setPassword('');
                        }
                    }}>
                        <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Select your role or location" />
                        </SelectTrigger>
                        <SelectContent>
                            {receptionists.map((rec) => (
                                <SelectItem key={rec.locationId} value={rec.locationId}>
                                    {rec.locationName}
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
                <Input id="email" type="email" placeholder="reception@example.com" required className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
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
            <Button variant="outline" className="w-full" asChild>
                <Link href="/">Back to Kiosk</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
