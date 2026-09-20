import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Building,
  GraduationCap,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  Loader2,
  Printer
} from 'lucide-react';
import { Student } from '../types';
import { fetchStudents, deleteStudent } from '../services/api';

interface StudentSearchProps {
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onPrintStudent: (student: Student) => void;
  onRegisterNew: () => void;
  onStudentDeleted?: () => void;
  lastUpdatedStudent?: Student | null;
}

const CLASSES = ['All Classes', ...Array.from({ length: 11 }, (_, i) => `Class ${i}`)];

export const StudentSearch: React.FC<StudentSearchProps> = ({
  onSelectStudent,
  onEditStudent,
  onPrintStudent,
  onRegisterNew,
  onStudentDeleted,
  lastUpdatedStudent
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Delete modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize when a student is updated externally
  useEffect(() => {
    if (lastUpdatedStudent) {
      loadStudents(searchQuery);
      setSuccessToast(
        `Updated student record: ${lastUpdatedStudent.id} (${lastUpdatedStudent.firstName} ${lastUpdatedStudent.lastName})`
      );
      const timer = setTimeout(() => setSuccessToast(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdatedStudent]);

  const loadStudents = async (query?: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchStudents(query);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(searchQuery);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete.id);
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
      if (onStudentDeleted) onStudentDeleted();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  // Client-side filtering for Class
  const filteredStudents = students.filter(s => {
    if (selectedClass !== 'All Classes' && s.className !== selectedClass) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8" id="student-search-view">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Directory & Search
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Search by Student ID, Student Name, Mobile Number, School, or Village
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => loadStudents(searchQuery)}
              disabled={isLoading}
              className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onRegisterNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Class Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Main Search Input */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="student-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Student ID (e.g. BBT000001 or 1), Name, Mobile, School, Village..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-colors duration-150 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Class Filter Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              id="student-filter-class"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full h-12 pl-10 pr-8 rounded-xl border border-slate-300 bg-white hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 transition-colors duration-150 focus:outline-none cursor-pointer"
            >
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Search Tag Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Quick Filters:</span>
          {['Madhavaram', 'Mantralayam', 'Kurnool', 'Class 0', 'Class 8', 'BBT000001'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (tag.startsWith('Class')) {
                  setSelectedClass(tag);
                } else {
                  setSearchQuery(tag);
                }
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
          {(searchQuery || selectedClass !== 'All Classes') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('All Classes');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold ml-1 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast('')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="text-xs font-bold text-rose-700">
            Dismiss
          </button>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="student-search-results">
        <div className="p-4 sm:px-6 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Student Records{' '}
            <span className="ml-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-mono">
              {filteredStudents.length} Found
            </span>
          </div>
          {searchQuery && (
            <span className="text-xs text-slate-500">
              Matching: &ldquo;<strong className="text-slate-800">{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Searching student database...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" id="students-table">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Student ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Class</th>
                  <th className="py-3.5 px-4">School</th>
                  <th className="py-3.5 px-4">Location (Village / Mandal)</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectStudent(student)}
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-blue-800 whitespace-nowrap">
                      {student.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors">
                        {student.className}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate" title={student.schoolName}>
                      {student.schoolName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                      <div>
                        <strong className="text-slate-800">{student.villageName}</strong>
                      </div>
                      <div className="text-slate-500">
                        {student.mandalName}, {student.districtName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 text-xs whitespace-nowrap">
                      +91 {student.mobileNumber}
                    </td>
                    <td
                      className="py-3.5 px-4 pr-6 text-right whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Profile */}
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Record Button */}
                        <button
                          type="button"
                          id={`btn-edit-${student.id}`}
                          onClick={() => onEditStudent(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title={`Edit Details for ${student.firstName} ${student.lastName} (${student.id})`}
                        >
                          <Edit className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit</span>
                        </button>

                        {/* Print Card */}
                        <button
                          type="button"
                          onClick={() => onPrintStudent(student)}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                          title="Print Registration Card"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Student Records Found</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              No registered students matched your current search parameters.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {(searchQuery || selectedClass !== 'All Classes') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClass('All Classes');
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={onRegisterNew}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                + Register New Student
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete{' '}
              <strong className="text-slate-900">
                {studentToDelete.firstName} {studentToDelete.lastName} ({studentToDelete.id})
              </strong>{' '}
              from the database?
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
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
