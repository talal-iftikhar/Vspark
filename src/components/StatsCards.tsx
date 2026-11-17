'use client';

import React from 'react';
import { Users, Award, BookOpen, TrendingUp } from 'lucide-react';
import { Student } from '@/types';

interface StatsCardsProps {
  students: Student[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ students }) => {
  const total = students.length;

  const avgCgpa = total > 0
    ? (students.reduce((acc, s) => acc + (Number(s.cgpa) || 0), 0) / total).toFixed(2)
    : '0.00';

  const departments = Array.from(new Set(students.map((s) => s.department).filter(Boolean)));

  const highestCgpa = total > 0
    ? Math.max(...students.map((s) => Number(s.cgpa) || 0)).toFixed(2)
    : '0.00';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Enrolled</span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{total}</p>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Verified Active Records</span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Average CGPA</span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{avgCgpa}</p>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Scale of 4.00 Max</span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Departments</span>
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{departments.length}</p>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">Faculties Represented</span>
      </div>

      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Honor Roll CGPA</span>
          <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{highestCgpa}</p>
        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Top Student Benchmark</span>
      </div>
    </div>
  );
};
