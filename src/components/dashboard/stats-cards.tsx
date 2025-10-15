
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, LogIn, LogOut, Briefcase } from "lucide-react"
import type { Entry } from "@/lib/types"

interface StatsCardsProps {
    entries: Entry[];
}

export function StatsCards({ entries }: StatsCardsProps) {
  const activeVisitors = entries.filter(e => e.type === 'Visitor' && e.status === 'Checked-in').length;
  const activeEmployees = entries.filter(e => e.type === 'Employee' && e.status === 'Checked-in').length;
  const totalCheckins = entries.length;
  const totalCheckouts = entries.filter(e => e.status === 'Checked-out').length;


  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card className="rounded-2xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Visitors
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{activeVisitors}</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Employees
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{activeEmployees}</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Check-ins Today
          </CardTitle>
          <LogIn className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalCheckins}</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-sm transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Check-outs</CardTitle>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalCheckouts}</div>
        </CardContent>
      </Card>
    </div>
  )
}
