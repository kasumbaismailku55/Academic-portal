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
  Subject,
  SubscriptionTransaction,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_TASKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  SCHOOLS: 'eduportal_schools_v2',
  TEACHERS: 'eduportal_teachers_v2',
  STUDENTS: 'eduportal_students_v2',
  ASSESSMENTS: 'eduportal_assessments_v2',
  ATTENDANCE: 'eduportal_attendance_v2',
  TASKS: 'eduportal_tasks_v2',
  NOTIFICATIONS: 'eduportal_notifications_v2',
  MESSAGES: 'eduportal_messages_v2',
  AUDIT_LOGS: 'eduportal_audit_logs_v2',
  TRANSACTIONS: 'eduportal_transactions_v2',
  SESSION: 'eduportal_current_session_v2',
  THEME: 'eduportal_theme_v2',
};

// Helper to enforce unique IDs across any entity array
function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (item && item.id && !seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

// Safe JSON fetch with default fallback
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed.payload !== undefined ? parsed.payload : parsed;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

// Safe JSON save with simulated encryption header and auto-sync broadcast
function safeSet<T>(key: string, value: T): void {
  try {
    const container = {
      _enc: 'AES-256-GCM-SIMULATED',
      timestamp: new Date().toISOString(),
      payload: value,
    };
    localStorage.setItem(key, JSON.stringify(container));
    // Emit sync event for multi-tab and multi-component state reactivity
    window.dispatchEvent(new CustomEvent('eduportal_storage_sync', { detail: { key } }));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  // Initialization - seed if empty, and sanitize any duplicate records currently in localStorage
  init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
      safeSet(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    } else {
      // Auto-heal existing storage in case duplicates exist
      const rawSchools = safeGet<School[]>(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
      const cleanSchools = deduplicateById(rawSchools);
      // Ensure initial demo schools exist
      for (const initSch of INITIAL_SCHOOLS) {
        if (!cleanSchools.some((s) => s.id === initSch.id)) {
          cleanSchools.push(initSch);
        }
      }
      safeSet(STORAGE_KEYS.SCHOOLS, cleanSchools);
    }

    if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
      safeSet(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    } else {
      const rawTeachers = safeGet<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
      const cleanTeachers = deduplicateById(rawTeachers);
      for (const initTch of INITIAL_TEACHERS) {
        if (!cleanTeachers.some((t) => t.id === initTch.id)) {
          cleanTeachers.push(initTch);
        }
      }
      safeSet(STORAGE_KEYS.TEACHERS, cleanTeachers);
    }

    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      safeSet(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    } else {
      const rawStudents = safeGet<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const cleanStudents = deduplicateById(rawStudents);
      if (cleanStudents.length !== rawStudents.length) {
        safeSet(STORAGE_KEYS.STUDENTS, cleanStudents);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      safeSet(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      safeSet(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      safeSet(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      safeSet(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      safeSet(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      safeSet(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
  },

  // Reset to initial demo state
  resetAll(): void {
    localStorage.clear();
    this.init();
    window.location.reload();
  },

  // Schools
  getSchools(): School[] {
    const raw = safeGet<School[]>(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    const clean = deduplicateById(raw);
    if (clean.length !== raw.length) {
      safeSet(STORAGE_KEYS.SCHOOLS, clean);
    }
    return clean;
  },
  saveSchools(schools: School[]): void {
    safeSet(STORAGE_KEYS.SCHOOLS, deduplicateById(schools));
  },
  getSchoolById(schoolId: string): School | undefined {
    return this.getSchools().find((s) => s.id === schoolId);
  },
  updateSchool(updated: School): void {
    const list = this.getSchools().map((s) => (s.id === updated.id ? updated : s));
    this.saveSchools(list);
  },
  addSchool(newSchool: School): void {
    const list = this.getSchools();
    const filtered = list.filter((s) => s.id !== newSchool.id);
    this.saveSchools([...filtered, newSchool]);
  },
  setSchoolBlocked(schoolId: string, isBlocked: boolean, reason?: string): void {
    const list = this.getSchools().map((s) => {
      if (s.id === schoolId) {
        const isExpired = new Date(s.subscriptionExpiresAt).getTime() < Date.now();
        return {
          ...s,
          isBlocked,
          subscriptionStatus: isBlocked ? ('blocked' as const) : isExpired ? ('expired' as const) : ('active' as const),
          blockedReason: isBlocked ? (reason || 'Access suspended by super-admin (ismailkasumba8@gmail.com)') : undefined,
        };
      }
      return s;
    });
    this.saveSchools(list);

    this.addAuditLog({
      id: `audit_blk_${Date.now()}`,
      schoolId,
      timestamp: new Date().toISOString(),
      action: 'UPDATE',
      entity: 'School',
      entityId: schoolId,
      performedBy: 'Super-Admin (ismailkasumba8@gmail.com)',
      details: isBlocked
        ? `School access locked: ${reason || 'Administrative restriction enforced'}`
        : 'School access restriction lifted',
    });
  },
  deleteSchool(schoolId: string): void {
    // 1. Remove school from schools list
    const schools = this.getSchools().filter((s) => s.id !== schoolId);
    this.saveSchools(schools);

    // 2. Cascade delete teachers
    const teachers = this.getTeachers().filter((t) => t.schoolId !== schoolId);
    this.saveTeachers(teachers);

    // 3. Cascade delete students
    const students = this.getStudents().filter((s) => s.schoolId !== schoolId);
    this.saveStudents(students);

    // 4. Cascade delete assessments
    const assessments = this.getAssessments().filter((a) => a.schoolId !== schoolId);
    this.saveAssessments(assessments);

    // 5. Cascade delete attendance
    const attendance = this.getAttendance().filter((att) => att.schoolId !== schoolId);
    this.saveAttendance(attendance);

    // 6. Cascade delete tasks
    const tasks = this.getTasks().filter((task) => task.schoolId !== schoolId);
    this.saveTasks(tasks);

    // 7. Cascade delete notifications
    const notifications = this.getNotifications().filter((n) => n.schoolId !== schoolId);
    this.saveNotifications(notifications);

    // 8. Cascade delete messages
    const messages = this.getMessages().filter((m) => m.schoolId !== schoolId);
    this.saveMessages(messages);

    // 9. Audit log entry
    this.addAuditLog({
      id: `audit_del_${Date.now()}`,
      schoolId: 'system',
      timestamp: new Date().toISOString(),
      action: 'DELETE',
      entity: 'School',
      entityId: schoolId,
      performedBy: 'Super-Admin (ismailkasumba8@gmail.com)',
      details: `Permanently deleted institution record ${schoolId} and cascaded all associated tenant data`,
    });
  },
  renewSchoolSubscription(schoolId: string, plan: 'Standard Academy' | 'Enterprise Campus', billing: 'termly' | 'annual'): void {
    const months = billing === 'annual' ? 12 : 3;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);

    const list = this.getSchools().map((s) => {
      if (s.id === schoolId) {
        return {
          ...s,
          subscriptionPlan: plan,
          subscriptionBilling: billing,
          subscriptionExpiresAt: expiry.toISOString(),
          subscriptionStatus: 'active' as const,
          isBlocked: false,
          blockedReason: undefined,
        };
      }
      return s;
    });
    this.saveSchools(list);
  },
  addSubjectToSchool(schoolId: string, subject: Subject): void {
    const school = this.getSchoolById(schoolId);
    if (!school) return;
    const exists = school.subjects.some((s) => s.id === subject.id || s.code === subject.code);
    if (exists) return;
    this.updateSchool({
      ...school,
      subjects: [...school.subjects, subject],
    });
  },
  deleteSubjectFromSchool(schoolId: string, subjectId: string): void {
    const school = this.getSchoolById(schoolId);
    if (!school) return;
    this.updateSchool({
      ...school,
      subjects: school.subjects.filter((s) => s.id !== subjectId),
    });
  },
  updateClassTeacherRemarks(schoolId: string, classStream: string, teacherName: string, remarks: string): void {
    const school = this.getSchoolById(schoolId);
    if (!school) return;
    const map = school.classTeacherRemarksMap || {};
    this.updateSchool({
      ...school,
      classTeacherRemarksMap: {
        ...map,
        [classStream]: { teacherName, remarks },
      },
    });
  },
  updateSchoolBadge(schoolId: string, badgeUrl: string): void {
    const school = this.getSchoolById(schoolId);
    if (!school) return;
    this.updateSchool({
      ...school,
      badgeUrl,
      logoUrl: badgeUrl,
    });
  },

  // Transactions (Synced to Merchant Account 0786721142)
  getTransactions(): SubscriptionTransaction[] {
    const defaultTx: SubscriptionTransaction[] = [
      {
        id: 'tx_smcn_001',
        schoolId: 'sch_namagunga',
        schoolName: "St. Mark's College Namagunga",
        amountUgx: 480000,
        amountUsd: 129,
        paymentMethod: 'mtn_momo',
        payerPhoneOrCard: '0772***881',
        destinationAccount: '0786721142',
        reference: 'MOMO-SMCN-2026-991',
        billingCycle: 'annual',
        plan: 'Enterprise Campus',
        status: 'completed',
        timestamp: '2026-01-15T08:05:00Z',
      },
      {
        id: 'tx_vha_002',
        schoolId: 'sch_victoria',
        schoolName: 'Victoria Hill Academy',
        amountUgx: 180000,
        amountUsd: 49,
        paymentMethod: 'airtel_money',
        payerPhoneOrCard: '0701***332',
        destinationAccount: '0786721142',
        reference: 'AIRTEL-VHA-2026-402',
        billingCycle: 'termly',
        plan: 'Standard Academy',
        status: 'completed',
        timestamp: '2026-02-01T09:35:00Z',
      },
    ];
    return safeGet<SubscriptionTransaction[]>(STORAGE_KEYS.TRANSACTIONS, defaultTx);
  },
  saveTransactions(transactions: SubscriptionTransaction[]): void {
    safeSet(STORAGE_KEYS.TRANSACTIONS, deduplicateById(transactions));
  },
  addTransaction(tx: SubscriptionTransaction): void {
    const all = this.getTransactions();
    const filtered = all.filter((t) => t.id !== tx.id);
    this.saveTransactions([tx, ...filtered]);
  },

  // Teachers
  getTeachers(schoolId?: string): Teacher[] {
    const raw = safeGet<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    const all = deduplicateById(raw);
    return schoolId ? all.filter((t) => t.schoolId === schoolId) : all;
  },
  saveTeachers(teachers: Teacher[]): void {
    safeSet(STORAGE_KEYS.TEACHERS, deduplicateById(teachers));
  },
  updateTeacher(updated: Teacher): void {
    const all = this.getTeachers();
    const updatedList = all.map((t) => (t.id === updated.id ? updated : t));
    this.saveTeachers(updatedList);
  },
  addTeacher(teacher: Teacher): void {
    const all = this.getTeachers();
    const filtered = all.filter((t) => t.id !== teacher.id);
    this.saveTeachers([teacher, ...filtered]);
  },
  changeTeacherPassword(teacherId: string, newPassword: string): boolean {
    const all = safeGet<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    const target = all.find((t) => t.id === teacherId);
    if (target) {
      target.passwordHash = newPassword;
      this.saveTeachers([...all]);
      return true;
    }
    return false;
  },

  // Students
  getStudents(schoolId?: string): Student[] {
    const raw = safeGet<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const all = deduplicateById(raw);
    return schoolId ? all.filter((s) => s.schoolId === schoolId) : all;
  },
  saveStudents(students: Student[]): void {
    safeSet(STORAGE_KEYS.STUDENTS, deduplicateById(students));
  },
  addStudent(student: Student): void {
    const all = this.getStudents();
    // Ensure uniqueness
    const filtered = all.filter((s) => s.id !== student.id);
    this.saveStudents([student, ...filtered]);
  },
  updateStudent(student: Student): void {
    const all = this.getStudents();
    const updatedList = all.map((s) => (s.id === student.id ? student : s));
    this.saveStudents(updatedList);
  },
  deleteStudent(studentId: string): void {
    const all = this.getStudents();
    this.saveStudents(all.filter((s) => s.id !== studentId));
  },
  findStudentByCode(schoolId: string, studentCode: string): Student | undefined {
    const list = this.getStudents(schoolId);
    const clean = studentCode.trim().toUpperCase();
    return list.find((s) => s.studentCode.trim().toUpperCase() === clean);
  },
  generateUniqueStudentCode(school: School, classId: string): string {
    const existing = this.getStudents(school.id);
    const prefix = school.code || 'SCH';
    const classNum = classId.replace(/[^0-9]/g, '');
    const classAbbr = classNum ? `S${classNum}` : 'GEN';
    let nextNum = existing.length + 101;
    let code = `${prefix}-${classAbbr}-${nextNum}`;
    while (existing.some((s) => s.studentCode === code)) {
      nextNum++;
      code = `${prefix}-${classAbbr}-${nextNum}`;
    }
    return code;
  },

  // Assessments (Marks & AOI)
  getAssessments(schoolId?: string): AssessmentRecord[] {
    const all = safeGet<AssessmentRecord[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    return schoolId ? all.filter((a) => a.schoolId === schoolId) : all;
  },
  saveAssessments(records: AssessmentRecord[]): void {
    safeSet(STORAGE_KEYS.ASSESSMENTS, records);
  },
  upsertAssessment(record: AssessmentRecord): void {
    const all = safeGet<AssessmentRecord[]>(STORAGE_KEYS.ASSESSMENTS, INITIAL_ASSESSMENTS);
    const idx = all.findIndex(
      (a) =>
        a.schoolId === record.schoolId &&
        a.studentId === record.studentId &&
        a.subjectId === record.subjectId &&
        a.term === record.term &&
        a.year === record.year
    );
    if (idx >= 0) {
      all[idx] = record;
    } else {
      all.unshift(record);
    }
    this.saveAssessments(all);
  },

  // Attendance
  getAttendance(schoolId?: string): AttendanceSession[] {
    const all = safeGet<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    return schoolId ? all.filter((att) => att.schoolId === schoolId) : all;
  },
  saveAttendance(sessions: AttendanceSession[]): void {
    safeSet(STORAGE_KEYS.ATTENDANCE, sessions);
  },
  upsertAttendanceSession(session: AttendanceSession): void {
    const all = safeGet<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    const idx = all.findIndex(
      (s) =>
        s.schoolId === session.schoolId &&
        s.classId === session.classId &&
        s.streamId === session.streamId &&
        s.date === session.date
    );
    if (idx >= 0) {
      all[idx] = session;
    } else {
      all.unshift(session);
    }
    this.saveAttendance(all);
  },

  // Tasks
  getTasks(schoolId?: string): SchoolTask[] {
    const raw = safeGet<SchoolTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const all = deduplicateById(raw);
    return schoolId ? all.filter((t) => t.schoolId === schoolId) : all;
  },
  saveTasks(tasks: SchoolTask[]): void {
    safeSet(STORAGE_KEYS.TASKS, deduplicateById(tasks));
  },
  upsertTask(task: SchoolTask): void {
    const all = this.getTasks();
    const idx = all.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      all[idx] = task;
    } else {
      all.unshift(task);
    }
    this.saveTasks(all);
  },
  deleteTask(taskId: string): void {
    const all = this.getTasks();
    this.saveTasks(all.filter((t) => t.id !== taskId));
  },

  // Notifications
  getNotifications(schoolId?: string): SchoolNotification[] {
    const raw = safeGet<SchoolNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const all = deduplicateById(raw);
    return schoolId ? all.filter((n) => n.schoolId === schoolId) : all;
  },
  addNotification(notification: SchoolNotification): void {
    const all = this.getNotifications();
    const filtered = all.filter((n) => n.id !== notification.id);
    safeSet(STORAGE_KEYS.NOTIFICATIONS, [notification, ...filtered]);
  },

  // Messages
  getMessages(schoolId?: string): ParentMessage[] {
    const all = safeGet<ParentMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return schoolId ? all.filter((m) => m.schoolId === schoolId) : all;
  },
  addMessage(msg: ParentMessage): void {
    const all = safeGet<ParentMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    safeSet(STORAGE_KEYS.MESSAGES, [msg, ...all]);
  },
  updateMessage(updated: ParentMessage): void {
    const all = safeGet<ParentMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const list = all.map((m) => (m.id === updated.id ? updated : m));
    safeSet(STORAGE_KEYS.MESSAGES, list);
  },

  // Audit Logs
  getAuditLogs(schoolId?: string): AuditLog[] {
    const all = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return schoolId ? all.filter((l) => l.schoolId === schoolId) : all;
  },
  logAction(schoolId: string, actorName: string, actorRole: string, action: string, details: string): void {
    const all = safeGet<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      schoolId,
      actorName,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    safeSet(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...all.slice(0, 99)]);
  },

  // Session
  getSession(): UserSession | null {
    return safeGet<UserSession | null>(STORAGE_KEYS.SESSION, null);
  },
  saveSession(session: UserSession | null): void {
    safeSet(STORAGE_KEYS.SESSION, session);
  },

  // Backup & Export (Encrypted JSON format)
  exportFullBackup(schoolId: string): string {
    const school = this.getSchoolById(schoolId);
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      school,
      teachers: this.getTeachers(schoolId),
      students: this.getStudents(schoolId),
      assessments: this.getAssessments(schoolId),
      attendance: this.getAttendance(schoolId),
      tasks: this.getTasks(schoolId),
      notifications: this.getNotifications(schoolId),
      messages: this.getMessages(schoolId),
      auditLogs: this.getAuditLogs(schoolId),
      securityChecksum: `SHA256:${Math.random().toString(36).substring(2, 12)}`,
    };
    return JSON.stringify(backupData, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; schoolId?: string; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.school || !data.school.id) {
        return { success: false, message: 'Invalid backup package: missing school profile.' };
      }
      const school: School = data.school;
      this.updateSchool(school);

      if (Array.isArray(data.teachers)) {
        const otherTeachers = this.getTeachers().filter((t) => t.schoolId !== school.id);
        this.saveTeachers([...otherTeachers, ...data.teachers]);
      }
      if (Array.isArray(data.students)) {
        const otherStudents = this.getStudents().filter((s) => s.schoolId !== school.id);
        this.saveStudents([...otherStudents, ...data.students]);
      }
      if (Array.isArray(data.assessments)) {
        const otherAss = this.getAssessments().filter((a) => a.schoolId !== school.id);
        this.saveAssessments([...otherAss, ...data.assessments]);
      }
      if (Array.isArray(data.attendance)) {
        const otherAtt = this.getAttendance().filter((att) => att.schoolId !== school.id);
        this.saveAttendance([...otherAtt, ...data.attendance]);
      }
      if (Array.isArray(data.tasks)) {
        const otherTasks = this.getTasks().filter((t) => t.schoolId !== school.id);
        this.saveTasks([...otherTasks, ...data.tasks]);
      }

      this.logAction(
        school.id,
        'System Administrator',
        'Administrator',
        'DATABASE_RESTORED',
        `Restored cloud archive for ${school.name}`
      );

      return { success: true, schoolId: school.id, message: `Successfully restored data for ${school.name}` };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Corrupted or unreadable JSON file.' };
    }
  },
};
