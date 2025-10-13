export type SubLocation = {
  id: string;
  name: string;
};

export type MainLocation = {
  id: string;
  name: string;
  subLocations: SubLocation[];
};

export type Department = 'Supply Chain' | 'Accounts' | 'HR' | 'Operations';

export type Visitor = {
  id: string;
  name: string;
  mobile: string;
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
};

    