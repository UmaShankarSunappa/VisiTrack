import Link from 'next/link';
import { QrCodeGenerator } from '@/components/qr-generator';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Building className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">VisiTrack Pro</h1>
          </div>
          <Button asChild>
            <Link href="/login">
              <LogIn className="w-4 h-4 mr-2" />
              Receptionist Login
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Logo />
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl font-headline">
              Welcome to VisiTrack Pro
            </h2>
            <p className="max-w-2xl mt-4 text-lg text-muted-foreground">
              The seamless visitor management solution. Please select your location to generate a check-in QR code.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Generate Check-in Code</CardTitle>
                <CardDescription>Select your office and floor to create a unique QR code for visitor check-in.</CardDescription>
              </CardHeader>
              <CardContent>
                <QrCodeGenerator />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="py-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} VisiTrack Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
