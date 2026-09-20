import { District, Mandal, Village, School, Student, StudentFormData, SupabaseStatus, AttendanceRecord, AttendanceSummary, User, AuthResponse } from '../types';

const API_BASE = '/api';

export async function fetchDistricts(): Promise<District[]> {
  const res = await fetch(`${API_BASE}/districts`);
  if (!res.ok) throw new Error('Failed to load districts');
  return res.json();
}

export async function fetchMandals(districtId?: string): Promise<Mandal[]> {
  const url = districtId ? `${API_BASE}/mandals?districtId=${encodeURIComponent(districtId)}` : `${API_BASE}/mandals`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load mandals');
  return res.json();
}

export async function fetchVillages(mandalId?: string): Promise<Village[]> {
  const url = mandalId ? `${API_BASE}/villages?mandalId=${encodeURIComponent(mandalId)}` : `${API_BASE}/villages`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load villages');
  return res.json();
}

export async function fetchSchools(villageId?: string): Promise<School[]> {
  const url = villageId ? `${API_BASE}/schools?villageId=${encodeURIComponent(villageId)}` : `${API_BASE}/schools`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load schools');
  return res.json();
}

export async function createSchool(villageId: string, name: string, type?: School['type']): Promise<School> {
  const res = await fetch(`${API_BASE}/schools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ villageId, name, type })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to add school');
  }
  return res.json();
}

export async function deleteSchool(id: string): Promise<{ message: string; school?: School; enrolledStudents: number }> {
  const res = await fetch(`${API_BASE}/schools/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete school');
  }
  return res.json();
}

export async function restoreDefaultSchools(villageId?: string): Promise<{ message: string; schools: School[] }> {
  const res = await fetch(`${API_BASE}/schools/restore-defaults`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ villageId })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to restore default schools');
  }
  return res.json();
}

export async function fetchStudents(searchQuery?: string): Promise<Student[]> {
  const url = searchQuery ? `${API_BASE}/students?q=${encodeURIComponent(searchQuery)}` : `${API_BASE}/students`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchStudentById(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('Failed to fetch student details');
  return res.json();
}

export async function registerStudent(data: StudentFormData): Promise<{ message: string; student: Student }> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = body.errors
      ? Object.values(body.errors).join(', ')
      : body.message || body.error || 'Failed to register student';
    const error = new Error(errorMsg);
    (error as any).fieldErrors = body.errors;
    throw error;
  }
  return body;
}

export async function updateStudent(
  id: string,
  data: Partial<StudentFormData> & { id?: string }
): Promise<{ message: string; student: Student }> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = body.errors
      ? Object.values(body.errors).join(', ')
      : body.message || body.error || 'Failed to update student';
    const error = new Error(errorMsg);
    (error as any).fieldErrors = body.errors;
    throw error;
  }
  return body;
}

export async function deleteStudent(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete student');
  return true;
}

export async function fetchStats(): Promise<{
  totalStudents: number;
  totalDistricts: number;
  totalMandals: number;
  totalVillages: number;
  totalSchools: number;
}> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchSupabaseStatus(): Promise<SupabaseStatus> {
  const res = await fetch(`${API_BASE}/supabase/status`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to check Supabase status');
  }
  return res.json();
}

export async function syncSupabaseDatabase(): Promise<{
  success: boolean;
  syncedCount: number;
  totalCount: number;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/supabase/sync`, {
    method: 'POST'
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to sync with Supabase');
  }
  return res.json();
}

export async function fetchAttendance(date?: string, className?: string): Promise<{
  date: string;
  className: string;
  records: AttendanceRecord[];
  summary: AttendanceSummary;
  students: Student[];
}> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (className && className !== 'All Classes') params.append('className', className);
  const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load attendance');
  return res.json();
}

export async function saveAttendance(date: string, records: AttendanceRecord[]): Promise<{
  message: string;
  saved: number;
  summary: AttendanceSummary;
}> {
  const res = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, records })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save attendance');
  }
  return res.json();
}

export async function fetchStudentAttendance(studentId: string): Promise<{
  studentId: string;
  records: AttendanceRecord[];
}> {
  const res = await fetch(`${API_BASE}/attendance/student/${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new Error('Failed to fetch student attendance records');
  return res.json();
}

// --- User Authentication API Calls ---
export async function loginWithPassword(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Login failed. Please check your credentials.');
  }
  return res.json();
}

export async function registerNewUser(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to create user account.');
  }
  return res.json();
}

export async function loginWithGoogle(email: string, name?: string, picture?: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, picture })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Google login failed.');
  }
  return res.json();
}

export async function fetchAllUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/auth/users`);
  if (!res.ok) throw new Error('Failed to fetch users list');
  return res.json();
}


