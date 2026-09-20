import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Student } from '../src/types';

// Supabase Configuration
// Using Project ID: oekqkfhnmvuanzppvmek & provided Publishable API Key
export const SUPABASE_PROJECT_ID = 'oekqkfhnmvuanzppvmek';

function normalizeSupabaseUrl(): string {
  const envUrl = process.env.SUPABASE_URL?.trim();
  if (envUrl) {
    const match = envUrl.match(/project\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://${match[1]}.supabase.co`;
    }
    if (envUrl.includes('.supabase.co')) {
      return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
    }
  }
  return `https://${SUPABASE_PROJECT_ID}.supabase.co`;
}

function resolveSupabaseKey(): string {
  const envKey = process.env.SUPABASE_ANON_KEY?.trim();
  if (envKey && (envKey.startsWith('sb_') || envKey.startsWith('eyJ'))) {
    return envKey;
  }
  return 'sb_publishable_0Ujq3CX7-CvyvKcsVWliHw_6AgtIFSY';
}

export const SUPABASE_URL = normalizeSupabaseUrl();
export const SUPABASE_ANON_KEY = resolveSupabaseKey();

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false
      }
    });
  }
  return supabaseClient;
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

export const SUPABASE_SETUP_SQL = `
-- ================================================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Project ID: oekqkfhnmvuanzppvmek
-- Project URL: https://oekqkfhnmvuanzppvmek.supabase.co
-- ================================================================

-- 1. Create the Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  school_id TEXT,
  school_name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  colony_street TEXT,
  district_id TEXT,
  district_name TEXT,
  mandal_id TEXT,
  mandal_name TEXT,
  village_id TEXT,
  village_name TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data JSONB
);

-- 2. Enable Row Level Security (RLS) on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3. Configure RLS Policies to allow app registration and reading
DROP POLICY IF EXISTS "Allow public select on students" ON public.students;
CREATE POLICY "Allow public select on students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on students" ON public.students;
CREATE POLICY "Allow public insert on students" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on students" ON public.students;
CREATE POLICY "Allow public update on students" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on students" ON public.students;
CREATE POLICY "Allow public delete on students" ON public.students FOR DELETE USING (true);

-- 4. Optional: Daily Attendance Register Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  school_id TEXT,
  school_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  remarks TEXT
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on attendance" ON public.attendance;
CREATE POLICY "Allow public select on attendance" ON public.attendance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on attendance" ON public.attendance;
CREATE POLICY "Allow public insert on attendance" ON public.attendance FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on attendance" ON public.attendance;
CREATE POLICY "Allow public update on attendance" ON public.attendance FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete on attendance" ON public.attendance;
CREATE POLICY "Allow public delete on attendance" ON public.attendance FOR DELETE USING (true);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students (class_name);
CREATE INDEX IF NOT EXISTS idx_students_mobile ON public.students (mobile_number);
CREATE INDEX IF NOT EXISTS idx_students_village ON public.students (village_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance (student_id);
`.trim();

/**
 * Check connection and table existence in Supabase
 */
export async function checkSupabaseStatus(): Promise<SupabaseStatus> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: false,
      recordCount: 0,
      message: 'Supabase client credentials missing',
      setupSql: SUPABASE_SETUP_SQL
    };
  }

  try {
    const { data, count, error } = await client
      .from('students')
      .select('id', { count: 'exact', head: false })
      .limit(1);

    if (error) {
      const isMissingTable =
        error.code === 'PGRST205' ||
        (error.message && (
          error.message.includes('Could not find the table') ||
          error.message.includes('relation "public.students" does not exist') ||
          error.message.includes('schema cache')
        ));

      if (isMissingTable) {
        return {
          connected: true,
          projectId: SUPABASE_PROJECT_ID,
          url: SUPABASE_URL,
          tableExists: false,
          recordCount: 0,
          message: "Connected to Supabase project, but 'students' table is not yet created. Run the SQL code below in your Supabase SQL Editor.",
          setupSql: SUPABASE_SETUP_SQL
        };
      }

      return {
        connected: true,
        projectId: SUPABASE_PROJECT_ID,
        url: SUPABASE_URL,
        tableExists: false,
        recordCount: 0,
        message: `Supabase responded: ${error.message}`,
        setupSql: SUPABASE_SETUP_SQL
      };
    }

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: true,
      recordCount: count ?? (data ? data.length : 0),
      message: 'Supabase database connected and ready for student registrations.',
      setupSql: SUPABASE_SETUP_SQL
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      tableExists: false,
      recordCount: 0,
      message: err.message || 'Error connecting to Supabase',
      setupSql: SUPABASE_SETUP_SQL
    };
  }
}

/**
 * Sync / insert a student into Supabase
 */
export async function syncStudentToSupabase(student: Student): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client not initialized' };
  }

  const payload = {
    id: student.id,
    first_name: student.firstName,
    last_name: student.lastName,
    class_name: student.className,
    school_id: student.schoolId,
    school_name: student.schoolName,
    father_name: student.fatherName,
    mother_name: student.motherName,
    mobile_number: student.mobileNumber,
    colony_street: student.colonyStreet,
    district_id: student.districtId,
    district_name: student.districtName,
    mandal_id: student.mandalId,
    mandal_name: student.mandalName,
    village_id: student.villageId,
    village_name: student.villageName,
    registered_at: student.registeredAt,
    raw_data: student
  };

  try {
    const { error } = await client
      .from('students')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase Sync Warning] Could not save student ${student.id} to Supabase:`, error.message);
      return { success: false, message: error.message };
    }

    console.log(`[Supabase Sync] Successfully saved student ${student.id} to Supabase`);
    return { success: true, message: 'Successfully synced to Supabase' };
  } catch (err: any) {
    console.warn(`[Supabase Sync Error] Exception saving student ${student.id} to Supabase:`, err.message);
    return { success: false, message: err.message };
  }
}

/**
 * Delete a student from Supabase
 */
export async function deleteStudentFromSupabase(studentId: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      console.warn(`[Supabase Delete Warning] Could not delete student ${studentId} from Supabase:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn(`[Supabase Delete Error] Exception deleting student ${studentId} from Supabase:`, err.message);
    return false;
  }
}

/**
 * Bulk sync students to Supabase
 */
export async function syncAllStudentsToSupabase(students: Student[]): Promise<{
  success: boolean;
  syncedCount: number;
  totalCount: number;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, syncedCount: 0, totalCount: students.length, message: 'Supabase client not initialized' };
  }

  let synced = 0;
  for (const s of students) {
    const res = await syncStudentToSupabase(s);
    if (res.success) synced++;
  }

  return {
    success: synced === students.length,
    syncedCount: synced,
    totalCount: students.length,
    message: `Synced ${synced} of ${students.length} students to Supabase.`
  };
}
