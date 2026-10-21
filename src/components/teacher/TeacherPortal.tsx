import React, { useState, useMemo } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Student, AssessmentRecord, AssessmentDescriptor, AttendanceStatus, Subject, ALevelGrade } from '../../types';
import { DigitalReportCardModal } from '../reports/DigitalReportCardModal';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  Save,
  Plus,
  Printer,
  MessageSquare,
  Search,
  Award,
  Sparkles,
  Send,
  KeyRound,
  Trash2,
  Filter,
  Check,
  Edit2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface TeacherPortalProps {
  activeTab: string;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ activeTab }) => {
  const {
    currentSchool,
    currentSession,
    teachers,
    students,
    assessments,
    attendance,
    messages,
    saveAssessmentRecord,
    saveAttendanceSession,
    addStudent,
    updateStudent,
    deleteStudent,
    replyParentMessage,
    changeTeacherOwnPassword,
    addSubjectToSchool,
    deleteSubjectFromSchool,
    updateClassTeacherRemarks,
  } = usePortal();

  const currentTeacher = currentSession?.teacher || teachers[1] || teachers[0];

  // Self password change modal
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newSelfPass, setNewSelfPass] = useState('');
  const [passChangeSuccess, setPassChangeSuccess] = useState(false);

  // Quick Filter dropdown for Teacher Gradebook:
  // "all" = All Classes, or specific stream e.g. "Senior 1 East", "Senior 4 S.4A", "Senior 5 Sciences"
  const [gradebookStreamFilter, setGradebookStreamFilter] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return currentSchool.subjects[0]?.id || 'sub_o_chem';
  });

  // Level selector filter: 'all' | 'O-Level' | 'A-Level'
  const [levelFilter, setLevelFilter] = useState<'all' | 'O-Level' | 'A-Level'>('all');

  // Class teacher subportal state
  const assignedClassTeacherInfo = useMemo(() => {
    if (currentTeacher.classTeacherAssignment) {
      return currentTeacher.classTeacherAssignment;
    }
    return { classId: 'Senior 1', streamId: 'East' };
  }, [currentTeacher]);

  const [classSubTab, setClassSubTab] = useState<'roster' | 'attendance' | 'reports' | 'subjects'>('roster');

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSavedNote, setAttendanceSavedNote] = useState(false);

  // Enrollment modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female'>('Male');
  const [newClassId, setNewClassId] = useState(assignedClassTeacherInfo.classId);
  const [newStreamId, setNewStreamId] = useState(assignedClassTeacherInfo.streamId);
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [enrolledStudentFeedback, setEnrolledStudentFeedback] = useState<Student | null>(null);

  // Edit Student Subjects & Biodata modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Subject Add/Delete modal
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubLevel, setNewSubLevel] = useState<'O-Level' | 'A-Level'>('O-Level');
  const [newSubIsSubsidiary, setNewSubIsSubsidiary] = useState(false);

  // Report Card preview
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);

  // Class teacher custom remarks
  const streamKey = `${assignedClassTeacherInfo.classId} ${assignedClassTeacherInfo.streamId}`;
  const existingStreamRemarks = currentSchool.classTeacherRemarksMap?.[streamKey];
  const [streamTeacherName, setStreamTeacherName] = useState(existingStreamRemarks?.teacherName || currentTeacher.name);
  const [streamRemarkInput, setStreamRemarkInput] = useState(
    existingStreamRemarks?.remarks || 'Learners demonstrated steady academic focus and admirable civic leadership.'
  );
  const [remarksSavedFeedback, setRemarksSavedFeedback] = useState(false);

  // Filter subjects according to level filter or gradebook selected class
  const filteredSubjects = useMemo(() => {
    return currentSchool.subjects.filter((sub) => {
      if (levelFilter === 'all') return true;
      return sub.level === levelFilter;
    });
  }, [currentSchool.subjects, levelFilter]);

  const activeSubjectObj = currentSchool.subjects.find((s) => s.id === selectedSubjectId) || currentSchool.subjects[0];
  const isSubjectALevel = activeSubjectObj?.level === 'A-Level';

  // Filter learners for Gradebook based on quick-filter dropdown
  const gradebookLearners = useMemo(() => {
    let list = students.filter((s) => s.schoolId === currentSchool.id);
    if (gradebookStreamFilter !== 'all') {
      const parts = gradebookStreamFilter.split(' - ');
      if (parts.length === 2) {
        list = list.filter((s) => s.classId === parts[0] && s.streamId === parts[1]);
      } else {
        list = list.filter((s) => `${s.classId} ${s.streamId}` === gradebookStreamFilter || s.classId === gradebookStreamFilter);
      }
    }
    return list;
  }, [students, currentSchool.id, gradebookStreamFilter]);

  // Filter learners for Class Teacher stream
  const learnersInClassStream = useMemo(() => {
    return students.filter(
      (s) =>
        s.schoolId === currentSchool.id &&
        s.classId === assignedClassTeacherInfo.classId &&
        s.streamId === assignedClassTeacherInfo.streamId
    );
  }, [students, currentSchool.id, assignedClassTeacherInfo]);

  // Draft marks state
  const [draftMarks, setDraftMarks] = useState<
    Record<
      string,
      {
        aoi1: number;
        aoi2: number;
        projectScore: number;
        midTerm: number;
        endOfTerm: number;
        paper1: number;
        paper2: number;
        aLevelGrade: ALevelGrade;
        aLevelPoints: number;
        descriptor: AssessmentDescriptor;
        remarks: string;
      }
    >
  >({});
  const [saveFeedbackMap, setSaveFeedbackMap] = useState<Record<string, boolean>>({});

  const getRecordForStudent = (studentId: string): AssessmentRecord | undefined => {
    if (!activeSubjectObj) return undefined;
    return assessments.find(
      (a) =>
        a.schoolId === currentSchool.id &&
        a.studentId === studentId &&
        a.subjectId === activeSubjectObj.id &&
        a.term === currentSchool.currentTerm
    );
  };

  const handleScoreChange = (
    studentId: string,
    field: string,
    value: string | number
  ) => {
    const existing = getRecordForStudent(studentId);
    const prev = draftMarks[studentId] || {
      aoi1: existing?.aoi1 ?? 8.0,
      aoi2: existing?.aoi2 ?? 8.0,
      projectScore: existing?.projectScore ?? 8.5,
      midTerm: existing?.midTermScore ?? 75,
      endOfTerm: existing?.endOfTermScore ?? 65,
      paper1: existing?.paper1Score ?? 75,
      paper2: existing?.paper2Score ?? 72,
      aLevelGrade: existing?.aLevelGrade ?? 'A',
      aLevelPoints: existing?.aLevelPoints ?? (activeSubjectObj?.isSubsidiary ? 1 : 5),
      descriptor: existing?.descriptor ?? 'Outstanding',
      remarks: existing?.teacherRemarks ?? 'Solid competency exhibited in examinations.',
    };

    setDraftMarks({
      ...draftMarks,
      [studentId]: { ...prev, [field]: value },
    });
  };

  const handleSaveStudentMark = (student: Student) => {
    if (!activeSubjectObj) return;
    const existing = getRecordForStudent(student.id);
    const draft = draftMarks[student.id] || {
      aoi1: existing?.aoi1 ?? 8.0,
      aoi2: existing?.aoi2 ?? 8.0,
      projectScore: existing?.projectScore ?? 8.5,
      midTerm: existing?.midTermScore ?? 75,
      endOfTerm: existing?.endOfTermScore ?? 65,
      paper1: existing?.paper1Score ?? 75,
      paper2: existing?.paper2Score ?? 72,
      aLevelGrade: existing?.aLevelGrade ?? 'A',
      aLevelPoints: existing?.aLevelPoints ?? (activeSubjectObj.isSubsidiary ? 1 : 5),
      descriptor: existing?.descriptor ?? 'Outstanding',
      remarks: existing?.teacherRemarks ?? 'Solid competency exhibited.',
    };

    const isALevel = activeSubjectObj.level === 'A-Level' || student.classId.includes('5') || student.classId.includes('6');

    // A-Level calculations
    let aLevelPts = draft.aLevelPoints;
    let aLevelGrd = draft.aLevelGrade;
    let finalScore = Number(draft.endOfTerm);

    if (isALevel) {
      if (activeSubjectObj.isSubsidiary) {
        // Subsidiaries strictly max 1 point
        aLevelPts = Math.min(1, Math.max(0, Number(draft.aLevelPoints)));
      } else {
        // Principal subjects max 5 points (A=5, B=4, C=3, D=2, E=1, O=0)
        aLevelPts = Math.min(5, Math.max(0, Number(draft.aLevelPoints)));
      }
      finalScore = Math.round((Number(draft.paper1) + Number(draft.paper2)) / 2);
    } else {
      // O-Level weighted calculations: AOI 1 + AOI 2 (20%) + End of term (80%)
      const aoiContinuous = Math.min(20, Number(draft.aoi1) + Number(draft.aoi2));
      finalScore = Number(aoiContinuous) + Number(draft.endOfTerm);
    }

    const record: AssessmentRecord = {
      id: existing?.id || `ass_${student.id}_${activeSubjectObj.id}_${Date.now()}`,
      schoolId: currentSchool.id,
      studentId: student.id,
      subjectId: activeSubjectObj.id,
      classId: student.classId,
      streamId: student.streamId,
      term: currentSchool.currentTerm,
      year: currentSchool.academicYear,
      level: isALevel ? 'A-Level' : 'O-Level',
      aoi1: Number(draft.aoi1),
      aoi2: Number(draft.aoi2),
      projectScore: Number(draft.projectScore),
      midTermScore: Number(draft.midTerm),
      endOfTermScore: Number(draft.endOfTerm),
      paper1Score: Number(draft.paper1),
      paper2Score: Number(draft.paper2),
      aLevelGrade: aLevelGrd,
      aLevelPoints: aLevelPts,
      aoiScores: [
        {
          id: 'aoi_1',
          title: 'AOI 1 Continuous Practical Assessment',
          score: Number(draft.aoi1),
          maxScore: 10,
          descriptor: draft.descriptor,
          remarks: draft.remarks,
        },
        {
          id: 'aoi_2',
          title: 'AOI 2 Practical Integration Task',
          score: Number(draft.aoi2),
          maxScore: 10,
          descriptor: draft.descriptor,
          remarks: draft.remarks,
        },
      ],
      aoiAggregateScore: Math.min(20, Number(draft.aoi1) + Number(draft.aoi2)),
      totalFinalScore: finalScore,
      competencyGrade: isALevel ? `${aLevelGrd} (${aLevelPts} Pts)` : finalScore >= 80 ? 'Distinction 1' : 'Credit 3',
      descriptor: draft.descriptor,
      teacherRemarks: draft.remarks,
      updatedAt: new Date().toISOString(),
      updatedBy: currentTeacher.name,
    };

    saveAssessmentRecord(record);
    setSaveFeedbackMap((prev) => ({ ...prev, [student.id]: true }));
    setTimeout(() => {
      setSaveFeedbackMap((prev) => ({ ...prev, [student.id]: false }));
    }, 2000);
  };

  // Self password change
  const handleChangeMyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSelfPass.trim()) return;
    const ok = changeTeacherOwnPassword(currentTeacher.id, newSelfPass.trim());
    if (ok) {
      setPassChangeSuccess(true);
      setTimeout(() => {
        setPassChangeSuccess(false);
        setShowChangePassModal(false);
        setNewSelfPass('');
      }, 1500);
    }
  };

  // Attendance handlers
  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    learnersInClassStream.forEach((s) => {
      updated[s.id] = 'present';
    });
    setAttendanceStatuses(updated);
  };

  const handleSetStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    const recordsToSave: Record<string, AttendanceStatus> = {};
    learnersInClassStream.forEach((s) => {
      recordsToSave[s.id] = attendanceStatuses[s.id] || 'present';
    });

    saveAttendanceSession({
      id: `att_${assignedClassTeacherInfo.classId}_${assignedClassTeacherInfo.streamId}_${attendanceDate}`,
      schoolId: currentSchool.id,
      classId: assignedClassTeacherInfo.classId,
      streamId: assignedClassTeacherInfo.streamId,
      date: attendanceDate,
      records: recordsToSave,
      loggedBy: currentTeacher.name,
      createdAt: new Date().toISOString(),
    });

    setAttendanceSavedNote(true);
    setTimeout(() => setAttendanceSavedNote(false), 2500);
  };

  // Student Enrollment submit
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newParentName) return;

    const student = addStudent({
      firstName: newFirstName,
      lastName: newLastName,
      gender: newGender,
      classId: newClassId,
      streamId: newStreamId,
      parentName: newParentName,
      parentPhone: newParentPhone || '+256 700 000 000',
      parentEmail: newParentEmail || `${newLastName.toLowerCase()}@family.com`,
      projectTitle: newProjectTitle || `${newClassId} Integration Project`,
    });

    setEnrolledStudentFeedback(student);
    setNewFirstName('');
    setNewLastName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewParentEmail('');
    setNewProjectTitle('');
  };

  // Save updated student subjects & biodata
  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent);
    setEditingStudent(null);
  };

  // Add subject to curriculum
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubCode) return;
    const isSub = newSubLevel === 'A-Level' && newSubIsSubsidiary;
    addSubjectToSchool({
      id: `sub_${newSubLevel === 'A-Level' ? 'a' : 'o'}_${newSubCode.toLowerCase()}_${Date.now().toString(36)}`,
      name: newSubName,
      code: newSubCode.toUpperCase(),
      isCore: false,
      level: newSubLevel,
      isSubsidiary: isSub,
      papers: newSubLevel === 'A-Level' ? ['Paper 1', 'Paper 2'] : ['Paper 1'],
    });
    setShowAddSubjectModal(false);
    setNewSubName('');
    setNewSubCode('');
    setNewSubIsSubsidiary(false);
  };

  const handleSaveStreamRemarks = () => {
    updateClassTeacherRemarks(streamKey, streamTeacherName, streamRemarkInput);
    setRemarksSavedFeedback(true);
    setTimeout(() => setRemarksSavedFeedback(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile & Password Action Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            {currentTeacher.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentTeacher.name}
              </h2>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                {currentTeacher.designation}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Class Master for: <strong className="text-slate-700 dark:text-slate-300">{streamKey}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChangePassModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Change My Password
          </button>
        </div>
      </div>

      {/* 1. SUBJECT MARKS & AOI SUBPORTAL WITH QUICK FILTER */}
      {activeTab === 'subject_marks' && (
        <div className="space-y-6">
          {/* Quick-Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Level Toggle */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                  <button
                    onClick={() => setLevelFilter('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      levelFilter === 'all' ? 'bg-white dark:bg-slate-950 font-bold text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    All Levels
                  </button>
                  <button
                    onClick={() => setLevelFilter('O-Level')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      levelFilter === 'O-Level' ? 'bg-white dark:bg-slate-950 font-bold text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    O-Level (S.1 - S.4)
                  </button>
                  <button
                    onClick={() => setLevelFilter('A-Level')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      levelFilter === 'A-Level' ? 'bg-white dark:bg-slate-950 font-bold text-indigo-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    A-Level (S.5 - S.6)
                  </button>
                </div>

                {/* Quick-Filter Dropdown for Stream Selection */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gradebook Filter:
                  </label>
                  <select
                    value={gradebookStreamFilter}
                    onChange={(e) => setGradebookStreamFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">★ All Classes &amp; Streams ({students.length} Learners)</option>
                    <optgroup label="O-Level Streams">
                      <option value="Senior 1 East">Senior 1 East</option>
                      <option value="Senior 1 West">Senior 1 West</option>
                      <option value="Senior 2 East">Senior 2 East</option>
                      <option value="Senior 4 S.4A">Senior 4 S.4A</option>
                      <option value="Senior 4 S.4B">Senior 4 S.4B</option>
                    </optgroup>
                    <optgroup label="A-Level Streams">
                      <option value="Senior 5 Sciences">Senior 5 Sciences</option>
                      <option value="Senior 5 Arts">Senior 5 Arts</option>
                      <option value="Senior 6 Sciences">Senior 6 Sciences</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Subject Selector */}
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject:
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {filteredSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} [{sub.level}{sub.isSubsidiary ? ' - Subsidiary (Max 1 Pt)' : ''}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Curriculum Rule Explainer */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {isSubjectALevel ? 'UACE A-Level Rubric:' : 'UCE O-Level Competency Rubric:'}
                </span>
                {isSubjectALevel ? (
                  <span>
                    Graded on <strong>Paper 1</strong> &amp; <strong>Paper 2</strong>.
                    Principal subjects: Max 5 Pts (A=5, B=4, C=3, D=2, E=1, O=0 - No F).
                    Subsidiary (Sub Math, Sub ICT, GP): Max 1 Pt. <strong>Total Max = 17 Pts</strong>.
                  </span>
                ) : (
                  <span>
                    Activities of Integration (AOI 1 + AOI 2 = 20%) + Project Work (10%) + End of Term Exam (80%).
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Showing {gradebookLearners.length} Enrolled Learners
              </div>
            </div>
          </div>

          {/* Gradebook Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                    <th className="py-3 px-4 font-semibold">Learner Name &amp; Code</th>
                    <th className="py-3 px-3 font-semibold">Class &amp; Stream</th>

                    {!isSubjectALevel ? (
                      <>
                        <th className="py-3 px-2 font-semibold text-center w-20">AOI 1 (/10)</th>
                        <th className="py-3 px-2 font-semibold text-center w-20">AOI 2 (/10)</th>
                        <th className="py-3 px-2 font-semibold text-center w-24">Project (/10)</th>
                        <th className="py-3 px-2 font-semibold text-center w-24">Exam (/80)</th>
                        <th className="py-3 px-2 font-semibold text-center w-24">Total %</th>
                        <th className="py-3 px-3 font-semibold w-32">Descriptor</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-2 font-semibold text-center w-24">Paper 1 (/100)</th>
                        <th className="py-3 px-2 font-semibold text-center w-24">
                          {activeSubjectObj.isSubsidiary ? 'Subsidiary' : 'Paper 2 (/100)'}
                        </th>
                        <th className="py-3 px-2 font-semibold text-center w-20">Grade</th>
                        <th className="py-3 px-2 font-semibold text-center w-24">
                          {activeSubjectObj.isSubsidiary ? 'Pts (Max 1)' : 'Pts (Max 5)'}
                        </th>
                        <th className="py-3 px-2 font-semibold text-center w-20">Total %</th>
                      </>
                    )}

                    <th className="py-3 px-3 font-semibold">Educator Remarks</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {gradebookLearners.length > 0 ? (
                    gradebookLearners.map((learner) => {
                      const record = getRecordForStudent(learner.id);
                      const draft = draftMarks[learner.id] || {
                        aoi1: record?.aoi1 ?? record?.aoiScores[0]?.score ?? 8.0,
                        aoi2: record?.aoi2 ?? record?.aoiScores[1]?.score ?? 8.0,
                        projectScore: record?.projectScore ?? 8.5,
                        midTerm: record?.midTermScore ?? 75,
                        endOfTerm: record?.endOfTermScore ?? 65,
                        paper1: record?.paper1Score ?? 75,
                        paper2: record?.paper2Score ?? 72,
                        aLevelGrade: record?.aLevelGrade ?? 'A',
                        aLevelPoints: record?.aLevelPoints ?? (activeSubjectObj.isSubsidiary ? 1 : 5),
                        descriptor: record?.descriptor ?? 'Outstanding',
                        remarks: record?.teacherRemarks ?? 'Solid understanding exhibited in coursework.',
                      };

                      const isSaved = saveFeedbackMap[learner.id];
                      const totalCalculated = isSubjectALevel
                        ? Math.round((Number(draft.paper1) + Number(draft.paper2)) / 2)
                        : Math.min(20, Number(draft.aoi1) + Number(draft.aoi2)) + Number(draft.endOfTerm);

                      return (
                        <tr key={learner.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {learner.firstName} {learner.lastName}
                            </div>
                            <div className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                              {learner.studentCode}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {learner.classId} {learner.streamId}
                            </span>
                          </td>

                          {/* O-Level inputs */}
                          {!isSubjectALevel ? (
                            <>
                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  value={draft.aoi1}
                                  onChange={(e) => handleScoreChange(learner.id, 'aoi1', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                />
                              </td>
                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  value={draft.aoi2}
                                  onChange={(e) => handleScoreChange(learner.id, 'aoi2', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                />
                              </td>
                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  value={draft.projectScore}
                                  onChange={(e) => handleScoreChange(learner.id, 'projectScore', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-indigo-700 dark:text-indigo-400"
                                />
                              </td>
                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="80"
                                  step="1"
                                  value={draft.endOfTerm}
                                  onChange={(e) => handleScoreChange(learner.id, 'endOfTerm', parseFloat(e.target.value) || 0)}
                                  className="w-18 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                />
                              </td>
                              <td className="py-3 px-2 text-center font-mono font-bold text-slate-950 dark:text-white text-xs">
                                {totalCalculated}%
                              </td>
                              <td className="py-3 px-3">
                                <select
                                  value={draft.descriptor}
                                  onChange={(e) => handleScoreChange(learner.id, 'descriptor', e.target.value as AssessmentDescriptor)}
                                  className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                                >
                                  <option value="Outstanding">Outstanding (3.0)</option>
                                  <option value="Moderate">Moderate (2.0)</option>
                                  <option value="Basic">Basic (1.0)</option>
                                </select>
                              </td>
                            </>
                          ) : (
                            /* A-Level inputs: Paper 1, Paper 2, Grade A-E/O, Points */
                            <>
                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={draft.paper1}
                                  onChange={(e) => handleScoreChange(learner.id, 'paper1', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                />
                              </td>
                              <td className="py-3 px-2 text-center">
                                {activeSubjectObj.isSubsidiary ? (
                                  <span className="text-slate-400 italic">N/A (Sub)</span>
                                ) : (
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={draft.paper2}
                                    onChange={(e) => handleScoreChange(learner.id, 'paper2', parseFloat(e.target.value) || 0)}
                                    className="w-20 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                                  />
                                )}
                              </td>
                              <td className="py-3 px-2 text-center">
                                <select
                                  value={draft.aLevelGrade}
                                  onChange={(e) => handleScoreChange(learner.id, 'aLevelGrade', e.target.value as ALevelGrade)}
                                  className="px-2 py-1 text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                                >
                                  <option value="A">A (5 Pts)</option>
                                  <option value="B">B (4 Pts)</option>
                                  <option value="C">C (3 Pts)</option>
                                  <option value="D">D (2 Pts)</option>
                                  <option value="E">E (1 Pt)</option>
                                  <option value="O">O (0 Pts)</option>
                                </select>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={activeSubjectObj.isSubsidiary ? 1 : 5}
                                  value={draft.aLevelPoints}
                                  onChange={(e) =>
                                    handleScoreChange(
                                      learner.id,
                                      'aLevelPoints',
                                      activeSubjectObj.isSubsidiary
                                        ? Math.min(1, parseFloat(e.target.value) || 0)
                                        : Math.min(5, parseFloat(e.target.value) || 0)
                                    )
                                  }
                                  className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-indigo-700 dark:text-indigo-400"
                                />
                              </td>
                              <td className="py-3 px-2 text-center font-mono font-bold text-slate-900 dark:text-white text-xs">
                                {totalCalculated}%
                              </td>
                            </>
                          )}

                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={draft.remarks}
                              onChange={(e) => handleScoreChange(learner.id, 'remarks', e.target.value)}
                              className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                            />
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleSaveStudentMark(learner)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-all ${
                                isSaved
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                              }`}
                            >
                              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                              {isSaved ? 'Saved!' : 'Save Mark'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                        No learners found matching this stream filter. Use the dropdown above or enroll learners in the Class Roster tab.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLASS TEACHER SUBPORTAL (ROSTER, ATTENDANCE, SUBJECT CURRICULUM) */}
      {activeTab === 'class_roster' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                Class Master Management Deck
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Classroom: {streamKey}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Class Teacher: {currentTeacher.name} · All additions persist permanently across the entire institution
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEnrollModal(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll Learner into Stream
              </button>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            <button
              onClick={() => setClassSubTab('roster')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                classSubTab === 'roster' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Learner Roster &amp; Edit Subjects ({learnersInClassStream.length})
            </button>
            <button
              onClick={() => setClassSubTab('attendance')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                classSubTab === 'attendance' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Daily Attendance Register
            </button>
            <button
              onClick={() => setClassSubTab('subjects')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                classSubTab === 'subjects' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Curriculum Subjects (Add / Delete)
            </button>
          </div>

          {/* TAB 1: ROSTER & EDIT LEARNERS */}
          {classSubTab === 'roster' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4 font-semibold">Learner Name</th>
                      <th className="py-3 px-4 font-semibold">Student Code</th>
                      <th className="py-3 px-4 font-semibold">Gender</th>
                      <th className="py-3 px-4 font-semibold">Parent Contact</th>
                      <th className="py-3 px-4 font-semibold">MFA OTP Code</th>
                      <th className="py-3 px-4 font-semibold">Enrolled Subjects</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {learnersInClassStream.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {s.studentCode}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{s.gender}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {s.parentPhone}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {s.mfaSecretPin}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {s.enrolledSubjectIds?.length || 5} Subjects Offered
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                            title="Edit subjects or details"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setPreviewStudent(s)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800"
                          >
                            Report Card
                          </button>
                          <button
                            onClick={() => deleteStudent(s.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY ATTENDANCE REGISTER */}
          {classSubTab === 'attendance' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Session Roll Call Date
                    </label>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllPresent}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Attendance Register
                  </button>
                </div>
              </div>

              {attendanceSavedNote && (
                <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Daily attendance register for {streamKey} on {attendanceDate} saved permanently to database!
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {learnersInClassStream.map((learner) => {
                  const currentStatus: AttendanceStatus = attendanceStatuses[learner.id] || 'present';
                  return (
                    <div
                      key={learner.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {learner.firstName} {learner.lastName}
                        </div>
                        <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                          {learner.studentCode}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(learner.id, 'present')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            currentStatus === 'present' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(learner.id, 'late')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            currentStatus === 'late' ? 'bg-amber-500 text-white font-bold shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(learner.id, 'absent')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            currentStatus === 'absent' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStudentAttendance(learner.id, 'excused')}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                            currentStatus === 'excused' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SUBJECT MANAGEMENT (ADD / DELETE SUBJECTS OFFERED) */}
          {classSubTab === 'subjects' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    School Curriculum Subject Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add new curriculum subjects or remove subjects offered to learners
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Subject to Curriculum
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSchool.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {sub.name} ({sub.code})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sub.level} · {sub.isSubsidiary ? 'Subsidiary (Max 1 Pt)' : 'Principal / Core'}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSubjectFromSchool(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete subject from curriculum"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. PERFORMANCE REPORTS & CLASS TEACHER REMARKS */}
      {activeTab === 'class_performance' && (
        <div className="space-y-6">
          {/* Class Teacher Signature & Comment Editor for Stream */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Class Teacher Official Signature &amp; Overall Stream Remarks
              </h3>
              {remarksSavedFeedback && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Saved to all student report cards for {streamKey}!
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Class Teacher Name (For {streamKey})
                </label>
                <input
                  type="text"
                  value={streamTeacherName}
                  onChange={(e) => setStreamTeacherName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  General Conduct &amp; Performance Remark
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={streamRemarkInput}
                    onChange={(e) => setStreamRemarkInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleSaveStreamRemarks}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shrink-0"
                  >
                    Save Remark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Class-Wide Performance Matrix: {streamKey}
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed marks across subjects, competency averages, and digital reports
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Batch Reports (PDF)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                    <th className="py-3 px-4 font-semibold">Learner Name</th>
                    <th className="py-3 px-3 font-semibold">Code</th>
                    <th className="py-3 px-3 font-semibold text-center">Average Score %</th>
                    <th className="py-3 px-3 font-semibold text-center">Level / Points</th>
                    <th className="py-3 px-4 font-semibold text-right">Digital Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {learnersInClassStream.map((s) => {
                    const recs = assessments.filter((a) => a.studentId === s.id);
                    const avg = recs.length > 0 ? (recs.reduce((a, b) => a + b.totalFinalScore, 0) / recs.length).toFixed(1) : '85.0';
                    const isALvl = s.classId.includes('5') || s.classId.includes('6');

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {s.studentCode}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {avg}%
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                          {isALvl ? 'A-Level (16 Pts)' : 'O-Level Outstanding'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setPreviewStudent(s)}
                            className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                          >
                            View &amp; Print
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PARENT MESSAGES */}
      {activeTab === 'communications' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Parent Inquiries &amp; Academic Communication
            </h2>
            <p className="text-xs text-slate-500">
              Direct questions from guardians regarding student competencies and Activities of Integration
            </p>
          </div>

          {messages.map((m) => (
            <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center font-semibold">
                <span>{m.parentName} ({m.subject})</span>
                <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">{m.message}</p>
              {m.reply && (
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-950 dark:text-indigo-200">
                  <span className="font-semibold block mb-0.5">Faculty Reply:</span>
                  {m.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Change My Password Modal */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Change My Access Password
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update login credentials for {currentTeacher.name}
            </p>

            <form onSubmit={handleChangeMyPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={newSelfPass}
                  onChange={(e) => setNewSelfPass(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {passChangeSuccess && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Password changed successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 my-6">
            {!enrolledStudentFeedback ? (
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Enroll Learner
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Learner will immediately appear across all teacher gradebooks and parent portal.
                </p>

                <form onSubmit={handleEnrollSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Class</label>
                      <select
                        value={newClassId}
                        onChange={(e) => setNewClassId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                      >
                        {currentSchool.classes.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Stream</label>
                      <select
                        value={newStreamId}
                        onChange={(e) => setNewStreamId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                      >
                        {currentSchool.streams.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Parent Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Parent Phone</label>
                    <input
                      type="text"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      placeholder="+256 700 000 000"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Project Work Title</label>
                    <input
                      type="text"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="e.g. Domestic Biogas Generation Unit"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEnrollModal(false)}
                      className="px-3.5 py-1.5 text-xs text-slate-600 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                    >
                      Enroll Permanently
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-3 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white">Learner Enrolled!</h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-left text-xs space-y-1 font-mono">
                  <div>Name: <strong>{enrolledStudentFeedback.firstName} {enrolledStudentFeedback.lastName}</strong></div>
                  <div>Code: <strong className="text-indigo-600">{enrolledStudentFeedback.studentCode}</strong></div>
                  <div>MFA PIN: <strong>{enrolledStudentFeedback.mfaSecretPin}</strong></div>
                </div>
                <button
                  onClick={() => {
                    setEnrolledStudentFeedback(null);
                    setShowEnrollModal(false);
                  }}
                  className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Student Subjects Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 my-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Edit Learner Subjects &amp; Biodata
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Managing subject combination for {editingStudent.firstName} {editingStudent.lastName} ({editingStudent.studentCode})
            </p>

            <form onSubmit={handleSaveStudentEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingStudent.firstName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingStudent.lastName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Enrolled Subject Combination (Check to Offer)
                </label>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl max-h-48 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-700">
                  {currentSchool.subjects.map((sub) => {
                    const isChecked = editingStudent.enrolledSubjectIds?.includes(sub.id) ?? true;
                    return (
                      <label key={sub.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentList = editingStudent.enrolledSubjectIds || [];
                            const updated = e.target.checked
                              ? [...currentList, sub.id]
                              : currentList.filter((id) => id !== sub.id);
                            setEditingStudent({ ...editingStudent, enrolledSubjectIds: updated });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {sub.name} [{sub.level}]
                        </span>
                        {sub.isSubsidiary && <span className="text-[10px] text-amber-600 font-semibold">(Sub Max 1 Pt)</span>}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject to School Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add Subject to Curriculum
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a new course offering for {currentSchool.name}
            </p>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Agriculture"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AGR"
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Academic Level</label>
                  <select
                    value={newSubLevel}
                    onChange={(e) => setNewSubLevel(e.target.value as 'O-Level' | 'A-Level')}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="O-Level">O-Level</option>
                    <option value="A-Level">A-Level</option>
                  </select>
                </div>
              </div>

              {newSubLevel === 'A-Level' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="subIsSubsidiaryCheck"
                    checked={newSubIsSubsidiary}
                    onChange={(e) => setNewSubIsSubsidiary(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="subIsSubsidiaryCheck" className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Is Subsidiary Subject (Limited to Max 1 Point)
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Report Card Modal */}
      {previewStudent && (
        <DigitalReportCardModal
          student={previewStudent}
          isOpen={true}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};
