
"use client"

import * as React from "react"
import Image from "next/image"
import { format, isSameDay } from "date-fns"
import {
  File,
  ListFilter,
  LogOut,
  Calendar as CalendarIcon,
  Eye,
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
import { VisitorDetailsDialog } from "./visitor-details-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export function VisitorTable({ visitors }: { visitors: Visitor[] }) {
    const { toast } = useToast()
    const [visitorList, setVisitorList] = React.useState(visitors)
    const [date, setDate] = React.useState<Date | undefined>()
    const [selectedVisitor, setSelectedVisitor] = React.useState<Visitor | null>(null);

    React.useEffect(() => {
        let filteredVisitors = visitors;
        if (date) {
            filteredVisitors = visitors.filter(visitor => isSameDay(visitor.checkInTime, date));
        }
        setVisitorList(filteredVisitors);
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

    const handleViewDetails = (visitor: Visitor) => {
        setSelectedVisitor(visitor);
    }

  return (
    <>
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
                   <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="h-auto">
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
               <DropdownMenuItem onSelect={() => setDate(undefined)}>Clear Date Filter</DropdownMenuItem>
              <DropdownMenuSeparator />
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
        <VisitorListCard visitors={visitorList} handleCheckout={handleCheckout} handleViewDetails={handleViewDetails} />
      </TabsContent>
      <TabsContent value="checked-in">
        <VisitorListCard visitors={visitorList.filter(v => v.status === 'Checked-in')} handleCheckout={handleCheckout} handleViewDetails={handleViewDetails} />
      </TabsContent>
       <TabsContent value="checked-out">
        <VisitorListCard visitors={visitorList.filter(v => v.status === 'Checked-out')} handleCheckout={handleCheckout} handleViewDetails={handleViewDetails} />
      </TabsContent>
    </Tabs>
     {selectedVisitor && (
        <VisitorDetailsDialog 
            visitor={selectedVisitor} 
            open={!!selectedVisitor} 
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedVisitor(null);
                }
            }}
        />
    )}
    </>
  )
}


function VisitorListCard({ visitors, handleCheckout, handleViewDetails }: { visitors: Visitor[], handleCheckout: (id: string) => void, handleViewDetails: (visitor: Visitor) => void }) {
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
                  <TableHead>Actions</TableHead>
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
                        <TooltipProvider>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            aria-label="View Details"
                                            size="icon"
                                            variant="outline"
                                            onClick={() => handleViewDetails(visitor)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
                                    </TooltipContent>
                                </Tooltip>
                                {visitor.status === 'Checked-in' && (
                                    <AlertDialog>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <AlertDialogTrigger asChild>
                                                    <Button aria-label="Check-out" size="icon" variant="destructive">
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Check-out</p>
                                            </TooltipContent>
                                        </Tooltip>
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
                            </div>
                        </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
}
