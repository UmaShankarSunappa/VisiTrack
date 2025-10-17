
"use client"

import Image from "next/image"
import { format } from "date-fns"
import type { Entry } from "@/lib/types"

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
import { cn } from "@/lib/utils"

interface VisitorDetailsDialogProps {
  entry: Entry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitorDetailsDialog({ entry, open, onOpenChange }: VisitorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry.type} Details</DialogTitle>
          <DialogDescription>
            Full details for {entry.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <Image
              src={entry.selfieUrl}
              alt={`Selfie of ${entry.name}`}
              width={128}
              height={128}
              className="rounded-full border-4 border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <strong className="text-muted-foreground">Type:</strong>
            <Badge variant={entry.type === 'Visitor' ? 'default' : 'secondary'} className={cn(entry.type === 'Employee' && 'bg-green-100 text-green-800')}>{entry.type}</Badge>

            <strong className="text-muted-foreground">Name:</strong>
            <span>{entry.name}</span>

            {entry.type === 'Visitor' ? (
                <>
                    <strong className="text-muted-foreground">Mobile:</strong>
                    <span>{entry.mobile}</span>
                </>
            ) : (
                <>
                    <strong className="text-muted-foreground">Employee ID:</strong>
                    <span>{entry.employeeId}</span>
                    <strong className="text-muted-foreground">Department:</strong>
                    <span>{entry.department}</span>
                </>
            )}

            {entry.email && (
              <>
                <strong className="text-muted-foreground">Email:</strong>
                <span className="truncate">{entry.email}</span>
              </>
            )}

            {entry.type === 'Visitor' && (
                <>
                    <strong className="text-muted-foreground">Govt ID:</strong>
                    <span>{entry.govtIdType === 'Other' ? entry.govtIdOther : entry.govtIdType}</span>
                    <strong className="text-muted-foreground">Card No:</strong>
                    <span>{entry.visitorCardNumber}</span>
                </>
            )}

            <strong className="text-muted-foreground">Person to Meet:</strong>
            <span>{entry.hostName}</span>

            <strong className="text-muted-foreground">Host Department:</strong>
            <span>{entry.hostDepartment}</span>
            
            <strong className="text-muted-foreground">Location:</strong>
            <span>{entry.location.main}{entry.location.sub ? `, ${entry.location.sub}`: ''}</span>

            <strong className="text-muted-foreground">Reason for Visit:</strong>
            <span>{entry.reasonForVisit}</span>

            <strong className="text-muted-foreground">Status:</strong>
            <Badge variant={entry.status === 'Checked-in' ? 'default' : 'outline'}>
              {entry.status}
            </Badge>

            <strong className="text-muted-foreground">Check-in:</strong>
            <span>{format(entry.checkInTime, "PPpp")}</span>

            {entry.checkOutTime && (
              <>
                <strong className="text-muted-foreground">Check-out:</strong>
                <span>{format(entry.checkOutTime, "PPpp")}</span>
              </>
            )}
             {entry.type === 'Visitor' && entry.status === 'Checked-out' && (
              <>
                <strong className="text-muted-foreground">Card Returned:</strong>
                <Badge variant={entry.visitorCardReturned ? 'secondary' : 'destructive'}>
                  {entry.visitorCardReturned ? 'Yes' : 'No'}
                </Badge>
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
