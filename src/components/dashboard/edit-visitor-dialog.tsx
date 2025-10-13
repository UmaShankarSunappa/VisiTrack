
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
import type { Visitor } from "@/lib/types";

const editVisitorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().transform((val) => val.replace(/\D/g, '')).pipe(z.string().length(10, "Please enter a valid 10-digit mobile number.")),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  hostName: z.string().min(2, "Host name is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
});

type EditVisitorFormData = z.infer<typeof editVisitorSchema>;

interface EditVisitorDialogProps {
  visitor: Visitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitorUpdated: (visitor: Visitor) => void;
}

export function EditVisitorDialog({ visitor, open, onOpenChange, onVisitorUpdated }: EditVisitorDialogProps) {
  const { toast } = useToast();

  const form = useForm<EditVisitorFormData>({
    resolver: zodResolver(editVisitorSchema),
    defaultValues: {
        name: visitor.name,
        mobile: visitor.mobile,
        email: visitor.email,
        hostName: visitor.hostName,
        hostDepartment: visitor.hostDepartment,
        reasonForVisit: visitor.reasonForVisit,
    },
  });
  
  useEffect(() => {
    form.reset({
        name: visitor.name,
        mobile: visitor.mobile,
        email: visitor.email,
        hostName: visitor.hostName,
        hostDepartment: visitor.hostDepartment,
        reasonForVisit: visitor.reasonForVisit,
    })
  }, [visitor, form])

  const onSubmit: SubmitHandler<EditVisitorFormData> = (data) => {
     const updatedVisitor = {
         ...visitor,
         ...data,
         checkInTime: new Date(visitor.checkInTime),
         checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : undefined,
     };

     onVisitorUpdated(updatedVisitor);

     toast({
         title: "Visitor Updated",
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
            Update the details for {visitor.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="John Doe" {...field} className="pl-10" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="9876543210" {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="john.doe@example.com" {...field} className="pl-10" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="hostName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Host Name</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. Jane Smith" {...field} className="pl-10"/>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="hostDepartment"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Host Department</FormLabel>
                    <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="pl-10">
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
                        </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="reasonForVisit"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Reason for Visit</FormLabel>
                    <FormControl>
                        <Textarea placeholder="e.g. Scheduled meeting about project X" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
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

    