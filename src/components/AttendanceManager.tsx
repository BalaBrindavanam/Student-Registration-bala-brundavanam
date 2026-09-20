import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2,
  MapPin,
  Phone,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { Student, ALL_CLASSES } from '../types';
import { fetchStudents } from '../services/api';

interface AttendanceManagerProps {
  onSelectStudent?: (student: Student) => void;
  onRegisterNew?: () => void;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  onSelectStudent,
  onRegisterNew
}) => {
  // Current local date in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load students list
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err: any) {
      console.error('Failed to load students for attendance register:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Date Navigation Helpers
  const shiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formattedDisplayDate = useMemo(() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Filter students by selected Class (Class 0 to Class 10) and Search query
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Class filter (Class 0 to Class 10)
      if (selectedClass !== 'All Classes' && student.className !== selectedClass) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesId = student.id.toLowerCase().includes(q);
        const matchesSchool = student.schoolName.toLowerCase().includes(q);
        const matchesMobile = student.mobileNumber.includes(q);
        const matchesFather = student.fatherName.toLowerCase().includes(q);
        const matchesClass = student.className.toLowerCase().includes(q);
        const matchesVillage = student.villageName.toLowerCase().includes(q);
        return (
          matchesName ||
          matchesId ||
          matchesSchool ||
          matchesMobile ||
          matchesFather ||
          matchesClass ||
          matchesVillage
        );
      }
      return true;
    });
  }, [students, selectedClass, searchQuery]);

  // Summary by Class from Class 0 to Class 10
  const classBreakdowns = useMemo(() => {
    return ALL_CLASSES.map(cls => {
      const classStudents = students.filter(s => s.className === cls);
      return {
        className: cls,
        count: classStudents.length
      };
    });
  }, [students]);

  // General Metrics
  const metrics = useMemo(() => {
    const total = students.length;
    const inFilter = filteredStudents.length;
    const uniqueSchools = new Set(students.map(s => s.schoolName)).size;
    const uniqueVillages = new Set(students.map(s => s.villageName)).size;
    const activeClasses = classBreakdowns.filter(c => c.count > 0).length;

    return { total, inFilter, uniqueSchools, uniqueVillages, activeClasses };
  }, [students, filteredStudents, classBreakdowns]);

  // Color helper for Class badge
  const getClassColor = (cls: string) => {
    switch (cls) {
      case 'Class 0':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Class 1':
      case 'Class 2':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Class 3':
      case 'Class 4':
      case 'Class 5':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Class 6':
      case 'Class 7':
      case 'Class 8':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Class 9':
      case 'Class 10':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Quick Export to CSV for Classroom Attendance
  const exportToCSV = () => {
    const headers = [
      'Roll No',
      'Student ID',
      'First Name',
      'Last Name',
      'Class',
      'Father Name',
      'Mother Name',
      'Mobile Number',
      'School Name',
      'Village',
      'Mandal',
      'District',
      'Attendance Date'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.id,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      `"${s.className}"`,
      `"${s.fatherName}"`,
      `"${s.motherName}"`,
      s.mobileNumber,
      `"${s.schoolName}"`,
      `"${s.villageName}"`,
      `"${s.mandalName}"`,
      `"${s.districtName}"`,
      selectedDate
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Attendance_Register_${selectedClass.replace(/\s+/g, '_')}_${selectedDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="attendance-manager-root">
      {/* Main Control Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Class Attendance Register</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Student Attendance Register
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              School class register organized by <span className="font-semibold text-slate-700">Class 0 to Class 10</span> matching student admissions.
            </p>
          </div>

          {/* Date Picker & Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                title="Previous Day"
                className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-3 py-1">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => shiftDate(1)}
                title="Next Day"
                className="p-2 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-2xs transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
              >
                Today
              </button>
            )}

            {/* Export CSV */}
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Export Register to CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Print Register */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors cursor-pointer"
              title="Print Attendance Register Sheet"
            >
              <Printer className="w-4 h-4" />
              <span>Print Register</span>
            </button>
          </div>
        </div>

        {/* Attendance Summary Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Registered
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">{metrics.total}</span>
              <span className="text-xs text-slate-500 font-medium">Students</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
              Selected Filter Roster
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-blue-900">{metrics.inFilter}</span>
              <span className="text-xs text-blue-600 font-medium">in {selectedClass}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">
              Active Classes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-900">{metrics.activeClasses}</span>
              <span className="text-xs text-purple-600 font-medium">of 11 Classes (0–10)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
              Schools Enrolled
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-900">{metrics.uniqueSchools}</span>
              <span className="text-xs text-emerald-600 font-medium">Across Mandals</span>
            </div>
          </div>
        </div>

        {/* Class Level Navigation Bar: Class 0 through Class 10 */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Filter by Class (Class 0 to Class 10)</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Select any class to filter attendance register
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedClass('All Classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedClass === 'All Classes'
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Classes ({students.length})
            </button>

            {classBreakdowns.map(cb => {
              const isActive = selectedClass === cb.className;
              return (
                <button
                  key={cb.className}
                  type="button"
                  onClick={() => setSelectedClass(cb.className)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-2xs ring-2 ring-blue-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cb.className}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cb.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID, class, school, or village..."
              className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Register Date: <span className="font-bold text-slate-800">{formattedDisplayDate}</span>
          </div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              Student Attendance Register Roster
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
              {formattedDisplayDate}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-700">{filteredStudents.length}</span> students in{' '}
            <span className="font-bold text-blue-700">{selectedClass}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-slate-600">Loading student register...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">No Students Found</h4>
            <p className="text-xs text-slate-500 mb-4">
              {selectedClass !== 'All Classes'
                ? `No students are currently registered under "${selectedClass}". Register a new student to add them to this class register.`
                : searchQuery
                ? `No students match your search "${searchQuery}".`
                : 'No students registered in the database yet.'}
            </p>
            {onRegisterNew && (
              <button
                type="button"
                onClick={onRegisterNew}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Register Student for {selectedClass !== 'All Classes' ? selectedClass : 'Class'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="attendance-table">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-32">Student ID</th>
                  <th className="py-3 px-4">Student Name & Parent</th>
                  {/* PROMINENT CLASS COLUMN (Class 0 to Class 10) */}
                  <th className="py-3 px-4 w-32">
                    <div className="flex items-center gap-1 text-blue-900 font-extrabold">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      <span>Class</span>
                    </div>
                  </th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4 hidden md:table-cell">Village & Mandal</th>
                  <th className="py-3 px-4 w-36">Parent Contact</th>
                  <th className="py-3 px-4 w-36 text-center print:table-cell">Roll Call / Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student, idx) => {
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Row Index */}
                      <td className="py-3.5 px-4 text-center text-xs font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Student ID */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectStudent && onSelectStudent(student)}
                          className="font-mono text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer flex items-center gap-1"
                          title="View student profile"
                        >
                          <span>{student.id}</span>
                        </button>
                      </td>

                      {/* Student Name & Father Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Father: {student.fatherName}</span>
                          <span className="text-slate-300">•</span>
                          <span>Mother: {student.motherName}</span>
                        </div>
                      </td>

                      {/* Prominent Class Badge (Class 0 to Class 10) */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${getClassColor(
                            student.className
                          )}`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{student.className}</span>
                        </span>
                      </td>

                      {/* School */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="font-semibold text-slate-800 truncate max-w-xs" title={student.schoolName}>
                          {student.schoolName}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {student.schoolType}
                        </div>
                      </td>

                      {/* Village & Mandal */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-slate-600">
                        <div className="font-medium text-slate-800">
                          {student.villageName}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {student.mandalName}, {student.districtName}
                        </div>
                      </td>

                      {/* Parent Contact */}
                      <td className="py-3.5 px-4 text-xs">
                        <a
                          href={`tel:${student.mobileNumber}`}
                          className="font-mono text-slate-700 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{student.mobileNumber}</span>
                        </a>
                      </td>

                      {/* Roll Call / Attendance Signature Box (For Roll Call & Print) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block border border-slate-300 rounded-md w-24 h-7 bg-slate-50/50 print:border-black"></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info inside table card */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{filteredStudents.length}</span> students across{' '}
            <span className="font-semibold text-slate-700">{selectedClass}</span>. Registered with standard Andhra Pradesh location hierarchy.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
