
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { departments, mockVisitors } from "@/lib/data";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Phone, Mail, Building, UserCheck, ShieldCheck, Camera, RefreshCw, LogOut } from "lucide-react";
import type { Visitor } from "@/lib/types";
import { useRouter } from "next/navigation";


const combinedSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  mobile: z.string().transform((val) => val.replace(/\D/g, '')).pipe(z.string().length(10, "Please enter a valid 10-digit mobile number.")),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  hostName: z.string().min(2, "Host name is required."),
  hostDepartment: z.enum(departments),
  reasonForVisit: z.string().min(5, "Please provide a reason for your visit."),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits."),
});

type CombinedData = z.infer<typeof combinedSchema>;
type OtpData = z.infer<typeof otpSchema>;
type FormData = CombinedData & { selfie: string };

function AnimatedCheckmark() {
    return (
        <svg
            className="h-16 w-16 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
        >
            <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
            />
            <path
                className="checkmark-check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
        </svg>
    );
}

export function CheckInFlow({ locationName }: { locationName: string }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNextStep = (data: Partial<FormData>) => {
    startTransition(() => {
      setFormData((prev) => ({ ...prev, ...data }));
      setStep((prev) => prev + 1);
    });
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };
  
  const handleFinalSubmit = (data: Partial<FormData>) => {
    const finalData = { ...formData, ...data } as FormData;
    const [main, sub] = locationName.split(' - ');
    const newVisitor: Visitor = {
      id: new Date().toISOString(), // Simple unique ID
      ...finalData,
      selfieUrl: finalData.selfie,
      checkInTime: new Date(),
      status: 'Checked-in',
      location: { main, sub },
    };

    let allVisitors: Visitor[] = [];
    const storedVisitors = localStorage.getItem('visitors');
    const baseVisitors = mockVisitors.map(v => ({
        ...v,
        checkInTime: new Date(v.checkInTime),
        checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
    }));

    if (storedVisitors) {
        try {
            const parsedStoredVisitors = JSON.parse(storedVisitors).map((v: any) => ({
                ...v,
                checkInTime: new Date(v.checkInTime),
                checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
            }));
            const visitorMap = new Map();
            [...baseVisitors, ...parsedStoredVisitors].forEach(v => visitorMap.set(v.id, v));
            allVisitors = Array.from(visitorMap.values());
        } catch(e) {
            console.error("Failed to parse visitors from localStorage on check-in", e);
            allVisitors = baseVisitors;
        }
    } else {
       allVisitors = baseVisitors;
    }

    const updatedVisitors = [...allVisitors, newVisitor];
    localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
    setFormData(newVisitor);

    toast({
        title: "Check-in Successful!",
        description: `Your host, ${finalData.hostName}, has been notified.`,
    });
    
    setStep(3);
  }
  
  const handleSelfCheckout = () => {
      const visitorId = (formData as Visitor).id;
      const storedVisitors = localStorage.getItem('visitors');
      if (storedVisitors) {
          try {
              let visitors: Visitor[] = JSON.parse(storedVisitors).map((v: any) => ({
                  ...v,
                  checkInTime: new Date(v.checkInTime),
                  checkOutTime: v.checkOutTime ? new Date(v.checkOutTime) : undefined,
              }));
              const updatedVisitors = visitors.map(v => 
                  v.id === visitorId ? { ...v, status: 'Checked-out', checkOutTime: new Date() } : v
              );
              localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
              toast({
                  title: "Check-out Successful",
                  description: "You have been successfully checked out. Thank you for your visit!",
              });
              router.push('/');
          } catch (e) {
              console.error("Failed to process checkout", e);
          }
      }
  };


  const renderStep = () => {
    switch (step) {
      case 1:
        return <VisitorDetailsStep onNext={handleNextStep} defaultValues={formData} />;
      case 2:
        return <SelfieStep onNext={handleFinalSubmit} onBack={handlePrevStep} />;
      case 3:
        return <SuccessStep visitor={formData as Visitor} onSelfCheckout={handleSelfCheckout} />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full shadow-xl sm:rounded-xl rounded-none border-x-0 sm:border-x animate-fade-in-up">
      <CardHeader>
        <Progress value={progress} className="w-full" />
        <CardTitle className="text-center pt-4">{step === 3 ? "Complete" : `Step ${step} of ${totalSteps}`}</CardTitle>
      </CardHeader>
      <CardContent>{renderStep()}</CardContent>
    </Card>
  );
}

function VisitorDetailsStep({ onNext, defaultValues }: { onNext: (data: CombinedData) => void; defaultValues: Partial<CombinedData> }) {
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const form = useForm<CombinedData>({
    resolver: zodResolver(combinedSchema),
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
      toast({ title: "OTP Sent", description: "An OTP has been sent to your mobile. (It's 123456)" });
    }, 1000);
  };

  const handleVerifyOtp = (data: OtpData) => {
    setIsVerifyingOtp(true);
    setTimeout(() => {
      if (data.otp === "123456") {
        setIsOtpVerified(true);
        toast({ title: "OTP Verified", description: "Your mobile number is verified.", variant: "default" });
      } else {
        toast({ title: "Invalid OTP", description: "Please enter the correct OTP.", variant: "destructive" });
        otpForm.setError("otp", { message: "Incorrect OTP" });
      }
      setIsVerifyingOtp(false);
    }, 1000);
  };

  const onSubmit: SubmitHandler<CombinedData> = (data) => {
    if (isOtpVerified) {
      onNext(data);
    } else {
       toast({ title: "Verification Required", description: "Please verify your mobile number with OTP.", variant: "destructive" });
       form.trigger();
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="flex items-end gap-2 p-4 border rounded-lg bg-muted/30">
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
                Verify OTP
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

        <Button type="submit" disabled={!isOtpVerified || form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
        </Button>
      </form>
    </Form>
  );
}

function SelfieStep({ onNext, onBack }: { onNext: (data: { selfie: string }) => void; onBack: () => void; }) {
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
            <Button onClick={handleContinue} className="w-full">
              Finish Check-in
            </Button>
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => {stopCamera(); onBack()}} className="w-full">
          Back
        </Button>
      </div>
    </div>
  );
}

function SuccessStep({ visitor, onSelfCheckout }: { visitor: Visitor, onSelfCheckout: () => void }) {
    const router = useRouter();

    if (!visitor) {
        return (
            <div className="text-center space-y-4">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="text-center space-y-4 flex flex-col items-center">
            <AnimatedCheckmark />
            <h2 className="text-2xl font-bold">Check-in Successful!</h2>
            <p className="text-muted-foreground">
                Welcome, <span className="font-semibold text-primary">{visitor.name}</span>. 
                Your host, <span className="font-semibold text-primary">{visitor.hostName}</span>, has been notified.
            </p>
            
            <div className="w-full space-y-2 pt-4">
                 <Button onClick={onSelfCheckout} className="w-full" variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Self Check-out
                </Button>
                <Button onClick={() => router.push('/')} className="w-full" variant="outline">
                    Done
                </Button>
            </div>
        </div>
    )
}
