import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Loader2,
  AlertCircle,
  MapPin,
  Building,
  School as SchoolIcon,
  Plus,
  CheckCircle2,
  Hash
} from 'lucide-react';
import { Student, District, Mandal, Village, School, FormErrors } from '../types';
import {
  fetchDistricts,
  fetchMandals,
  fetchVillages,
  fetchSchools,
  createSchool,
  updateStudent
} from '../services/api';

interface EditStudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Student) => void;
}

const CLASS_OPTIONS = Array.from({ length: 11 }, (_, i) => `Class ${i}`);
const NAME_REGEX = /^[A-Za-z\s.\-']{2,60}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const SCHOOL_TYPES: School['type'][] = [
  'Mandal Parishad',
  'Zilla Parishad',
  'Government',
  'Private',
  'Aided'
];

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    className: student.className,
    fatherName: student.fatherName,
    motherName: student.motherName,
    mobileNumber: student.mobileNumber,
    colonyStreet: student.colonyStreet || '',
    districtId: student.districtId,
    mandalId: student.mandalId,
    villageId: student.villageId,
    schoolId: student.schoolId,
    schoolName: student.schoolName
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [districts, setDistricts] = useState<District[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  // Inline new school addition
  const [isAddingNewSchool, setIsAddingNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolType, setNewSchoolType] = useState<School['type']>('Government');
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [newSchoolNotice, setNewSchoolNotice] = useState('');

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-initialize and load hierarchy whenever student changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      className: student.className,
      fatherName: student.fatherName,
      motherName: student.motherName,
      mobileNumber: student.mobileNumber,
      colonyStreet: student.colonyStreet || '',
      districtId: student.districtId,
      mandalId: student.mandalId,
      villageId: student.villageId,
      schoolId: student.schoolId,
      schoolName: student.schoolName
    });
    setErrors({});
    setIsAddingNewSchool(false);
    setNewSchoolName('');
    setNewSchoolNotice('');

    let isMounted = true;
    setIsLoadingLocations(true);

    const initHierarchy = async () => {
      try {
        const dists = await fetchDistricts();
        if (!isMounted) return;
        setDistricts(dists);

        if (student.districtId) {
          const mnds = await fetchMandals(student.districtId);
          if (!isMounted) return;
          setMandals(mnds);
        }

        if (student.mandalId) {
          const vils = await fetchVillages(student.mandalId);
          if (!isMounted) return;
          setVillages(vils);
        }

        if (student.villageId) {
          const schs = await fetchSchools(student.villageId);
          if (!isMounted) return;
          setSchools(schs);
        }
      } catch (err) {
        console.error('Error loading location hierarchy for editing:', err);
      } finally {
        if (isMounted) setIsLoadingLocations(false);
      }
    };

    initHierarchy();

    return () => {
      isMounted = false;
    };
  }, [isOpen, student]);

  if (!isOpen) return null;

  const handleDistrictChange = async (districtId: string) => {
    setFormData(prev => ({
      ...prev,
      districtId,
      mandalId: '',
      villageId: '',
      schoolId: '',
      schoolName: ''
    }));
    setMandals([]);
    setVillages([]);
    setSchools([]);

    if (!districtId) return;
    try {
      const data = await fetchMandals(districtId);
      setMandals(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMandalChange = async (mandalId: string) => {
    setFormData(prev => ({
      ...prev,
      mandalId,
      villageId: '',
      schoolId: '',
      schoolName: ''
    }));
    setVillages([]);
    setSchools([]);

    if (!mandalId) return;
    try {
      const data = await fetchVillages(mandalId);
      setVillages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVillageChange = async (villageId: string) => {
    setFormData(prev => ({
      ...prev,
      villageId,
      schoolId: '',
      schoolName: ''
    }));
    setSchools([]);

    if (!villageId) return;
    try {
      const data = await fetchSchools(villageId);
      setSchools(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    const selected = schools.find(s => s.id === schoolId);
    setFormData(prev => ({
      ...prev,
      schoolId,
      schoolName: selected ? selected.name : prev.schoolName
    }));
  };

  const handleCreateNewSchool = async () => {
    if (!formData.villageId) {
      setErrors(prev => ({ ...prev, schoolId: 'Please select a Village first.' }));
      return;
    }
    if (!newSchoolName.trim()) {
      setErrors(prev => ({ ...prev, schoolId: 'Please enter a School Name.' }));
      return;
    }
    setIsCreatingSchool(true);
    try {
      const created = await createSchool(formData.villageId, newSchoolName.trim(), newSchoolType);
      setSchools(prev => [...prev, created]);
      setFormData(prev => ({
        ...prev,
        schoolId: created.id,
        schoolName: created.name
      }));
      setIsAddingNewSchool(false);
      setNewSchoolName('');
      setNewSchoolNotice(`Added and selected "${created.name}"`);
      setTimeout(() => setNewSchoolNotice(''), 4000);
    } catch (err: any) {
      setErrors(prev => ({ ...prev, general: err.message || 'Failed to add school' }));
    } finally {
      setIsCreatingSchool(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedId = (formData.studentId || '').trim().toUpperCase();
    if (!trimmedId) {
      newErrors.studentId = 'Student ID is required.';
    } else if (!/^[A-Z0-9_-]{2,30}$/i.test(trimmedId)) {
      newErrors.studentId = 'Student ID must be 2-30 characters (letters, numbers, hyphens allowed).';
    }

    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required.';
    else if (!NAME_REGEX.test(formData.firstName.trim())) {
      newErrors.firstName = 'First Name must contain letters only.';
    }

    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required.';
    else if (!NAME_REGEX.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last Name must contain letters only.';
    }

    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father Name is required.';
    if (!formData.motherName.trim()) newErrors.motherName = 'Mother Name is required.';

    const cleanedMobile = formData.mobileNumber.replace(/\D/g, '');
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile Number is required.';
    else if (cleanedMobile.length !== 10) newErrors.mobileNumber = 'Must be 10 digits.';
    else if (!MOBILE_REGEX.test(cleanedMobile)) newErrors.mobileNumber = 'Enter valid 10-digit mobile number.';

    if (!formData.districtId) newErrors.districtId = 'District is required.';
    if (!formData.mandalId) newErrors.mandalId = 'Mandal is required.';
    if (!formData.villageId) newErrors.villageId = 'Village is required.';
    if (!formData.schoolId) newErrors.schoolId = 'School is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const trimmedId = formData.studentId.trim().toUpperCase();
      const response = await updateStudent(student.id, {
        id: trimmedId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        className: formData.className,
        schoolId: formData.schoolId,
        schoolName: formData.schoolName,
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        mobileNumber: formData.mobileNumber.replace(/\D/g, ''),
        colonyStreet: formData.colonyStreet.trim(),
        districtId: formData.districtId,
        mandalId: formData.mandalId,
        villageId: formData.villageId
      });
      onSuccess(response.student);
      onClose();
    } catch (err: any) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setErrors(prev => ({ ...prev, general: err.message || 'Failed to update student' }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Edit Student Record
            </h3>
            <p className="text-xs font-mono text-blue-700 mt-0.5">
              Current ID: <span className="font-bold">{student.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errors.general && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Editable Student ID / Admission Number */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
              <label htmlFor="edit-student-id-field" className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-blue-600" />
                <span>Student ID / Admission Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-blue-700 font-medium">
                Unique identifier (e.g. BBT000001, BBT000002)
              </span>
            </div>
            <div className="relative">
              <input
                id="edit-student-id-field"
                type="text"
                value={formData.studentId}
                onChange={e => {
                  const val = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, studentId: val }));
                  if (errors.studentId || errors.id) {
                    setErrors(prev => ({ ...prev, studentId: undefined, id: undefined }));
                  }
                }}
                placeholder="e.g. BBT000001"
                className="w-full h-10 px-3 font-mono font-bold tracking-wider rounded-lg border border-blue-300 bg-white text-blue-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-600 uppercase"
              />
            </div>
            {(errors.studentId || errors.id) && (
              <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.studentId || errors.id}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
              {errors.firstName && <p className="text-xs text-rose-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
              {errors.lastName && <p className="text-xs text-rose-600 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.className}
                onChange={e => setFormData(prev => ({ ...prev, className: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
              >
                {CLASS_OPTIONS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.mobileNumber}
                onChange={e =>
                  setFormData(prev => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '') }))
                }
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
              {errors.mobileNumber && (
                <p className="text-xs text-rose-600 mt-1">{errors.mobileNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Father Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={e => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
              />
              {errors.fatherName && <p className="text-xs text-rose-600 mt-1">{errors.fatherName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mother Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={e => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
              />
              {errors.motherName && <p className="text-xs text-rose-600 mt-1">{errors.motherName}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Colony / Street
              </label>
              <input
                type="text"
                value={formData.colonyStreet}
                onChange={e => setFormData(prev => ({ ...prev, colonyStreet: e.target.value }))}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Location Hierarchy Fields */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Location & School Hierarchy</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={formData.districtId}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="">Select District</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mandal</label>
                <select
                  value={formData.mandalId}
                  onChange={e => handleMandalChange(e.target.value)}
                  disabled={!formData.districtId}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white disabled:bg-slate-100"
                >
                  <option value="">Select Mandal</option>
                  {mandals.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Village</label>
                <select
                  value={formData.villageId}
                  onChange={e => handleVillageChange(e.target.value)}
                  disabled={!formData.mandalId}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white disabled:bg-slate-100"
                >
                  <option value="">Select Village</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  School Name <span className="text-rose-500">*</span>
                </label>
                {formData.villageId && !isAddingNewSchool && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewSchool(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New School</span>
                  </button>
                )}
              </div>

              {/* Notice for newly added school */}
              {newSchoolNotice && (
                <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{newSchoolNotice}</span>
                </div>
              )}

              {/* Inline Form to Add New School */}
              {isAddingNewSchool && (
                <div className="mb-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
                  <div className="text-xs font-bold text-blue-900">Add New School to this Village</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={newSchoolName}
                        onChange={e => setNewSchoolName(e.target.value)}
                        placeholder="Enter full school name (e.g., ZPHS, MPPS)"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <select
                        value={newSchoolType}
                        onChange={e => setNewSchoolType(e.target.value as School['type'])}
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        {SCHOOL_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewSchool(false);
                        setNewSchoolName('');
                      }}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewSchool}
                      disabled={isCreatingSchool || !newSchoolName.trim()}
                      className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      {isCreatingSchool ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Save & Select School
                    </button>
                  </div>
                </div>
              )}

              <select
                value={formData.schoolId}
                onChange={e => handleSchoolChange(e.target.value)}
                disabled={!formData.villageId}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              >
                <option value="">Select School</option>
                {/* Fallback option for current student's school if not in schools array */}
                {formData.schoolId && !schools.some(s => s.id === formData.schoolId) && (
                  <option value={formData.schoolId}>
                    {formData.schoolName || student.schoolName} (Current)
                  </option>
                )}
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
              {errors.schoolId && <p className="text-xs text-rose-600 mt-1">{errors.schoolId}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-60 flex items-center gap-2 shadow-xs"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
