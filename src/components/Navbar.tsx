import React from 'react';
import { Mic, Flame, User, LogOut, Sparkles, History } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  isDemo: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isDemo,
  onOpenAuth,
  onSignOut,
  onToggleHistory,
  showHistory,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 ring-1 ring-brand-400/30">
            <Mic className="w-5 h-5 animate-pulse-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-brand-600 bg-clip-text text-transparent">
                SpeakDaily
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200/70">
                AI Coach
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Daily English Speaking Fluency
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 font-semibold text-xs shadow-sm">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>{user?.streak_count || 1} Day Streak</span>
          </div>

          {/* Toggle History Log */}
          <button
            onClick={onToggleHistory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showHistory
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
            title="View Past Practice Sessions"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My Sessions</span>
          </button>

          {/* Authentication State */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isDemo ? 'Recruiter Demo' : 'Supabase Active'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 border border-brand-300 flex items-center justify-center font-bold text-xs">
                {(user.full_name || user.email)[0].toUpperCase()}
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-sm shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
