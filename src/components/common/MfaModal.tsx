import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Smartphone, KeyRound, AlertCircle } from 'lucide-react';

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  expectedPin: string;
  learnerName: string;
  studentCode: string;
  error?: string;
}

export const MfaModal: React.FC<MfaModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  expectedPin,
  learnerName,
  studentCode,
  error,
}) => {
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleQuickFill = () => {
    setOtp(expectedPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length === 6) {
      onVerify(otp.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Multi-Factor Authentication
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifying access for {learnerName} ({studentCode})
            </p>
          </div>
        </div>

        {/* Security Simulation Notice */}
        <div className="p-3.5 mb-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              Simulated SMS / Authenticator Code
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Filled!' : 'Quick Fill Code'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Registered One-Time Passcode:</span>
            <span className="font-mono text-sm tracking-widest font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700/80 px-2.5 py-0.5 rounded-md">
              {expectedPin}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Enter 6-Digit Verification Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-center font-mono tracking-widest text-lg font-bold bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={otp.length !== 6}
              className="flex-1 py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs"
            >
              Verify &amp; Proceed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
