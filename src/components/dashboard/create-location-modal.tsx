
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { MainLocation } from "@/lib/types";

const locationSchema = z.object({
  id: z
    .string()
    .min(3, "Location ID must be at least 3 characters")
    .regex(
      /^[A-Z0-9-]+$/,
      "Location ID can only contain uppercase letters, numbers, and hyphens."
    ),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface CreateLocationModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationCreated: (newLocation: MainLocation) => void;
}

export function CreateLocationModal({
  children,
  open,
  onOpenChange,
  onLocationCreated,
}: CreateLocationModalProps) {
  const { toast } = useToast();
  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      id: "",
    },
  });

  const onSubmit = (data: LocationFormData) => {
    const newLocation: MainLocation = {
      id: data.id,
      name: "", // Not configured yet
      descriptiveName: "", // Not configured yet
      subLocations: [],
    };
    onLocationCreated(newLocation);
    toast({
      title: "Location Created",
      description: `Master location ${data.id} has been successfully created.`,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Master Location</DialogTitle>
          <DialogDescription>
            Create a new unique identifier for a location. This ID cannot be
            changed later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. HYD-CO-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Location
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
