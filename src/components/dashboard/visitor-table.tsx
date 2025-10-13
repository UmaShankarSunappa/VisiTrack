
"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  File,
  ListFilter,
  LogOut,
  Eye,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { utils, writeFile } from "xlsx";

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

import type { Visitor } from "@/lib/types"
import { AddVisitorDialog } from "./add-visitor-dialog"
import { useToast } from "@/hooks/use-toast"
import { VisitorDetailsDialog } from "./visitor-details-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export function VisitorTable({ visitors }: { visitors: Visitor[] }) {
    const { toast } = useToast()
    const [visitorList, setVisitorList] = React.useState(visitors)
    const [selectedVisitor, setSelectedVisitor] = React.useState<Visitor | null>(null);
    const [activeTab, setActiveTab] = React.useState("all");

    React.useEffect(() => {
        setVisitorList(visitors);
    }, [visitors]);


    const handleCheckout = (visitorId: string) => {
        const updatedList = visitorList.map(v => 
            v.id === visitorId ? { ...v, status: 'Checked-out', checkOutTime: new Date() } : v
        );
        
        // This will trigger the exit animation
        setVisitorList(updatedList);
        
        const visitor = visitors.find(v => v.id === visitorId);
        toast({
            title: "Visitor Checked Out",
            description: `${visitor?.name} has been successfully checked out.`
        });
        
        // Persist change
        const storedVisitors = localStorage.getItem('visitors');
        if(storedVisitors) {
            const allVisitors = JSON.parse(storedVisitors).map((v:any) => ({
                ...v,
                checkInTime: new Date(v.checkInTime),
                checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
            }));
            const updatedAllVisitors = allVisitors.map((v: Visitor) => v.id === visitorId ? { ...v, status: 'Checked-out', checkOutTime: new Date() } : v);
            localStorage.setItem('visitors', JSON.stringify(updatedAllVisitors));
        }
    }

    const handleViewDetails = (visitor: Visitor) => {
        setSelectedVisitor(visitor);
    }
    
    const onVisitorAdded = (newVisitor: Visitor) => {
        setVisitorList(currentVisitors => [newVisitor, ...currentVisitors]);
    }

    const handleExport = () => {
        let dataToExport = visitorList;
        if (activeTab === "checked-in") {
            dataToExport = visitorList.filter(v => v.status === "Checked-in");
        } else if (activeTab === "checked-out") {
            dataToExport = visitorList.filter(v => v.status === "Checked-out");
        }
        
        const formattedData = dataToExport.map(v => ({
            "Name": v.name,
            "Mobile": v.mobile,
            "Email": v.email || 'N/A',
            "Host Name": v.hostName,
            "Host Department": v.hostDepartment,
            "Reason For Visit": v.reasonForVisit,
            "Location": `${v.location.main}${v.location.sub ? ` - ${v.location.sub}` : ''}`,
            "Status": v.status,
            "Check-in Time": format(v.checkInTime, "yyyy-MM-dd HH:mm:ss"),
            "Check-out Time": v.checkOutTime ? format(v.checkOutTime, "yyyy-MM-dd HH:mm:ss") : 'N/A',
        }));

        const worksheet = utils.json_to_sheet(formattedData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Visitors");
        writeFile(workbook, `Visitors_${activeTab}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        toast({
            title: "Export Successful",
            description: "The visitor list has been exported to an Excel file."
        });
    }

  return (
    <>
    <Tabs defaultValue="all" onValueChange={setActiveTab}>
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
              <DropdownMenuCheckboxItem checked>
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Department</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <AddVisitorDialog onVisitorAdded={onVisitorAdded} />
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
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
            <CardDescription>
              A list of all visitors for the selected date and location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 px-4 whitespace-nowrap">Visitor Name</TableHead>
                  <TableHead className="py-2 px-4 whitespace-nowrap">Mobile</TableHead>
                  <TableHead className="py-2 px-4 whitespace-nowrap">Status</TableHead>
                  <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                    Host Name
                  </TableHead>
                  <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                    Department
                  </TableHead>
                  <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                    Check-in Time
                  </TableHead>
                  <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                    Check-out Time
                  </TableHead>
                  <TableHead className="py-2 px-4 whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                {visitors.map(visitor => (
                  <motion.tr
                    key={visitor.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium py-2 px-4 whitespace-nowrap">
                        {visitor.name}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                        {visitor.mobile}
                    </TableCell>
                    <TableCell className="py-2 px-4 whitespace-nowrap">
                      <Badge variant={visitor.status === 'Checked-in' ? 'secondary' : 'outline'}>
                        {visitor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {visitor.hostName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {visitor.hostDepartment}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {format(visitor.checkInTime, "PPpp")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {visitor.checkOutTime ? format(visitor.checkOutTime, "PPpp") : 'N/A'}
                    </TableCell>
                    <TableCell className="py-2 px-4 whitespace-nowrap">
                        <TooltipProvider>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            aria-label="View Details"
                                            size="icon"
                                            variant="outline"
                                            onClick={() => handleViewDetails(visitor)}
                                            className="h-8 w-8"
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
                                                    <Button aria-label="Check-out" size="icon" variant="destructive" className="h-8 w-8">
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
                  </motion.tr>
                ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    )
}
