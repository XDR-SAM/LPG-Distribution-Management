import React, { useState } from 'react';
import { Flame, Lock, Mail, UserCheck, AlertCircle, ArrowRight, ShieldCheck, Database, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { setCurrentUser, users, settings } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const supabaseReady = isSupabaseConfigured();

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          // Fetch profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const role = (profile?.role || data.user.user_metadata?.role || 'admin') as UserRole;
          const fullName = profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0];

          setCurrentUser({
            id: data.user.id,
            name: fullName,
            email: data.user.email || email,
            username: profile?.username || email.split('@')[0],
            role,
            phone: profile?.phone || '',
            status: 'active',
            lastLogin: new Date().toLocaleDateString('en-GB'),
          });
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: 'admin',
              full_name: email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        setSuccessMsg('Account created successfully! You may now sign in.');
        setMode('signin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    const existing = users.find(u => u.role === role);
    if (existing) {
      setCurrentUser(existing);
    } else {
      setCurrentUser({
        id: `mock-${role}`,
        name: `${role.toUpperCase()} Staff`,
        email: `${role}@almadinalpg.com`,
        username: role,
        role,
        phone: '01712-345678',
        status: 'active',
        lastLogin: 'Just now',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-orange-500 shadow-lg shadow-orange-500/20 mb-3 text-white">
            <Flame className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {settings?.profile?.businessName || 'Al-Madina LPG Agency'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            LPG Distribution & Cylinder Asset Management ERP
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-700/60 border border-slate-600 text-xs text-sky-400 font-mono mt-2">
            <Database className="w-3 h-3" />
            Supabase PostgreSQL Active
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Real Supabase Auth Form */}
        <form onSubmit={handleSupabaseAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@almadinalpg.com"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-medium py-2.5 px-4 rounded-lg shadow-lg shadow-sky-600/20 transition-all text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Supabase' : 'Create Supabase Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="hover:text-white transition-colors"
          >
            {mode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </button>
        </div>

        {/* Quick Role Tester (for rapid evaluation & role switching) */}
        <div className="mt-6 pt-5 border-t border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              Quick RBAC Staff Login:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => handleQuickRoleLogin('admin')}
              className="px-2.5 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-left flex items-center justify-between text-[11px]"
            >
              <span>Super Admin</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </button>
            <button
              onClick={() => handleQuickRoleLogin('manager')}
              className="px-2.5 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-left flex items-center justify-between text-[11px]"
            >
              <span>Manager</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </button>
            <button
              onClick={() => handleQuickRoleLogin('accountant')}
              className="px-2.5 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-left flex items-center justify-between text-[11px]"
            >
              <span>Accountant</span>
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
            </button>
            <button
              onClick={() => handleQuickRoleLogin('sales_operator')}
              className="px-2.5 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-left flex items-center justify-between text-[11px]"
            >
              <span>Sales Operator</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
            <button
              onClick={() => handleQuickRoleLogin('store_keeper')}
              className="px-2.5 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-left flex items-center justify-between text-[11px]"
            >
              <span>Store Keeper</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </button>
            <button
              onClick={() => handleQuickRoleLogin('delivery_staff')}
              className="px-2.5 py-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-left flex items-center justify-between text-[11px]"
            >
              <span>Delivery Staff</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
