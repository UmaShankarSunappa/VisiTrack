
"use client"

import * as React from "react"
import { format } from "date-fns"
import {
  File,
  ListFilter,
  LogOut,
  Eye,
  Pencil,
  Search,
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

import type { Visitor, Department } from "@/lib/types"
import { AddVisitorDialog } from "./add-visitor-dialog"
import { useToast } from "@/hooks/use-toast"
import { VisitorDetailsDialog } from "./visitor-details-dialog"
import { EditVisitorDialog } from "./edit-visitor-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { departments } from "@/lib/data"
import { Input } from "@/components/ui/input"


export function VisitorTable({ visitors }: { visitors: Visitor[] }) {
    const { toast } = useToast()
    const [visitorList, setVisitorList] = React.useState(visitors)
    const [selectedVisitor, setSelectedVisitor] = React.useState<Visitor | null>(null);
    const [editingVisitor, setEditingVisitor] = React.useState<Visitor | null>(null);
    const [activeTab, setActiveTab] = React.useState("all");
    const [selectedDepartments, setSelectedDepartments] = React.useState<Department[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
        let filtered = visitors;

        if (selectedDepartments.length > 0) {
            filtered = filtered.filter(v => selectedDepartments.includes(v.hostDepartment));
        }

        if (searchQuery) {
            filtered = filtered.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        setVisitorList(filtered.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()));
    }, [visitors, selectedDepartments, searchQuery]);


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

    const handleEdit = (visitor: Visitor) => {
        setEditingVisitor(visitor);
    }
    
    const onVisitorAdded = (newVisitor: Visitor) => {
        const updatedVisitors = [newVisitor, ...visitorList];
        setVisitorList(updatedVisitors);
    }
    
    const onVisitorUpdated = (updatedVisitor: Visitor) => {
        const updatedList = visitorList.map(v => 
            v.id === updatedVisitor.id ? updatedVisitor : v
        );
        setVisitorList(updatedList);
        
        const storedVisitors = localStorage.getItem('visitors');
        if(storedVisitors) {
            const allVisitors = JSON.parse(storedVisitors).map((v:any) => ({
                ...v,
                checkInTime: new Date(v.checkInTime),
                checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
            }));
            const updatedAllVisitors = allVisitors.map((v: Visitor) => v.id === updatedVisitor.id ? updatedVisitor : v);
            localStorage.setItem('visitors', JSON.stringify(updatedAllVisitors));
        }
    }

    const handleDepartmentFilterChange = (department: Department) => {
        setSelectedDepartments(prev => 
            prev.includes(department)
                ? prev.filter(d => d !== department)
                : [...prev, department]
        );
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
            "Person to Meet": v.hostName,
            "Host Department": v.hostDepartment,
            "Reason For Visit": v.reasonForVisit,
            "Location": `${v.location.main}${v.location.sub ? ` - ${v.location.sub}` : ''}`,
            "Status": v.status,
            "Check-in Time": format(new Date(v.checkInTime), "yyyy-MM-dd HH:mm:ss"),
            "Check-out Time": v.checkOutTime ? format(new Date(v.checkOutTime), "yyyy-MM-dd HH:mm:ss") : 'N/A',
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
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-[150px] lg:w-[250px] pl-8"
                />
            </div>
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
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {departments.map(dep => (
                <DropdownMenuCheckboxItem
                    key={dep}
                    checked={selectedDepartments.includes(dep)}
                    onSelect={(e) => {
                        e.preventDefault();
                        handleDepartmentFilterChange(dep);
                    }}
                >
                    {dep}
                </DropdownMenuCheckboxItem>
              ))}
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
        <VisitorListCard visitors={visitorList} handleCheckout={handleCheckout} handleViewDetails={handleViewDetails} handleEdit={handleEdit} />
      </TabsContent>
      <TabsContent value="checked-in">
        <VisitorListCard visitors={visitorList.filter(v => v.status === 'Checked-in')} handleCheckout={handleCheckout} handleViewDetails={handleViewDetails} handleEdit={handleEdit}/>
      </TabsContent>
       <TabsContent value="checked-out">
        <VisitorListCard visitors={visitorList.filter(v => v.status === 'Checked-out')} handleCheckout={handleCheckout} handleViewDetails={handleViewDetails} handleEdit={handleEdit}/>
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
    {editingVisitor && (
        <EditVisitorDialog
            visitor={editingVisitor}
            open={!!editingVisitor}
            onOpenChange={(isOpen) => {
                if(!isOpen) {
                    setEditingVisitor(null);
                }
            }}
            onVisitorUpdated={onVisitorUpdated}
        />
    )}
    </>
  )
}


function VisitorListCard({ visitors, handleCheckout, handleViewDetails, handleEdit }: { visitors: Visitor[], handleCheckout: (id: string) => void, handleViewDetails: (visitor: Visitor) => void, handleEdit: (visitor: Visitor) => void }) {
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
                    Person to Meet
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium py-2 px-4 whitespace-nowrap">
                        {visitor.name}
                    </TableCell>
                    <TableCell className="py-2 px-4 text-muted-foreground whitespace-nowrap">
                        {visitor.mobile}
                    </TableCell>
                    <TableCell className="py-2 px-4 whitespace-nowrap">
                      <Badge variant={visitor.status === 'Checked-in' ? 'default' : 'outline'}>
                        {visitor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {visitor.hostName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {visitor.hostDepartment}
                    </TableCell>
                    <TableCell className="hidden md-table-cell py-2 px-4 whitespace-nowrap">
                      {format(new Date(visitor.checkInTime), "PPpp")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">
                      {visitor.checkOutTime ? format(new Date(visitor.checkOutTime), "PPpp") : 'N/A'}
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
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            aria-label="Edit Visitor"
                                            size="icon"
                                            variant="outline"
                                            onClick={() => handleEdit(visitor)}
                                            className="h-8 w-8"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit Visitor</p>
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
