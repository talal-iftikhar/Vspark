'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Student } from '@/types';
import { Navbar } from '@/components/Navbar';
import { StatsCards } from '@/components/StatsCards';
import { CampusWeatherWidget } from '@/components/CampusWeatherWidget';
import { StudentCard } from '@/components/StudentCard';
import { StudentTable } from '@/components/StudentTable';
import { StudentModal } from '@/components/StudentModal';
import { DeleteModal } from '@/components/DeleteModal';
import { AuthModal } from '@/components/AuthModal';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'cgpa' | 'roll'>('cgpa');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals & Dialogs
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch Students from Supabase (READ operation)
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      showToast(err.message || 'Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Auth initialization & listener
  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchStudents();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    showToast('Signed out of session');
  };

  // 3. Save Student (CREATE or UPDATE operation)
  const handleSaveStudent = async (studentData: Partial<Student>) => {
    if (studentToEdit) {
      // UPDATE
      const { error } = await supabase
        .from('students')
        .update({
          ...studentData,
          user_id: user?.id || studentToEdit.user_id,
        })
        .eq('id', studentToEdit.id);

      if (error) throw error;
      showToast(`Student ${studentData.name} updated successfully!`);
    } else {
      // CREATE
      const { error } = await supabase.from('students').insert([
        {
          ...studentData,
          user_id: user?.id || null,
        },
      ]);

      if (error) throw error;
      showToast(`Student ${studentData.name} enrolled successfully!`);
    }

    await fetchStudents();
  };

  // 4. Delete Student (DELETE operation)
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentToDelete.id);

      if (error) throw error;

      showToast(`Student ${studentToDelete.name} deleted.`);
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
      await fetchStudents();
    } catch (err: any) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // 5. Seed Demo Data fallback
  const handleSeedData = async () => {
    setLoading(true);
    try {
      const sample = [
        {
          name: 'Talal Iftikhar',
          roll_number: 'SE-2023-042',
          email: 'talal.iftikhar@university.edu',
          phone: '+92 300 1234567',
          department: 'Software Engineering',
          semester: '6th',
          cgpa: 3.82,
          campus_city: 'Karachi',
          status: 'Active',
          avatar_url:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        },
        {
          name: 'Ayesha Malik',
          roll_number: 'CS-2023-018',
          email: 'ayesha.malik@university.edu',
          phone: '+92 312 9876543',
          department: 'Computer Science',
          semester: '4th',
          cgpa: 3.91,
          campus_city: 'Lahore',
          status: 'Active',
          avatar_url:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        },
      ];

      const { error } = await supabase.from('students').insert(sample);
      if (error) throw error;
      showToast('Loaded demo student batch!');
      await fetchStudents();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Departments list for filtering
  const allDepartments = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.department && set.add(s.department));
    return ['All', ...Array.from(set)];
  }, [students]);

  // Filtered & Sorted student list
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept = selectedDept === 'All' || student.department === selectedDept;
        const matchesSemester = selectedSemester === 'All' || student.semester === selectedSemester;

        return matchesSearch && matchesDept && matchesSemester;
      })
      .sort((a, b) => {
        if (sortBy === 'cgpa') return Number(b.cgpa) - Number(a.cgpa);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return a.roll_number.localeCompare(b.roll_number);
      });
  }, [students, searchQuery, selectedDept, selectedSemester, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-200 animate-slide-up text-xs sm:text-sm font-medium">
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenAddModal={() => {
          setStudentToEdit(null);
          setIsStudentModalOpen(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time External Weather API integration banner */}
        <CampusWeatherWidget />

        {/* Statistical Metrics Dashboard */}
        <StatsCards students={students} />

        {/* Controls Bar: Search, Filters, View Modes */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name, roll number, or email..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {allDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      Dept: {dept}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="All">All Semesters</option>
                {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((sem) => (
                  <option key={sem} value={sem}>
                    {sem} Sem
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="cgpa">Sort: Highest CGPA</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="roll">Sort: Roll Number</option>
              </select>

              {/* View Switch */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid Card View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Data Table View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchStudents}
                title="Refresh Database Records"
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section: Grid or Table */}
        {loading && students.length === 0 ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Querying PostgreSQL database...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
              No Student Records Found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedDept !== 'All'
                ? 'Try modifying your search query or department filter.'
                : 'Get started by creating your first student profile with photo upload.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setStudentToEdit(null);
                  setIsStudentModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Student</span>
              </button>
              <button
                onClick={handleSeedData}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Seed Sample Data</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={(s) => {
                  setStudentToEdit(s);
                  setIsStudentModalOpen(true);
                }}
                onDelete={(s) => {
                  setStudentToDelete(s);
                  setIsDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <StudentTable
            students={filteredStudents}
            onEdit={(s) => {
              setStudentToEdit(s);
              setIsStudentModalOpen(true);
            }}
            onDelete={(s) => {
              setStudentToDelete(s);
              setIsDeleteModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Student Create / Update Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        studentToEdit={studentToEdit}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        student={studentToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          showToast('Authentication state refreshed');
        }}
      />
    </div>
  );
}
