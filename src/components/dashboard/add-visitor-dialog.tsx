
"use client"

import { useState, useTransition, useRef, useEffect } from "react";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, User, Phone, Mail, Building, UserCheck, ShieldCheck, Camera, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});

const step2Schema = z.object({
  hostName: z.string().min(2, "Host name is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
});

type Step1Data = z.infer<typeof step1Schema>;
type OtpData = z.infer<typeof otpSchema>;
type Step2Data = z.infer<typeof step2Schema>;
type FormData = Step1Data & Step2Data & { selfie: string };


export function AddVisitorDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;
  
  const handleNextStep = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const resetFlow = () => {
    setFormData({});
    setStep(1);
    setOpen(false);
  }

  const handleFinalSubmit = (data: Partial<FormData>) => {
     const finalData = { ...formData, ...data } as FormData;
     console.log("Final visitor data:", finalData);
     toast({
         title: "Visitor Added",
         description: `${finalData.name} has been checked in.`
     });
     // Here you would typically call an API to add the visitor
     // and then maybe close the dialog and refresh the table
     resetFlow();
  }
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 onNext={handleNextStep} defaultValues={formData} />;
      case 2:
        return <Step2 onNext={handleNextStep} onBack={handlePrevStep} defaultValues={formData} />;
      case 3:
        return <Step3 onNext={handleFinalSubmit} onBack={handlePrevStep} />;
      default:
        return null;
    }
  };

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
            Add Visitor
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Visitor</DialogTitle>
          <DialogDescription>
            Manually enter the details for a new visitor.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <Progress value={progress} className="w-full" />
            <CardTitle className="text-center pt-2 text-lg">Step {step} of {totalSteps}</CardTitle>
            {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}


function Step1({ onNext, defaultValues }: { onNext: (data: Step1Data) => void; defaultValues: Partial<Step1Data> }) {
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
  });

  const { toast } = useToast();

  const handleSendOtp = async () => {
    const mobileValid = await form.trigger("mobile");
    if (!mobileValid) return;
    setIsSendingOtp(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsSendingOtp(false);
      toast({ title: "OTP Sent", description: "An OTP has been sent to the mobile. (It's 123456)" });
    }, 1000);
  };

  const handleVerifyOtp = (data: OtpData) => {
    setIsVerifyingOtp(true);
    setTimeout(() => {
      if (data.otp === "123456") {
        setIsOtpVerified(true);
        toast({ title: "OTP Verified", description: "Mobile number is verified.", variant: "default" });
      } else {
        toast({ title: "Invalid OTP", description: "Please enter the correct OTP.", variant: "destructive" });
        otpForm.setError("otp", { message: "Incorrect OTP" });
      }
      setIsVerifyingOtp(false);
    }, 1000);
  };

  const onSubmit: SubmitHandler<Step1Data> = (data) => {
    if (isOtpVerified) {
      onNext(data);
    } else {
       form.trigger();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="space-y-2">
            <FormLabel>Mobile Number</FormLabel>
            <div className="flex items-start gap-2">
            <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                    <FormItem className="flex-grow">
                        <FormControl>
                            <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="9876543210" {...field} className="pl-10" disabled={otpSent} />
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
            <div className="flex items-end gap-2 p-3 border rounded-lg bg-muted/30">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="123456" {...field} className="pl-10" />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={otpForm.handleSubmit(handleVerifyOtp)} disabled={isVerifyingOtp}>
                {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
          </Form>
        )}

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


function Step2({ onNext, onBack, defaultValues }: { onNext: (data: Step2Data) => void; onBack: () => void; defaultValues: Partial<Step2Data> }) {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<Step2Data> = (data) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <DialogFooter className="flex-row gap-4 justify-end">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Back
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Next
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function Step3({ onNext, onBack }: { onNext: (data: { selfie: string }) => void; onBack: () => void; }) {
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
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setSelfie(canvas.toDataURL("image/jpeg"));
      stopCamera();
    }
  };

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
        {selfie && <Image src={selfie} alt="Visitor's selfie" layout="fill" objectFit="cover" />}
        {!stream && !selfie && placeholder && <Image src={placeholder.imageUrl} alt="selfie placeholder" layout="fill" objectFit="cover" data-ai-hint={placeholder.imageHint} />}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      
      {!selfie ? (
        <Button onClick={takePhoto} disabled={!stream} className="w-full">
          <Camera className="mr-2 h-4 w-4" />
          Capture Selfie
        </Button>
      ) : (
        <div className="flex gap-4">
            <Button variant="outline" onClick={handleRetake} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake
            </Button>
        </div>
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


    