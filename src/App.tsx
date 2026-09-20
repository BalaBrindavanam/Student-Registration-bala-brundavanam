/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { StudentProfile } from './components/StudentProfile';
import { StudentSearch } from './components/StudentSearch';
import { AttendanceManager } from './components/AttendanceManager';
import { LocationManager } from './components/LocationManager';
import { EditStudentModal } from './components/EditStudentModal';
import { PrintableView } from './components/PrintableView';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { Student, User } from './types';
import { fetchStudents } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bbt_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'register' | 'search' | 'attendance' | 'locations'>('register');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [lastUpdatedStudent, setLastUpdatedStudent] = useState<Student | null>(null);
  const [printingStudent, setPrintingStudent] = useState<Student | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [studentCount, setStudentCount] = useState<number>(0);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('bbt_current_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist user session', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('bbt_current_user');
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
  };

  // Sync count of registered students
  const refreshStudentCount = async () => {
    try {
      const list = await fetchStudents();
      setStudentCount(list.length);
    } catch (err) {
      console.error('Failed to sync student count:', err);
    }
  };

  useEffect(() => {
    refreshStudentCount();
  }, []);

  // Handler: When student registration completes
  const handleRegistrationSuccess = (newStudent: Student) => {
    setActiveStudent(newStudent);
    setLastUpdatedStudent(newStudent);
    refreshStudentCount();
  };

  // Handler: Select student from directory/search
  const handleSelectStudent = (student: Student) => {
    setActiveStudent(student);
  };

  // Handler: Edit student
  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  // Handler: Edit saved successfully
  const handleEditSuccess = (updatedStudent: Student) => {
    const wasActive = activeStudent && editingStudent && activeStudent.id === editingStudent.id;
    setEditingStudent(null);
    setLastUpdatedStudent(updatedStudent);
    if (wasActive || (activeStudent && activeStudent.id === updatedStudent.id)) {
      setActiveStudent(updatedStudent);
    }
    refreshStudentCount();
  };

  // Handler: Delete student completed
  const handleDeleteSuccess = () => {
    setActiveStudent(null);
    refreshStudentCount();
    setActiveTab('search');
  };

  // Handler: Print student
  const handlePrintStudent = (student: Student) => {
    setPrintingStudent(student);
  };

  // Handler: Register new student
  const handleRegisterNew = () => {
    setActiveStudent(null);
    setActiveTab('register');
  };

  // If user is not logged in, display the dedicated Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-200">
      {/* Education Management Navigation Header */}
      <Header
        activeTab={isAdmin ? activeTab : 'register'}
        setActiveTab={tab => {
          if (!isAdmin && tab !== 'register') return;
          setActiveTab(tab);
          if (tab === 'register') {
            setActiveStudent(null);
          }
        }}
        studentCount={studentCount}
        onOpenSupabaseSync={() => {
          if (isAdmin) setIsSupabaseModalOpen(true);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-8" id="main-content">
        {/* If a student profile is active, show the Student Profile View */}
        {activeStudent ? (
          <StudentProfile
            student={activeStudent}
            onEdit={isAdmin ? handleEditStudent : () => {}}
            onDeleteSuccess={isAdmin ? handleDeleteSuccess : () => {}}
            onPrint={handlePrintStudent}
            onSearchClick={() => {
              if (isAdmin) {
                setActiveStudent(null);
                setActiveTab('search');
              }
            }}
            onRegisterNew={handleRegisterNew}
            isAdmin={isAdmin}
          />
        ) : (
          <>
            {/* View 1: STUDENT REGISTRATION Form - Available to both User and Admin */}
            {(activeTab === 'register' || !isAdmin) && (
              <RegistrationForm
                onRegistrationSuccess={handleRegistrationSuccess}
                onSelectStudent={handleSelectStudent}
                onViewAllRecords={isAdmin ? () => setActiveTab('search') : undefined}
                onPrintStudent={handlePrintStudent}
                isAdmin={isAdmin}
              />
            )}

            {/* View 2: Student Directory & Search Table - ADMIN ONLY */}
            {isAdmin && activeTab === 'search' && (
              <StudentSearch
                onSelectStudent={handleSelectStudent}
                onEditStudent={handleEditStudent}
                onPrintStudent={handlePrintStudent}
                onRegisterNew={handleRegisterNew}
                onStudentDeleted={refreshStudentCount}
                lastUpdatedStudent={lastUpdatedStudent}
              />
            )}

            {/* View 3: Daily Attendance Register (Class 0 to Class 10) - ADMIN ONLY */}
            {isAdmin && activeTab === 'attendance' && (
              <AttendanceManager
                onSelectStudent={handleSelectStudent}
                onRegisterNew={handleRegisterNew}
              />
            )}

            {/* View 4: Andhra Pradesh Location Hierarchy & Schools Directory - ADMIN ONLY */}
            {isAdmin && activeTab === 'locations' && <LocationManager />}
          </>
        )}
      </main>

      {/* Modal: Edit Student Record - ADMIN ONLY */}
      {editingStudent && isAdmin && (
        <EditStudentModal
          student={editingStudent}
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Modal: Print Registration Card */}
      {printingStudent && (
        <PrintableView
          student={printingStudent}
          onClose={() => setPrintingStudent(null)}
        />
      )}

      {/* Modal: Supabase Cloud Database Sync - ADMIN ONLY */}
      {isAdmin && (
        <SupabaseSyncModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onSyncComplete={refreshStudentCount}
        />
      )}

      {/* Global Footer with Requirement 13 Copyright */}
      <Footer />
    </div>
  );
}
