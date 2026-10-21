import React, { useState, useMemo } from 'react';
import { usePortal } from '../../context/PortalContext';
import { StorageService } from '../../services/storageService';
import { SuperAdminLoginModal } from './SuperAdminLoginModal';
import { SchoolSubscriptionModal } from '../subscription/SchoolSubscriptionModal';
import { MobileMoneyPaymentModal } from '../payment/MobileMoneyPaymentModal';
import { School, Teacher, Student, PaymentMethod } from '../../types';
import {
  Building,
  GraduationCap,
  Users,
  BookOpen,
  Award,
  ShieldCheck,
  CreditCard,
  Phone,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Search,
  Check,
  Globe,
  Zap,
  AlertTriangle,
  RefreshCw,
  Copy,
  ChevronRight,
  UserCheck,
  KeyRound,
  FileSpreadsheet,
  Calendar,
  Database,
  Upload,
  Image as ImageIcon,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

const CREST_PRESETS = [
  {
    name: 'Gold Laurels',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Royal Shield',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Science & Wisdom',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Torch of Learning',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
  },
];

export const WelcomeLandingPage: React.FC = () => {
  const {
    schools,
    navigateToSchool,
    switchSchool,
    loginAs,
    renewSubscription,
    subscribeNewSchool,
    superAdminEmail,
    superAdminPhone,
  } = usePortal();

  // Navigation & Modals
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalSchool, setRenewalSchool] = useState<School | null>(null);
  const [renewalCycle, setRenewalCycle] = useState<'termly' | 'annual'>('annual');

  // Hub Main Deck Active Tab: 'gateway' | 'subscribe' | 'parent_lookup'
  const [hubTab, setHubTab] = useState<'gateway' | 'subscribe' | 'parent_lookup'>('gateway');

  // Directory Search
  const [searchSchool, setSearchSchool] = useState('');
  const [pricingCycle, setPricingCycle] = useState<'termly' | 'annual'>('annual');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // -------------------------------------------------------------
  // LOGIN GATEWAY STATES
  // -------------------------------------------------------------
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(() => schools[0]?.id || 'sch_namagunga');
  const [gatewayRole, setGatewayRole] = useState<'admin' | 'class_teacher' | 'subject_teacher' | 'parent'>('admin');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [parentStudentCode, setParentStudentCode] = useState<string>('');
  const [parentOtp, setParentOtp] = useState<string>('123456');
  const [gatewayError, setGatewayError] = useState<string>('');

  // Selected school entity
  const selectedSchool = useMemo(() => {
    return schools.find((s) => s.id === selectedSchoolId) || schools[0];
  }, [schools, selectedSchoolId]);

  // Teachers and students for selected school
  const schoolTeachers = useMemo(() => {
    if (!selectedSchool) return [];
    return StorageService.getTeachers(selectedSchool.id);
  }, [selectedSchool]);

  const schoolStudents = useMemo(() => {
    if (!selectedSchool) return [];
    return StorageService.getStudents(selectedSchool.id);
  }, [selectedSchool]);

  // Filter teachers by assignments
  const classTeachers = useMemo(() => {
    return schoolTeachers.filter((t) => !!t.classTeacherAssignment && !t.isHeadteacher);
  }, [schoolTeachers]);

  const subjectTeachers = useMemo(() => {
    return schoolTeachers.filter((t) => t.subjectAssignments && t.subjectAssignments.length > 0 && !t.isHeadteacher);
  }, [schoolTeachers]);

  const headteacher = useMemo(() => {
    return schoolTeachers.find((t) => t.isHeadteacher) || schoolTeachers[0];
  }, [schoolTeachers]);

  // Subscription Expiry & Block Evaluation
  const isSelectedSchoolExpired = useMemo(() => {
    if (!selectedSchool) return false;
    return (
      selectedSchool.subscriptionStatus === 'expired' ||
      new Date(selectedSchool.subscriptionExpiresAt).getTime() < Date.now()
    );
  }, [selectedSchool]);

  const isSelectedSchoolBlocked = useMemo(() => {
    if (!selectedSchool) return false;
    return selectedSchool.isBlocked || selectedSchool.subscriptionStatus === 'blocked';
  }, [selectedSchool]);

  const daysRemaining = useMemo(() => {
    if (!selectedSchool) return 0;
    const diff = new Date(selectedSchool.subscriptionExpiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [selectedSchool]);

  // -------------------------------------------------------------
  // EMBEDDED SUBSCRIPTION FORM STATES (Tab 2)
  // -------------------------------------------------------------
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subMotto, setSubMotto] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subAddress, setSubAddress] = useState('');
  const [subHeadName, setSubHeadName] = useState('');
  const [subHeadPass, setSubHeadPass] = useState('');
  const [subPlan, setSubPlan] = useState<'Standard Academy' | 'Enterprise Campus'>('Enterprise Campus');
  const [subBilling, setSubBilling] = useState<'termly' | 'annual'>('annual');
  const [subBadgeUrl, setSubBadgeUrl] = useState('');
  const [subPaymentMethod, setSubPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [subPayerPhone, setSubPayerPhone] = useState('');
  const [subStep, setSubStep] = useState<'form' | 'payment' | 'authorizing' | 'success'>('form');
  const [subTxnRef, setSubTxnRef] = useState('');
  const [newlyCreatedSchool, setNewlyCreatedSchool] = useState<School | null>(null);

  // -------------------------------------------------------------
  // PARENT FAST LOOKUP STATES (Tab 3)
  // -------------------------------------------------------------
  const [lookupCode, setLookupCode] = useState('');
  const [lookupResult, setLookupResult] = useState<{
    student: Student;
    school: School;
    isExpired: boolean;
  } | null>(null);
  const [lookupError, setLookupError] = useState('');

  // -------------------------------------------------------------
  // ACTIONS & HANDLERS
  // -------------------------------------------------------------
  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}?school=${slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleLaunchRenewal = (school: School, cycle: 'termly' | 'annual' = 'annual') => {
    setRenewalSchool(school);
    setRenewalCycle(cycle);
    setShowRenewalModal(true);
  };

  const handleRenewalSuccess = (paymentData: any) => {
    if (renewalSchool) {
      renewSubscription(
        renewalSchool.id,
        renewalSchool.subscriptionPlan,
        renewalCycle,
        paymentData.paymentMethod,
        paymentData.payerPhoneOrCard
      );
      setShowRenewalModal(false);
      setGatewayError('');
    }
  };

  const handleGatewayLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayError('');

    if (!selectedSchool) {
      setGatewayError('Please select a school to proceed.');
      return;
    }

    // STRICT CHECK: IF BLOCKED OR EXPIRED, STOP AND BLOCK ACCESS
    if (isSelectedSchoolBlocked) {
      setGatewayError(`Access Suspended: Portal operations for ${selectedSchool.name} have been suspended by the Overall Administrator.`);
      return;
    }

    if (isSelectedSchoolExpired) {
      setGatewayError(
        `Access Blocked: ${selectedSchool.name}'s subscription expired on ${new Date(
          selectedSchool.subscriptionExpiresAt
        ).toLocaleDateString()}. Please renew the subscription to unlock portal access.`
      );
      return;
    }

    // Role-specific login resolution
    if (gatewayRole === 'admin') {
      loginAs('admin');
      switchSchool(selectedSchool.id);
      navigateToSchool(selectedSchool.id);
    } else if (gatewayRole === 'class_teacher') {
      const teacherId = selectedTeacherId || classTeachers[0]?.id || schoolTeachers[0]?.id;
      loginAs('class_teacher', teacherId);
      switchSchool(selectedSchool.id);
      navigateToSchool(selectedSchool.id);
    } else if (gatewayRole === 'subject_teacher') {
      const teacherId = selectedTeacherId || subjectTeachers[0]?.id || schoolTeachers[0]?.id;
      loginAs('subject_teacher', teacherId);
      switchSchool(selectedSchool.id);
      navigateToSchool(selectedSchool.id);
    } else if (gatewayRole === 'parent') {
      if (!parentStudentCode.trim()) {
        setGatewayError('Please enter the Student Access Code / LIN (e.g. SMCN-S1-101).');
        return;
      }
      const match = schoolStudents.find(
        (s) => s.studentCode.trim().toUpperCase() === parentStudentCode.trim().toUpperCase()
      );
      if (!match) {
        setGatewayError(`Student code "${parentStudentCode}" not found in ${selectedSchool.name}. Please verify.`);
        return;
      }
      loginAs('parent', undefined, match.id);
      switchSchool(selectedSchool.id);
      navigateToSchool(selectedSchool.id);
    }
  };

  // Embedded subscription submission
  const handleProceedEmbeddedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subCode || !subEmail || !subHeadName || !subHeadPass) return;
    setSubPayerPhone(subPhone || '0786721142');
    setSubStep('payment');
  };

  const handleAuthorizeEmbeddedPayment = () => {
    setSubStep('authorizing');
    const ref = `${subPaymentMethod === 'mtn_momo' ? 'MOMO' : subPaymentMethod === 'airtel_money' ? 'AIRTEL' : 'VISA'}-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubTxnRef(ref);

    setTimeout(() => {
      const created = subscribeNewSchool({
        name: subName,
        code: subCode.toUpperCase(),
        email: subEmail,
        phone: subPhone,
        address: subAddress,
        motto: subMotto || 'Knowledge, Discipline and Excellence',
        headteacherName: subHeadName,
        headteacherPassword: subHeadPass,
        subscriptionPlan: subPlan,
        subscriptionBilling: subBilling,
        badgeUrl: subBadgeUrl || CREST_PRESETS[0].url,
        paymentMethod: subPaymentMethod,
        payerPhoneOrCard: subPayerPhone,
      });

      setNewlyCreatedSchool(created);
      setSubStep('success');
    }, 1800);
  };

  // Parent fast lookup execution
  const handleParentLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setLookupResult(null);

    const clean = lookupCode.trim().toUpperCase();
    if (!clean) return;

    // Search across all schools
    const allStudents = StorageService.getStudents();
    const found = allStudents.find((s) => s.studentCode.trim().toUpperCase() === clean);
    if (!found) {
      setLookupError(`No learner record matches LIN "${clean}". Please verify with the class teacher.`);
      return;
    }

    const school = schools.find((s) => s.id === found.schoolId);
    if (!school) {
      setLookupError('Institutional record not found.');
      return;
    }

    const expired = school.subscriptionStatus === 'expired' || new Date(school.subscriptionExpiresAt).getTime() < Date.now();
    setLookupResult({
      student: found,
      school,
      isExpired: expired,
    });
  };

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchSchool.toLowerCase()) ||
      s.code.toLowerCase().includes(searchSchool.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchSchool.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
              EP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">EduPortal OS</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Paperless System
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Academic Management &amp; Continuous Assessment Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Direct Carrier Merchant Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Carrier Sync: <strong className="text-emerald-400 font-mono">{superAdminPhone}</strong></span>
            </div>

            <button
              onClick={() => setShowSuperAdminModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Creator Master Console (ismailkasumba8@gmail.com)"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Overall Administrator</span>
            </button>

            <button
              onClick={() => {
                setHubTab('subscribe');
                const el = document.getElementById('hub-deck');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Subscribe School</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 bg-radial from-indigo-950/40 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Central Operating Hub for Subscribed Ugandan Institutions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Institutional Gateway &amp; Academic Management Portal
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct access for <strong>School Administrators</strong>, <strong>Class Masters</strong>, <strong>Subject Teachers</strong>, and <strong>Parents</strong>. Governed by live subscription status with immediate carrier sync to merchant account <strong>{superAdminPhone}</strong>.
          </p>

          {/* Quick Curriculum Rule Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> O-Level 20% AOI Continuous Assessment
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> A-Level 17-Pt Rule (A=5, E=1, Subs max 1 pt)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Permanent Database Storage Guarantee
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Dedicated URLs (?school=slug)
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* THE CENTRAL HUB MISSION CONTROL DECK */}
      {/* ------------------------------------------------------------------ */}
      <section id="hub-deck" className="py-8 px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="max-w-4xl mx-auto">
          {/* Deck Tab Switcher */}
          <div className="flex items-center justify-center p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-xl mx-auto mb-6 shadow-xl">
            <button
              onClick={() => setHubTab('gateway')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hubTab === 'gateway'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>School Login Gateway</span>
            </button>

            <button
              onClick={() => setHubTab('subscribe')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hubTab === 'subscribe'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Subscribe New School</span>
            </button>

            <button
              onClick={() => setHubTab('parent_lookup')}
              className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                hubTab === 'parent_lookup'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Parent Fast-Check</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: SCHOOL PORTAL LOGIN GATEWAY (WITH STRICT EXPIRY BLOCK) */}
          {/* ============================================================== */}
          {hubTab === 'gateway' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
              {/* Gateway Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Institutional Login Gateway</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">
                        Central Hub
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Select your school and sign into your assigned role workspace
                    </p>
                  </div>
                </div>

                {/* School Selector Dropdown */}
                <div className="w-full sm:w-72">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select Subscribed School
                  </label>
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => {
                      setSelectedSchoolId(e.target.value);
                      setGatewayError('');
                    }}
                    className="w-full px-3 py-2 text-xs font-medium bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code}) - {s.subscriptionStatus === 'expired' ? 'EXPIRED' : s.isBlocked ? 'SUSPENDED' : 'ACTIVE'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected School Identification Strip */}
              {selectedSchool && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center overflow-hidden shrink-0">
                      {selectedSchool.badgeUrl ? (
                        <img src={selectedSchool.badgeUrl} alt={selectedSchool.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-mono font-black text-sm text-indigo-300">{selectedSchool.code}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{selectedSchool.name}</h3>
                        <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
                          {selectedSchool.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic">&ldquo;{selectedSchool.motto}&rdquo;</p>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        URL: ?school={selectedSchool.slug}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {isSelectedSchoolBlocked ? (
                      <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                        <span>Portal Suspended</span>
                      </div>
                    ) : isSelectedSchoolExpired ? (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Subscription Expired</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Active ({daysRemaining}d left · {selectedSchool.subscriptionBilling})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* BLOCKING INTERCEPTOR 1: SCHOOL IS BLOCKED BY OVERALL ADMIN */}
              {/* ------------------------------------------------------------- */}
              {isSelectedSchoolBlocked ? (
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-900 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-900/60 border border-rose-700 text-rose-400 flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-rose-200">
                      Institutional Access Suspended
                    </h4>
                    <p className="text-xs text-rose-300/80 max-w-lg mx-auto mt-1 leading-relaxed">
                      Portal operations for <strong>{selectedSchool.name}</strong> have been suspended by the Overall System Administrator ({superAdminEmail}). All grade inputs and parent report card viewing are paused.
                    </p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-rose-900/60 text-xs max-w-md mx-auto space-y-1 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suspension Reason:</span>
                      <span className="text-rose-300 font-semibold">{selectedSchool.blockedReason || 'Administrative Review'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Permanent Database:</span>
                      <span className="text-emerald-400 font-semibold">{schoolStudents.length} Learners Safely Preserved</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-xs text-slate-400">
                      Contact creator to reactivate: <strong className="text-slate-200 font-mono">{superAdminPhone}</strong>
                    </span>
                  </div>
                </div>
              ) : isSelectedSchoolExpired ? (
                /* ------------------------------------------------------------- */
                /* BLOCKING INTERCEPTOR 2: SUBSCRIPTION HAS EXPIRED */
                /* ------------------------------------------------------------- */
                <div className="p-6 rounded-2xl bg-amber-950/40 border-2 border-amber-600/70 text-center space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-900/60 border border-amber-700 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full">
                      Portal Access Blocked · Renewal Required
                    </span>
                    <h4 className="text-lg font-black text-white mt-2.5">
                      {selectedSchool.name} Subscription Has Ended
                    </h4>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto mt-1 leading-relaxed">
                      The {selectedSchool.subscriptionBilling} billing cycle concluded on{' '}
                      <strong className="text-amber-300">
                        {new Date(selectedSchool.subscriptionExpiresAt).toLocaleDateString()}
                      </strong>
                      . Teachers, Administrators, and Parents are blocked from accessing portal features until renewed.
                    </p>
                  </div>

                  {/* Guaranteed Safe Storage Note */}
                  <div className="p-3.5 bg-black/40 rounded-xl border border-emerald-900/60 text-xs text-emerald-300 text-left max-w-lg mx-auto flex items-start gap-2.5">
                    <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Permanent Database Guarantee:</strong> All {schoolStudents.length} enrolled students, {schoolTeachers.length} staff records, and continuous assessment marks are permanently preserved in the database. Renewing reactivates all portals immediately!
                    </div>
                  </div>

                  {/* Instant Renewal Trigger to 0786721142 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
                    <button
                      onClick={() => handleLaunchRenewal(selectedSchool, 'termly')}
                      className="p-3.5 rounded-xl border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/40 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Termly Renewal</span>
                        <span className="font-mono font-black text-indigo-400">UGX 180,000</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">3 Months portal access</p>
                      <div className="mt-2 text-[11px] font-bold text-indigo-400 group-hover:underline flex items-center gap-1">
                        Pay via MoMo / Visa &rarr;
                      </div>
                    </button>

                    <button
                      onClick={() => handleLaunchRenewal(selectedSchool, 'annual')}
                      className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-950/40 hover:bg-emerald-900/40 text-left transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-1 right-2 text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                        Save 30%
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">Annual Pass</span>
                        <span className="font-mono font-black text-emerald-400">UGX 480,000</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">12 Months full access</p>
                      <div className="mt-2 text-[11px] font-bold text-emerald-400 group-hover:underline flex items-center gap-1">
                        Pay via MoMo / Visa &rarr;
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* ------------------------------------------------------------- */
                /* ACTIVE SCHOOL GATEWAY: ROLE SELECTION & LOGIN */
                /* ------------------------------------------------------------- */
                <form onSubmit={handleGatewayLogin} className="space-y-5">
                  {gatewayError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{gatewayError}</span>
                    </div>
                  )}

                  {/* Role Selector Tabs */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Select Access Portal / Role
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGatewayRole('admin');
                          setGatewayError('');
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          gatewayRole === 'admin'
                            ? 'border-indigo-500 bg-indigo-600/20 text-white ring-2 ring-indigo-500 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <span className="text-xs">Administrator</span>
                        <span className="text-[9px] text-slate-500 font-normal">Headteacher</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGatewayRole('class_teacher');
                          setGatewayError('');
                          if (classTeachers[0]) setSelectedTeacherId(classTeachers[0].id);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          gatewayRole === 'class_teacher'
                            ? 'border-indigo-500 bg-indigo-600/20 text-white ring-2 ring-indigo-500 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <UserCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs">Class Teacher</span>
                        <span className="text-[9px] text-slate-500 font-normal">Roster &amp; Remarks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGatewayRole('subject_teacher');
                          setGatewayError('');
                          if (subjectTeachers[0]) setSelectedTeacherId(subjectTeachers[0].id);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          gatewayRole === 'subject_teacher'
                            ? 'border-indigo-500 bg-indigo-600/20 text-white ring-2 ring-indigo-500 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <BookOpen className="w-5 h-5 text-amber-400" />
                        <span className="text-xs">Subject Teacher</span>
                        <span className="text-[9px] text-slate-500 font-normal">AOI &amp; Marks Entry</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setGatewayRole('parent');
                          setGatewayError('');
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          gatewayRole === 'parent'
                            ? 'border-indigo-500 bg-indigo-600/20 text-white ring-2 ring-indigo-500 font-bold'
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <GraduationCap className="w-5 h-5 text-violet-400" />
                        <span className="text-xs">Parent / Guardian</span>
                        <span className="text-[9px] text-slate-500 font-normal">Learner Progress</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Form per Role */}
                  {gatewayRole === 'admin' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">
                          Headteacher / Principal Account:
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {headteacher?.name || 'Dr. Arthur Mugalu'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Administrator Password
                        </label>
                        <div className="relative">
                          <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="password"
                            value={inputPassword || '••••••••'}
                            onChange={(e) => setInputPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Master credential configured for {selectedSchool.name}.
                        </p>
                      </div>
                    </div>
                  )}

                  {gatewayRole === 'class_teacher' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Select Class Master / Teacher
                        </label>
                        <select
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          {classTeachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} — Class Master: {t.classTeacherAssignment?.classId} {t.classTeacherAssignment?.streamId}
                            </option>
                          ))}
                          {classTeachers.length === 0 && (
                            <option value="">Mr. David Okello (Senior 1 East)</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Teacher Access Password
                        </label>
                        <input
                          type="password"
                          value={inputPassword || '••••••••'}
                          onChange={(e) => setInputPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {gatewayRole === 'subject_teacher' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Select Subject Teacher
                        </label>
                        <select
                          value={selectedTeacherId}
                          onChange={(e) => setSelectedTeacherId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          {subjectTeachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} — ({t.subjectAssignments.length} assigned streams &amp; papers)
                            </option>
                          ))}
                          {subjectTeachers.length === 0 && (
                            <option value="">Ms. Sarah Kembabazi (Physics &amp; Chemistry)</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Teacher Access Password
                        </label>
                        <input
                          type="password"
                          value={inputPassword || '••••••••'}
                          onChange={(e) => setInputPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}

                  {gatewayRole === 'parent' && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Student Access Code / LIN *
                          </label>
                          <input
                            type="text"
                            required
                            value={parentStudentCode}
                            onChange={(e) => setParentStudentCode(e.target.value.toUpperCase())}
                            placeholder={schoolStudents[0]?.studentCode || `${selectedSchool.code}-S1-101`}
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Verification MFA OTP *
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={parentOtp}
                            onChange={(e) => setParentOtp(e.target.value)}
                            placeholder="123456"
                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Quick-Pick for Convenience */}
                      {schoolStudents.length > 0 && (
                        <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="text-slate-500">Quick Test Learners:</span>
                          {schoolStudents.slice(0, 3).map((stu) => (
                            <button
                              key={stu.id}
                              type="button"
                              onClick={() => setParentStudentCode(stu.studentCode)}
                              className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 font-mono text-indigo-300 cursor-pointer"
                            >
                              {stu.studentCode} ({stu.firstName})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Action */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.01]"
                  >
                    <span>
                      Enter {gatewayRole === 'admin' ? 'Administrator' : gatewayRole === 'class_teacher' ? 'Class Master' : gatewayRole === 'subject_teacher' ? 'Subject Teacher' : 'Parent'} Portal
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: EMBEDDED SCHOOL SUBSCRIPTION & ONBOARDING */}
          {/* ============================================================== */}
          {hubTab === 'subscribe' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Subscribe Your Institution
                  </h2>
                  <p className="text-xs text-slate-400">
                    Provision a brand-new institutional operating portal with dedicated URL &amp; custom crest
                  </p>
                </div>
              </div>

              {subStep === 'form' && (
                <form onSubmit={handleProceedEmbeddedPayment} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        School / Institution Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={subName}
                        onChange={(e) => {
                          setSubName(e.target.value);
                          if (!subCode) {
                            const words = e.target.value.split(/\s+/).filter(Boolean);
                            const suggested = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
                            setSubCode(suggested);
                          }
                        }}
                        placeholder="e.g. Kibuli Secondary School"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Student Prefix *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={subCode}
                        onChange={(e) => setSubCode(e.target.value.toUpperCase())}
                        placeholder="e.g. KBL"
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      School Motto
                    </label>
                    <input
                      type="text"
                      value={subMotto}
                      onChange={(e) => setSubMotto(e.target.value)}
                      placeholder="e.g. Knowledge, Discipline and Excellence"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Official School Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        placeholder="admin@school.ac.ug"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Phone / MoMo Contact *
                      </label>
                      <input
                        type="tel"
                        required
                        value={subPhone}
                        onChange={(e) => setSubPhone(e.target.value)}
                        placeholder="+256 700 000 000"
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* School Crest Selection */}
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <span>Select School Crest Preset</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {CREST_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSubBadgeUrl(preset.url)}
                          className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            subBadgeUrl === preset.url
                              ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500'
                              : 'border-slate-800 hover:bg-slate-900'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[9px] font-medium truncate w-full">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Headteacher Master Account */}
                  <div className="p-3.5 bg-indigo-950/40 rounded-2xl border border-indigo-900/60 space-y-3">
                    <div className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>Headteacher Master Administrator Setup</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Headteacher Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={subHeadName}
                          onChange={(e) => setSubHeadName(e.target.value)}
                          placeholder="e.g. Dr. Arthur Mugalu"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">
                          Administrative Password *
                        </label>
                        <input
                          type="password"
                          required
                          value={subHeadPass}
                          onChange={(e) => setSubHeadPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plan Tier Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSubBilling('termly')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        subBilling === 'termly'
                          ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Termly Plan</span>
                        <span className="font-mono text-indigo-400">UGX 180,000</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">3 Months ($49)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubBilling('annual')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        subBilling === 'annual'
                          ? 'border-emerald-500 bg-emerald-950/40 ring-2 ring-emerald-500'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      <span className="absolute top-2 right-2 text-[8px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full uppercase">
                        Save 30%
                      </span>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Annual Pass</span>
                        <span className="font-mono text-emerald-400">UGX 480,000</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">12 Months ($129)</div>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Payment &amp; Activation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {subStep === 'payment' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400">Institution: </span>
                      <strong className="text-white">{subName} ({subCode})</strong>
                      <div className="text-slate-400 text-[10px]">Settlement destination: <span className="font-mono text-emerald-400">{superAdminPhone}</span></div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {subBilling === 'annual' ? 'UGX 480,000' : 'UGX 180,000'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Channel Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSubPaymentMethod('mtn_momo')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        subPaymentMethod === 'mtn_momo'
                          ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500 text-white font-bold'
                          : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs">MTN MoMo</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubPaymentMethod('airtel_money')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        subPaymentMethod === 'airtel_money'
                          ? 'border-rose-600 bg-rose-600/10 ring-2 ring-rose-600 text-white font-bold'
                          : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs">Airtel Money</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubPaymentMethod('visa_card')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        subPaymentMethod === 'visa_card'
                          ? 'border-indigo-600 bg-indigo-600/10 ring-2 ring-indigo-600 text-white font-bold'
                          : 'border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs">Visa / Card</div>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Payer Mobile Money Phone / Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={subPayerPhone}
                      onChange={(e) => setSubPayerPhone(e.target.value)}
                      placeholder="0772 123 456"
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubStep('form')}
                      className="px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleAuthorizeEmbeddedPayment}
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg cursor-pointer"
                    >
                      Authorize Payment to 0786721142
                    </button>
                  </div>
                </div>
              )}

              {subStep === 'authorizing' && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto animate-spin">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Contacting Carrier Switch...</h4>
                  <p className="text-xs text-slate-400">
                    Transacting with merchant recipient <strong className="text-emerald-400">{superAdminPhone}</strong> (Ismail Kasumba).
                  </p>
                </div>
              )}

              {subStep === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-black text-white">
                    School Provisioned &amp; Subscribed!
                  </h4>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1 max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Institution:</span>
                      <span className="font-bold text-white">{newlyCreatedSchool?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dedicated URL:</span>
                      <span className="font-mono text-emerald-400">?school={newlyCreatedSchool?.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transaction Ref:</span>
                      <span className="font-mono text-indigo-400">{subTxnRef}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (newlyCreatedSchool) {
                        navigateToSchool(newlyCreatedSchool.id);
                      }
                    }}
                    className="w-full max-w-sm mx-auto py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg cursor-pointer"
                  >
                    Launch Your School Portal Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: PARENT FAST-CHECK LOOKUP */}
          {/* ============================================================== */}
          {hubTab === 'parent_lookup' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Parent Student Record Fast-Check
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verify learner enrollment and check school subscription status directly
                  </p>
                </div>
              </div>

              <form onSubmit={handleParentLookup} className="space-y-4">
                {lookupError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Enter Learner Access Code / LIN
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={lookupCode}
                      onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SMCN-S1-101 or VHA-S1-102"
                      className="flex-1 px-3 py-2.5 text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Check</span>
                    </button>
                  </div>
                </div>
              </form>

              {lookupResult && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {lookupResult.student.firstName} {lookupResult.student.lastName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {lookupResult.student.classId} {lookupResult.student.streamId} · {lookupResult.school.name}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-1 rounded">
                      {lookupResult.student.studentCode}
                    </span>
                  </div>

                  {lookupResult.isExpired ? (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900 text-xs text-amber-300 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>School Subscription Renewal Due</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        {lookupResult.school.name} subscription expired on{' '}
                        {new Date(lookupResult.school.subscriptionExpiresAt).toLocaleDateString()}. Report card access will reopen immediately when the school renews via 0786721142.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        loginAs('parent', undefined, lookupResult.student.id);
                        switchSchool(lookupResult.school.id);
                        navigateToSchool(lookupResult.school.id);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Open Learner Progress Report</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* DIRECTORY OF SUBSCRIBED SCHOOLS */}
      {/* ------------------------------------------------------------------ */}
      <section id="directory" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">
                  Subscribed Institutional Directory
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                All registered institutions with dedicated portals, active gradebooks, and publishing URLs
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchSchool}
                onChange={(e) => setSearchSchool(e.target.value)}
                placeholder="Find institution by name or code..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((sch) => {
              const isExpired =
                sch.subscriptionStatus === 'expired' ||
                new Date(sch.subscriptionExpiresAt).getTime() < Date.now();
              const isBlocked = sch.isBlocked || sch.subscriptionStatus === 'blocked';

              return (
                <div
                  key={sch.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                    isBlocked
                      ? 'bg-rose-950/20 border-rose-900/60'
                      : isExpired
                      ? 'bg-amber-950/20 border-amber-900/60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center overflow-hidden">
                        {sch.badgeUrl ? (
                          <img src={sch.badgeUrl} alt={sch.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-mono font-black text-sm text-indigo-300">{sch.code}</span>
                        )}
                      </div>

                      {isBlocked ? (
                        <span className="text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-full">
                          Suspended
                        </span>
                      ) : isExpired ? (
                        <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full">
                          Renewal Due
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Active ({sch.subscriptionBilling})
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white">{sch.name}</h3>
                      <p className="text-xs text-slate-400 italic mt-0.5">&ldquo;{sch.motto}&rdquo;</p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Namespace:</span>
                        <span className="font-mono font-bold text-indigo-400">{sch.code}-S*-XXX</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Dedicated URL:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-emerald-400 text-[11px]">?school={sch.slug}</span>
                          <button
                            onClick={() => handleCopyUrl(sch.slug)}
                            className="p-1 hover:text-white text-slate-400 rounded cursor-pointer"
                            title="Copy School URL"
                          >
                            {copiedSlug === sch.slug ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Action 1: Select in Gateway above */}
                    <button
                      onClick={() => {
                        setSelectedSchoolId(sch.id);
                        setHubTab('gateway');
                        const el = document.getElementById('hub-deck');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Select in Login Gateway</span>
                    </button>

                    {/* Action 2: Direct Portal or Renewal */}
                    {isExpired ? (
                      <button
                        onClick={() => handleLaunchRenewal(sch)}
                        className="w-full py-2.5 px-4 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew Access (0786721142)</span>
                      </button>
                    ) : isBlocked ? (
                      <div className="text-center text-[11px] text-rose-400 py-2">
                        Contact Creator at {superAdminPhone}
                      </div>
                    ) : (
                      <button
                        onClick={() => navigateToSchool(sch.id)}
                        className="w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Launch Direct Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* PRICING & MERCHANT CARRIER SETTLEMENT SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-radial from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto space-y-10 text-center">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase font-mono text-emerald-400 tracking-wider">
              Ugandan Academic Pricing Tiers
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Subscribe Your Institution Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              All subscription settlements are routed and synced directly via MTN Mobile Money, Airtel Money, or Visa Card to the Creator Merchant Account: <strong className="font-mono text-emerald-400">{superAdminPhone}</strong> (Ismail Kasumba).
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-semibold mt-4">
              <button
                onClick={() => setPricingCycle('termly')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  pricingCycle === 'termly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Termly Plan (3 Months)
              </button>
              <button
                onClick={() => setPricingCycle('annual')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  pricingCycle === 'annual' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Pass (12 Months)</span>
                <span className="text-[10px] bg-black/30 text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                  Save 30%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {/* Standard Academy */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Standard Academy</h3>
                  <p className="text-xs text-slate-400">For secondary schools focusing on O-Level Continuous Assessments</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">
                      {pricingCycle === 'annual' ? 'UGX 380,000' : 'UGX 180,000'}
                    </span>
                    <span className="text-xs text-slate-400">/ {pricingCycle === 'annual' ? 'year' : 'term'}</span>
                  </div>
                  <div className="text-xs font-mono text-indigo-400">
                    (${pricingCycle === 'annual' ? '99' : '49'} USD)
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Institutional URL (<span className="font-mono text-indigo-300">?school=code</span>)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Headteacher Master Administrative Password</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>O-Level AOI 20% Continuous Assessment Grid</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Class Master Rosters &amp; Automated Attendance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Parent Portal with 6-digit MFA OTP Verification</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setHubTab('subscribe');
                  setSubPlan('Standard Academy');
                  setSubBilling(pricingCycle);
                  const el = document.getElementById('hub-deck');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Subscribe Standard Academy
              </button>
            </div>

            {/* Enterprise Campus */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500 relative space-y-6 flex flex-col justify-between shadow-2xl">
              <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Enterprise Campus</span>
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </h3>
                  <p className="text-xs text-slate-400">For multi-stream secondary colleges &amp; A-Level institutions</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">
                      {pricingCycle === 'annual' ? 'UGX 480,000' : 'UGX 220,000'}
                    </span>
                    <span className="text-xs text-slate-400">/ {pricingCycle === 'annual' ? 'year' : 'term'}</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    (${pricingCycle === 'annual' ? '129' : '59'} USD)
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Everything in Standard Academy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>A-Level Paper 1 &amp; 2 Grading</strong> (Strict 17-Pt Rule: A=5, E=1, Subs max 1 pt)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Custom School Badge &amp; Crest Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Stream Quick-Filters (S.4A, S.4B, Sciences, Arts)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Official PDF Printable Report Cards with Crest &amp; Remarks</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setHubTab('subscribe');
                  setSubPlan('Enterprise Campus');
                  setSubBilling(pricingCycle);
                  const el = document.getElementById('hub-deck');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Subscribe Enterprise Campus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CREATOR SYSTEM ADMINISTRATOR CONSOLE CALLOUT */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-950">
        <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Overall System Administrator Portal</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Restricted to system creator (<span className="text-slate-200 font-mono">{superAdminEmail}</span>) for overall governance &amp; carrier settlements synced to <strong>{superAdminPhone}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSuperAdminModal(true)}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Creator Login
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">EduPortal OS</span>
            <span>·</span>
            <span>Ugandan Academic Operating System &amp; Paperless Portal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Carrier Settlements: <strong className="text-emerald-400 font-mono">{superAdminPhone}</strong></span>
            <span>·</span>
            <span>Admin: <strong className="text-slate-300 font-mono">{superAdminEmail}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SuperAdminLoginModal
        isOpen={showSuperAdminModal}
        onClose={() => setShowSuperAdminModal(false)}
      />

      <SchoolSubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      {renewalSchool && (
        <MobileMoneyPaymentModal
          isOpen={showRenewalModal}
          onClose={() => setShowRenewalModal(false)}
          schoolName={renewalSchool.name}
          planName={renewalSchool.subscriptionPlan}
          billingCycle={renewalCycle}
          onSuccess={handleRenewalSuccess}
        />
      )}
    </div>
  );
};
