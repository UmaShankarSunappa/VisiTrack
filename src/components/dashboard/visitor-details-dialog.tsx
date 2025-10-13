
"use client"

import Image from "next/image"
import { format } from "date-fns"
import type { Visitor } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface VisitorDetailsDialogProps {
  visitor: Visitor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitorDetailsDialog({ visitor, open, onOpenChange }: VisitorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Visitor Details</DialogTitle>
          <DialogDescription>
            Full details for {visitor.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <Image
              src={visitor.selfieUrl}
              alt={`Selfie of ${visitor.name}`}
              width={128}
              height={128}
              className="rounded-full border-4 border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <strong className="text-muted-foreground">Name:</strong>
            <span>{visitor.name}</span>

            <strong className="text-muted-foreground">Mobile:</strong>
            <span>{visitor.mobile}</span>

            {visitor.email && (
              <>
                <strong className="text-muted-foreground">Email:</strong>
                <span>{visitor.email}</span>
              </>
            )}

            <strong className="text-muted-foreground">Person to Meet:</strong>
            <span>{visitor.hostName}</span>

            <strong className="text-muted-foreground">Department:</strong>
            <span>{visitor.hostDepartment}</span>
            
            <strong className="text-muted-foreground">Location:</strong>
            <span>{visitor.location.main}{visitor.location.sub ? `, ${visitor.location.sub}`: ''}</span>

            <strong className="text-muted-foreground">Reason for Visit:</strong>
            <span className="col-start-2">{visitor.reasonForVisit}</span>

            <strong className="text-muted-foreground">Status:</strong>
            <Badge variant={visitor.status === 'Checked-in' ? 'default' : 'outline'}>
              {visitor.status}
            </Badge>

            <strong className="text-muted-foreground">Check-in:</strong>
            <span>{format(visitor.checkInTime, "PPpp")}</span>

            {visitor.checkOutTime && (
              <>
                <strong className="text-muted-foreground">Check-out:</strong>
                <span>{format(visitor.checkOutTime, "PPpp")}</span>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

    