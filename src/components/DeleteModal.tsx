'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Student } from '@/types';

interface DeleteModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  student,
  onClose,
  onConfirm,
  deleting,
}) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Student Record?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action permanently deletes this student from PostgreSQL.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <p className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            {student.name}
          </p>
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {student.roll_number} • {student.department}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-sm shadow-rose-600/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
