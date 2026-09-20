import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto h-12 sm:h-10 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 shrink-0 text-slate-400 text-[11px] font-medium gap-1 py-2 sm:py-0" id="app-footer">
      <p className="text-center sm:text-left">
        © 2026 Student Registration System • Andhra Pradesh Education Department
      </p>

      <div className="flex items-center space-x-4">
        <span className="hidden md:inline text-slate-400">Version 4.2.0-STABLE</span>
        <span className="flex items-center text-emerald-600 font-bold">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
          Server Online
        </span>
      </div>
    </footer>
  );
};
