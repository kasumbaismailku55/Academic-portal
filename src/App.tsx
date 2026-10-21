/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Navbar } from './components/layout/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherPortal } from './components/teacher/TeacherPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { SchoolSubscriptionModal } from './components/subscription/SchoolSubscriptionModal';
import { WelcomeLandingPage } from './components/welcome/WelcomeLandingPage';
import { SuperAdminDashboard } from './components/welcome/SuperAdminDashboard';
import { MobileMoneyPaymentModal } from './components/payment/MobileMoneyPaymentModal';
import {
  Shield,
  Users,
  BookOpen,
  GraduationCap,
  Sparkles,
  Building,
  Bell,
  X,
  AlertTriangle,
  WifiOff,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  CreditCard,
  Database,
  ExternalLink,
  ArrowLeft,
  Globe,
  PhoneCall,
} from 'lucide-react';

function AppContent() {
  const {
    viewMode,
    navigateToWelcome,
    schools,
    currentSchool,
    currentSession,
    loginAs,
    notifications,
    students,
    assessments,
    isSuperAdmin,
    superAdminEmail,
    superAdminPhone,
    toggleBlockSchool,
    renewSubscription,
    switchSchool,
    getSchoolAppUrl,
  } = usePortal();

  // Active view tab inside school portal
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showRenewalPaymentModal, setShowRenewalPaymentModal] = useState(false);
  const [renewalBillingCycle, setRenewalBillingCycle] = useState<'termly' | 'annual'>('annual');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor offline / online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync default tab when role switches
  useEffect(() => {
    if (currentSession?.role === 'admin') {
      setActiveTab('overview');
    } else if (currentSession?.role === 'class_teacher') {
      setActiveTab('class_roster');
    } else if (currentSession?.role === 'subject_teacher') {
      setActiveTab('subject_marks');
    } else if (currentSession?.role === 'parent') {
      setActiveTab('progress');
    }
  }, [currentSession?.role]);

  // If user is on Welcome landing page
  if (viewMode === 'welcome') {
    return <WelcomeLandingPage />;
  }

  // If user is inside System Creator overall administrator portal
  if (viewMode === 'superadmin') {
    return <SuperAdminDashboard />;
  }

  // Subscription expiration check
  const isExpired = currentSchool && (
    currentSchool.subscriptionStatus === 'expired' ||
    new Date(currentSchool.subscriptionExpiresAt).getTime() < Date.now()
  );

  const daysLeft = currentSchool ? Math.max(
    0,
    Math.ceil((new Date(currentSchool.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  ) : 0;

  const handleStartRenewal = (cycle: 'termly' | 'annual') => {
    setRenewalBillingCycle(cycle);
    setShowRenewalPaymentModal(true);
  };

  const handleRenewalPaymentSuccess = (paymentData: any) => {
    renewSubscription(
      currentSchool.id,
      currentSchool.subscriptionPlan,
      renewalBillingCycle,
      paymentData.paymentMethod,
      paymentData.payerPhoneOrCard
    );
    setShowRenewalPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Offline Mode Banner (PWA Service Worker Active) */}
      {!isOnline && (
        <aside aria-label="Offline Mode Notice" className="bg-amber-600 text-white px-4 py-2 text-xs flex items-center justify-between font-medium shadow-xs z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
              <span>
                <strong>Offline Paperless PWA Active:</strong> You are currently disconnected. All cached student records, AOI assessments, and syllabi remain fully accessible locally.
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] bg-black/20 px-2 py-0.5 rounded">
              Local Vault In-Sync
            </span>
          </div>
        </aside>
      )}

      {/* Top Navigation Bar */}
      <Navbar
        onOpenSubscription={() => setShowSubscriptionModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setShowNotificationsModal(true)}
      />

      {/* Institutional Breadcrumb Bar */}
      <section className="no-print bg-slate-100/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={navigateToWelcome}
              className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Schools</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              {currentSchool.badgeUrl && (
                <img
                  src={currentSchool.badgeUrl}
                  alt={currentSchool.name}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              )}
              <span>{currentSchool.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Subscription Status Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
              currentSchool.isBlocked
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : isExpired
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              <Calendar className="w-3 h-3" />
              {currentSchool.isBlocked
                ? 'Portal Suspended'
                : isExpired
                ? 'Subscription Expired'
                : `${daysLeft} Days Active (${currentSchool.subscriptionBilling})`}
            </div>

            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Building className="w-3 h-3" />
              <span>Subscribe New School</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* CHECK 1: SCHOOL IS BLOCKED BY SUPER ADMIN */}
        {currentSchool.isBlocked ? (
          <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900">
                Institutional Access Suspended
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {currentSchool.name} is Temporarily Blocked
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
                Portal operations for this institution have been suspended by the Overall System Administrator (
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{superAdminEmail}</span>).
                Teacher grade input and parent report card viewing are currently paused.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution Code:</span>
                <span className="font-mono font-bold">{currentSchool.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Admin:</span>
                <span>{currentSchool.adminEmail || currentSchool.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Suspension Reason:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {currentSchool.blockedReason || 'Administrative Review by Overall System Administrator'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Student Database:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {students.length} Learners Preserved
                </span>
              </div>
            </div>

            {/* Actions for blocked portal */}
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  Contact System Creator to resolve suspension: <strong>{superAdminPhone}</strong>
                </span>
              </div>

              <button
                onClick={navigateToWelcome}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Institutional Directory
              </button>
            </div>
          </div>
        ) : isExpired ? (
          /* CHECK 2: SUBSCRIPTION HAS EXPIRED */
          <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                Subscription Term Concluded
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {currentSchool.name} Subscription Has Ended
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
                The {currentSchool.subscriptionBilling} billing cycle for this institution concluded on{' '}
                <strong className="text-slate-800 dark:text-slate-200">
                  {new Date(currentSchool.subscriptionExpiresAt).toLocaleDateString()}
                </strong>
                . Renew via MTN MoMo, Airtel Money, or Visa Card (synced to <strong>{superAdminPhone}</strong>) to restore instantaneous access across all Teacher, Class Master, and Parent portals.
              </p>
            </div>

            {/* Permanent Storage Assurance Box */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <Database className="w-4 h-4 text-emerald-600" />
                Permanent Data Stored Guarantee
              </div>
              <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-normal">
                No student records, continuous assessments, or report cards have been deleted! All <strong>{students.length} learners</strong>, <strong>{assessments.length} assessment marks</strong>, and teacher staff accounts remain intact in the database and will reactivate immediately upon renewal.
              </p>
            </div>

            {/* Instant Renewal Options with Mobile Money & Card Integration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleStartRenewal('termly')}
                className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/40 text-left hover:border-indigo-500 hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Termly Renewal</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">UGX 180,000</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  3 Months (90 days) full portal access for all streams.
                </p>
                <div className="mt-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                  Pay via MoMo / Visa &rarr;
                </div>
              </button>

              <button
                onClick={() => handleStartRenewal('annual')}
                className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-left hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Best Value
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Annual Pass</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">UGX 480,000</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Full 12 Months (365 days) unrestricted access + save 30%.
                </p>
                <div className="mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                  Pay via MoMo / Visa &rarr;
                </div>
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-3">
              <button
                onClick={navigateToWelcome}
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to All Schools Directory
              </button>
            </div>
          </div>
        ) : (
          /* STANDARD ACTIVE PORTAL VIEWS */
          <>
            {currentSession?.role === 'admin' && <AdminDashboard activeTab={activeTab} />}

            {(currentSession?.role === 'class_teacher' || currentSession?.role === 'subject_teacher') && (
              <TeacherPortal activeTab={activeTab} />
            )}

            {currentSession?.role === 'parent' && <ParentPortal activeTab={activeTab} />}

            {!currentSession && (
              <div className="text-center py-16 space-y-4">
                <h2 className="text-xl font-bold">Select a Portal to Begin</h2>
                <p className="text-xs text-slate-500">
                  Choose your role above or log in with your institutional credentials.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] py-6 px-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">EduPortal OS</span>
            <span>·</span>
            <span>Academic Management &amp; Activities of Integration Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Tenant: <strong className="text-slate-700 dark:text-slate-300">{currentSchool.name}</strong></span>
            <span>Namespace: <strong className="font-mono">{currentSchool.code}</strong></span>
            <span>Plan: <strong className="text-indigo-600 dark:text-indigo-400">{currentSchool.subscriptionPlan}</strong></span>
            <span className="hidden md:inline font-mono text-slate-400">?school={currentSchool.slug}</span>
          </div>
        </div>
      </footer>

      {/* New School Subscription Modal */}
      <SchoolSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {/* Renewal Payment Modal */}
      <MobileMoneyPaymentModal
        isOpen={showRenewalPaymentModal}
        onClose={() => setShowRenewalPaymentModal(false)}
        schoolName={currentSchool.name}
        planName={currentSchool.subscriptionPlan}
        billingCycle={renewalBillingCycle}
        onSuccess={handleRenewalPaymentSuccess}
      />

      {/* Urgent Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Administrative Broadcasts
                </h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    n.priority === 'urgent'
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{n.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/10">
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">{n.message}</p>
                  <div className="text-[10px] text-slate-400 pt-1 font-mono">
                    Sent {new Date(n.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PortalProvider>
      <AppContent />
    </PortalProvider>
  );
}
