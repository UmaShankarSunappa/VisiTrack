
export type SubLocation = {
  id: string;
  name: string;
};

export type MainLocation = {
  id: string;
  name: string;
  descriptiveName?: string;
  subLocations: SubLocation[];
};

export type Department = 'Supply Chain' | 'Accounts' | 'HR' | 'Operations';

export type GovtIdType = "Aadhaar Card" | "Driving Licence" | "Voter ID" | "Passport" | "PAN Card" | "Other";

export type EntryType = 'Visitor' | 'Employee';

export interface BaseEntry {
  id: string;
  type: EntryType;
  name: string;
  email?: string;
  hostName: string;
  hostDepartment: Department;
  reasonForVisit: string;
  selfieUrl: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'Checked-in' | 'Checked-out';
  location: {
    main: string;
    sub?: string;
  }
}

export interface Visitor extends BaseEntry {
  type: 'Visitor';
  mobile: string;
  govtIdType: GovtIdType;
  govtIdOther?: string;
  visitorCardNumber: string;
  visitorCardReturned: boolean;
}

export interface Employee extends BaseEntry {
  type: 'Employee';
  employeeId: string;
  department: string;
}

export type Entry = Visitor | Employee;
