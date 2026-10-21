import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Teacher, SchoolTask, SchoolNotification, School, Subject } from '../../types';
import {
  Users,
  GraduationCap,
  Award,
  Calendar,
  KeyRound,
  ShieldAlert,
  Download,
  Upload,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Save,
  Trash2,
  Copy,
  Check,
  Search,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldX,
  ShieldCheck,
  Globe,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';

// Academic Crest Presets
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

interface AdminDashboardProps {
  activeTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab }) => {
  const {
    schools,
    currentSchool,
    teachers,
    students,
    assessments,
    attendance,
    tasks,
    notifications,
    auditLogs,
    isSuperAdmin,
    superAdminEmail,
    updateSchoolProfile,
    updateSchoolBadge,
    updateTeacherPassword,
    addTeacher,
    addTask,
    updateTask,
    deleteTask,
    broadcastNotification,
    exportSchoolBackup,
    importSchoolBackup,
    switchSchool,
    subscribeNewSchool,
    renewSubscription,
    toggleBlockSchool,
    getSchoolAppUrl,
    addSubjectToSchool,
    deleteSubjectFromSchool,
  } = usePortal();

  // Multi-School Provisioning modal
  const [showCreateSchoolModal, setShowCreateSchoolModal] = useState(false);
  const [newSchName, setNewSchName] = useState('');
  const [newSchCode, setNewSchCode] = useState('');
  const [newSchEmail, setNewSchEmail] = useState('');
  const [newSchPhone, setNewSchPhone] = useState('');
  const [newSchAddress, setNewSchAddress] = useState('');
  const [newSchMotto, setNewSchMotto] = useState('');
  const [newSchAdminName, setNewSchAdminName] = useState('');
  const [newSchAdminPass, setNewSchAdminPass] = useState('');
  const [newSchBilling, setNewSchBilling] = useState<'termly' | 'annual'>('termly');
  const [newSchPlan, setNewSchPlan] = useState<'Standard Academy' | 'Enterprise Campus'>('Enterprise Campus');
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<string | null>(null);

  // Staff Credentials state
  const [selectedTeacherForReset, setSelectedTeacherForReset] = useState<Teacher | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Add Teacher form
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherDesignation, setNewTeacherDesignation] = useState('Assistant Teacher');
  const [newTeacherPassword, setNewTeacherPassword] = useState('welcome2026');
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [assignedClass, setAssignedClass] = useState('Senior 1');
  const [assignedStream, setAssignedStream] = useState('East');
  const [assignedSubject, setAssignedSubject] = useState('sub_o_math');

  // Task state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('high');
  const [taskCategory, setTaskCategory] = useState<'administrative' | 'academic' | 'grading' | 'meeting'>('grading');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');

  // Broadcast Notification state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'urgent' | 'info' | 'warning'>('urgent');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'teachers' | 'parents'>('all');

  // School Profile state
  const [profileName, setProfileName] = useState(currentSchool.name);
  const [profileMotto, setProfileMotto] = useState(currentSchool.motto);
  const [profileEmail, setProfileEmail] = useState(currentSchool.email);
  const [profilePhone, setProfilePhone] = useState(currentSchool.phone);
  const [profileAddress, setProfileAddress] = useState(currentSchool.address);
  const [profileYear, setProfileYear] = useState(currentSchool.academicYear);
  const [profileTerm, setProfileTerm] = useState(currentSchool.currentTerm);
  const [profileBadge, setProfileBadge] = useState(currentSchool.badgeUrl || '');
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  React.useEffect(() => {
    setProfileName(currentSchool.name);
    setProfileMotto(currentSchool.motto);
    setProfileEmail(currentSchool.email);
    setProfilePhone(currentSchool.phone);
    setProfileAddress(currentSchool.address);
    setProfileYear(currentSchool.academicYear);
    setProfileTerm(currentSchool.currentTerm);
    setProfileBadge(currentSchool.badgeUrl || '');
  }, [currentSchool]);

  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setProfileBadge(result);
    };
    reader.readAsDataURL(file);
  };

  // Backup restore status
  const [backupMessage, setBackupMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Analytics
  const totalLearners = students.length;
  const totalTeachers = teachers.length;

  let totalRecordsCount = 0;
  let presentRecordsCount = 0;
  attendance.forEach((sess) => {
    Object.values(sess.records).forEach((stat) => {
      totalRecordsCount++;
      if (stat === 'present' || stat === 'late') presentRecordsCount++;
    });
  });
  const avgAttendance = totalRecordsCount > 0 ? Math.round((presentRecordsCount / totalRecordsCount) * 100) : 96;

  // Handlers
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForReset || !newPasswordInput.trim()) return;
    updateTeacherPassword(selectedTeacherForReset.id, newPasswordInput.trim());
    setSelectedTeacherForReset(null);
    setNewPasswordInput('');
  };

  const handleGenerateRandomPass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#@';
    let pass = '';
    for (let i = 0; i < 9; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(pass);
  };

  const handleCreateSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchName || !newSchCode || !newSchEmail || !newSchAdminName || !newSchAdminPass) return;

    subscribeNewSchool({
      name: newSchName,
      code: newSchCode.toUpperCase(),
      email: newSchEmail,
      phone: newSchPhone || '+256 700 000 000',
      address: newSchAddress || 'Uganda Main Campus',
      motto: newSchMotto || 'Knowledge is Power',
      headteacherName: newSchAdminName,
      headteacherPassword: newSchAdminPass,
      subscriptionPlan: newSchPlan,
      subscriptionBilling: newSchBilling,
    });

    setShowCreateSchoolModal(false);
    setNewSchName('');
    setNewSchCode('');
    setNewSchEmail('');
  };

  const handleCopyUrl = (sch: School) => {
    const url = getSchoolAppUrl(sch);
    navigator.clipboard.writeText(url);
    setCopiedUrlIndex(sch.id);
    setTimeout(() => setCopiedUrlIndex(null), 2000);
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName || !newTeacherEmail) return;

    addTeacher({
      name: newTeacherName,
      email: newTeacherEmail,
      phone: newTeacherPhone,
      passwordHash: newTeacherPassword,
      isHeadteacher: false,
      designation: newTeacherDesignation,
      classTeacherAssignment: isClassTeacher ? { classId: assignedClass, streamId: assignedStream } : null,
      subjectAssignments: [
        {
          subjectId: assignedSubject,
          classId: assignedClass,
          streamId: assignedStream,
        },
      ],
    });

    setShowAddTeacherModal(false);
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherPhone('');
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    addTask({
      title: taskTitle,
      description: taskDesc,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      priority: taskPriority,
      status: 'todo',
      category: taskCategory,
      assignedToName: taskAssignee || 'Academic Committee',
    });
    setShowAddTaskModal(false);
    setTaskTitle('');
    setTaskDesc('');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    broadcastNotification({
      title: broadcastTitle,
      message: broadcastMessage,
      priority: broadcastPriority,
      targetRole: broadcastTarget,
    });
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile({
      ...currentSchool,
      name: profileName,
      motto: profileMotto,
      email: profileEmail,
      phone: profilePhone,
      address: profileAddress,
      academicYear: profileYear,
      currentTerm: profileTerm,
      badgeUrl: profileBadge,
    });
    setProfileSavedFeedback(true);
    setTimeout(() => setProfileSavedFeedback(false), 2500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportSchoolBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduPortal_Backup_${currentSchool.code}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage({ text: 'Encrypted institutional backup successfully generated and downloaded.' });
  };

  const handleRestoreFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importSchoolBackup(content);
      if (res.success) {
        setBackupMessage({ text: res.message });
      } else {
        setBackupMessage({ text: res.message, error: true });
      }
    };
    reader.readAsText(file);
  };

  const filteredTasks = tasks.filter((t) => (taskFilter === 'all' ? true : t.status === taskFilter));

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.designation.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
                <Building className="w-4 h-4" />
                <span>Headteacher Executive Console</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
                {currentSchool.name}
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Academic Year {currentSchool.academicYear} · {currentSchool.currentTerm} · Institutional Code: {currentSchool.code}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBroadcastModal(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Urgent Broadcast
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                Export Summary (PDF)
              </button>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Enrolled Learners</span>
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {totalLearners}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Namespace: {currentSchool.code}-S*
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Teaching Faculty</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {totalTeachers}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Class Masters &amp; Subject Specialists
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">School Attendance</span>
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
                {avgAttendance}%
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                High student attendance index
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Subscription Validity</span>
                <Clock className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                {currentSchool.subscriptionBilling.toUpperCase()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Expires: {new Date(currentSchool.subscriptionExpiresAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* MULTI-SCHOOL NETWORK & PUBLISHING SECTOR */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Publishing Sector &amp; Subscribed School Portals
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every created school profile receives its dedicated app URL with isolated gradebooks, teacher subportals, and parent tracking.
                </p>
              </div>

              <button
                onClick={() => setShowCreateSchoolModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Another School Profile
              </button>
            </div>

            {/* List of all school portals */}
            <div className="space-y-3">
              {schools.map((sch, schIdx) => {
                const url = getSchoolAppUrl(sch);
                const isCurrent = sch.id === currentSchool.id;
                const isExpired = new Date(sch.subscriptionExpiresAt) < new Date();

                return (
                  <div
                    key={`dash-sch-${sch.id}-${schIdx}`}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{sch.name}</span>
                        <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">
                          {sch.code}
                        </span>
                        {sch.isBlocked ? (
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded">
                            BLOCKED BY SUPER-ADMIN
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded">
                            SUBSCRIPTION EXPIRED
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Administrator Email: <strong>{sch.adminEmail || sch.email}</strong> · Plan: {sch.subscriptionPlan} ({sch.subscriptionBilling})
                      </div>
                      <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="truncate max-w-md">{url}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopyUrl(sch)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5"
                      >
                        {copiedUrlIndex === sch.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedUrlIndex === sch.id ? 'Copied Link!' : 'Copy Portal URL'}
                      </button>

                      {!isCurrent && (
                        <button
                          onClick={() => switchSchool(sch.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                        >
                          Switch to Portal
                        </button>
                      )}

                      {/* Super Admin Block / Unblock Control */}
                      {isSuperAdmin && (
                        <button
                          onClick={() => toggleBlockSchool(sch.id, !sch.isBlocked)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                            sch.isBlocked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          }`}
                          title={`Super-Admin Control (${superAdminEmail})`}
                        >
                          {sch.isBlocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
                          {sch.isBlocked ? 'Unblock Portal' : 'Block Portal'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. STAFF & CREDENTIALS MANAGEMENT TAB */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Faculty &amp; Teacher Credentials Management
              </h2>
              <p className="text-xs text-slate-500">
                Grant classroom permissions, assign subjects &amp; streams, and securely reset teacher passwords
              </p>
            </div>
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Enroll New Teacher
            </button>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty by name or email..."
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Teachers Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 font-semibold">Teacher Name</th>
                    <th className="py-3 px-4 font-semibold">Contact &amp; Email</th>
                    <th className="py-3 px-4 font-semibold">Class Master Of</th>
                    <th className="py-3 px-4 font-semibold">Assigned Subjects</th>
                    <th className="py-3 px-4 font-semibold">Portal Password</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredTeachers.map((tch) => (
                    <tr key={tch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {tch.name}
                        {tch.isHeadteacher && (
                          <span className="ml-1.5 text-[10px] font-mono text-indigo-600 font-bold">
                            [HEADTEACHER]
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 font-normal">{tch.designation}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        <div>{tch.email}</div>
                        <div>{tch.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        {tch.classTeacherAssignment ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {tch.classTeacherAssignment.classId} {tch.classTeacherAssignment.streamId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[11px]">
                        {tch.subjectAssignments.length > 0 ? (
                          tch.subjectAssignments.map((sub, i) => {
                            const s = currentSchool.subjects.find((item) => item.id === sub.subjectId);
                            return <div key={i}>{s?.name || sub.subjectId} ({sub.classId})</div>;
                          })
                        ) : (
                          <span className="text-slate-400 italic">Executive Staff</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {tch.passwordHash}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedTeacherForReset(tch);
                            setNewPasswordInput('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TASK MANAGEMENT DASHBOARD TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Academic &amp; School Task Planner
              </h2>
              <p className="text-xs text-slate-500">
                Organize school inspection deadlines, mark submissions, and administrative milestones
              </p>
            </div>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add School Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-semibold uppercase ${
                        t.priority === 'urgent'
                          ? 'text-rose-600'
                          : t.priority === 'high'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      {t.priority} Priority
                    </span>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {t.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Due: {t.dueDate}
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) =>
                      updateTask({
                        ...t,
                        status: e.target.value as 'todo' | 'in_progress' | 'completed',
                      })
                    }
                    className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SCHOOL PROFILE & SETTINGS TAB */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Institutional Profile &amp; Customization
            </h2>
            <p className="text-xs text-slate-500">
              Changes apply instantly across all teacher gradebooks, parent portals, and reports
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">Institution Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Prefix Code</label>
                <input
                  type="text"
                  disabled
                  value={currentSchool.code}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">School Motto</label>
              <input
                type="text"
                value={profileMotto}
                onChange={(e) => setProfileMotto(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">School Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Academic Year</label>
                <input
                  type="text"
                  value={profileYear}
                  onChange={(e) => setProfileYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Current Term</label>
                <select
                  value={profileTerm}
                  onChange={(e) => setProfileTerm(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
            </div>

            {/* School Badge & Crest Customization */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                Official School Badge / Emblem / Crest
              </label>
              <p className="text-xs text-slate-500">
                This badge appears on the portal navigation header, administrative records, and on official printable student report cards.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {profileBadge ? (
                    <img
                      src={profileBadge}
                      alt="School Badge"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-7 h-7 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload Badge Image (PNG/JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBadgeUpload}
                        className="hidden"
                      />
                    </label>

                    {profileBadge && (
                      <button
                        type="button"
                        onClick={() => setProfileBadge('')}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        Remove Badge
                      </button>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Or choose from academic crest presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CREST_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setProfileBadge(preset.url)}
                          className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition-all ${
                            profileBadge === preset.url
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-2xs'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {profileSavedFeedback && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  School profile changes synchronized across all portals!
                </span>
              )}
              {!profileSavedFeedback && <div />}
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save School Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. CLOUD BACKUP & SUBSCRIPTION SECURITY */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Subscription Expiry & Renewal Deck */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Subscription &amp; Access Status: {currentSchool.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Automated access cut-off on expiration. Renewing restores access to all previous data where you stopped.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => renewSubscription(currentSchool.id, 'Enterprise Campus', 'annual')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Renew 1 Year (Annual)
                </button>
                <button
                  onClick={() => renewSubscription(currentSchool.id, 'Standard Academy', 'termly')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
                >
                  Renew 1 Term (Termly)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Billing Cadence</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">{currentSchool.subscriptionBilling}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Expires On</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {new Date(currentSchool.subscriptionExpiresAt).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Current Status</span>
                <span className="font-bold text-emerald-600 uppercase">{currentSchool.subscriptionStatus}</span>
              </div>
            </div>
          </div>

          {/* Backup Export / Restore */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Encryption &amp; Offline Cloud Snapshot
            </h3>

            {backupMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{backupMessage.text}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Encrypted Database Backup (JSON)
              </button>

              <label className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Restore Database from File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Create New School Profile Modal */}
      {showCreateSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 my-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Create Another School Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Provisions a brand new school portal with isolated gradebooks, teacher subportals, and unique student codes without affecting existing schools.
            </p>

            <form onSubmit={handleCreateSchoolSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold mb-1">School Name *</label>
                  <input
                    type="text"
                    required
                    value={newSchName}
                    onChange={(e) => {
                      setNewSchName(e.target.value);
                      if (!newSchCode) {
                        const words = e.target.value.split(/\s+/).filter(Boolean);
                        setNewSchCode(words.map((w) => w[0]).join('').slice(0, 4).toUpperCase());
                      }
                    }}
                    placeholder="e.g. Kibuli Secondary School"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Prefix Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newSchCode}
                    onChange={(e) => setNewSchCode(e.target.value.toUpperCase())}
                    placeholder="e.g. KBL"
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">School Email *</label>
                <input
                  type="email"
                  required
                  value={newSchEmail}
                  onChange={(e) => setNewSchEmail(e.target.value)}
                  placeholder="admin@new-school.ac.ug"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Administrator Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newSchAdminName}
                    onChange={(e) => setNewSchAdminName(e.target.value)}
                    placeholder="e.g. Hajji Musa Kasule"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Master Password *</label>
                  <input
                    type="password"
                    required
                    value={newSchAdminPass}
                    onChange={(e) => setNewSchAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Billing Term</label>
                  <select
                    value={newSchBilling}
                    onChange={(e) => setNewSchBilling(e.target.value as 'termly' | 'annual')}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="termly">Termly (3 Months)</option>
                    <option value="annual">Annual (1 Year)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tier</label>
                  <select
                    value={newSchPlan}
                    onChange={(e) => setNewSchPlan(e.target.value as 'Standard Academy' | 'Enterprise Campus')}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Standard Academy">Standard Academy</option>
                    <option value="Enterprise Campus">Enterprise Campus</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSchoolModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Provision &amp; Launch Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedTeacherForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Reset Faculty Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating credentials for {selectedTeacherForReset.name}
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold">New Password</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPass}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Generate Pass
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForReset(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
