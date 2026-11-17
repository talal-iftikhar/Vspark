'use client';

import React from 'react';
import { Edit3, Trash2, Mail, MapPin } from 'lucide-react';
import { Student } from '@/types';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onEdit,
  onDelete,
}) => {
  const getCgpaBadge = (cgpa: number) => {
    if (cgpa >= 3.5) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    if (cgpa >= 3.0) return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Student</th>
              <th scope="col" className="px-4 py-3.5">Roll Number</th>
              <th scope="col" className="px-4 py-3.5">Department</th>
              <th scope="col" className="px-4 py-3.5">Semester</th>
              <th scope="col" className="px-4 py-3.5">CGPA</th>
              <th scope="col" className="px-4 py-3.5">Campus</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={student.name}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-xs">
                        {student.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {student.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {student.roll_number}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {student.department}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                  {student.semester}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getCgpaBadge(
                      Number(student.cgpa)
                    )}`}
                  >
                    {Number(student.cgpa).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {student.campus_city || 'Main'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      student.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : student.status === 'Graduated'
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(student)}
                      title="Edit Student"
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(student)}
                      title="Delete Student"
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
