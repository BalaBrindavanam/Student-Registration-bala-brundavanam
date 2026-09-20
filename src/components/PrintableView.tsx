import React from 'react';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';
import { Student } from '../types';

interface PrintableViewProps {
  student: Student;
  onClose: () => void;
}

export const PrintableView: React.FC<PrintableViewProps> = ({ student, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(student.registeredAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-300 print:border-none print:shadow-none print:p-0 my-6">
        {/* Print & Close Control Buttons (Hidden when printing) */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-base">Print Preview</span>
            <span className="text-xs text-slate-500 font-mono">({student.id})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Registration Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Card Body */}
        <div className="mt-6 border-2 border-slate-800 p-6 sm:p-8 rounded-xl relative bg-white" id="printable-student-card">
          {/* Official Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">
              Government of Andhra Pradesh • School Education Department
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
              STUDENT REGISTRATION CERTIFICATE
            </h1>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Academic Session 2026–2027 • Official Enrollment Record
            </div>
          </div>

          {/* Student ID & QR row */}
          <div className="flex items-center justify-between py-4 border-b border-slate-300 bg-slate-50 px-4 mt-4 rounded-lg">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Official Registration Number
              </span>
              <span className="font-mono font-black text-2xl text-blue-900 tracking-wider">
                {student.id}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Date of Registration</span>
                <span className="text-xs font-bold text-slate-800">{formattedDate}</span>
              </div>
              <div className="w-12 h-12 border border-slate-400 rounded bg-white flex items-center justify-center p-1">
                <QrCode className="w-10 h-10 text-slate-800" />
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="mt-6">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600 w-1/3">Student Full Name:</td>
                  <td className="py-2.5 font-black text-slate-900 text-base">
                    {student.firstName} {student.lastName}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Enrolled Class:</td>
                  <td className="py-2.5 font-bold text-blue-800">{student.className}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Father&apos;s Name:</td>
                  <td className="py-2.5 font-semibold text-slate-800">{student.fatherName}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Mother&apos;s Name:</td>
                  <td className="py-2.5 font-semibold text-slate-800">{student.motherName}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Mobile Number:</td>
                  <td className="py-2.5 font-mono font-semibold text-slate-800">+91 {student.mobileNumber}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Colony / Street:</td>
                  <td className="py-2.5 text-slate-800">{student.colonyStreet || '—'}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Village / Town:</td>
                  <td className="py-2.5 font-semibold text-slate-800">{student.villageName}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">Mandal:</td>
                  <td className="py-2.5 font-semibold text-slate-800">{student.mandalName}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2.5 font-bold text-slate-600">District:</td>
                  <td className="py-2.5 font-semibold text-slate-800">{student.districtName}</td>
                </tr>
                <tr className="border-b border-slate-200 bg-blue-50/40">
                  <td className="py-3 font-bold text-slate-700">Allocated School:</td>
                  <td className="py-3 font-black text-blue-900 text-sm">{student.schoolName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures & Seal boxes */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-dashed border-slate-400 text-center text-xs">
            <div>
              <div className="h-14"></div>
              <div className="border-t border-slate-800 pt-1 font-semibold text-slate-700">
                Parent / Guardian Signature
              </div>
            </div>
            <div>
              <div className="h-14"></div>
              <div className="border-t border-slate-800 pt-1 font-semibold text-slate-700">
                Registration Officer
              </div>
            </div>
            <div>
              <div className="h-14"></div>
              <div className="border-t border-slate-800 pt-1 font-semibold text-slate-700">
                School Headmaster Seal
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-[11px] text-center text-slate-500 border-t border-slate-200 pt-3">
            This registration record is generated by the Andhra Pradesh Student Registration System.
            Preserve this card for official school admission and examination hall pass records.
          </div>
        </div>
      </div>
    </div>
  );
};
