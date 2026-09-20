import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/db';
import {
  checkSupabaseStatus,
  syncStudentToSupabase,
  syncAllStudentsToSupabase,
  deleteStudentFromSupabase
} from './server/supabase';

const PORT = 3000;

// Name validation regex: alphabets, spaces, dots, hyphens
const NAME_REGEX = /^[A-Za-z\s.\-']{2,60}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // Standard 10-digit Indian mobile number

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Routes ---
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // --- Auth APIs ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Check specific Admin rule: admin google is bala@gmail.com, password is Bala$2026
    if (normalizedEmail === 'bala@gmail.com' && cleanPassword === 'Bala$2026') {
      const adminUser = dbManager.createUser({
        email: 'bala@gmail.com',
        name: 'Bala (Admin)',
        password: 'Bala$2026',
        role: 'admin',
        provider: 'password'
      });
      return res.json({
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: 'admin',
          provider: adminUser.provider
        },
        token: `session-${adminUser.id}-${Date.now()}`,
        message: 'Admin login successful.'
      });
    }

    // Check general user in database
    const user = dbManager.findUserByEmail(normalizedEmail);
    if (!user || user.password !== cleanPassword) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials.' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        provider: user.provider
      },
      token: `session-${user.id}-${Date.now()}`,
      message: 'Login successful.'
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (String(password).length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const existing = dbManager.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    // Rule: New person created in that page is "user"
    const newUser = dbManager.createUser({
      email: normalizedEmail,
      name: String(name).trim(),
      password: String(password).trim(),
      role: normalizedEmail === 'bala@gmail.com' ? 'admin' : 'user',
      provider: 'password'
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        provider: newUser.provider
      },
      token: `session-${newUser.id}-${Date.now()}`,
      message: 'User account created successfully.'
    });
  });

  // Google Account Login / Registration
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { email, name, picture } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userName = name || normalizedEmail.split('@')[0];

    // Rule: admin google is bala@gmail.com
    const role: 'admin' | 'user' = normalizedEmail === 'bala@gmail.com' ? 'admin' : 'user';

    const user = dbManager.createUser({
      email: normalizedEmail,
      name: userName,
      picture: picture || undefined,
      role,
      provider: 'google'
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture,
        provider: 'google'
      },
      token: `session-${user.id}-${Date.now()}`,
      message: 'Signed in with Google successfully.'
    });
  });

  app.get('/api/auth/users', (_req: Request, res: Response) => {
    const users = dbManager.getUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      provider: u.provider,
      picture: u.picture,
      createdAt: u.createdAt
    }));
    res.json(users);
  });

  app.get('/api/stats', (_req: Request, res: Response) => {
    res.json(dbManager.getStats());
  });

  // Location APIs
  app.get('/api/districts', (_req: Request, res: Response) => {
    const districts = dbManager.getDistricts();
    res.json(districts);
  });

  app.get('/api/mandals', (req: Request, res: Response) => {
    const districtId = req.query.districtId as string | undefined;
    const mandals = dbManager.getMandals(districtId);
    res.json(mandals);
  });

  app.get('/api/villages', (req: Request, res: Response) => {
    const mandalId = req.query.mandalId as string | undefined;
    const villages = dbManager.getVillages(mandalId);
    res.json(villages);
  });

  app.get('/api/schools', (req: Request, res: Response) => {
    const villageId = req.query.villageId as string | undefined;
    const schools = dbManager.getSchools(villageId);
    res.json(schools);
  });

  app.post('/api/schools', (req: Request, res: Response) => {
    const { villageId, name, type } = req.body;
    if (!villageId || !name || !name.trim()) {
      return res.status(400).json({ error: 'Village ID and School Name are required.' });
    }
    const village = dbManager.getVillageById(villageId);
    if (!village) {
      return res.status(404).json({ error: 'Village not found.' });
    }
    const newSchool = dbManager.addSchool(villageId, name.trim(), type);
    res.status(201).json(newSchool);
  });

  app.delete('/api/schools/:id', (req: Request, res: Response) => {
    const schoolId = req.params.id;
    const result = dbManager.deleteSchool(schoolId);
    if (!result.success) {
      return res.status(404).json({ error: 'School not found.' });
    }
    res.json({
      message: 'School deleted successfully',
      school: result.deletedSchool,
      enrolledStudents: result.enrolledStudents
    });
  });

  app.post('/api/schools/restore-defaults', (req: Request, res: Response) => {
    const villageId = req.body.villageId as string | undefined;
    const restored = dbManager.restoreDefaultSchools(villageId);
    res.json({ message: 'Default schools restored successfully', schools: restored });
  });

  app.post('/api/villages', (req: Request, res: Response) => {
    const { mandalId, name } = req.body;
    if (!mandalId || !name || !name.trim()) {
      return res.status(400).json({ error: 'Mandal ID and Village Name are required.' });
    }
    const mandal = dbManager.getMandalById(mandalId);
    if (!mandal) {
      return res.status(404).json({ error: 'Mandal not found.' });
    }
    const newVillage = dbManager.addVillage(mandalId, name.trim());
    res.status(201).json(newVillage);
  });

  // Students APIs
  app.get('/api/students', (req: Request, res: Response) => {
    const q = req.query.q as string | undefined;
    const students = dbManager.getStudents(q);
    res.json(students);
  });

  app.get('/api/students/:id', (req: Request, res: Response) => {
    const student = dbManager.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    res.json(student);
  });

  app.post('/api/students', async (req: Request, res: Response) => {
    const data = req.body;
    const errors: Record<string, string> = {};

    // 1. First Name
    if (!data.firstName || !data.firstName.trim()) {
      errors.firstName = 'First Name is required.';
    } else if (!NAME_REGEX.test(data.firstName.trim())) {
      errors.firstName = 'First Name must contain valid letters (2-60 chars).';
    }

    // 2. Last Name
    if (!data.lastName || !data.lastName.trim()) {
      errors.lastName = 'Last Name is required.';
    } else if (!NAME_REGEX.test(data.lastName.trim())) {
      errors.lastName = 'Last Name must contain valid letters (2-60 chars).';
    }

    // 3. Class: Class 0 to Class 10
    const validClasses = Array.from({ length: 11 }, (_, i) => `Class ${i}`);
    if (!data.className || !validClasses.includes(data.className)) {
      errors.className = 'Please select a valid class from Class 0 to Class 10.';
    }

    // 4. Father Name
    if (!data.fatherName || !data.fatherName.trim()) {
      errors.fatherName = 'Father Name is required.';
    } else if (!NAME_REGEX.test(data.fatherName.trim())) {
      errors.fatherName = 'Father Name must contain valid letters (2-60 chars).';
    }

    // 5. Mother Name
    if (!data.motherName || !data.motherName.trim()) {
      errors.motherName = 'Mother Name is required.';
    } else if (!NAME_REGEX.test(data.motherName.trim())) {
      errors.motherName = 'Mother Name must contain valid letters (2-60 chars).';
    }

    // 6. Mobile Number: exactly 10 digits
    const cleanedMobile = (data.mobileNumber || '').replace(/\D/g, '');
    if (!data.mobileNumber || !data.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile Number is required.';
    } else if (cleanedMobile.length !== 10) {
      errors.mobileNumber = 'Mobile Number must contain exactly 10 digits.';
    } else if (!MOBILE_REGEX.test(cleanedMobile)) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }

    // 7. Hierarchy: District -> Mandal -> Village -> School
    if (!data.districtId) {
      errors.districtId = 'Please select a District.';
    }
    if (!data.mandalId) {
      errors.mandalId = 'Please select a Mandal.';
    }
    if (!data.villageId) {
      errors.villageId = 'Please select a Village.';
    }
    if (!data.schoolId) {
      errors.schoolId = 'Please select a School.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors, message: 'Form validation failed' });
    }

    try {
      const student = dbManager.createStudent({
        firstName: data.firstName,
        lastName: data.lastName,
        className: data.className,
        schoolId: data.schoolId,
        schoolName: data.schoolName,
        fatherName: data.fatherName,
        motherName: data.motherName,
        mobileNumber: cleanedMobile,
        colonyStreet: data.colonyStreet,
        districtId: data.districtId,
        mandalId: data.mandalId,
        villageId: data.villageId
      });

      // Synchronize with Supabase Cloud
      const supabaseSync = await syncStudentToSupabase(student);

      res.status(201).json({
        message: 'Student Registration Successful',
        student,
        supabaseSync
      });
    } catch (err: any) {
      console.error('Error creating student:', err);
      res.status(500).json({ error: 'Internal server error saving student record.' });
    }
  });

  app.put('/api/students/:id', async (req: Request, res: Response) => {
    const studentId = req.params.id;
    const existing = dbManager.getStudentById(studentId);
    if (!existing) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const data = req.body;
    const errors: Record<string, string> = {};

    // Validate Student ID if provided
    let newStudentId = existing.id;
    if (data.id && typeof data.id === 'string') {
      const trimmedId = data.id.trim().toUpperCase();
      if (!trimmedId) {
        errors.id = 'Student ID cannot be empty.';
      } else if (!/^[A-Z0-9_-]{2,30}$/i.test(trimmedId)) {
        errors.id = 'Student ID must be 2-30 characters (letters, numbers, hyphens allowed).';
      } else if (trimmedId.toLowerCase() !== existing.id.toLowerCase()) {
        const collision = dbManager.getStudentById(trimmedId);
        if (collision) {
          errors.id = `Student ID "${trimmedId}" is already assigned to ${collision.firstName} ${collision.lastName}.`;
        } else {
          newStudentId = trimmedId;
        }
      }
    }

    if (data.firstName && !NAME_REGEX.test(data.firstName.trim())) {
      errors.firstName = 'First Name must contain valid letters.';
    }
    if (data.lastName && !NAME_REGEX.test(data.lastName.trim())) {
      errors.lastName = 'Last Name must contain valid letters.';
    }
    if (data.fatherName && !NAME_REGEX.test(data.fatherName.trim())) {
      errors.fatherName = 'Father Name must contain valid letters.';
    }
    if (data.motherName && !NAME_REGEX.test(data.motherName.trim())) {
      errors.motherName = 'Mother Name must contain valid letters.';
    }

    if (data.className) {
      const validClasses = Array.from({ length: 11 }, (_, i) => `Class ${i}`);
      if (!validClasses.includes(data.className)) {
        errors.className = 'Please select a valid class from Class 0 to Class 10.';
      }
    }

    let cleanedMobile = existing.mobileNumber;
    if (data.mobileNumber) {
      cleanedMobile = data.mobileNumber.replace(/\D/g, '');
      if (cleanedMobile.length !== 10) {
        errors.mobileNumber = 'Mobile Number must contain exactly 10 digits.';
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors, message: 'Update validation failed' });
    }

    try {
      const oldId = existing.id;
      const updated = dbManager.updateStudent(studentId, {
        ...data,
        id: newStudentId,
        mobileNumber: cleanedMobile
      });

      if (updated) {
        // If the ID was renamed, remove the old ID from Supabase to prevent duplicate stale rows
        if (oldId !== updated.id) {
          await deleteStudentFromSupabase(oldId);
        }
        await syncStudentToSupabase(updated);
      }

      res.json({ message: 'Student details updated successfully', student: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to update student' });
    }
  });

  app.delete('/api/students/:id', async (req: Request, res: Response) => {
    const studentId = req.params.id;
    const success = dbManager.deleteStudent(studentId);
    if (!success) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    await deleteStudentFromSupabase(studentId);
    res.json({ message: 'Student deleted successfully.' });
  });

  // Attendance APIs
  app.get('/api/attendance', (req: Request, res: Response) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const date = (req.query.date as string) || todayStr;
      const className = req.query.className as string;

      const records = dbManager.getAttendance(date, className);
      const summary = dbManager.getAttendanceSummary(date, className);

      // Get students for this class or all classes
      let students = dbManager.getStudents();
      if (className && className !== 'All Classes') {
        students = students.filter(s => s.className === className);
      }

      res.json({
        date,
        className: className || 'All Classes',
        records,
        summary,
        students
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch attendance' });
    }
  });

  app.post('/api/attendance', (req: Request, res: Response) => {
    try {
      const { date, records } = req.body;
      if (!date || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Date and records array are required.' });
      }

      const result = dbManager.saveAttendance(records);
      const summary = dbManager.getAttendanceSummary(date);

      res.json({
        message: `Attendance for ${date} recorded successfully`,
        saved: result.saved,
        summary
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save attendance' });
    }
  });

  app.get('/api/attendance/student/:studentId', (req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId;
      const records = dbManager.getStudentAttendance(studentId);
      res.json({ studentId, records });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch student attendance' });
    }
  });

  // Supabase Status & Sync APIs
  app.get('/api/supabase/status', async (_req: Request, res: Response) => {
    try {
      const status = await checkSupabaseStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({
        connected: false,
        message: err.message || 'Failed to check Supabase status'
      });
    }
  });

  app.post('/api/supabase/sync', async (_req: Request, res: Response) => {
    try {
      const allStudents = dbManager.getStudents();
      const syncResult = await syncAllStudentsToSupabase(allStudents);
      res.json(syncResult);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to sync students to Supabase'
      });
    }
  });

  // --- Vite Middleware for Development / Static for Production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Registration Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
