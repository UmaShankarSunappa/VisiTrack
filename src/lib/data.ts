import type { MainLocation, Visitor, Department } from './types';

export const locations: MainLocation[] = [
  {
    id: 'corporate-office',
    name: 'Corporate Office',
    subLocations: [
      { id: '1st-floor', name: '1st Floor' },
      { id: '2nd-floor', name: '2nd Floor' },
      { id: '3rd-floor', name: '3rd Floor' },
    ],
  },
  {
    id: 'software-office',
    name: 'Software Office',
    subLocations: [],
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    subLocations: [{ id: '1st-floor', name: '1st Floor' }],
  },
  {
    id: 'hostel',
    name: 'Hostel',
    subLocations: [
      { id: '1st-floor', name: '1st Floor' },
      { id: '2nd-floor', name: '2nd Floor' },
      { id: '3rd-floor', name: '3rd Floor' },
    ],
  },
];

export const departments: Department[] = ['Supply Chain', 'Accounts', 'HR', 'Operations'];

export const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    mobile: '123-456-7890',
    email: 'alice@example.com',
    hostName: 'Bob Williams',
    hostDepartment: 'HR',
    reasonForVisit: 'Interview for a new role',
    selfieUrl: 'https://picsum.photos/seed/v1/100/100',
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'Checked-in',
    location: { main: 'Corporate Office', sub: '2nd Floor' },
  },
  {
    id: '2',
    name: 'Charlie Brown',
    mobile: '234-567-8901',
    hostName: 'David Clark',
    hostDepartment: 'Operations',
    reasonForVisit: 'Scheduled Maintenance',
    selfieUrl: 'https://picsum.photos/seed/v2/100/100',
    checkInTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    status: 'Checked-in',
    location: { main: 'Warehouse', sub: '1st Floor' },
  },
  {
    id: '3',
    name: 'Diana Miller',
    mobile: '345-678-9012',
    email: 'diana@example.com',
    hostName: 'Eve Davis',
    hostDepartment: 'Supply Chain',
    reasonForVisit: 'Vendor Meeting',
    selfieUrl: 'https://picsum.photos/seed/v3/100/100',
    checkInTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: 'Checked-in',
    location: { main: 'Corporate Office', sub: '1st Floor' },
  },
    {
    id: '4',
    name: 'Frank White',
    mobile: '456-789-0123',
    hostName: 'Grace Lee',
    hostDepartment: 'Accounts',
    reasonForVisit: 'Invoice clarification',
    selfieUrl: 'https://picsum.photos/seed/v4/100/100',
    checkInTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    checkOutTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'Checked-out',
    location: { main: 'Corporate Office', sub: '3rd Floor' },
  },
];
