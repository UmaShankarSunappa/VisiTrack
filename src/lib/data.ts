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

export const receptionists = [
  {
    locationId: 'corporate-office-1st-floor',
    locationName: 'Corporate Office - 1st Floor',
    email: 'reception.cop.1f@example.com',
    password: 'password123',
  },
  {
    locationId: 'corporate-office-2nd-floor',
    locationName: 'Corporate Office - 2nd Floor',
    email: 'reception.cop.2f@example.com',
    password: 'password123',
  },
  {
    locationId: 'corporate-office-3rd-floor',
    locationName: 'Corporate Office - 3rd Floor',
    email: 'reception.cop.3f@example.com',
    password: 'password123',
  },
];


export const mockVisitors: Visitor[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    mobile: '123-456-7890',
    email: 'priya@example.com',
    hostName: 'Bob Williams',
    hostDepartment: 'HR',
    reasonForVisit: 'Interview for a new role',
    selfieUrl: 'https://picsum.photos/seed/priya/100/100',
    checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'Checked-in',
    location: { main: 'Corporate Office', sub: '2nd Floor' },
  },
  {
    id: '2',
    name: 'Arjun Kumar',
    mobile: '234-567-8901',
    hostName: 'David Clark',
    hostDepartment: 'Operations',
    reasonForVisit: 'Scheduled Maintenance',
    selfieUrl: 'https://picsum.photos/seed/arjun/100/100',
    checkInTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    status: 'Checked-in',
    location: { main: 'Warehouse', sub: '1st Floor' },
  },
  {
    id: '3',
    name: 'Ananya Singh',
    mobile: '345-678-9012',
    email: 'ananya@example.com',
    hostName: 'Eve Davis',
    hostDepartment: 'Supply Chain',
    reasonForVisit: 'Vendor Meeting',
    selfieUrl: 'https://picsum.photos/seed/ananya/100/100',
    checkInTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    status: 'Checked-in',
    location: { main: 'Corporate Office', sub: '1st Floor' },
  },
    {
    id: '4',
    name: 'Vikram Patel',
    mobile: '456-789-0123',
    hostName: 'Grace Lee',
    hostDepartment: 'Accounts',
    reasonForVisit: 'Invoice clarification',
    selfieUrl: 'https://picsum.photos/seed/vikram/100/100',
    checkInTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    checkOutTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'Checked-out',
    location: { main: 'Corporate Office', sub: '3rd Floor' },
  },
];
