# EduPortal OS: Multi-Tenant Academic School & Integration Portal

An enterprise-grade multi-tenant academic management platform enabling educational institutions to subscribe, operate school-specific portals, record Competency-Based Activities of Integration (AOI) and End-of-Term evaluations, automate class attendance and reporting, manage school tasks, and grant real-time parent/student progress tracking guarded by multi-factor authentication.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters have been established based on your choices:

- **Assessment Paradigm Confirmed**: Competency-Based Curriculum incorporating continuous assessment Activities of Integration (AOI) rubrics (scale 1–3 competency descriptors with integration projects) paired with End-of-Term standardized exams (80% / 20% weighting, configurable per school).
- **Initial Data Provisioning**: Preloaded with realistic institution data (e.g., *St. Mark's College Namagunga* and *Victoria Hill Academy*) with pre-assigned classes, streams (North, South, East), teachers, and learners, while simultaneously providing a School Subscription Wizard for instant onboarding of new schools with custom subdomains/slugs.
- **Multi-Factor Authentication (MFA)**: Built-in 6-digit one-time authentication code with an interactive simulated OTP dispatch panel and instant quick-fill helper for student/parent logins.
- **Reporting & Export**: In-browser clean PDF generator and official printable digital report cards with school crest, competency rubrics, teacher/headteacher remarks, and QR verification codes.

---

## 1. Overview & Core Concept

EduPortal OS delivers a unified yet segregated multi-tenant academic operating system designed for schools, educators, learners, and families:

- **Institutional Multi-Tenancy**: Every subscribed school receives an isolated institutional environment, custom school branding, unique student code namespaces (e.g., `SMCN-S1-102`), and independent gradebooks. Cross-institution access is strictly prevented through tenant boundary isolation.
- **Headteacher & Administrator Portal**: Complete governance over school profile, streams, subjects, teacher accounts, credential/password resets, task management dashboard, urgent administrative broadcast alerts, and school-wide performance analytics.
- **Subject Teacher Subportal**: Fine-grained access strictly bounded by teacher's subject and assigned classes/streams. Seamless data entry for continuous Activities of Integration (AOI scores, rubric criteria, learner integration evidence) and end-of-term marks with automatic auto-save and sync.
- **Class Teacher Subportal**: Class/stream-specific governance (e.g., Senior 1 East class teacher only manages S1 East). Enroll learners, assign subject combinations, log daily attendance sessions with one-tap batch registers, compile class performance ranking, and generate batch student report cards.
- **Parent & Student Real-Time Portal**: Zero-barrier yet secure portal where parents input their learner's school-specific code plus MFA verification code to view up-to-the-minute attendance percentages, subject progress cards, AOI competency remarks, and send direct parent-teacher communications.
- **Task Management & Administrative Workflow**: Integrated task planner for school events, exam deadlines, report compilation milestones, and teacher grading tasks with priority tags and due dates.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **School Switcher & Subscription**:
   - Institutional portal entry with school selection or "Subscribe New School" modal.
   - Quick Demo Switcher bar allowing immediate evaluation of any role: School Admin, Class Teacher (S1 East), Subject Teacher (Chemistry S1), or Parent (S1 learner SMCN-S1-102).
2. **Administrator Flow**:
   - **School Dashboard**: Live student/teacher counts, attendance averages, grade distribution, real-time alerts.
   - **Teacher & Credential Management**: List teachers, assign classes/subjects, reset teacher passwords with temporary credential generation.
   - **Task Management**: Kanban/List dashboard for exam deadlines, fee clearing, and academic committee tasks.
   - **School Profile & Settings**: Update crest, motto, term dates, and grading scale.
3. **Subject Teacher Flow**:
   - Select assigned Subject (e.g., *Chemistry*) $\to$ Select Class (*Senior 1*) $\to$ Select Stream (*East*).
   - Enter Activities of Integration (AOI 1, AOI 2, AOI 3) with rubric descriptors (Basic, Proficient, Outstanding) and End-of-Term marks.
   - Live synchronization indicator confirms data persistence in real time.
4. **Class Teacher Flow**:
   - View assigned class roster (*Senior 1 East*).
   - Enroll new learners (auto-generates school-prefixed unique student code).
   - Daily Attendance Register (Present, Late, Absent, Excused) with automated percentage computation.
   - Generate Class Performance Matrix and preview/print batch report cards.
5. **Parent & Student Flow**:
   - Enter Student Code (e.g. `SMCN-S1-102`) $\to$ MFA verification step with simulated 6-digit SMS/WhatsApp OTP code.
   - Access comprehensive digital student dashboard: Subject grades, AOI competency badges, attendance log, teacher remarks, and "Download Official Report Card (PDF)".
   - Direct parent-teacher feedback messaging drawer.

### Visual Identity & Theme

- **Design Philosophy**: Domain-native academic enterprise dashboard adhering strictly to universal design rules (no generic AI slop, no arbitrary pill capsules, clean unboxed metadata, robust typographic hierarchy).
- **Color Palette**:
  - *Dominant Canvas (60%)*: Crisp light workspace `#F8FAFC` / Deep slate `#0B0F19` in Dark Mode.
  - *Structural Surfaces (30%)*: Crisp white `#FFFFFF` / Slate `#131B2E` with hairline borders (`#E2E8F0` / `#1E293B`).
  - *Academic Accents (10%)*: Deep Royal Oxford Blue `#1E3A8A` / Vibrant Electric Indigo `#4F46E5`, complemented by Emerald `#16A34A` for passing competencies and Amber `#D97706` for needs-improvement.
- **Typography**:
  - *Headings & Brand*: `Plus Jakarta Sans` with sharp geometric letterforms.
  - *Prose & Interface*: `Plus Jakarta Sans` / `DM Sans`.
  - *Grades, Marks & Tabular Data*: `font-mono tabular-nums` for precise alignment of scores, percentages, and attendance figures.
- **Dark Mode**: Complete system-wide dark mode toggle stored in preferences, with optical compensation for high legibility and soft contrast.

---

## 3. Key Product Decisions & Trade-Offs

- **Multi-Tenant Storage Architecture**:
  - *Chosen Approach*: Hierarchical structured LocalStorage with isolated tenant stores under `eduportal_tenants_{schoolId}` and an institutional registry `eduportal_schools`.
  - *Why*: Allows instantaneous multi-school simulation, zero server latency, complete offline readiness, and resilient auto-save without requiring external cloud credentials or setup friction.
  - *Backup & Restore*: Real-time JSON import/export with simulated AES encryption headers and cloud sync state.
- **Competency-Based Assessment (AOI) Engine**:
  - *Chosen Approach*: Explicit continuous assessment recording for Activities of Integration (score out of 10/20, competence descriptor: 1 = Basic, 2 = Moderate, 3 = Outstanding) + End of Term exam score (out of 80/100).
  - *Why*: Realistically reflects modern educational standards (e.g. Lower Secondary Curriculum) where rote memorization is replaced with practical integration projects.
- **Scoped Dynamic Role Permissions**:
  - *Chosen Approach*: Dynamic role-based capability resolution where a teacher account holds specific Class Teacher assignments (e.g. `[class: "S1", stream: "East"]`) and Subject Teacher assignments (e.g. `[subject: "Chemistry", class: "S1", stream: "East"]`).
  - *Why*: Strictly prevents unauthorized teachers from tampering with classes or subjects they do not teach, while school administrators maintain master override privileges.
- **Digital Report Card & PDF Generation**:
  - *Chosen Approach*: Styled high-resolution printable report card DOM template designed specifically for `@media print` with auto-trigger browser PDF print / direct export utility.
  - *Why*: Guarantees authentic, vector-sharp school certificates complete with institutional badge, grading scale rubrics, and signatures without external PDF bloat.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EduPortal OS Master Shell                       │
│     [School Selector / Subscriptions]  [Theme Toggle]  [Demo Switcher] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│  Headteacher Admin  │   │   Teacher Portal    │   │   Parent/Student    │
│  - Analytics & KPIs │   │ ┌─────────────────┐ │   │   - Student Code ID │
│  - Staff Credentials│   │ │ Subject Subportal│ │   │   - 6-Digit MFA     │
│  - School Settings  │   │ │ (AOI / Marks)   │ │   │   - Report Card     │
│  - Task Planner     │   │ ├─────────────────┤ │   │   - Attendance Log  │
│  - Urgent Broadcasts│   │ │ Class Subportal │ │   │   - Teacher Message │
│  - Backup / Sync    │   │ │ (Enroll/Roster) │ │   │                     │
└──────────┬──────────┘   └─────────┬─────────┘     └──────────┬──────────┘
           │                        │                          │
           └────────────────────────┼──────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 EduPortal State & Persistence Core                     │
│  - Multi-Tenant Repository (Schools, Staff, Classes, Students, Tasks)  │
│  - Unique Code Namespace Generator (e.g., SMCN-S1-001)                 │
│  - Competency AOI Grading Engine & Report Card Compiler                │
│  - Encrypted LocalStorage Provider & Auto-Sync Engine                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & State Contracts

- **`School`**: `id`, `name`, `code` (e.g. `SMCN`), `motto`, `email`, `logoUrl`, `academicYear`, `currentTerm`, `classes` (e.g., `['S1', 'S2', 'S3', 'S4']`), `streams` (e.g., `['East', 'West', 'North']`), `subjects` (e.g., `['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'Geography', 'History']`), `gradingSystem`.
- **`Teacher`**: `id`, `schoolId`, `name`, `email`, `phone`, `password`, `isHeadteacher`, `classTeacherOf` (`{ classId: string, streamId: string } | null`), `subjectAssignments` (`Array<{ subjectId: string, classId: string, streamId: string }>`).
- **`Student`**: `id`, `schoolId`, `studentCode` (unique, e.g. `SMCN-S1-102`), `name`, `gender`, `classId`, `streamId`, `parentName`, `parentPhone`, `parentEmail`, `enrollmentDate`, `mfaSecret`.
- **`AssessmentRecord`**: `id`, `schoolId`, `studentId`, `subjectId`, `term`, `year`, `aoiScores` (`Array<{ id: string, title: string, score: number, maxScore: number, descriptor: 'Basic'|'Moderate'|'Outstanding', remarks: string }>`), `endOfTermScore`, `teacherRemarks`.
- **`AttendanceSession`**: `id`, `schoolId`, `classId`, `streamId`, `date`, `records` (`Record<studentId, 'present'|'absent'|'late'|'excused'>`).
- **`SchoolTask`**: `id`, `schoolId`, `title`, `description`, `dueDate`, `priority`, `status` (`'todo'|'in_progress'|'completed'`), `assignedTo`.
- **`NotificationAlert`**: `id`, `schoolId`, `title`, `message`, `type` (`'urgent'|'info'|'warning'`), `createdAt`.
