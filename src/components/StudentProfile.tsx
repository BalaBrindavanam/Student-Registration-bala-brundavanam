import React, { useState } from 'react';
import {
  IdCard,
  User,
  GraduationCap,
  Building,
  MapPin,
  Phone,
  Users,
  Edit,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { Student } from '../types';
import { deleteStudent } from '../services/api';

interface StudentProfileProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDeleteSuccess: () => void;
  onPrint: (student: Student) => void;
  onSearchClick: () => void;
  onRegisterNew: () => void;
  isAdmin?: boolean;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  student,
  onEdit,
  onDeleteSuccess,
  onPrint,
  onSearchClick,
  onRegisterNew,
  isAdmin = false
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteStudent(student.id);
      setShowDeleteModal(false);
      onDeleteSuccess();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete student record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(student.registeredAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8" id="student-profile-view">
      {/* Top Action / Back Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onRegisterNew}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Registration Form</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Record
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {student.id}
          </span>
        </div>
      </div>

      {/* Main Student Profile Card */}
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
        id="student-profile-card"
      >
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0">
                <IdCard className="w-9 h-9 text-blue-200" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-blue-300 uppercase block mb-1">
                  Official Student Identity
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {student.firstName} {student.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <span className="bg-blue-600 text-white font-semibold text-xs px-3 py-0.5 rounded-full shadow-2xs">
                    {student.className}
                  </span>
                  <span className="text-xs text-blue-200">
                    {student.schoolName}
                  </span>
                </div>
              </div>
            </div>

            {/* Student ID Badge */}
            <div className="self-end sm:self-center bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-xs text-right">
              <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                Student ID
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-amber-300 tracking-wider">
                {student.id}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Class Enrollment</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{student.className}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Contact Number</span>
              </div>
              <div className="text-lg font-bold text-slate-900 font-mono">+91 {student.mobileNumber}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Registration Date</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-1">{formattedDate}</div>
            </div>
          </div>

          {/* Detailed Information Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* 1. Student & Parent Particulars */}
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <Users className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Personal & Family Particulars
                </h4>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">First Name:</span>
                  <span className="font-semibold text-slate-800">{student.firstName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Name:</span>
                  <span className="font-semibold text-slate-800">{student.lastName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Father&apos;s Name:</span>
                  <span className="font-semibold text-slate-800">{student.fatherName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mother&apos;s Name:</span>
                  <span className="font-semibold text-slate-800">{student.motherName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Colony / Street:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {student.colonyStreet || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. School & Location Hierarchy */}
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  School & Location Hierarchy
                </h4>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">District:</span>
                  <span className="font-semibold text-slate-800">{student.districtName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mandal:</span>
                  <span className="font-semibold text-slate-800">{student.mandalName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Village:</span>
                  <span className="font-semibold text-slate-800">{student.villageName}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 block text-xs mb-1">School Name:</span>
                  <div className="font-bold text-blue-900 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2">
                    <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{student.schoolName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Student Academic Class & Enrollment Overview */}
          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Academic Class Enrollment
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Enrolled Class:</span>
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold border border-blue-200">
                  {student.className}
                </span>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Enrolled Class Level
                </span>
                <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>{student.className}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  School Category
                </span>
                <div className="text-sm font-bold text-slate-900 truncate" title={student.schoolType}>
                  {student.schoolType}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Admission Date
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {new Date(student.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit, Delete, Print, Search Student */}
          <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Edit Button - Admin Only */}
              {isAdmin && (
                <button
                  type="button"
                  id="btn-profile-edit"
                  onClick={() => onEdit(student)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                  <span>Edit Details</span>
                </button>
              )}

              {/* Delete Button - Admin Only */}
              {isAdmin && (
                <button
                  type="button"
                  id="btn-profile-delete"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete</span>
                </button>
              )}

              {/* Print Button - Available to all */}
              <button
                type="button"
                id="btn-profile-print"
                onClick={() => onPrint(student)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Print Card</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Student Button - Admin Only */}
              {isAdmin && (
                <button
                  type="button"
                  id="btn-profile-search"
                  onClick={onSearchClick}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Student</span>
                </button>
              )}

              {/* Register New Student Button */}
              <button
                type="button"
                onClick={onRegisterNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Register Another</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Delete Student Record?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">
                {student.firstName} {student.lastName} ({student.id})
              </strong>{' '}
              from the persistent database? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
