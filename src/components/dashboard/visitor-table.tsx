"use client"

import * as React from "react"
import Image from "next/image"
import { format, isSameDay } from "date-fns"
import {
  File,
  ListFilter,
  MoreHorizontal,
  LogOut,
  Calendar as CalendarIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import type { Visitor } from "@/lib/types"
import { AddVisitorDialog } from "./add-visitor-dialog"
import { useToast } from "@/hooks/use-toast"


export function VisitorTable({ visitors }: { visitors: Visitor[] }) {
    const { toast } = useToast()
    const [visitorList, setVisitorList] = React.useState(visitors)
    const [date, setDate] = React.useState<Date | undefined>()

    React.useEffect(() => {
        if (date) {
            const filteredVisitors = visitors.filter(visitor => isSameDay(visitor.checkInTime, date));
            setVisitorList(filteredVisitors);
        } else {
            setVisitorList(visitors);
        }
    }, [date, visitors]);

    const handleCheckout = (visitorId: string) => {
        const updatedList = visitorList.map(v => 
            v.id === visitorId ? { ...v, status: 'Checked-out', checkOutTime: new Date() } : v
        );
        setVisitorList(updatedList);
        
        const visitor = visitors.find(v => v.id === visitorId);
        toast({
            title: "Visitor Checked Out",
            description: `${visitor?.name} has been successfully checked out.`
        });
    }

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="checked-in">Checked-in</TabsTrigger>
          <TabsTrigger value="checked-out">Checked-out</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
               <Popover>
                <PopoverTrigger asChild>
                   <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                     <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal h-8",
                            !date && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                   </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
              <DropdownMenuCheckboxItem checked>
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Department</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <AddVisitorDialog />
        </div>
      </div>
      <TabsContent value="all">
        <VisitorListCard visitors={visitorList} handleCheckout={handleCheckout} />
      </TabsContent>
      <TabsContent value="checked-in">
        <VisitorListCard visitors={visitorList.filter(v => v.status === 'Checked-in')} handleCheckout={handleCheckout} />
      </TabsContent>
       <TabsContent value="checked-out">
        <VisitorListCard visitors={visitorList.filter(v => v.status === 'Checked-out')} handleCheckout={handleCheckout} />
      </TabsContent>
    </Tabs>
  )
}


function VisitorListCard({ visitors, handleCheckout }: { visitors: Visitor[], handleCheckout: (id: string) => void }) {
    return (
        <Card>
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>
              A list of all visitors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Host
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Check-in Time
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map(visitor => (
                  <TableRow key={visitor.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt="Visitor image"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={visitor.selfieUrl}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                        <div>{visitor.name}</div>
                        <div className="text-sm text-muted-foreground">{visitor.mobile}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={visitor.status === 'Checked-in' ? 'secondary' : 'outline'}>
                        {visitor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {visitor.hostName} ({visitor.hostDepartment})
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(visitor.checkInTime, "PPpp")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          {visitor.status === 'Checked-in' && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Check-out
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to check-out this visitor?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark {visitor.name} as checked-out. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCheckout(visitor.id)}>
                                        Confirm Check-out
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
}
