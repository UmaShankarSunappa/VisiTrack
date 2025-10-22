
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
  TriangleAlert,
  MapPin,
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
} from "@/components/ui/alert-dialog"

import type { Entry, Department } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { VisitorDetailsDialog } from "./visitor-details-dialog"
import { EditVisitorDialog } from "./edit-visitor-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { departments } from "@/lib/data"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function VisitorTable({ entries, onEntryUpdated }: { entries: Entry[], onEntryUpdated: (entry: Entry) => void }) {
    const { toast } = useToast()
    const [entryList, setEntryList] = React.useState(entries)
    const [selectedEntry, setSelectedEntry] = React.useState<Entry | null>(null);
    const [editingEntry, setEditingEntry] = React.useState<Entry | null>(null);
    const [checkoutEntry, setCheckoutEntry] = React.useState<Entry | null>(null);
    const [activeTab, setActiveTab] = React.useState("all");
    const [selectedDepartments, setSelectedDepartments] = React.useState<Department[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [userRole, setUserRole] = React.useState<string | null>(null);

     React.useEffect(() => {
        if (typeof window !== "undefined") {
            const storedRole = localStorage.getItem('userRole');
            setUserRole(storedRole);
        }
    }, []);

    React.useEffect(() => {
        let filtered = entries;

        if (selectedDepartments.length > 0) {
            filtered = filtered.filter(v => selectedDepartments.includes(v.hostDepartment));
        }

        if (searchQuery) {
            filtered = filtered.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        
        setEntryList(filtered.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()));
    }, [entries, selectedDepartments, searchQuery]);


    const handleCheckout = (entryId: string, cardReturned: boolean = true) => {
        const entry = entryList.find(v => v.id === entryId);
        if (!entry) return;

        const updatedEntry = {
            ...entry,
            status: 'Checked-out' as const,
            checkOutTime: new Date(),
        };

        if (updatedEntry.type === 'Visitor') {
            updatedEntry.visitorCardReturned = cardReturned;
        }

        onEntryUpdated(updatedEntry);
        
        toast({
            title: "Entry Checked Out",
            description: `${entry?.name} has been successfully checked out.`
        });
        
        setCheckoutEntry(null);
    }

    const handleViewDetails = (entry: Entry) => {
        setSelectedEntry(entry);
    }

    const handleEdit = (entry: Entry) => {
        setEditingEntry(entry);
    }
    
    const handleEntryUpdate = (updatedEntry: Entry) => {
        onEntryUpdated(updatedEntry);
        setEditingEntry(null);
    };


    const handleDepartmentFilterChange = (department: Department) => {
        setSelectedDepartments(prev => 
            prev.includes(department)
                ? prev.filter(d => d !== department)
                : [...prev, department]
        );
    }

    const handleExport = () => {
        let dataToExport = entryList;
        if (activeTab === "checked-in") {
            dataToExport = entryList.filter(v => v.status === "Checked-in");
        } else if (activeTab === "checked-out") {
            dataToExport = entryList.filter(v => v.status === "Checked-out");
        }
        
        const formattedData = dataToExport.map(v => {
            if (v.type === 'Visitor') {
                return {
                    "Type": v.type,
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
                    "Visitor Card No.": v.visitorCardNumber,
                    "Card Returned": v.visitorCardReturned ? 'Yes' : 'No'
                }
            } else {
                 return {
                    "Type": v.type,
                    "Name": v.name,
                    "Employee ID": v.employeeId,
                    "Department": v.department,
                    "Email": v.email || 'N/A',
                    "Person to Meet": v.hostName,
                    "Host Department": v.hostDepartment,
                    "Reason For Visit": v.reasonForVisit,
                    "Location": `${v.location.main}${v.location.sub ? ` - ${v.location.sub}` : ''}`,
                    "Status": v.status,
                    "Check-in Time": format(new Date(v.checkInTime), "yyyy-MM-dd HH:mm:ss"),
                    "Check-out Time": v.checkOutTime ? format(new Date(v.checkOutTime), "yyyy-MM-dd HH:mm:ss") : 'N/A',
                }
            }
        });

        const worksheet = utils.json_to_sheet(formattedData);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Entries");
        writeFile(workbook, `Entries_${activeTab}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
        toast({
            title: "Export Successful",
            description: "The list has been exported to an Excel file."
        });
    }
  
  const isProcessOwner = userRole === 'process-owner';

  return (
    <>
    <Tabs defaultValue="all" onValueChange={setActiveTab} className="flex flex-col h-full">
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
                  Filter Dept
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
                    onSelect={(e) => { e.preventDefault(); handleDepartmentFilterChange(dep); }}
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
        </div>
      </div>
      <TabsContent value="all" className="flex-1 min-h-0">
        <VisitorListCard entries={entryList} handleCheckout={setCheckoutEntry} handleViewDetails={handleViewDetails} handleEdit={handleEdit} isAdmin={isProcessOwner}/>
      </TabsContent>
      <TabsContent value="checked-in" className="flex-1 min-h-0">
        <VisitorListCard entries={entryList.filter(v => v.status === 'Checked-in')} handleCheckout={setCheckoutEntry} handleViewDetails={handleViewDetails} handleEdit={handleEdit} isAdmin={isProcessOwner}/>
      </TabsContent>
       <TabsContent value="checked-out" className="flex-1 min-h-0">
        <VisitorListCard entries={entryList.filter(v => v.status === 'Checked-out')} handleCheckout={setCheckoutEntry} handleViewDetails={handleViewDetails} handleEdit={handleEdit} isAdmin={isProcessOwner}/>
      </TabsContent>
    </Tabs>
     {selectedEntry && (
        <VisitorDetailsDialog 
            entry={selectedEntry} 
            open={!!selectedEntry} 
            onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)}
        />
    )}
    {editingEntry && (
        <EditVisitorDialog
            key={editingEntry.id}
            entry={editingEntry}
            open={!!editingEntry}
            onOpenChange={(isOpen) => !isOpen && setEditingEntry(null)}
            onEntryUpdated={handleEntryUpdate}
        />
    )}
    {checkoutEntry && (
        <AlertDialog open={!!checkoutEntry} onOpenChange={(isOpen) => !isOpen && setCheckoutEntry(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Checkout</AlertDialogTitle>
                    <AlertDialogDescription>
                        {checkoutEntry.type === 'Visitor' ? `Has visitor card #${(checkoutEntry as any).visitorCardNumber} been returned?` : `Are you sure you want to check out ${checkoutEntry.name}?`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {checkoutEntry.type === 'Visitor' ? (
                        <>
                            <AlertDialogAction onClick={() => handleCheckout(checkoutEntry.id, false)} className="bg-destructive hover:bg-destructive/80">No, Not Returned</AlertDialogAction>
                            <AlertDialogAction onClick={() => handleCheckout(checkoutEntry.id, true)}>Yes, Returned</AlertDialogAction>
                        </>
                    ) : (
                        <AlertDialogAction onClick={() => handleCheckout(checkoutEntry.id)}>Confirm Check-out</AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )}
    </>
  )
}


function VisitorListCard({ entries, handleCheckout, handleViewDetails, handleEdit, isAdmin }: { entries: Entry[], handleCheckout: (entry: Entry) => void, handleViewDetails: (entry: Entry) => void, handleEdit: (entry: Entry) => void, isAdmin: boolean }) {
    return (
        <Card className="animate-fade-in-up h-full flex flex-col mt-4">
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            <div className="relative flex-grow overflow-y-auto">
                <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                    <TableHead className="py-2 px-4 whitespace-nowrap">Type</TableHead>
                    <TableHead className="py-2 px-4 whitespace-nowrap">Name</TableHead>
                    <TableHead className="hidden sm:table-cell py-2 px-4 whitespace-nowrap">Mobile / Emp ID</TableHead>
                    {isAdmin && <TableHead className="hidden xl:table-cell py-2 px-4 whitespace-nowrap">Location</TableHead>}
                    <TableHead className="py-2 px-4 whitespace-nowrap">Status</TableHead>
                    <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">Person to Meet</TableHead>
                    <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">Department</TableHead>
                    <TableHead className="hidden lg:table-cell py-2 px-4 whitespace-nowrap">Card No.</TableHead>
                    <TableHead className="hidden md:table-cell py-2 px-4 whitespace-nowrap">Check-in</TableHead>
                    <TableHead className="hidden lg:table-cell py-2 px-4 whitespace-nowrap">Check-out</TableHead>
                    <TableHead className="py-2 px-4 whitespace-nowrap text-center sticky right-0 bg-card">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence>
                    {entries.map(entry => (
                    <motion.tr
                        key={entry.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn("hover:bg-muted/50", entry.type === 'Employee' && 'bg-green-50/50')}
                    >
                        <TableCell className="py-2 px-4 whitespace-nowrap">
                            <Badge
                            variant="outline"
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-medium',
                                entry.type === 'Visitor' && 'border-gray-300 bg-background text-gray-700',
                                entry.type === 'Employee' && 'border-transparent bg-green-100 text-green-800'
                            )}
                            >
                            {entry.type}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium py-2 px-4 whitespace-nowrap">{entry.name}</TableCell>
                        <TableCell className="hidden sm:table-cell py-2 px-4 text-muted-foreground whitespace-nowrap">
                            {entry.type === 'Visitor' ? entry.mobile : entry.employeeId}
                        </TableCell>
                        {isAdmin && <TableCell className="hidden xl:table-cell py-2 px-4 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{entry.location.main}{entry.location.sub ? ` - ${entry.location.sub}` : ''}</span>
                        </div>
                            </TableCell>}
                        <TableCell className="py-2 px-4 whitespace-nowrap">
                        <Badge variant={entry.status === 'Checked-in' ? 'default' : 'outline'}>{entry.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">{entry.hostName}</TableCell>
                        <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">{entry.hostDepartment}</TableCell>
                        <TableCell className="hidden lg:table-cell py-2 px-4 whitespace-nowrap">
                        {entry.type === 'Visitor' ? (
                            <div className="flex items-center gap-1">
                            <span>{entry.visitorCardNumber}</span>
                            {entry.status === 'Checked-out' && !entry.visitorCardReturned && (
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                    <TriangleAlert className="h-4 w-4 text-destructive" />
                                    </TooltipTrigger>
                                    <TooltipContent><p>Card not returned</p></TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            )}
                            </div>
                        ) : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2 px-4 whitespace-nowrap">{format(new Date(entry.checkInTime), "PPp")}</TableCell>
                        <TableCell className="hidden lg:table-cell py-2 px-4 whitespace-nowrap">{entry.checkOutTime ? format(new Date(entry.checkOutTime), "PPp") : 'N/A'}</TableCell>
                        <TableCell className="py-2 px-4 whitespace-nowrap text-center sticky right-0 bg-card/95">
                            <TooltipProvider>
                                <div className="flex items-center justify-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild><Button aria-label="View Details" size="icon" variant="outline" onClick={() => handleViewDetails(entry)} className="h-8 w-8"><Eye className="h-4 w-4" /></Button></TooltipTrigger>
                                        <TooltipContent><p>View Details</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild><Button aria-label="Edit" size="icon" variant="outline" onClick={() => handleEdit(entry)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button></TooltipTrigger>
                                        <TooltipContent><p>Edit</p></TooltipContent>
                                    </Tooltip>
                                    {entry.status === 'Checked-in' ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild><Button aria-label="Check-out" size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleCheckout(entry)}><LogOut className="h-4 w-4" /></Button></TooltipTrigger>
                                        <TooltipContent><p>Check-out</p></TooltipContent>
                                    </Tooltip>
                                    ) : ( <div className="w-8" /> )}
                                </div>
                            </TooltipProvider>
                        </TableCell>
                    </motion.tr>
                    ))}
                    </AnimatePresence>
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
    )
}

    