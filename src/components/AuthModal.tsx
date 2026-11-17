'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session) {
          setSuccessMsg('Account created and signed in successfully!');
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1000);
        } else {
          setSuccessMsg('Registration submitted! Check email or sign in directly.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setSuccessMsg('Welcome back! Signed in successfully.');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@vspark.edu');
    setPassword('VsparkAdmin2026!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isSignUp ? 'Create Faculty / Admin Account' : 'Sign In to Portal'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supabase Auth with secure session tokens
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

        {successMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="mt-4 flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              !isSignUp
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              isSignUp
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Register Account
          </button>
        </div>

        <form onSubmit={handleAuth} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@vspark.edu"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-4 text-xs sm:text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Demo Credentials for Fast Evaluation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
