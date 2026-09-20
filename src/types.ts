export interface District {
  id: string;
  name: string;
  code: string;
}

export interface Mandal {
  id: string;
  districtId: string;
  name: string;
}

export interface Village {
  id: string;
  mandalId: string;
  name: string;
}

export interface School {
  id: string;
  villageId: string;
  name: string;
  type?: 'Government' | 'Aided' | 'Private' | 'Zilla Parishad' | 'Mandal Parishad';
}

export interface Student {
  id: string; // e.g. BBT000001
  firstName: string;
  lastName: string;
  className: string; // e.g. "Class 0" .. "Class 10"
  schoolId: string;
  schoolName: string;
  fatherName: string;
  motherName: string;
  mobileNumber: string; // 10 digits
  colonyStreet: string;
  districtId: string;
  districtName: string;
  mandalId: string;
  mandalName: string;
  villageId: string;
  villageName: string;
  registeredAt: string;
  updatedAt?: string;
}

export interface SupabaseStatus {
  connected: boolean;
  projectId: string;
  url: string;
  tableExists: boolean;
  recordCount: number;
  message: string;
  setupSql: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  className: string;
  schoolId: string;
  schoolName: string;
  fatherName: string;
  motherName: string;
  mobileNumber: string;
  colonyStreet: string;
  districtId: string;
  mandalId: string;
  villageId: string;
}

export interface FormErrors {
  id?: string;
  studentId?: string;
  firstName?: string;
  lastName?: string;
  className?: string;
  schoolId?: string;
  fatherName?: string;
  motherName?: string;
  mobileNumber?: string;
  colonyStreet?: string;
  districtId?: string;
  mandalId?: string;
  villageId?: string;
  general?: string;
}

export const ALL_CLASSES = Array.from({ length: 11 }, (_, i) => `Class ${i}`);

export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface AttendanceRecord {
  id: string; // e.g. att-2026-09-05-BBT000001
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  className: string; // "Class 0" .. "Class 10"
  schoolId: string;
  schoolName: string;
  status: AttendanceStatus;
  markedAt: string;
  remarks?: string;
}

export interface AttendanceSummary {
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  unmarkedCount: number;
  percentage: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  picture?: string;
  createdAt?: string;
  provider?: 'google' | 'password';
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

