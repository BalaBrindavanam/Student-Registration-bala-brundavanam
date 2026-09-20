import React from 'react';
import { UserPlus, Search, Building2, ShieldCheck, GraduationCap, Database, UserCheck, Calendar, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeTab: 'register' | 'search' | 'attendance' | 'locations';
  setActiveTab: (tab: 'register' | 'search' | 'attendance' | 'locations') => void;
  studentCount: number;
  onOpenSupabaseSync?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  onOpenSupabaseSync,
  currentUser,
  onLogout
}) => {
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'US';
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="bg-blue-700 text-white shadow-md shrink-0 sticky top-0 z-30" id="app-header">
      {/* Top Banner with Official AP Header & Portal Identity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-xs">
              AP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white leading-tight">
                  Student Admission Management System
                </h1>
              </div>
              <p className="text-[11px] text-blue-100 font-medium hidden sm:block">
                Government of Andhra Pradesh • School Education Department
              </p>
            </div>
          </div>

          {/* Right Side Header Badges & User Status */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-sm font-medium">
            {onOpenSupabaseSync && isAdmin && (
              <button
                type="button"
                onClick={onOpenSupabaseSync}
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold text-white border border-emerald-400 shadow-xs cursor-pointer transition-colors"
                title="Supabase Cloud Synchronization"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Sync</span>
              </button>
            )}

            <span className="hidden xl:inline-flex items-center bg-blue-600 px-3 py-1 rounded-full border border-blue-400 text-xs font-semibold tracking-wide">
              Academic Year 2026–27
            </span>

            {/* Current User Chip */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-blue-800/60 px-3 py-1 rounded-full border border-blue-400/40">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-2xs ${
                    isAdmin ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300' : 'bg-white text-blue-800'
                  }`}
                >
                  {getInitials(currentUser.name, currentUser.email)}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-white max-w-[120px] truncate">
                    {currentUser.name || currentUser.email}
                  </span>
                  <span className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                    {isAdmin ? 'Administrator' : 'User'}
                  </span>
                </div>
                {isAdmin ? (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 hidden md:inline-block">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-blue-100 hidden md:inline-block">
                    User
                  </span>
                )}
              </div>
            )}

            {/* Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1 bg-red-600/80 hover:bg-red-600 active:bg-red-700 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-navigation bar for mobile or compact view */}
      <div className="bg-blue-800 border-t border-blue-600/60 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar" aria-label="Main Navigation">
            <button
              id="nav-btn-register"
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-blue-800 shadow-xs font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-blue-700/70'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Student Registration</span>
            </button>

            {/* Admin Only Navigation Tabs */}
            {isAdmin && (
              <>
                <button
                  id="nav-btn-search"
                  onClick={() => setActiveTab('search')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === 'search'
                      ? 'bg-white text-blue-800 shadow-xs font-bold'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/70'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Student Database</span>
                  {studentCount > 0 && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        activeTab === 'search' ? 'bg-blue-700 text-white' : 'bg-blue-900/80 text-blue-200'
                      }`}
                    >
                      {studentCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-btn-attendance"
                  onClick={() => setActiveTab('attendance')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === 'attendance'
                      ? 'bg-white text-blue-800 shadow-xs font-bold'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/70'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Attendance Register</span>
                </button>

                <button
                  id="nav-btn-locations"
                  onClick={() => setActiveTab('locations')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === 'locations'
                      ? 'bg-white text-blue-800 shadow-xs font-bold'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/70'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>School Directory</span>
                </button>
              </>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs text-blue-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>26 Districts Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};
