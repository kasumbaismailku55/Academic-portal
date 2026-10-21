import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  School,
  Teacher,
  Student,
  AssessmentRecord,
  AttendanceSession,
  SchoolTask,
  SchoolNotification,
  ParentMessage,
  AuditLog,
  UserSession,
  RoleType,
  Subject,
  PaymentMethod,
  SubscriptionTransaction,
} from '../types';
import { StorageService } from '../services/storageService';

export type ViewMode = 'welcome' | 'portal' | 'superadmin';

interface PortalContextType {
  // Navigation & View Mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  navigateToSchool: (schoolIdOrSlug: string) => void;
  navigateToWelcome: () => void;
  navigateToSuperAdmin: () => void;

  // Super Administrator (System Creator - ismailkasumba8@gmail.com)
  superAdminAuthenticated: boolean;
  superAdminEmail: string;
  superAdminPhone: string;
  loginSuperAdmin: (email: string, pass: string) => boolean;
  logoutSuperAdmin: () => void;
  transactions: SubscriptionTransaction[];

  // Global States
  schools: School[];
  currentSchool: School;
  currentSchoolId: string;
  currentSession: UserSession | null;
  theme: 'light' | 'dark';
  syncStatus: 'synced' | 'syncing' | 'offline';
  lastSyncTime: Date;
  isSuperAdmin: boolean;

  // Reactive Data Scoped to Current School
  teachers: Teacher[];
  students: Student[];
  assessments: AssessmentRecord[];
  attendance: AttendanceSession[];
  tasks: SchoolTask[];
  notifications: SchoolNotification[];
  messages: ParentMessage[];
  auditLogs: AuditLog[];

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  switchSchool: (schoolId: string) => void;
  subscribeNewSchool: (formData: {
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    motto: string;
    headteacherName: string;
    headteacherPassword: string;
    subscriptionPlan: 'Standard Academy' | 'Enterprise Campus';
    subscriptionBilling: 'termly' | 'annual';
    badgeUrl?: string;
    paymentMethod?: PaymentMethod;
    payerPhoneOrCard?: string;
  }) => School;
  loginAs: (role: RoleType, teacherId?: string, studentId?: string) => void;
  loginParentWithMFA: (studentCode: string, otp: string) => { success: boolean; error?: string };
  logout: () => void;
  updateSchoolProfile: (updated: School) => void;
  updateSchoolBadge: (schoolId: string, badgeUrl: string) => void;
  updateTeacherPassword: (teacherId: string, newPass: string) => void;
  changeTeacherOwnPassword: (teacherId: string, newPass: string) => boolean;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'schoolId'>) => void;
  updateTeacher: (teacher: Teacher) => void;
  addStudent: (data: {
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female';
    classId: string;
    streamId: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    dateOfBirth?: string;
    enrolledSubjectIds?: string[];
    projectTitle?: string;
  }) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  saveAssessmentRecord: (record: AssessmentRecord) => void;
  saveAttendanceSession: (session: AttendanceSession) => void;
  addTask: (task: Omit<SchoolTask, 'id' | 'schoolId' | 'createdAt'>) => void;
  updateTask: (task: SchoolTask) => void;
  deleteTask: (taskId: string) => void;
  broadcastNotification: (notif: Omit<SchoolNotification, 'id' | 'schoolId' | 'createdAt'>) => void;
  sendParentMessage: (msg: Omit<ParentMessage, 'id' | 'schoolId' | 'createdAt' | 'status'>) => void;
  replyParentMessage: (msgId: string, reply: string) => void;
  exportSchoolBackup: () => string;
  importSchoolBackup: (jsonStr: string) => { success: boolean; message: string };
  resetToDemo: () => void;

  // New features
  addSubjectToSchool: (subject: Subject) => void;
  deleteSubjectFromSchool: (subjectId: string) => void;
  renewSubscription: (schoolId: string, plan: 'Standard Academy' | 'Enterprise Campus', billing: 'termly' | 'annual', paymentMethod?: PaymentMethod, payerPhoneOrCard?: string) => void;
  toggleBlockSchool: (schoolId: string, isBlocked: boolean, reason?: string) => void;
  updateClassTeacherRemarks: (classStream: string, teacherName: string, remarks: string) => void;
  getSchoolAppUrl: (school: School) => string;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage once
  useEffect(() => {
    StorageService.init();
  }, []);

  const SUPER_ADMIN_EMAIL = 'ismailkasumba8@gmail.com';
  const SUPER_ADMIN_PHONE = '0786721142';
  const SUPER_ADMIN_PASS = '18801800';

  // Primary reactive collections stored directly in React state
  const [schools, setSchools] = useState<School[]>(() => StorageService.getSchools());
  const [allTeachers, setAllTeachers] = useState<Teacher[]>(() => StorageService.getTeachers());
  const [allStudents, setAllStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [allAssessments, setAllAssessments] = useState<AssessmentRecord[]>(() => StorageService.getAssessments());
  const [allAttendance, setAllAttendance] = useState<AttendanceSession[]>(() => StorageService.getAttendance());
  const [allTasks, setAllTasks] = useState<SchoolTask[]>(() => StorageService.getTasks());
  const [allNotifications, setAllNotifications] = useState<SchoolNotification[]>(() => StorageService.getNotifications());
  const [allMessages, setAllMessages] = useState<ParentMessage[]>(() => StorageService.getMessages());
  const [allAuditLogs, setAllAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>(() => StorageService.getTransactions());

  // View Mode: 'welcome' (main landing), 'portal' (active school), or 'superadmin' (creator console)
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'super') return 'superadmin';
      if (params.get('school')) return 'portal';
    } catch {
      // fallback
    }
    return 'welcome'; // Welcome page is the default landing portal
  });

  const [superAdminAuthenticated, setSuperAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('eduportal_super_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Check URL query for direct school link e.g. ?school=namagunga
  const [currentSchoolId, setCurrentSchoolId] = useState<string>(() => {
    const list = StorageService.getSchools();
    try {
      const params = new URLSearchParams(window.location.search);
      const querySchool = params.get('school');
      if (querySchool) {
        const found = list.find(
          (s) => s.slug.toLowerCase() === querySchool.toLowerCase() || s.code.toLowerCase() === querySchool.toLowerCase()
        );
        if (found) return found.id;
      }
    } catch {
      // fallback
    }
    return list[0]?.id || 'sch_namagunga';
  });

  const [currentSession, setCurrentSession] = useState<UserSession | null>(() => {
    const initialTeachers = StorageService.getTeachers('sch_namagunga');
    const head = initialTeachers.find((t) => t.isHeadteacher);
    return {
      role: 'admin',
      schoolId: 'sch_namagunga',
      teacher: head,
      authenticatedAt: new Date().toISOString(),
    };
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('eduportal_theme_v2');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Apply dark theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('eduportal_theme_v2', theme);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));

  const markSyncActivity = useCallback(() => {
    setSyncStatus('syncing');
    setLastSyncTime(new Date());
    setTimeout(() => {
      setSyncStatus('synced');
    }, 300);
  }, []);

  // Listen for storage events (across tabs and internal writes) to reload all reactive collections
  const reloadAllFromStorage = useCallback(() => {
    setSchools(StorageService.getSchools());
    setAllTeachers(StorageService.getTeachers());
    setAllStudents(StorageService.getStudents());
    setAllAssessments(StorageService.getAssessments());
    setAllAttendance(StorageService.getAttendance());
    setAllTasks(StorageService.getTasks());
    setAllNotifications(StorageService.getNotifications());
    setAllMessages(StorageService.getMessages());
    setAllAuditLogs(StorageService.getAuditLogs());
    markSyncActivity();
  }, [markSyncActivity]);

  useEffect(() => {
    const handleStorageEvent = () => {
      reloadAllFromStorage();
    };
    window.addEventListener('eduportal_storage_sync', handleStorageEvent);
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('eduportal_storage_sync', handleStorageEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [reloadAllFromStorage]);

  // Derived current school
  const currentSchool = useMemo(() => {
    return schools.find((s) => s.id === currentSchoolId) || schools[0];
  }, [schools, currentSchoolId]);

  // Reactive data filtered strictly to current school
  const teachers = useMemo(() => allTeachers.filter((t) => t.schoolId === currentSchoolId), [allTeachers, currentSchoolId]);
  const students = useMemo(() => allStudents.filter((s) => s.schoolId === currentSchoolId), [allStudents, currentSchoolId]);
  const assessments = useMemo(() => allAssessments.filter((a) => a.schoolId === currentSchoolId), [allAssessments, currentSchoolId]);
  const attendance = useMemo(() => allAttendance.filter((att) => att.schoolId === currentSchoolId), [allAttendance, currentSchoolId]);
  const tasks = useMemo(() => allTasks.filter((t) => t.schoolId === currentSchoolId), [allTasks, currentSchoolId]);
  const notifications = useMemo(() => allNotifications.filter((n) => n.schoolId === currentSchoolId), [allNotifications, currentSchoolId]);
  const messages = useMemo(() => allMessages.filter((m) => m.schoolId === currentSchoolId), [allMessages, currentSchoolId]);
  const auditLogs = useMemo(() => allAuditLogs.filter((l) => l.schoolId === currentSchoolId), [allAuditLogs, currentSchoolId]);

  // Check if current user is super admin
  const isSuperAdmin = currentSession?.teacher?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
    currentSession?.role === 'admin';

  // Helper to get school URL
  const getSchoolAppUrl = (school: School) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?school=${school.slug}`;
  };

  // Switch school
  const switchSchool = (schoolId: string) => {
    setCurrentSchoolId(schoolId);
    const schTeachers = StorageService.getTeachers(schoolId);
    const head = schTeachers.find((t) => t.isHeadteacher) || schTeachers[0];
    setCurrentSession({
      role: 'admin',
      schoolId,
      teacher: head,
      authenticatedAt: new Date().toISOString(),
    });

    // Update browser URL query without reload
    try {
      const sch = schools.find((s) => s.id === schoolId);
      if (sch) {
        const newUrl = `${window.location.pathname}?school=${sch.slug}`;
        window.history.pushState({ schoolId }, '', newUrl);
      }
    } catch {
      // ignore
    }

    markSyncActivity();
  };

  // Navigation and Portal Switch Helpers
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (mode === 'welcome') {
      try {
        window.history.pushState({}, '', window.location.pathname);
      } catch {}
    } else if (mode === 'superadmin') {
      try {
        window.history.pushState({}, '', `${window.location.pathname}?admin=super`);
      } catch {}
    }
  };

  const navigateToSchool = (schoolIdOrSlug: string) => {
    const target = schools.find(
      (s) =>
        s.id === schoolIdOrSlug ||
        s.slug.toLowerCase() === schoolIdOrSlug.toLowerCase() ||
        s.code.toLowerCase() === schoolIdOrSlug.toLowerCase()
    );
    if (target) {
      switchSchool(target.id);
      setViewModeState('portal');
      try {
        window.history.pushState({ schoolId: target.id }, '', `${window.location.pathname}?school=${target.slug}`);
      } catch {}
    }
  };

  const navigateToWelcome = () => {
    setViewMode('welcome');
  };

  const navigateToSuperAdmin = () => {
    setViewMode('superadmin');
  };

  const loginSuperAdmin = (email: string, pass: string): boolean => {
    if (email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && pass === SUPER_ADMIN_PASS) {
      setSuperAdminAuthenticated(true);
      try {
        sessionStorage.setItem('eduportal_super_auth', 'true');
      } catch {}
      setViewModeState('superadmin');
      try {
        window.history.pushState({}, '', `${window.location.pathname}?admin=super`);
      } catch {}
      return true;
    }
    return false;
  };

  const logoutSuperAdmin = () => {
    setSuperAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('eduportal_super_auth');
    } catch {}
    setViewMode('welcome');
  };

  const updateSchoolBadge = (schoolId: string, badgeUrl: string) => {
    StorageService.updateSchoolBadge(schoolId, badgeUrl);
    setSchools(StorageService.getSchools());
    markSyncActivity();
  };

  // Subscribe new school (creates a brand new isolated school profile)
  const subscribeNewSchool = (formData: {
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    motto: string;
    headteacherName: string;
    headteacherPassword: string;
    subscriptionPlan: 'Standard Academy' | 'Enterprise Campus';
    subscriptionBilling: 'termly' | 'annual';
    badgeUrl?: string;
    paymentMethod?: PaymentMethod;
    payerPhoneOrCard?: string;
  }): School => {
    const newSchoolId = `sch_${formData.code.toLowerCase()}_${Date.now().toString(36)}`;
    const months = formData.subscriptionBilling === 'annual' ? 12 : 3;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const badge = formData.badgeUrl || '';

    const newSchool: School = {
      id: newSchoolId,
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      code: formData.code.toUpperCase().trim(),
      motto: formData.motto || 'Knowledge, Discipline, and Excellence',
      email: formData.email,
      adminEmail: formData.email,
      phone: formData.phone,
      address: formData.address,
      logoUrl: badge,
      badgeUrl: badge,
      academicYear: '2026',
      currentTerm: 'Term 2',
      terms: ['Term 1', 'Term 2', 'Term 3'],
      classes: ['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6'],
      streams: ['East', 'West', 'S.4A', 'S.4B', 'Sciences', 'Arts'],
      subjects: [
        // O-Level
        { id: `sub_${newSchoolId}_mth`, name: 'Mathematics (O-Level)', code: 'MTH', isCore: true, level: 'O-Level' },
        { id: `sub_${newSchoolId}_eng`, name: 'English Language', code: 'ENG', isCore: true, level: 'O-Level' },
        { id: `sub_${newSchoolId}_chm`, name: 'Chemistry (O-Level)', code: 'CHM', isCore: true, level: 'O-Level' },
        { id: `sub_${newSchoolId}_phy`, name: 'Physics (O-Level)', code: 'PHY', isCore: true, level: 'O-Level' },
        { id: `sub_${newSchoolId}_bio`, name: 'Biology (O-Level)', code: 'BIO', isCore: true, level: 'O-Level' },
        // A-Level Principals
        { id: `sub_${newSchoolId}_aphy`, name: 'Physics (A-Level)', code: 'PHY', isCore: false, level: 'A-Level', isSubsidiary: false, papers: ['Paper 1', 'Paper 2'] },
        { id: `sub_${newSchoolId}_achm`, name: 'Chemistry (A-Level)', code: 'CHM', isCore: false, level: 'A-Level', isSubsidiary: false, papers: ['Paper 1', 'Paper 2'] },
        { id: `sub_${newSchoolId}_amth`, name: 'Mathematics (A-Level)', code: 'MTH', isCore: false, level: 'A-Level', isSubsidiary: false, papers: ['Paper 1', 'Paper 2'] },
        // A-Level Subsidiaries (Strictly max 1 pt)
        { id: `sub_${newSchoolId}_agp`, name: 'General Paper (A-Level)', code: 'GP', isCore: true, level: 'A-Level', isSubsidiary: true, papers: ['Paper 1'] },
        { id: `sub_${newSchoolId}_asmath`, name: 'Subsidiary Mathematics', code: 'SMTH', isCore: false, level: 'A-Level', isSubsidiary: true, papers: ['Paper 1'] },
        { id: `sub_${newSchoolId}_asict`, name: 'Subsidiary ICT', code: 'SICT', isCore: false, level: 'A-Level', isSubsidiary: true, papers: ['Paper 1'] },
      ],
      subscribedAt: new Date().toISOString(),
      subscriptionPlan: formData.subscriptionPlan,
      subscriptionBilling: formData.subscriptionBilling,
      subscriptionExpiresAt: expiresAt.toISOString(),
      subscriptionStatus: 'active',
      isBlocked: false,
      encryptionKeyFingerprint: `SHA256:${Math.random().toString(36).substring(2, 14)}`,
      cloudBackupEnabled: true,
      lastCloudBackup: new Date().toISOString(),
      classTeacherRemarksMap: {},
    };

    const headteacher: Teacher = {
      id: `tch_head_${Date.now()}`,
      schoolId: newSchoolId,
      name: formData.headteacherName,
      email: formData.email,
      phone: formData.phone,
      passwordHash: formData.headteacherPassword || 'admin123',
      isHeadteacher: true,
      designation: 'Headteacher / Principal',
      classTeacherAssignment: null,
      subjectAssignments: [],
      lastLogin: new Date().toISOString(),
    };

    StorageService.addSchool(newSchool);
    StorageService.addTeacher(headteacher);

    // Save initial subscription transaction routed to 0786721142
    const isAnnual = formData.subscriptionBilling === 'annual';
    const tx: SubscriptionTransaction = {
      id: `tx_${formData.code.toLowerCase()}_${Date.now().toString(36)}`,
      schoolId: newSchoolId,
      schoolName: formData.name,
      amountUgx: isAnnual ? 480000 : 180000,
      amountUsd: isAnnual ? 129 : 49,
      paymentMethod: formData.paymentMethod || 'mtn_momo',
      payerPhoneOrCard: formData.payerPhoneOrCard || formData.phone,
      destinationAccount: SUPER_ADMIN_PHONE,
      reference: `MOMO-${formData.code.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      billingCycle: formData.subscriptionBilling,
      plan: formData.subscriptionPlan,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    StorageService.addTransaction(tx);
    setTransactions((prev) => [tx, ...prev]);

    StorageService.logAction(
      newSchoolId,
      formData.headteacherName,
      'Headteacher',
      'SCHOOL_SUBSCRIPTION_ACTIVATED',
      `Subscribed ${formData.name} under ${formData.subscriptionBilling} plan (Synced to merchant 0786721142)`
    );

    // Update state directly - ensure clean deduplication
    setSchools((prev) => {
      const filtered = prev.filter((s) => s.id !== newSchool.id);
      return [...filtered, newSchool];
    });
    setAllTeachers((prev) => {
      const filtered = prev.filter((t) => t.id !== headteacher.id);
      return [headteacher, ...filtered];
    });
    setCurrentSchoolId(newSchoolId);
    setCurrentSession({
      role: 'admin',
      schoolId: newSchoolId,
      teacher: headteacher,
      authenticatedAt: new Date().toISOString(),
    });
    setViewModeState('portal');

    markSyncActivity();
    return newSchool;
  };

  // Demo Login & Quick Role Switch
  const loginAs = (role: RoleType, teacherId?: string, studentId?: string) => {
    let tch: Teacher | undefined;
    let stu: Student | undefined;

    const currentSchoolTeachers = StorageService.getTeachers(currentSchoolId);
    const currentSchoolStudents = StorageService.getStudents(currentSchoolId);

    if (role === 'admin') {
      tch = currentSchoolTeachers.find((t) => t.isHeadteacher) || currentSchoolTeachers[0];
    } else if (role === 'class_teacher') {
      tch = teacherId
        ? currentSchoolTeachers.find((t) => t.id === teacherId)
        : currentSchoolTeachers.find((t) => !!t.classTeacherAssignment) || currentSchoolTeachers[1];
    } else if (role === 'subject_teacher') {
      tch = teacherId
        ? currentSchoolTeachers.find((t) => t.id === teacherId)
        : currentSchoolTeachers.find((t) => t.subjectAssignments.length > 0) || currentSchoolTeachers[2];
    } else if (role === 'parent') {
      stu = studentId
        ? currentSchoolStudents.find((s) => s.id === studentId)
        : currentSchoolStudents[0];
    }

    setCurrentSession({
      role,
      schoolId: currentSchoolId,
      teacher: tch,
      student: stu,
      authenticatedAt: new Date().toISOString(),
    });
    markSyncActivity();
  };

  // Parent login with MFA OTP
  const loginParentWithMFA = (studentCode: string, otp: string): { success: boolean; error?: string } => {
    const student = StorageService.findStudentByCode(currentSchoolId, studentCode);
    if (!student) {
      return {
        success: false,
        error: `No learner found matching student code "${studentCode}" in ${currentSchool.name}. Verify student code namespace.`,
      };
    }

    if (student.mfaSecretPin !== otp.trim()) {
      return {
        success: false,
        error: 'Invalid 6-digit verification code. Please check the simulated OTP display and re-enter.',
      };
    }

    setCurrentSession({
      role: 'parent',
      schoolId: currentSchoolId,
      student,
      authenticatedAt: new Date().toISOString(),
    });
    StorageService.logAction(
      currentSchoolId,
      student.parentName,
      'Parent',
      'PARENT_PORTAL_MFA_LOGIN',
      `Authenticated for learner ${student.firstName} ${student.lastName} (${student.studentCode})`
    );
    markSyncActivity();
    return { success: true };
  };

  const logout = () => {
    setCurrentSession(null);
  };

  // Update School Profile
  const updateSchoolProfile = (updated: School) => {
    StorageService.updateSchool(updated);
    setSchools((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    StorageService.logAction(
      updated.id,
      currentSession?.teacher?.name || 'Administrator',
      'Headteacher',
      'SCHOOL_PROFILE_UPDATED',
      'Updated school information, motto, or curriculum settings'
    );
    markSyncActivity();
  };

  // Update Teacher Password by Headteacher
  const updateTeacherPassword = (teacherId: string, newPass: string) => {
    StorageService.changeTeacherPassword(teacherId, newPass);
    setAllTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, passwordHash: newPass } : t))
    );
    StorageService.logAction(
      currentSchoolId,
      currentSession?.teacher?.name || 'Headteacher',
      'Headteacher',
      'PASSWORD_RESET',
      `Admin updated credentials for teacher ID ${teacherId}`
    );
    markSyncActivity();
  };

  // Change Teacher Own Password from Teacher Portal
  const changeTeacherOwnPassword = (teacherId: string, newPass: string): boolean => {
    const ok = StorageService.changeTeacherPassword(teacherId, newPass);
    if (ok) {
      setAllTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, passwordHash: newPass } : t))
      );
      if (currentSession?.teacher?.id === teacherId) {
        setCurrentSession((prev) =>
          prev ? { ...prev, teacher: { ...prev.teacher!, passwordHash: newPass } } : null
        );
      }
      StorageService.logAction(
        currentSchoolId,
        currentSession?.teacher?.name || 'Teacher',
        'Teacher',
        'PASSWORD_SELF_UPDATED',
        'Teacher updated their own portal password'
      );
      markSyncActivity();
    }
    return ok;
  };

  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'schoolId'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      id: `tch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      schoolId: currentSchoolId,
    };
    StorageService.addTeacher(newTeacher);
    setAllTeachers((prev) => [newTeacher, ...prev.filter((t) => t.id !== newTeacher.id)]);
    StorageService.logAction(
      currentSchoolId,
      currentSession?.teacher?.name || 'Headteacher',
      'Headteacher',
      'TEACHER_ENROLLED',
      `Enrolled staff member: ${newTeacher.name} (${newTeacher.designation})`
    );
    markSyncActivity();
  };

  const updateTeacher = (updated: Teacher) => {
    StorageService.updateTeacher(updated);
    setAllTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    markSyncActivity();
  };

  // Student Enrollment - Perpetual & Globally Shared
  const addStudent = (data: {
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female';
    classId: string;
    streamId: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    dateOfBirth?: string;
    enrolledSubjectIds?: string[];
    projectTitle?: string;
  }): Student => {
    const uniqueCode = StorageService.generateUniqueStudentCode(currentSchool, data.classId);
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();

    const isALevel = data.classId.includes('5') || data.classId.includes('6');
    const defaultSubjectIds = data.enrolledSubjectIds && data.enrolledSubjectIds.length > 0
      ? data.enrolledSubjectIds
      : currentSchool.subjects
          .filter((s) => (isALevel ? s.level === 'A-Level' : s.level === 'O-Level'))
          .slice(0, isALevel ? 5 : 8)
          .map((s) => s.id);

    const newStudent: Student = {
      id: `stu_${currentSchool.code.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      schoolId: currentSchoolId,
      studentCode: uniqueCode,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      classId: data.classId,
      streamId: data.streamId,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      dateOfBirth: data.dateOfBirth,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'enrolled',
      mfaSecretPin: randomPin,
      enrolledSubjectIds: defaultSubjectIds,
      projectTitle: data.projectTitle || `${data.classId} Practical Competency Project`,
    };

    StorageService.addStudent(newStudent);
    // Explicitly update React state so all accounts & components immediately reflect the student
    setAllStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);

    StorageService.logAction(
      currentSchoolId,
      currentSession?.teacher?.name || 'Class Teacher',
      'Teacher',
      'STUDENT_ENROLLED',
      `Enrolled learner ${newStudent.firstName} ${newStudent.lastName} into ${newStudent.classId} ${newStudent.streamId} (Code: ${newStudent.studentCode})`
    );
    markSyncActivity();
    return newStudent;
  };

  const updateStudent = (student: Student) => {
    StorageService.updateStudent(student);
    setAllStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    markSyncActivity();
  };

  const deleteStudent = (studentId: string) => {
    StorageService.deleteStudent(studentId);
    setAllStudents((prev) => prev.filter((s) => s.id !== studentId));
    markSyncActivity();
  };

  // Assessment Persistence - Shared Across Whole Portal
  const saveAssessmentRecord = (record: AssessmentRecord) => {
    StorageService.upsertAssessment(record);
    setAllAssessments((prev) => {
      const idx = prev.findIndex(
        (a) =>
          a.schoolId === record.schoolId &&
          a.studentId === record.studentId &&
          a.subjectId === record.subjectId &&
          a.term === record.term &&
          a.year === record.year
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    StorageService.logAction(
      currentSchoolId,
      currentSession?.teacher?.name || 'Teacher',
      'Teacher',
      'ASSESSMENT_SAVED',
      `Updated marks and evaluation for student ${record.studentId}`
    );
    markSyncActivity();
  };

  const saveAttendanceSession = (session: AttendanceSession) => {
    StorageService.upsertAttendanceSession(session);
    setAllAttendance((prev) => {
      const idx = prev.findIndex(
        (s) =>
          s.schoolId === session.schoolId &&
          s.classId === session.classId &&
          s.streamId === session.streamId &&
          s.date === session.date
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = session;
        return copy;
      }
      return [session, ...prev];
    });
    markSyncActivity();
  };

  const addTask = (taskData: Omit<SchoolTask, 'id' | 'schoolId' | 'createdAt'>) => {
    const newTask: SchoolTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      schoolId: currentSchoolId,
      createdAt: new Date().toISOString(),
    };
    StorageService.upsertTask(newTask);
    setAllTasks((prev) => [newTask, ...prev.filter((t) => t.id !== newTask.id)]);
    markSyncActivity();
  };

  const updateTask = (task: SchoolTask) => {
    StorageService.upsertTask(task);
    setAllTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    markSyncActivity();
  };

  const deleteTask = (taskId: string) => {
    StorageService.deleteTask(taskId);
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
    markSyncActivity();
  };

  const broadcastNotification = (notif: Omit<SchoolNotification, 'id' | 'schoolId' | 'createdAt'>) => {
    const newNotif: SchoolNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      schoolId: currentSchoolId,
      createdAt: new Date().toISOString(),
    };
    StorageService.addNotification(newNotif);
    setAllNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
    markSyncActivity();
  };

  const sendParentMessage = (msg: Omit<ParentMessage, 'id' | 'schoolId' | 'createdAt' | 'status'>) => {
    const newMsg: ParentMessage = {
      ...msg,
      id: `msg_${Date.now()}`,
      schoolId: currentSchoolId,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    StorageService.addMessage(newMsg);
    setAllMessages((prev) => [newMsg, ...prev]);
    markSyncActivity();
  };

  const replyParentMessage = (msgId: string, reply: string) => {
    const target = allMessages.find((m) => m.id === msgId);
    if (target) {
      const updated = { ...target, reply, status: 'resolved' as const };
      StorageService.updateMessage(updated);
      setAllMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
      markSyncActivity();
    }
  };

  // Add / Delete Subjects from School Curriculum
  const addSubjectToSchool = (subject: Subject) => {
    StorageService.addSubjectToSchool(currentSchoolId, subject);
    setSchools(StorageService.getSchools());
    markSyncActivity();
  };

  const deleteSubjectFromSchool = (subjectId: string) => {
    StorageService.deleteSubjectFromSchool(currentSchoolId, subjectId);
    setSchools(StorageService.getSchools());
    markSyncActivity();
  };

  // Renew Subscription (Termly or Annual) - Synced to Merchant Account 0786721142
  const renewSubscription = (
    schoolId: string,
    plan: 'Standard Academy' | 'Enterprise Campus',
    billing: 'termly' | 'annual',
    paymentMethod: PaymentMethod = 'mtn_momo',
    payerPhoneOrCard = '0786721142'
  ) => {
    StorageService.renewSchoolSubscription(schoolId, plan, billing);
    setSchools(StorageService.getSchools());

    const targetSchool = schools.find((s) => s.id === schoolId);
    const isAnnual = billing === 'annual';
    const tx: SubscriptionTransaction = {
      id: `tx_renew_${Date.now().toString(36)}`,
      schoolId,
      schoolName: targetSchool?.name || 'School Renewal',
      amountUgx: isAnnual ? 480000 : 180000,
      amountUsd: isAnnual ? 129 : 49,
      paymentMethod,
      payerPhoneOrCard,
      destinationAccount: SUPER_ADMIN_PHONE,
      reference: `RENEW-${targetSchool?.code || 'SCH'}-${Math.floor(100000 + Math.random() * 900000)}`,
      billingCycle: billing,
      plan,
      status: 'completed',
      timestamp: new Date().toISOString(),
    };
    StorageService.addTransaction(tx);
    setTransactions((prev) => [tx, ...prev]);

    StorageService.logAction(
      schoolId,
      'System Billing',
      'Finance',
      'SUBSCRIPTION_RENEWED',
      `Renewed ${billing} subscription for plan ${plan}. Synced to merchant 0786721142`
    );
    markSyncActivity();
  };

  // Block / Unblock School (Super Admin feature for ismailkasumba8@gmail.com)
  const toggleBlockSchool = (schoolId: string, isBlocked: boolean, reason?: string) => {
    StorageService.setSchoolBlocked(schoolId, isBlocked, reason);
    setSchools(StorageService.getSchools());
    StorageService.logAction(
      schoolId,
      SUPER_ADMIN_EMAIL,
      'Super Admin',
      isBlocked ? 'PORTAL_BLOCKED' : 'PORTAL_UNBLOCKED',
      reason || 'Super Admin access override'
    );
    markSyncActivity();
  };

  // Class Teacher remarks and name customization
  const updateClassTeacherRemarks = (classStream: string, teacherName: string, remarks: string) => {
    StorageService.updateClassTeacherRemarks(currentSchoolId, classStream, teacherName, remarks);
    setSchools(StorageService.getSchools());
    markSyncActivity();
  };

  const exportSchoolBackup = () => {
    return StorageService.exportFullBackup(currentSchoolId);
  };

  const importSchoolBackup = (jsonStr: string) => {
    const res = StorageService.importBackup(jsonStr);
    if (res.success && res.schoolId) {
      reloadAllFromStorage();
      setCurrentSchoolId(res.schoolId);
    }
    return res;
  };

  const resetToDemo = () => {
    StorageService.resetAll();
  };

  return (
    <PortalContext.Provider
      value={{
        viewMode,
        setViewMode,
        navigateToSchool,
        navigateToWelcome,
        navigateToSuperAdmin,
        superAdminAuthenticated,
        superAdminEmail: SUPER_ADMIN_EMAIL,
        superAdminPhone: SUPER_ADMIN_PHONE,
        loginSuperAdmin,
        logoutSuperAdmin,
        transactions,
        schools,
        currentSchool,
        currentSchoolId,
        currentSession,
        theme,
        syncStatus,
        lastSyncTime,
        isSuperAdmin,
        teachers,
        students,
        assessments,
        attendance,
        tasks,
        notifications,
        messages,
        auditLogs,
        setTheme,
        toggleTheme,
        switchSchool,
        subscribeNewSchool,
        loginAs,
        loginParentWithMFA,
        logout,
        updateSchoolProfile,
        updateSchoolBadge,
        updateTeacherPassword,
        changeTeacherOwnPassword,
        addTeacher,
        updateTeacher,
        addStudent,
        updateStudent,
        deleteStudent,
        saveAssessmentRecord,
        saveAttendanceSession,
        addTask,
        updateTask,
        deleteTask,
        broadcastNotification,
        sendParentMessage,
        replyParentMessage,
        exportSchoolBackup,
        importSchoolBackup,
        resetToDemo,
        addSubjectToSchool,
        deleteSubjectFromSchool,
        renewSubscription,
        toggleBlockSchool,
        updateClassTeacherRemarks,
        getSchoolAppUrl,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = (): PortalContextType => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
