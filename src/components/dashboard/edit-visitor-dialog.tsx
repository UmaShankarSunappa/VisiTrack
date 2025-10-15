
"use client"

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { departments } from "@/lib/data";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Phone, Mail, Building, UserCheck } from "lucide-react";
import type { Entry, Visitor, Employee, GovtIdType } from "@/lib/types";

const editVisitorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().transform((val) => val.replace(/\D/g, '')).pipe(z.string().length(10, "Please enter a valid 10-digit mobile number.")),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  hostName: z.string().min(2, "Person to meet is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
  govtIdType: z.enum(["Aadhaar Card", "Driving Licence", "Voter ID", "Passport", "PAN Card", "Other"]),
  visitorCardNumber: z.string().min(1, "Visitor card number is required."),
});

const editEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  hostName: z.string().min(2, "Person to meet is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
});


interface EditVisitorDialogProps {
  entry: Entry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryUpdated: (entry: Entry) => void;
}

export function EditVisitorDialog({ entry, open, onOpenChange, onEntryUpdated }: EditVisitorDialogProps) {
  return entry.type === 'Visitor' 
    ? <EditVisitorForm entry={entry as Visitor} open={open} onOpenChange={onOpenChange} onEntryUpdated={onEntryUpdated} />
    : <EditEmployeeForm entry={entry as Employee} open={open} onOpenChange={onOpenChange} onEntryUpdated={onEntryUpdated} />
}


function EditVisitorForm({ entry, open, onOpenChange, onEntryUpdated }: { entry: Visitor, open: boolean, onOpenChange: (open: boolean) => void, onEntryUpdated: (entry: Entry) => void }){
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editVisitorSchema>>({
    resolver: zodResolver(editVisitorSchema),
    defaultValues: {
        name: entry.name,
        mobile: entry.mobile,
        email: entry.email,
        hostName: entry.hostName,
        hostDepartment: entry.hostDepartment,
        reasonForVisit: entry.reasonForVisit,
        govtIdType: entry.govtIdType,
        visitorCardNumber: entry.visitorCardNumber
    },
  });
  
  useEffect(() => {
    form.reset({
        name: entry.name,
        mobile: entry.mobile,
        email: entry.email,
        hostName: entry.hostName,
        hostDepartment: entry.hostDepartment,
        reasonForVisit: entry.reasonForVisit,
        govtIdType: entry.govtIdType,
        visitorCardNumber: entry.visitorCardNumber
    })
  }, [entry, form])

  const onSubmit: SubmitHandler<z.infer<typeof editVisitorSchema>> = (data) => {
     const updatedEntry = {
         ...entry,
         ...data,
         checkInTime: new Date(entry.checkInTime),
         checkOutTime: entry.checkOutTime ? new Date(entry.checkOutTime) : undefined,
     };

     onEntryUpdated(updatedEntry);

     toast({
         title: "Entry Updated",
         description: `${data.name}'s details have been updated.`
     });
     onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Visitor</DialogTitle>
          <DialogDescription>
            Update the details for {entry.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <div className="relative"> <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="John Doe" {...field} className="pl-10" /> </div> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="mobile" render={({ field }) => ( <FormItem> <FormLabel>Mobile</FormLabel> <FormControl> <div className="relative"> <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="9876543210" {...field} className="pl-10"/> </div> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email (Optional)</FormLabel> <FormControl> <div className="relative"> <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="john.doe@example.com" {...field} className="pl-10" /> </div> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField
                    control={form.control}
                    name="govtIdType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Verified Govt. ID</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select ID Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                                    <SelectItem value="Driving Licence">Driving Licence</SelectItem>
                                    <SelectItem value="Voter ID">Voter ID</SelectItem>
                                    <SelectItem value="Passport">Passport</SelectItem>
                                    <SelectItem value="PAN Card">PAN Card</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="hostName" render={({ field }) => ( <FormItem> <FormLabel>Person To Meet</FormLabel> <FormControl> <div className="relative"> <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="e.g. Jane Smith" {...field} className="pl-10"/> </div> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField
                  control={form.control}
                  name="hostDepartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a department" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {departments.map((dep) => (
                                <SelectItem key={dep} value={dep}>
                                {dep}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="reasonForVisit" render={({ field }) => ( <FormItem> <FormLabel>Reason for Visit</FormLabel> <FormControl> <Textarea placeholder="e.g. Scheduled meeting" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function EditEmployeeForm({ entry, open, onOpenChange, onEntryUpdated }: { entry: Employee, open: boolean, onOpenChange: (open: boolean) => void, onEntryUpdated: (entry: Entry) => void }){
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editEmployeeSchema>>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
        name: entry.name,
        hostName: entry.hostName,
        hostDepartment: entry.hostDepartment,
        reasonForVisit: entry.reasonForVisit,
    },
  });
  
  useEffect(() => {
    form.reset({
        name: entry.name,
        hostName: entry.hostName,
        hostDepartment: entry.hostDepartment,
        reasonForVisit: entry.reasonForVisit,
    })
  }, [entry, form])

  const onSubmit: SubmitHandler<z.infer<typeof editEmployeeSchema>> = (data) => {
     const updatedEntry = {
         ...entry,
         ...data,
         checkInTime: new Date(entry.checkInTime),
         checkOutTime: entry.checkOutTime ? new Date(entry.checkOutTime) : undefined,
     };

     onEntryUpdated(updatedEntry);

     toast({
         title: "Entry Updated",
         description: `${data.name}'s details have been updated.`
     });
     onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the details for {entry.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input {...field} readOnly className="bg-muted/50" /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="hostName" render={({ field }) => ( <FormItem> <FormLabel>Person To Meet</FormLabel> <FormControl> <div className="relative"> <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> <Input placeholder="e.g. Jane Smith" {...field} className="pl-10"/> </div> </FormControl> <FormMessage /> </FormItem> )}/>
                 <FormField
                  control={form.control}
                  name="hostDepartment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dep) => (
                            <SelectItem key={dep} value={dep}>
                              {dep}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="reasonForVisit" render={({ field }) => ( <FormItem> <FormLabel>Reason for Visit</FormLabel> <FormControl> <Textarea placeholder="e.g. Project meeting" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

    