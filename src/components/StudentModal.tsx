'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Student } from '@/types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSave: (studentData: Partial<Student>) => Promise<void>;
}

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Artificial Intelligence',
  'Data Science',
  'Electrical Engineering',
  'Cyber Security',
  'Business Administration',
];

const SEMESTERS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Faisalabad', 'Multan'];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    semester: '1st',
    cgpa: '3.50',
    campus_city: 'Karachi',
    status: 'Active' as 'Active' | 'Graduated' | 'Suspended',
    avatar_url: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name,
        roll_number: studentToEdit.roll_number,
        email: studentToEdit.email,
        phone: studentToEdit.phone || '',
        department: studentToEdit.department,
        semester: studentToEdit.semester,
        cgpa: String(studentToEdit.cgpa),
        campus_city: studentToEdit.campus_city || 'Karachi',
        status: studentToEdit.status,
        avatar_url: studentToEdit.avatar_url || '',
      });
      setPreviewUrl(studentToEdit.avatar_url || '');
    } else {
      setFormData({
        name: '',
        roll_number: '',
        email: '',
        phone: '',
        department: 'Computer Science',
        semester: '1st',
        cgpa: '3.50',
        campus_city: 'Karachi',
        status: 'Active',
        avatar_url: '',
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setError(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const uploadAvatarToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage Upload Error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('student-avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Cloud Storage Upload failed:', err);
      setError(`Storage upload failed: ${err.message || 'Please check storage bucket'}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim() || !formData.roll_number.trim() || !formData.email.trim()) {
      setError('Please provide Name, Roll Number, and Email.');
      return;
    }

    const parsedCgpa = parseFloat(formData.cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 4.0) {
      setError('CGPA must be a valid number between 0.00 and 4.00.');
      return;
    }

    setSubmitting(true);
    try {
      let finalAvatarUrl = formData.avatar_url;

      // Handle binary file upload if user selected an image
      if (selectedFile) {
        const uploadedUrl = await uploadAvatarToSupabase(selectedFile);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }

      await onSave({
        name: formData.name.trim(),
        roll_number: formData.roll_number.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        department: formData.department,
        semester: formData.semester,
        cgpa: parsedCgpa,
        campus_city: formData.campus_city,
        status: formData.status,
        avatar_url: finalAvatarUrl,
      });

      onClose();
    } catch (err: any) {
      console.error('Save Student Error:', err);
      setError(err.message || 'Failed to save student record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {studentToEdit ? 'Edit Student Record' : 'Register New Student'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete student credentials, profile photo, and academic metrics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Cloud Storage: Avatar Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Profile Photo (Supabase Cloud Storage)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{selectedFile ? 'Change Photo' : 'Upload Image'}</span>
                </label>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  PNG, JPG, or WEBP up to 5MB. Uploads directly to bucket.
                </p>
              </div>
            </div>
          </div>

          {/* Full Name & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Talal Iftikhar"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                placeholder="e.g. SE-2024-001"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@university.edu"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Department & Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem} Semester
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CGPA, Campus City & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CGPA (0 - 4.0) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                required
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus City
              </label>
              <select
                value={formData.campus_city}
                onChange={(e) => setFormData({ ...formData, campus_city: e.target.value })}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'Active' | 'Graduated' | 'Suspended' })
                }
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{studentToEdit ? 'Update Student' : 'Create Student'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
