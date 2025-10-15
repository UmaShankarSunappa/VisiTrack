
"use client"

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { departments } from "@/lib/data";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, User, Phone, Mail, Building, UserCheck, ShieldCheck, Camera, RefreshCw, Briefcase, Fingerprint, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Visitor, Employee, Entry, EntryType, GovtIdType, Department } from "@/lib/types";

// Schemas
const visitorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().transform((val) => val.replace(/\D/g, '')).pipe(z.string().length(10, "Please enter a valid 10-digit mobile number.")),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  govtIdType: z.enum(["Aadhaar Card", "Driving Licence", "Voter ID", "Passport", "PAN Card", "Other"]),
  govtIdOther: z.string().optional(),
  hostName: z.string().min(2, "Person to meet is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
  visitorCardNumber: z.string().min(1, "Visitor card number is required."),
}).refine(data => !(data.govtIdType === 'Other' && !data.govtIdOther), {
  message: "Please specify the ID type",
  path: ["govtIdOther"],
});

const employeeSchema = z.object({
  employeeId: z.string().min(4, "Employee ID is required"),
  name: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  hostName: z.string().min(2, "Person to meet is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
});


const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});

type VisitorFormData = z.infer<typeof visitorSchema>;
type EmployeeFormData = z.infer<typeof employeeSchema>;
type SelfieData = { selfie: string };

type AddVisitorDialogProps = {
    onEntryAdded: (entry: Entry) => void;
};

// Mock HRMS Data
const hrmsData: { [key: string]: { name: string; department: Department; email: string } } = {
  'EMP1001': { name: 'Ravi Kumar', department: 'Operations', email: 'ravi.k@example.com' },
  'EMP1002': { name: 'Sonia Patel', department: 'HR', email: 'sonia.p@example.com' },
};


export function AddVisitorDialog({ onEntryAdded }: AddVisitorDialogProps) {
  const [open, setOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType | null>(null);

  const handleSelectEntryType = (type: EntryType) => {
    setEntryType(type);
  };

  const resetFlow = useCallback(() => {
    setEntryType(null);
    setOpen(false);
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetFlow();
        }
        setOpen(isOpen)
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Entry
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!entryType ? (
          <TypeSelectionStep onSelect={handleSelectEntryType} />
        ) : (
          <AddEntryFlow entryType={entryType} onEntryAdded={onEntryAdded} resetFlow={resetFlow} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TypeSelectionStep({ onSelect }: { onSelect: (type: EntryType) => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Select Entry Type</DialogTitle>
        <DialogDescription>
          Are you adding a visitor or an employee?
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-8">
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onSelect('Visitor')}>
          <User className="h-8 w-8"/>
          <span>Visitor</span>
        </Button>
        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => onSelect('Employee')}>
          <Briefcase className="h-8 w-8"/>
          <span>Employee</span>
        </Button>
      </div>
    </>
  )
}


function AddEntryFlow({ entryType, onEntryAdded, resetFlow }: { entryType: EntryType, onEntryAdded: (entry: Entry) => void, resetFlow: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<VisitorFormData & EmployeeFormData>>({});
  const { toast } = useToast();
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLocation = localStorage.getItem('receptionistLocation');
      setLocationName(storedLocation);
    }
  }, []);

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;
  
  const handleNextStep = (data: Partial<VisitorFormData | EmployeeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinalSubmit = (selfieData: SelfieData) => {
     const finalData = { ...formData, ...selfieData };
     
     if (!locationName) {
        toast({ title: "Error", description: "Could not determine receptionist location.", variant: "destructive" });
        return;
     }

     const [main, sub] = locationName.split(' - ');
     
     let newEntry: Entry;

     if (entryType === 'Visitor') {
        const visitorData = finalData as VisitorFormData & SelfieData;
        newEntry = {
            id: new Date().toISOString(),
            type: 'Visitor',
            name: visitorData.name,
            mobile: visitorData.mobile,
            email: visitorData.email,
            hostName: visitorData.hostName,
            hostDepartment: visitorData.hostDepartment,
            reasonForVisit: visitorData.reasonForVisit,
            selfieUrl: visitorData.selfie,
            checkInTime: new Date(),
            status: 'Checked-in',
            location: { main, sub },
            govtIdType: visitorData.govtIdType as GovtIdType,
            govtIdOther: visitorData.govtIdOther,
            visitorCardNumber: visitorData.visitorCardNumber,
            visitorCardReturned: false,
        };
     } else { // Employee
        const employeeData = finalData as EmployeeFormData & SelfieData;
        newEntry = {
            id: new Date().toISOString(),
            type: 'Employee',
            name: employeeData.name!,
            employeeId: employeeData.employeeId,
            department: employeeData.department!,
            email: employeeData.email,
            hostName: employeeData.hostName,
            hostDepartment: employeeData.hostDepartment,
            reasonForVisit: employeeData.reasonForVisit,
            selfieUrl: employeeData.selfie,
            checkInTime: new Date(),
            status: 'Checked-in',
            location: { main, sub },
        };
     }

     onEntryAdded(newEntry);

    const storedEntries = localStorage.getItem('entries') || '[]';
    let allEntries: Entry[] = [];
    try {
        allEntries = JSON.parse(storedEntries);
    } catch (e) {
        // ignore
    }
    
    allEntries.push(newEntry);
    localStorage.setItem('entries', JSON.stringify(allEntries));

     toast({
         title: "Entry Added",
         description: `${newEntry.name} has been checked in.`
     });

     resetFlow();
  }
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return entryType === 'Visitor' 
            ? <VisitorDetailsStep onNext={handleNextStep} defaultValues={formData as Partial<VisitorFormData>} />
            : <EmployeeDetailsStep onNext={handleNextStep} defaultValues={formData as Partial<EmployeeFormData>} />;
      case 2:
        return <SelfieStep onNext={handleFinalSubmit} onBack={handlePrevStep} />;
      default:
        return null;
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New {entryType}</DialogTitle>
        <DialogDescription>
          Manually enter the details for a new {entryType.toLowerCase()}.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
          <Progress value={progress} className="w-full" />
          <CardTitle className="text-center pt-2 text-lg">Step {step} of {totalSteps}</CardTitle>
          {renderStep()}
      </div>
    </>
  )
}

function VisitorDetailsStep({ onNext, defaultValues }: { onNext: (data: VisitorFormData) => void; defaultValues: Partial<VisitorFormData> }) {
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
    defaultValues,
  });

  const govtIdType = form.watch("govtIdType");

  const onSubmit: SubmitHandler<VisitorFormData> = (data) => {
      onNext(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
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
        {/* Mobile + OTP can be added here as in the original component if needed */}
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
              <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                      <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="9876543210" {...field} className="pl-10" />
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
            name="govtIdType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Govt. ID</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select ID Type" /></SelectTrigger>
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
        {govtIdType === 'Other' && (
            <FormField
                control={form.control}
                name="govtIdOther"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Please Specify ID Type</FormLabel>
                    <FormControl><Input placeholder="e.g. Student ID" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        )}

        <FormField
          control={form.control}
          name="hostName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Person To Meet</FormLabel>
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
                        {departments.map((dep) => (<SelectItem key={dep} value={dep}>{dep}</SelectItem>))}
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
              <FormControl><Textarea placeholder="e.g. Scheduled meeting" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visitorCardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visitor Card Number</FormLabel>
              <FormControl>
                 <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="e.g. 123" {...field} className="pl-10" type="number" />
                 </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function EmployeeDetailsStep({ onNext, defaultValues }: { onNext: (data: EmployeeFormData) => void; defaultValues: Partial<EmployeeFormData> }) {
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
  });

  const employeeId = form.watch("employeeId");

  const handleSendOtp = async () => {
    const idValid = await form.trigger("employeeId");
    if (!idValid || !hrmsData[employeeId]) {
      form.setError("employeeId", { message: "Invalid Employee ID" });
      return;
    }
    setIsSendingOtp(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsSendingOtp(false);
      toast({ title: "OTP Sent", description: "An OTP has been sent. (It's 123456)" });
    }, 1000);
  };

  const handleVerifyOtp = (data: { otp: string }) => {
    setIsVerifyingOtp(true);
    setTimeout(() => {
      if (data.otp === "123456") {
        setIsOtpVerified(true);
        const employeeData = hrmsData[employeeId];
        form.setValue("name", employeeData.name);
        form.setValue("department", employeeData.department);
        form.setValue("email", employeeData.email);
        form.setValue("hostDepartment", employeeData.department);
        toast({ title: "OTP Verified", description: "Employee details auto-filled." });
      } else {
        toast({ title: "Invalid OTP", variant: "destructive" });
        otpForm.setError("otp", { message: "Incorrect OTP" });
      }
      setIsVerifyingOtp(false);
    }, 1000);
  };

  const onSubmit: SubmitHandler<EmployeeFormData> = (data) => {
     if (isOtpVerified) {
      onNext(data);
    } else {
       toast({ title: "Verification Required", description: "Please verify with OTP.", variant: "destructive" });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
        <div className="space-y-2">
            <FormLabel>Employee ID</FormLabel>
            <div className="flex items-start gap-2">
                <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormControl>
                                <div className="relative">
                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="e.g. EMP1001" {...field} className="pl-10" disabled={otpSent} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!otpSent && <Button type="button" onClick={handleSendOtp} disabled={isSendingOtp}>
                    {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send OTP
                </Button>}
            </div>
        </div>

        {otpSent && !isOtpVerified && (
          <Form {...otpForm}>
            <div className="flex items-end gap-2 p-4 border rounded-lg bg-muted/30">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                        <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={otpForm.handleSubmit(handleVerifyOtp)} disabled={isVerifyingOtp}>
                {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
              </Button>
            </div>
          </Form>
        )}
        
        {isOtpVerified && (
          <>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="hostName" render={({ field }) => (<FormItem><FormLabel>Person To Meet</FormLabel><FormControl><Input placeholder="e.g. Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="hostDepartment" render={({ field }) => (<FormItem><FormLabel>Host Department</FormLabel><FormControl><Input {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="reasonForVisit" render={({ field }) => (<FormItem><FormLabel>Reason for Visit</FormLabel><FormControl><Textarea placeholder="e.g. Project meeting" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </>
        )}

        <DialogFooter>
            <Button type="submit" disabled={!isOtpVerified || form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function SelfieStep({ onNext, onBack }: { onNext: (data: SelfieData) => void; onBack: () => void; }) {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const placeholder = PlaceHolderImages.find(p => p.id === 'visitor-selfie');
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({ title: "Camera Error", description: "Could not access camera.", variant: "destructive" });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setSelfie(canvas.toDataURL("image/jpeg"));
      stopCamera();
    }
  };
  
  const skipPhoto = () => {
      if(placeholder) {
        setSelfie(placeholder.imageUrl);
        stopCamera();
      }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetake = () => {
    setSelfie(null);
    startCamera();
  };

  const handleContinue = () => {
    if(selfie) {
        onNext({ selfie });
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center relative">
        {!selfie && stream && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
        {!selfie && !stream && <Camera className="w-16 h-16 text-muted-foreground" />}
        {selfie && <Image src={selfie} alt="Entry selfie" layout="fill" objectFit="cover" />}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      
      {!selfie ? (
        <div className="flex gap-4">
            <Button onClick={takePhoto} disabled={!stream} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Capture Selfie
            </Button>
            <Button onClick={skipPhoto} variant="secondary" className="w-full">
                Skip
            </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={handleRetake} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retake
        </Button>
      )}

      <DialogFooter className="flex-row gap-4 justify-end">
        <Button variant="outline" onClick={() => {stopCamera(); onBack()}} className="w-full sm:w-auto">
          Back
        </Button>
         <Button onClick={handleContinue} disabled={!selfie} className="w-full sm:w-auto">
              Add and Check-in
        </Button>
      </DialogFooter>
    </div>
  );
}

