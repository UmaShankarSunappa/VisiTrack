"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Mail, Key } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (event: React.FormEvent) => {
        event.preventDefault();
        // In a real app, you'd have authentication logic here.
        // For this demo, we'll just redirect to the dashboard.
        router.push('/dashboard');
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="reception@example.com" required className="pl-10"/>
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
                <Input id="password" type="password" required className="pl-10"/>
              </div>
            </div>
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
