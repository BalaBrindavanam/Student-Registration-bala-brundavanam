import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  GraduationCap,
  Users,
  Phone,
  MapPin,
  Building,
  School as SchoolIcon,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Loader2,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { District, Mandal, Village, School, Student, StudentFormData, FormErrors } from '../types';
import {
  fetchDistricts,
  fetchMandals,
  fetchVillages,
  fetchSchools,
  createSchool,
  deleteSchool,
  registerStudent,
  fetchStudents
} from '../services/api';

interface RegistrationFormProps {
  onRegistrationSuccess: (student: Student) => void;
  onSelectStudent?: (student: Student) => void;
  onViewAllRecords?: () => void;
  onPrintStudent?: (student: Student) => void;
  isAdmin?: boolean;
}

const CLASS_OPTIONS = Array.from({ length: 11 }, (_, i) => `Class ${i}`);
const NAME_REGEX = /^[A-Za-z\s.\-']{2,60}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegistrationSuccess,
  onSelectStudent,
  onViewAllRecords,
  onPrintStudent,
  isAdmin = false
}) => {
  // Form State
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    className: '',
    schoolId: '',
    schoolName: '',
    fatherName: '',
    motherName: '',
    mobileNumber: '',
    colonyStreet: '',
    districtId: '',
    mandalId: '',
    villageId: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Location Hierarchy State
  const [districts, setDistricts] = useState<District[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  // Loading states
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingMandals, setIsLoadingMandals] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<{ message: string; studentId: string } | null>(null);

  // Quick Search & Last Registration side widget state
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [lastRegisteredStudent, setLastRegisteredStudent] = useState<Student | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  // Searchable School Combobox state
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Add School Modal state
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolType, setNewSchoolType] = useState<School['type']>('Government');
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [addSchoolError, setAddSchoolError] = useState('');

  // Delete School state
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeletingSchool, setIsDeletingSchool] = useState(false);
  const [deleteSchoolNotice, setDeleteSchoolNotice] = useState('');

  // Initial Load: Fetch All AP Districts & recent registrations
  useEffect(() => {
    let isMounted = true;
    setIsLoadingDistricts(true);
    fetchDistricts()
      .then(data => {
        if (isMounted) {
          setDistricts(data);
        }
      })
      .catch(err => {
        console.error('Failed to load districts:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDistricts(false);
      });

    fetchStudents()
      .then(data => {
        if (isMounted && data.length > 0) {
          setRecentStudents(data);
          setLastRegisteredStudent(data[0]);
        }
      })
      .catch(err => {
        console.error('Failed to load recent students:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Close school dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setIsSchoolDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler: District selection changed
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
    setSchoolSearchQuery('');

    // Clear downstream validation errors
    setErrors(prev => {
      const next = { ...prev };
      delete next.districtId;
      delete next.mandalId;
      delete next.villageId;
      delete next.schoolId;
      return next;
    });

    if (!districtId) return;

    setIsLoadingMandals(true);
    try {
      const data = await fetchMandals(districtId);
      setMandals(data);
    } catch (err) {
      console.error('Failed to load mandals:', err);
    } finally {
      setIsLoadingMandals(false);
    }
  };

  // Handler: Mandal selection changed
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
    setSchoolSearchQuery('');

    // Clear downstream validation errors
    setErrors(prev => {
      const next = { ...prev };
      delete next.mandalId;
      delete next.villageId;
      delete next.schoolId;
      return next;
    });

    if (!mandalId) return;

    setIsLoadingVillages(true);
    try {
      const data = await fetchVillages(mandalId);
      setVillages(data);
    } catch (err) {
      console.error('Failed to load villages:', err);
    } finally {
      setIsLoadingVillages(false);
    }
  };

  // Handler: Village selection changed
  const handleVillageChange = async (villageId: string) => {
    setFormData(prev => ({
      ...prev,
      villageId,
      schoolId: '',
      schoolName: ''
    }));
    setSchools([]);
    setSchoolSearchQuery('');

    // Clear downstream validation errors
    setErrors(prev => {
      const next = { ...prev };
      delete next.villageId;
      delete next.schoolId;
      return next;
    });

    if (!villageId) return;

    setIsLoadingSchools(true);
    try {
      const data = await fetchSchools(villageId);
      setSchools(data);
    } catch (err) {
      console.error('Failed to load schools:', err);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // Handler: School selection
  const handleSelectSchool = (school: School) => {
    setFormData(prev => ({
      ...prev,
      schoolId: school.id,
      schoolName: school.name
    }));
    setSchoolSearchQuery(school.name);
    setIsSchoolDropdownOpen(false);
    setErrors(prev => {
      const next = { ...prev };
      delete next.schoolId;
      return next;
    });
  };

  // Handler: Quick Add School to selected Village
  const handleAddSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      setAddSchoolError('Please enter school name.');
      return;
    }
    if (!formData.villageId) {
      setAddSchoolError('Please select a village first.');
      return;
    }

    setIsSavingSchool(true);
    setAddSchoolError('');
    try {
      const created = await createSchool(formData.villageId, newSchoolName.trim(), newSchoolType);
      setSchools(prev => [...prev, created]);
      handleSelectSchool(created);
      setIsAddSchoolOpen(false);
      setNewSchoolName('');
    } catch (err: any) {
      setAddSchoolError(err.message || 'Failed to add school.');
    } finally {
      setIsSavingSchool(false);
    }
  };

  const handleDeleteSchool = async (school: School, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete school "${school.name}" from ${selectedVillage?.name || 'village'}?`);
    if (!confirmed) return;

    try {
      await deleteSchool(school.id);
      setSchools(prev => prev.filter(s => s.id !== school.id));
      if (formData.schoolId === school.id) {
        setFormData(prev => ({ ...prev, schoolId: '', schoolName: '' }));
      }
      setDeleteSchoolNotice(`School "${school.name}" deleted successfully.`);
      setTimeout(() => setDeleteSchoolNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete school');
    }
  };

  // Validate single field
  const validateField = (field: keyof StudentFormData, value: string): string | undefined => {
    switch (field) {
      case 'firstName':
        if (!value.trim()) return 'First Name is required.';
        if (!NAME_REGEX.test(value.trim())) {
          return 'First Name must contain valid characters (letters, spaces, dots, hyphens).';
        }
        return undefined;

      case 'lastName':
        if (!value.trim()) return 'Last Name is required.';
        if (!NAME_REGEX.test(value.trim())) {
          return 'Last Name must contain valid characters (letters, spaces, dots, hyphens).';
        }
        return undefined;

      case 'className':
        if (!value.trim()) return 'Class is required. Please select from Class 0 to Class 10.';
        if (!CLASS_OPTIONS.includes(value.trim())) return 'Please select a valid class between Class 0 and Class 10.';
        return undefined;

      case 'fatherName':
        if (!value.trim()) return 'Father Name is required.';
        if (!NAME_REGEX.test(value.trim())) {
          return 'Father Name must contain valid characters.';
        }
        return undefined;

      case 'motherName':
        if (!value.trim()) return 'Mother Name is required.';
        if (!NAME_REGEX.test(value.trim())) {
          return 'Mother Name must contain valid characters.';
        }
        return undefined;

      case 'mobileNumber':
        if (!value.trim()) return 'Mobile Number is required.';
        if (value.replace(/\D/g, '').length !== 10) {
          return 'Mobile Number must contain exactly 10 digits.';
        }
        if (!MOBILE_REGEX.test(value.replace(/\D/g, ''))) {
          return 'Mobile Number must be a valid 10-digit number starting with 6, 7, 8, or 9.';
        }
        return undefined;

      case 'districtId':
        if (!value.trim()) return 'District is required.';
        return undefined;

      case 'mandalId':
        if (!value.trim()) return 'Mandal is required. Please select a District first.';
        return undefined;

      case 'villageId':
        if (!value.trim()) return 'Village is required. Please select a Mandal first.';
        return undefined;

      case 'schoolId':
        if (!value.trim()) return 'School Name is required. Please select a Village first.';
        return undefined;

      default:
        return undefined;
    }
  };

  // Handle Input Changes with strict sanitation for mobile number
  const handleInputChange = (field: keyof StudentFormData, rawValue: string) => {
    let value = rawValue;

    // Mobile Number: strictly digits only, max 10 characters
    if (field === 'mobileNumber') {
      value = rawValue.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    // Run field-level validation if touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  // Handle Blur
  const handleBlur = (field: keyof StudentFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Full Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fieldsToValidate: (keyof StudentFormData)[] = [
      'firstName',
      'lastName',
      'className',
      'fatherName',
      'motherName',
      'mobileNumber',
      'districtId',
      'mandalId',
      'villageId',
      'schoolId'
    ];

    fieldsToValidate.forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched(
      fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error element
      const firstErrorKey = Object.keys(errors)[0] || 'firstName';
      const el = document.getElementById(`input-${firstErrorKey}`);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setSuccessBanner(null);

    try {
      const response = await registerStudent(formData);
      setSuccessBanner({
        message: 'Student Registration Successful',
        studentId: response.student.id
      });
      setLastRegisteredStudent(response.student);
      setRecentStudents(prev => [response.student, ...prev.filter(s => s.id !== response.student.id)]);

      // Notify parent after brief display
      setTimeout(() => {
        onRegistrationSuccess(response.student);
      }, 1200);
    } catch (err: any) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setErrors(prev => ({ ...prev, general: err.message || 'Failed to submit registration.' }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter schools based on search query
  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase())
  );

  const selectedDistrict = districts.find(d => d.id === formData.districtId);
  const selectedMandal = mandals.find(m => m.id === formData.mandalId);
  const selectedVillage = villages.find(v => v.id === formData.villageId);

  // Filter quick search students
  const filteredQuickStudents = recentStudents
    .filter(s => {
      if (!quickSearch.trim()) return true;
      const q = quickSearch.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.schoolName.toLowerCase().includes(q)
      );
    })
    .slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8" id="student-registration-container">
      {/* Success Notification Banner */}
      {successBanner && (
        <div
          id="success-registration-banner"
          className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-sm animate-in fade-in slide-in-from-top-3"
          role="alert"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-emerald-900 tracking-tight">
                {successBanner.message}
              </h3>
              <p className="text-sm text-emerald-800 mt-1">
                Generated Student ID:{' '}
                <span className="font-mono font-bold bg-white text-emerald-900 px-2.5 py-0.5 rounded-md border border-emerald-300 text-base shadow-2xs">
                  {successBanner.studentId}
                </span>
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Redirecting to Student Profile card...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Action Header matching Design Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight" id="form-heading">
            Student Registration
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Enter official details as per Aadhaar and Previous School records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              handleDistrictChange('dist-kurnool').then(() => {
                handleMandalChange('mnd-mantralayam').then(() => {
                  handleVillageChange('vil-madhavaram');
                });
              });
            }}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Auto-Fill AP Hierarchy
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                className: '',
                schoolId: '',
                schoolName: '',
                fatherName: '',
                motherName: '',
                mobileNumber: '',
                colonyStreet: '',
                districtId: '',
                mandalId: '',
                villageId: ''
              });
              setMandals([]);
              setVillages([]);
              setSchools([]);
              setErrors({});
              setTouched({});
            }}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Reset Form
          </button>
        </div>
      </div>

      {/* 12-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Main Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8" id="registration-card">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate id="student-registration-form">
            {/* General Error Alert */}
            {errors.general && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* SECTION 1: Student Details */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  1. Student Details
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="input-firstName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    placeholder="e.g. Sai Krishna"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-300 ${
                      touched.firstName && errors.firstName
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                        : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white'
                    }`}
                    aria-invalid={touched.firstName && !!errors.firstName}
                    aria-describedby={errors.firstName ? 'error-firstName' : undefined}
                  />
                  {touched.firstName && errors.firstName && (
                    <p id="error-firstName" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="input-lastName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={e => handleInputChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    placeholder="e.g. Kuruba"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-300 ${
                      touched.lastName && errors.lastName
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                        : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white'
                    }`}
                    aria-invalid={touched.lastName && !!errors.lastName}
                    aria-describedby={errors.lastName ? 'error-lastName' : undefined}
                  />
                  {touched.lastName && errors.lastName && (
                    <p id="error-lastName" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Parents & Contact */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  2. Parents & Contact
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Step 2 of 3</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Father Name */}
                <div>
                  <label htmlFor="input-fatherName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Father Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={e => handleInputChange('fatherName', e.target.value)}
                    onBlur={() => handleBlur('fatherName')}
                    placeholder="e.g. Venkata Ramana"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-300 ${
                      touched.fatherName && errors.fatherName
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                        : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white'
                    }`}
                    aria-invalid={touched.fatherName && !!errors.fatherName}
                    aria-describedby={errors.fatherName ? 'error-fatherName' : undefined}
                  />
                  {touched.fatherName && errors.fatherName && (
                    <p id="error-fatherName" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.fatherName}
                    </p>
                  )}
                </div>

                {/* Mother Name */}
                <div>
                  <label htmlFor="input-motherName" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Mother Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="input-motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={e => handleInputChange('motherName', e.target.value)}
                    onBlur={() => handleBlur('motherName')}
                    placeholder="e.g. Lakshmi Devi"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-slate-300 ${
                      touched.motherName && errors.motherName
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                        : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white'
                    }`}
                    aria-invalid={touched.motherName && !!errors.motherName}
                    aria-describedby={errors.motherName ? 'error-motherName' : undefined}
                  />
                  {touched.motherName && errors.motherName && (
                    <p id="error-motherName" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.motherName}
                    </p>
                  )}
                </div>

                {/* Mobile Number with +91 badge */}
                <div>
                  <label htmlFor="input-mobileNumber" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="input-mobileNumber"
                      name="mobileNumber"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={e => handleInputChange('mobileNumber', e.target.value)}
                      onBlur={() => handleBlur('mobileNumber')}
                      placeholder="10-digit number"
                      className={`w-full px-4 py-2.5 rounded-r-lg border text-sm transition-all focus:outline-none focus:ring-2 font-mono ${
                        touched.mobileNumber && errors.mobileNumber
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                          : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white'
                      }`}
                      aria-invalid={touched.mobileNumber && !!errors.mobileNumber}
                      aria-describedby={errors.mobileNumber ? 'error-mobileNumber' : undefined}
                    />
                  </div>
                  {touched.mobileNumber && errors.mobileNumber ? (
                    <p id="error-mobileNumber" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.mobileNumber}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">10-digit valid Indian mobile number.</p>
                  )}
                </div>

                {/* Class */}
                <div>
                  <label htmlFor="input-className" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="input-className"
                    name="className"
                    value={formData.className}
                    onChange={e => handleInputChange('className', e.target.value)}
                    onBlur={() => handleBlur('className')}
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 bg-white cursor-pointer ${
                      touched.className && errors.className
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                        : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900'
                    }`}
                    aria-invalid={touched.className && !!errors.className}
                    aria-describedby={errors.className ? 'error-className' : undefined}
                  >
                    <option value="">Select Class (Class 0 – 10)</option>
                    {CLASS_OPTIONS.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {touched.className && errors.className && (
                    <p id="error-className" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.className}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Official Andhra Pradesh Location Hierarchy & School */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  3. Location & School Hierarchy
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Step 3 of 3</span>
              </div>

              {/* Dependent Hierarchy Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. District */}
                <div>
                  <label htmlFor="input-districtId" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="input-districtId"
                      name="districtId"
                      value={formData.districtId}
                      onChange={e => handleDistrictChange(e.target.value)}
                      onBlur={() => handleBlur('districtId')}
                      disabled={isLoadingDistricts}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 bg-white cursor-pointer ${
                        touched.districtId && errors.districtId
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900'
                          : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900'
                      }`}
                      aria-invalid={touched.districtId && !!errors.districtId}
                      aria-describedby={errors.districtId ? 'error-districtId' : undefined}
                    >
                      <option value="">
                        {isLoadingDistricts ? 'Loading...' : 'Select District (26 AP)'}
                      </option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} {d.code ? `(${d.code})` : ''}
                        </option>
                      ))}
                    </select>
                    {isLoadingDistricts && (
                      <div className="absolute right-8 top-3">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  {touched.districtId && errors.districtId && (
                    <p id="error-districtId" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.districtId}
                    </p>
                  )}
                </div>

                {/* 2. Mandal */}
                <div>
                  <label htmlFor="input-mandalId" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Mandal <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="input-mandalId"
                      name="mandalId"
                      value={formData.mandalId}
                      onChange={e => handleMandalChange(e.target.value)}
                      onBlur={() => handleBlur('mandalId')}
                      disabled={!formData.districtId || isLoadingMandals}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                        !formData.districtId
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                          : touched.mandalId && errors.mandalId
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900 bg-white cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white cursor-pointer'
                      }`}
                      aria-invalid={touched.mandalId && !!errors.mandalId}
                      aria-describedby={errors.mandalId ? 'error-mandalId' : undefined}
                    >
                      <option value="">
                        {!formData.districtId
                          ? 'Select District first'
                          : isLoadingMandals
                          ? 'Loading Mandals...'
                          : mandals.length === 0
                          ? 'No Mandals'
                          : 'Select Mandal'}
                      </option>
                      {mandals.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    {isLoadingMandals && (
                      <div className="absolute right-8 top-3">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  {touched.mandalId && errors.mandalId && (
                    <p id="error-mandalId" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.mandalId}
                    </p>
                  )}
                </div>

                {/* 3. Village */}
                <div>
                  <label htmlFor="input-villageId" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="input-villageId"
                      name="villageId"
                      value={formData.villageId}
                      onChange={e => handleVillageChange(e.target.value)}
                      onBlur={() => handleBlur('villageId')}
                      disabled={!formData.mandalId || isLoadingVillages}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                        !formData.mandalId
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                          : touched.villageId && errors.villageId
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900 bg-white cursor-pointer'
                          : 'border-slate-200 hover:border-slate-300 focus:border-transparent focus:ring-blue-500 text-slate-900 bg-white cursor-pointer'
                      }`}
                      aria-invalid={touched.villageId && !!errors.villageId}
                      aria-describedby={errors.villageId ? 'error-villageId' : undefined}
                    >
                      <option value="">
                        {!formData.mandalId
                          ? 'Select Mandal first'
                          : isLoadingVillages
                          ? 'Loading Villages...'
                          : villages.length === 0
                          ? 'No Villages'
                          : 'Select Village'}
                      </option>
                      {villages.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                    {isLoadingVillages && (
                      <div className="absolute right-8 top-3">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                  {touched.villageId && errors.villageId && (
                    <p id="error-villageId" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.villageId}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Searchable School Name combobox */}
              <div className="mt-4" ref={schoolDropdownRef}>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="input-schoolId" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    School Name <span className="text-red-500">*</span>
                    {selectedVillage && (
                      <span className="ml-1.5 font-normal text-slate-400 text-xs lowercase">
                        (showing schools in {selectedVillage.name})
                      </span>
                    )}
                  </label>
                  {formData.villageId && isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsAddSchoolOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Add School to {selectedVillage?.name || 'Village'}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <SchoolIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="input-schoolId"
                      readOnly={!formData.villageId}
                      placeholder={
                        !formData.villageId
                          ? 'Select Village first to load schools...'
                          : isLoadingSchools
                          ? 'Loading schools...'
                          : 'Search or select School Name...'
                      }
                      value={formData.schoolName || schoolSearchQuery}
                      onChange={e => {
                        if (!formData.villageId) return;
                        setSchoolSearchQuery(e.target.value);
                        setIsSchoolDropdownOpen(true);
                        if (formData.schoolName && e.target.value !== formData.schoolName) {
                          setFormData(prev => ({ ...prev, schoolId: '', schoolName: '' }));
                        }
                      }}
                      onFocus={() => {
                        if (formData.villageId) {
                          setIsSchoolDropdownOpen(true);
                        }
                      }}
                      disabled={!formData.villageId}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                        !formData.villageId
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                          : touched.schoolId && errors.schoolId
                          ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-200 text-rose-900 bg-white'
                          : 'border-blue-200 bg-slate-50/70 hover:border-blue-300 focus:border-transparent focus:ring-blue-500 text-slate-900'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                      {isLoadingSchools ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Search className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu for Schools */}
                  {isSchoolDropdownOpen && formData.villageId && (
                    <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map(school => (
                          <div
                            key={school.id}
                            className={`w-full px-3.5 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between gap-2 cursor-pointer group ${
                              formData.schoolId === school.id ? 'bg-blue-50/80 font-semibold text-blue-900' : 'text-slate-800'
                            }`}
                            onClick={() => handleSelectSchool(school)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Building className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="truncate">{school.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {school.type && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                                  {school.type}
                                </span>
                              )}
                              {isAdmin && (
                                <button
                                  type="button"
                                  title={`Delete ${school.name}`}
                                  onClick={(e) => handleDeleteSchool(school, e)}
                                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-sm text-slate-500">
                            No schools found for &ldquo;{schoolSearchQuery}&rdquo; in {selectedVillage?.name}.
                          </p>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewSchoolName(schoolSearchQuery);
                                setIsAddSchoolOpen(true);
                                setIsSchoolDropdownOpen(false);
                              }}
                              className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            >
                              + Add &ldquo;{schoolSearchQuery || 'New School'}&rdquo; to {selectedVillage?.name} database
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {deleteSchoolNotice && (
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {deleteSchoolNotice}
                  </p>
                )}

                {touched.schoolId && errors.schoolId && (
                  <p id="error-schoolId" className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.schoolId}
                  </p>
                )}
              </div>

              {/* Colony / Street */}
              <div className="mt-4">
                <label htmlFor="input-colonyStreet" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Colony / Street / Landmark
                </label>
                <input
                  type="text"
                  id="input-colonyStreet"
                  name="colonyStreet"
                  value={formData.colonyStreet}
                  onChange={e => handleInputChange('colonyStreet', e.target.value)}
                  placeholder="e.g. Near Ramanjaneya Temple, Main Road"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm transition-all focus:outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* SECTION 4: Register Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                id="btn-register-student"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-blue-200 active:transform transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Registration...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-6 h-6" />
                    <span>REGISTER STUDENT</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-2.5">
                Official Enrollment • Unique Student ID (e.g. BBT000001) generated automatically
              </p>
            </div>
          </form>
        </div>

        {/* Right 4 Cols: Quick Search & Last Registration Card */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Card 1: Quick Search */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Quick Search</h3>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase font-bold border border-blue-100">
                Database
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Filter registered students..."
                value={quickSearch}
                onChange={e => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* List of recent records */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredQuickStudents.length > 0 ? (
                filteredQuickStudents.map(s => (
                  <div
                    key={s.id}
                    onClick={() => onSelectStudent && onSelectStudent(s)}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer flex items-center justify-between gap-2 text-left group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {s.className} • {s.schoolName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                      {s.id}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400">
                  {recentStudents.length === 0 ? 'No registered students yet' : 'No matches found'}
                </div>
              )}
            </div>

            {onViewAllRecords && isAdmin && (
              <button
                type="button"
                onClick={onViewAllRecords}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
              >
                View All Records ({recentStudents.length}) →
              </button>
            )}
          </div>

          {/* Card 2: Last Successful Registration in Emerald */}
          {lastRegisteredStudent ? (
            <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
              <div className="flex items-center space-x-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>Last Registration</span>
              </div>
              <h4 className="text-xl font-bold mb-0.5 tracking-tight truncate">
                {lastRegisteredStudent.firstName} {lastRegisteredStudent.lastName}
              </h4>
              <p className="text-xs text-emerald-100 font-mono mb-4">
                Assigned ID: {lastRegisteredStudent.id} • {lastRegisteredStudent.className}
              </p>
              <div className="flex space-x-2">
                {onPrintStudent && (
                  <button
                    type="button"
                    onClick={() => onPrintStudent(lastRegisteredStudent)}
                    className="flex-1 py-2 bg-white text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer shadow-xs text-center"
                  >
                    PRINT PROFILE
                  </button>
                )}
                {onSelectStudent && isAdmin && (
                  <button
                    type="button"
                    onClick={() => onSelectStudent(lastRegisteredStudent)}
                    className="flex-1 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs text-center border border-emerald-500/40"
                  >
                    VIEW PROFILE
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
              <div className="flex items-center space-x-2 text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>Live Enrollment Engine</span>
              </div>
              <h4 className="text-base font-bold mb-1">Official Andhra Pradesh Portal</h4>
              <p className="text-xs text-emerald-100">
                All 26 districts connected. Enter student data to generate certified registration record.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New School to current Village (Admin Only) */}
      {isAddSchoolOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">
                Add School to {selectedVillage?.name}
              </h4>
              <button
                type="button"
                onClick={() => setIsAddSchoolOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchoolSubmit} className="mt-4 space-y-4">
              {addSchoolError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                  {addSchoolError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Path
                </label>
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 font-mono">
                  {selectedDistrict?.name} → {selectedMandal?.name} → {selectedVillage?.name}
                </div>
              </div>

              <div>
                <label htmlFor="modal-new-school-name" className="block text-xs font-semibold text-slate-700 mb-1">
                  School Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="modal-new-school-name"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  placeholder="e.g. ZPHS Madhavaram"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="modal-new-school-type" className="block text-xs font-semibold text-slate-700 mb-1">
                  School Category
                </label>
                <select
                  id="modal-new-school-type"
                  value={newSchoolType}
                  onChange={e => setNewSchoolType(e.target.value as School['type'])}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white"
                >
                  <option value="Government">Government High School</option>
                  <option value="Zilla Parishad">Zilla Parishad (ZPHS)</option>
                  <option value="Mandal Parishad">Mandal Parishad (MPPS)</option>
                  <option value="Aided">Aided School</option>
                  <option value="Private">Private School</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSchool}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSavingSchool ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
