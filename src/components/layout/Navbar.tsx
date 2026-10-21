import React, { useState, useEffect } from 'react';
import { usePortal } from '../../context/PortalContext';
import {
  Sun,
  Moon,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ChevronDown,
  Plus,
  Shield,
  BookOpen,
  Users,
  GraduationCap,
  Bell,
  Download,
  WifiOff,
  Globe,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  onOpenSubscription: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubscription,
  activeTab,
  setActiveTab,
  onOpenNotifications,
}) => {
  const {
    schools,
    currentSchool,
    currentSession,
    switchSchool,
    theme,
    toggleTheme,
    syncStatus,
    lastSyncTime,
    loginAs,
    logout,
    notifications,
    isSuperAdmin,
    navigateToWelcome,
  } = usePortal();

  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };

  const urgentCount = notifications.filter((n) => n.priority === 'urgent').length;
  const displayBadge = currentSchool.badgeUrl || currentSchool.logoUrl;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand & School Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {displayBadge ? (
              <img
                src={displayBadge}
                alt={currentSchool.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {currentSchool.code || 'EP'}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                {currentSchool.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {currentSchool.code} · {currentSchool.currentTerm} {currentSchool.academicYear} · {currentSchool.subscriptionBilling.toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={navigateToWelcome}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
            title="Return to Welcome Portal & Institutional Directory"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>All Portals</span>
          </button>

          {/* School Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Switch Subscribed School"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {schoolDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50"
                onClick={() => setSchoolDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Subscribed Institution Portals
                </div>
                {schools.map((sch, schIdx) => (
                  <button
                    key={`nav-sch-${sch.id}-${schIdx}`}
                    onClick={() => switchSchool(sch.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${
                      sch.id === currentSchool.id
                        ? 'font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div>{sch.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sch.code} · {sch.subscriptionPlan} ({sch.subscriptionBilling})
                      </div>
                    </div>
                    {sch.id === currentSchool.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <button
                    onClick={onOpenSubscription}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Subscribe New School
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap overflow-x-auto py-1">
          {currentSession?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'overview' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Analytics &amp; Publishing
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'staff' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Staff Credentials
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'tasks' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Task Dashboard
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                School Profile
              </button>
              <button
                onClick={() => setActiveTab('backup')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'backup' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Subscription &amp; Backup
              </button>
            </>
          )}

          {(currentSession?.role === 'class_teacher' || currentSession?.role === 'subject_teacher') && (
            <>
              <button
                onClick={() => setActiveTab('subject_marks')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'subject_marks' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Gradebook &amp; AOI (All Streams)
              </button>
              <button
                onClick={() => setActiveTab('class_roster')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'class_roster' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Roster, Attendance &amp; Subjects
              </button>
              <button
                onClick={() => setActiveTab('class_performance')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'class_performance' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Performance &amp; Signatures
              </button>
              <button
                onClick={() => setActiveTab('communications')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'communications' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Parent Messages
              </button>
            </>
          )}

          {currentSession?.role === 'parent' && (
            <>
              <button
                onClick={() => setActiveTab('progress')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'progress' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Competency Progression
              </button>
              <button
                onClick={() => setActiveTab('report_card')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'report_card' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Digital Report Card
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'attendance' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Attendance Log
              </button>
              <button
                onClick={() => setActiveTab('contact_teacher')}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  activeTab === 'contact_teacher' ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 pb-1' : ''
                }`}
              >
                Message Teachers
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* PWA In-App Install Prompt */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install Offline App</span>
            </button>
          )}

          {/* Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <span className="hidden md:inline">
              {syncStatus === 'syncing' ? 'Syncing...' : 'Perpetual Storage'}
            </span>
          </div>

          {/* Urgent Notifications Bell */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Urgent Administrative Broadcasts"
            >
              <Bell className="w-4 h-4" />
              {urgentCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {currentSession?.role === 'admin' && <Shield className="w-3.5 h-3.5 text-indigo-600" />}
              {currentSession?.role === 'class_teacher' && <Users className="w-3.5 h-3.5 text-emerald-600" />}
              {currentSession?.role === 'subject_teacher' && <BookOpen className="w-3.5 h-3.5 text-amber-600" />}
              {currentSession?.role === 'parent' && <GraduationCap className="w-3.5 h-3.5 text-violet-600" />}
              <span className="truncate max-w-[120px]">
                {currentSession?.role === 'admin' && 'Headteacher'}
                {currentSession?.role === 'class_teacher' && 'Class Master'}
                {currentSession?.role === 'subject_teacher' && 'Subject Teacher'}
                {currentSession?.role === 'parent' && 'Parent Portal'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Switch Active Portal Role
                </div>
                <button
                  onClick={() => {
                    loginAs('admin');
                    setActiveTab('overview');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Headteacher Admin</div>
                    <div className="text-[10px] text-slate-400">Manage school, faculty credentials, publishing links</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    loginAs('class_teacher', 'tch_okello_david');
                    setActiveTab('class_roster');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Class Master (Mr. Okello)</div>
                    <div className="text-[10px] text-slate-400">Senior 1 East · Roster &amp; Attendance</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    loginAs('subject_teacher', 'tch_kembabazi_sarah');
                    setActiveTab('subject_marks');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Subject Specialist (Ms. Kembabazi)</div>
                    <div className="text-[10px] text-slate-400">Chemistry · O-Level AOI &amp; A-Level Paper 1/2</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    loginAs('parent', undefined, 'stu_smcn_102');
                    setActiveTab('progress');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-violet-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Parent / Learner (MFA)</div>
                    <div className="text-[10px] text-slate-400">Miriam Babirye (SMCN-S1-102) with 6-digit OTP</div>
                  </div>
                </button>

                {currentSession && (
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
