import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  MapPin,
  School as SchoolIcon,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  Trash2,
  AlertTriangle,
  RotateCcw,
  X
} from 'lucide-react';
import { District, Mandal, Village, School } from '../types';
import {
  fetchDistricts,
  fetchMandals,
  fetchVillages,
  fetchSchools,
  createSchool,
  deleteSchool,
  restoreDefaultSchools
} from '../services/api';

export const LocationManager: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist-kurnool');
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [selectedMandalId, setSelectedMandalId] = useState<string>('mnd-mantralayam');
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('vil-madhavaram');
  const [schools, setSchools] = useState<School[]>([]);

  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingMandals, setIsLoadingMandals] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  // New School state
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolType, setNewSchoolType] = useState<School['type']>('Government');
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [schoolAddedMessage, setSchoolAddedMessage] = useState('');

  // School Delete and Search state
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeletingSchool, setIsDeletingSchool] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');
  const [schoolSearchFilter, setSchoolSearchFilter] = useState('');
  const [isRestoringDefaults, setIsRestoringDefaults] = useState(false);

  // Initial load: districts
  useEffect(() => {
    setIsLoadingDistricts(true);
    fetchDistricts()
      .then(d => {
        setDistricts(d);
      })
      .finally(() => setIsLoadingDistricts(false));
  }, []);

  // When district changes, load mandals
  useEffect(() => {
    if (!selectedDistrictId) return;
    setIsLoadingMandals(true);
    fetchMandals(selectedDistrictId)
      .then(m => {
        setMandals(m);
        // Default to mantralayam if kurnool
        if (selectedDistrictId === 'dist-kurnool' && m.some(x => x.id === 'mnd-mantralayam')) {
          setSelectedMandalId('mnd-mantralayam');
        } else if (m.length > 0) {
          setSelectedMandalId(m[0].id);
        } else {
          setSelectedMandalId('');
        }
      })
      .finally(() => setIsLoadingMandals(false));
  }, [selectedDistrictId]);

  // When mandal changes, load villages
  useEffect(() => {
    if (!selectedMandalId) {
      setVillages([]);
      setSelectedVillageId('');
      return;
    }
    setIsLoadingVillages(true);
    fetchVillages(selectedMandalId)
      .then(v => {
        setVillages(v);
        if (selectedMandalId === 'mnd-mantralayam' && v.some(x => x.id === 'vil-madhavaram')) {
          setSelectedVillageId('vil-madhavaram');
        } else if (v.length > 0) {
          setSelectedVillageId(v[0].id);
        } else {
          setSelectedVillageId('');
        }
      })
      .finally(() => setIsLoadingVillages(false));
  }, [selectedMandalId]);

  // When village changes, load schools
  useEffect(() => {
    if (!selectedVillageId) {
      setSchools([]);
      return;
    }
    setIsLoadingSchools(true);
    fetchSchools(selectedVillageId)
      .then(s => setSchools(s))
      .finally(() => setIsLoadingSchools(false));
  }, [selectedVillageId]);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim() || !selectedVillageId) return;

    setIsSavingSchool(true);
    setSchoolAddedMessage('');
    try {
      const created = await createSchool(selectedVillageId, newSchoolName.trim(), newSchoolType);
      setSchools(prev => [...prev, created]);
      setSchoolAddedMessage(`Added "${created.name}" successfully!`);
      setNewSchoolName('');
      setIsAddingSchool(false);
      setTimeout(() => setSchoolAddedMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to add school');
    } finally {
      setIsSavingSchool(false);
    }
  };

  const handleConfirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    setIsDeletingSchool(true);
    setDeleteErrorMessage('');
    try {
      const res = await deleteSchool(schoolToDelete.id);
      setSchools(prev => prev.filter(s => s.id !== schoolToDelete.id));
      const studentNote = res.enrolledStudents > 0 ? ` (${res.enrolledStudents} student records preserve this school in their history)` : '';
      setSchoolAddedMessage(`Deleted school "${schoolToDelete.name}" successfully${studentNote}.`);
      setSchoolToDelete(null);
      setTimeout(() => setSchoolAddedMessage(''), 5000);
    } catch (err: any) {
      setDeleteErrorMessage(err.message || 'Failed to delete school');
    } finally {
      setIsDeletingSchool(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!selectedVillageId) return;
    const confirmRestore = window.confirm(`Restore official default schools for ${currentVillage?.name || 'this village'}?`);
    if (!confirmRestore) return;

    setIsRestoringDefaults(true);
    try {
      const res = await restoreDefaultSchools(selectedVillageId);
      setSchools(res.schools);
      setSchoolAddedMessage(`Restored official default schools for ${currentVillage?.name || 'village'}.`);
      setTimeout(() => setSchoolAddedMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to restore default schools');
    } finally {
      setIsRestoringDefaults(false);
    }
  };

  const filteredSchools = useMemo(() => {
    if (!schoolSearchFilter.trim()) return schools;
    const q = schoolSearchFilter.toLowerCase().trim();
    return schools.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.type && s.type.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q)
    );
  }, [schools, schoolSearchFilter]);

  const currentDistrict = districts.find(d => d.id === selectedDistrictId);
  const currentMandal = mandals.find(m => m.id === selectedMandalId);
  const currentVillage = villages.find(v => v.id === selectedVillageId);

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8" id="location-manager-view">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Hierarchical Database Management</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Andhra Pradesh Educational Location Directory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore and update District → Mandal → Village → School records across Andhra Pradesh
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Current Test Case:</span>
            <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Kurnool → Mantralayam → Madhavaram
            </span>
          </div>
        </div>

        {/* Selected Hierarchy Breadcrumbs */}
        <div className="pt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Active Scope:</span>
          <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {currentDistrict?.name || 'District'}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            {currentMandal?.name || 'Mandal'}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {currentVillage?.name || 'Village'}
          </span>
        </div>
      </div>

      {schoolAddedMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{schoolAddedMessage}</span>
        </div>
      )}

      {/* 3-Column Hierarchy Explorer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Column 1: Districts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-96">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>1. Districts ({districts.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">AP Reorg</span>
          </div>

          <div className="mt-3 overflow-y-auto space-y-1 flex-1 pr-1">
            {isLoadingDistricts ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
              </div>
            ) : (
              districts.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDistrictId(d.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedDistrictId === d.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{d.name}</span>
                  <span className={`text-[10px] font-mono ${selectedDistrictId === d.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {d.code}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Mandals */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-96">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>2. Mandals in {currentDistrict?.name}</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {mandals.length}
            </span>
          </div>

          <div className="mt-3 overflow-y-auto space-y-1 flex-1 pr-1">
            {isLoadingMandals ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-indigo-600" />
              </div>
            ) : mandals.length > 0 ? (
              mandals.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMandalId(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedMandalId === m.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{m.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${selectedMandalId === m.id ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No mandals loaded for this district.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Villages */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-96">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>3. Villages in {currentMandal?.name}</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
              {villages.length}
            </span>
          </div>

          <div className="mt-3 overflow-y-auto space-y-1 flex-1 pr-1">
            {isLoadingVillages ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
              </div>
            ) : villages.length > 0 ? (
              villages.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVillageId(v.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedVillageId === v.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{v.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${selectedVillageId === v.id ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No villages listed.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schools Section for Selected Village */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <SchoolIcon className="w-5 h-5 text-blue-700" />
                <span>Schools in {currentVillage?.name || 'Selected Village'}</span>
              </h3>
              <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                {schools.length} {schools.length === 1 ? 'school' : 'schools'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered schools for {currentVillage?.name} ({currentMandal?.name} Mandal, {currentDistrict?.name}). You can add or delete schools as needed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentVillage && (
              <>
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  disabled={isRestoringDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  title={`Restore official pre-configured schools for ${currentVillage.name}`}
                >
                  {isRestoringDefaults ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Restore Defaults</span>
                </button>

                <button
                  type="button"
                  id="btn-add-school"
                  onClick={() => setIsAddingSchool(prev => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add School to {currentVillage.name}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Bar for Schools */}
        {schools.length > 2 && (
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={schoolSearchFilter}
              onChange={e => setSchoolSearchFilter(e.target.value)}
              placeholder={`Filter schools in ${currentVillage?.name || 'village'} by name or type...`}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
            {schoolSearchFilter && (
              <button
                type="button"
                onClick={() => setSchoolSearchFilter('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Add School Form */}
        {isAddingSchool && currentVillage && (
          <form onSubmit={handleAddSchool} className="my-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Register New School in {currentVillage.name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  placeholder="e.g. Mandal Parishad Primary School (MPPS), Madhavaram"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newSchoolType}
                  onChange={e => setNewSchoolType(e.target.value as School['type'])}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="Government">Government High School</option>
                  <option value="Zilla Parishad">Zilla Parishad (ZPHS)</option>
                  <option value="Mandal Parishad">Mandal Parishad (MPPS)</option>
                  <option value="Aided">Aided</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSchool(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingSchool || !newSchoolName.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer disabled:opacity-60 flex items-center gap-1"
              >
                {isSavingSchool ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Save School</span>
              </button>
            </div>
          </form>
        )}

        {/* Schools List */}
        <div className="mt-4">
          {isLoadingSchools ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            </div>
          ) : filteredSchools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSchools.map(sch => (
                <div
                  key={sch.id}
                  id={`school-card-${sch.id}`}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <SchoolIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 truncate" title={sch.name}>
                        {sch.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-mono">ID: {sch.id}</span>
                        {sch.type && (
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 shrink-0">
                            {sch.type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action: Delete School */}
                  <button
                    type="button"
                    id={`btn-delete-school-${sch.id}`}
                    onClick={() => {
                      setDeleteErrorMessage('');
                      setSchoolToDelete(sch);
                    }}
                    title={`Delete "${sch.name}" from ${currentVillage?.name || 'village'}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                    aria-label={`Delete school ${sch.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : schools.length > 0 && filteredSchools.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No schools matched your filter &ldquo;{schoolSearchFilter}&rdquo;.
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <SchoolIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No schools currently configured for {currentVillage?.name || 'this village'}.</p>
              <p className="text-xs text-slate-400 mt-1">
                You can add a school or click &ldquo;Restore Defaults&rdquo; to load the standard educational institutions for {currentVillage?.name || 'this area'}.
              </p>
              {currentVillage && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreDefaults}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Default Schools</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSchool(true)}
                    className="px-3 py-1.5 bg-blue-700 text-white hover:bg-blue-800 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add School</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete School Confirmation Modal */}
      {schoolToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900">Delete School Record</h4>
                  <button
                    type="button"
                    onClick={() => setSchoolToDelete(null)}
                    disabled={isDeletingSchool}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove this school from the educational directory?
                </p>
              </div>
            </div>

            <div className="my-4 p-3 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <SchoolIcon className="w-3.5 h-3.5 text-rose-700" />
                <span>{schoolToDelete.name}</span>
              </div>
              <div className="text-[11px] text-rose-800 mt-1 space-y-0.5">
                <div><strong>Village:</strong> {currentVillage?.name}</div>
                <div><strong>Mandal:</strong> {currentMandal?.name} | <strong>District:</strong> {currentDistrict?.name}</div>
                <div><strong>Category:</strong> {schoolToDelete.type || 'Standard'}</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Note: Deleting this school removes it from the dropdown during student registration for {currentVillage?.name}. Any previously enrolled students will keep their historical school name intact.
            </p>

            {deleteErrorMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-medium">
                {deleteErrorMessage}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSchoolToDelete(null)}
                disabled={isDeletingSchool}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete-school"
                onClick={handleConfirmDeleteSchool}
                disabled={isDeletingSchool}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                {isDeletingSchool ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeletingSchool ? 'Deleting...' : 'Delete School'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
