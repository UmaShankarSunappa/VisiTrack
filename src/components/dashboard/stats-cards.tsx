
"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Users, LogIn, LogOut } from "lucide-react"
import type { Visitor } from "@/lib/types"

interface StatsCardsProps {
    visitors: Visitor[];
}

export function StatsCards({ visitors }: StatsCardsProps) {
  const totalCheckins = visitors.length;
  const totalCheckouts = visitors.filter(v => v.status === 'Checked-out').length;
  const currentVisitors = totalCheckins - totalCheckouts;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Checked-in Visitors
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentVisitors}</div>
          <p className="text-xs text-muted-foreground">
            Visitors currently on premises for the selected date.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Check-ins
          </CardTitle>
          <LogIn className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCheckins}</div>
          <p className="text-xs text-muted-foreground">
            For the selected date
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Check-outs</CardTitle>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCheckouts}</div>
          <p className="text-xs text-muted-foreground">
            For the selected date
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
