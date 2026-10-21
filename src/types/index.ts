export type RoleType = 'admin' | 'class_teacher' | 'subject_teacher' | 'parent';

export type AssessmentDescriptor = 'Basic' | 'Moderate' | 'Outstanding';

export type EducationLevel = 'O-Level' | 'A-Level';

export type ALevelGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'O';

export interface Subject {
  id: string;
  name: string;
  code: string;
  isCore: boolean;
  level: EducationLevel;
  isSubsidiary?: boolean; // Strictly limited to: Sub Math, Sub ICT, General Paper (max 1 point)
  papers?: string[]; // e.g., ['Paper 1', 'Paper 2']
}

export interface School {
  id: string;
  name: string;
  slug: string;
  code: string; // Institutional prefix e.g., 'SMCN', 'VHA'
  motto: string;
  email: string;
  adminEmail: string;
  phone: string;
  address: string;
  logoUrl: string;
  badgeUrl?: string; // Custom badge uploaded or selected from crest presets
  academicYear: string;
  currentTerm: string;
  terms: string[];
  classes: string[]; // e.g. ['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6']
  streams: string[]; // e.g. ['East', 'West', 'North', 'S.4A', 'S.4B', 'Sciences', 'Arts']
  subjects: Subject[];
  subscribedAt: string;
  subscriptionPlan: 'Standard Academy' | 'Enterprise Campus';
  subscriptionBilling: 'termly' | 'annual';
  subscriptionExpiresAt: string; // ISO date
  subscriptionStatus: 'active' | 'expired' | 'blocked';
  isBlocked: boolean;
  blockedReason?: string;
  encryptionKeyFingerprint: string;
  cloudBackupEnabled: boolean;
  lastCloudBackup?: string;
  classTeacherRemarksMap?: Record<string, { teacherName: string; remarks: string }>;
}

export interface SubjectAssignment {
  subjectId: string;
  classId: string;
  streamId: string;
}

export interface ClassTeacherAssignment {
  classId: string;
  streamId: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  isHeadteacher: boolean;
  classTeacherAssignment?: ClassTeacherAssignment | null;
  subjectAssignments: SubjectAssignment[];
  lastLogin?: string;
  designation: string;
}

export interface Student {
  id: string;
  schoolId: string;
  studentCode: string; // e.g. SMCN-S1-102
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  classId: string;
  streamId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  mfaSecretPin: string; // 6-digit verification code
  dateOfBirth?: string;
  enrollmentDate: string;
  status: 'enrolled' | 'transferred' | 'graduated';
  enrolledSubjectIds?: string[];
  projectTitle?: string;
}

export interface AoiAssessmentItem {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  descriptor: AssessmentDescriptor;
  remarks: string;
}

export interface AssessmentRecord {
  id: string;
  schoolId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  streamId: string;
  term: string;
  year: string;
  level: EducationLevel;

  // O-Level Specific Continuous Assessment & Exams (S.1, S.2, S.3, S.4)
  aoi1?: number; // Activity of Integration 1 (e.g. out of 10)
  aoi2?: number; // Activity of Integration 2 (e.g. out of 10)
  projectScore?: number; // Project Work score (out of 10)
  midTermScore?: number; // Mid-Term exam score (out of 80 or 100)
  endOfTermScore: number; // End-of-Term exam score (out of 80)
  aoiScores: AoiAssessmentItem[];
  aoiAggregateScore: number; // 20% continuous total
  totalFinalScore: number; // Final weighted percentage out of 100%
  competencyGrade: string; // Distinction 1, Credit 3, etc.
  descriptor: AssessmentDescriptor; // Outstanding, Moderate, Basic

  // A-Level Specific Multiverse Assessment (S.5, S.6)
  paper1Score?: number; // Paper 1 (e.g. /100)
  paper2Score?: number; // Paper 2 (e.g. /100)
  paper3Score?: number; // Optional Paper 3 for sciences
  aLevelGrade?: ALevelGrade; // A, B, C, D, E, O (No F)
  aLevelPoints?: number; // Principal max 5 (A=5, B=4, C=3, D=2, E=1, O=0). Subsidiary max 1 (Sub Math, Sub ICT, GP)

  teacherRemarks: string;
  updatedAt: string;
  updatedBy: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: string;
  schoolId: string;
  classId: string;
  streamId: string;
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // studentId -> status
  loggedBy: string;
  createdAt: string;
}

export interface SchoolTask {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  category: 'administrative' | 'academic' | 'grading' | 'meeting';
  assignedToName: string;
  createdAt: string;
}

export interface SchoolNotification {
  id: string;
  schoolId: string;
  title: string;
  message: string;
  priority: 'urgent' | 'info' | 'warning';
  createdAt: string;
  targetRole: 'all' | 'teachers' | 'parents';
}

export interface ParentMessage {
  id: string;
  schoolId: string;
  studentId: string;
  parentName: string;
  recipient: 'Class Teacher' | 'Headteacher' | 'Subject Teacher';
  subject: string;
  message: string;
  reply?: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

export interface AuditLog {
  id: string;
  schoolId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserSession {
  role: RoleType;
  schoolId: string;
  teacher?: Teacher;
  student?: Student;
  authenticatedAt: string;
}

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'visa_card';

export interface SubscriptionTransaction {
  id: string;
  schoolId: string;
  schoolName: string;
  amountUgx: number;
  amountUsd: number;
  paymentMethod: PaymentMethod;
  payerPhoneOrCard: string;
  destinationAccount: string; // '0786721142' (Ismail Kasumba)
  reference: string;
  billingCycle: 'termly' | 'annual';
  plan: 'Standard Academy' | 'Enterprise Campus';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}
