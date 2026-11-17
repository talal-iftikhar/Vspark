'use client';

import React from 'react';
import { Mail, Phone, Edit3, Trash2, MapPin } from 'lucide-react';
import { Student } from '@/types';

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onDelete,
}) => {
  const getCgpaColor = (cgpa: number) => {
    if (cgpa >= 3.5) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    if (cgpa >= 3.0) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800';
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div>
        {/* Top Header: Avatar & CGPA */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            {student.avatar_url ? (
              <img
                src={student.avatar_url}
                alt={student.name}
                className="h-14 w-14 rounded-xl object-cover border-2 border-indigo-100 dark:border-slate-700 shadow-sm"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 font-bold text-lg text-white shadow-sm">
                {getInitials(student.name)}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                student.status === 'Active'
                  ? 'bg-emerald-500'
                  : student.status === 'Graduated'
                  ? 'bg-sky-500'
                  : 'bg-rose-500'
              }`}
              title={`Status: ${student.status}`}
            />
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${getCgpaColor(
                Number(student.cgpa)
              )}`}
            >
              CGPA {Number(student.cgpa).toFixed(2)}
            </span>
            <p className="mt-1 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
              {student.roll_number}
            </p>
          </div>
        </div>

        {/* Student Details */}
        <div className="mt-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 transition-colors">
            {student.name}
          </h3>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {student.department}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Sem {student.semester}
            </span>
            {student.campus_city && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <MapPin className="w-2.5 h-2.5" />
                {student.campus_city}
              </span>
            )}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{student.email}</span>
            </div>
            {student.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{student.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
        <button
          onClick={() => onEdit(student)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 rounded-lg transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(student)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
