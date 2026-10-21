import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Student } from '../../types';
import { MfaModal } from '../common/MfaModal';
import { DigitalReportCardModal } from '../reports/DigitalReportCardModal';
import {
  GraduationCap,
  Award,
  Calendar,
  MessageSquare,
  Printer,
  ShieldCheck,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';

interface ParentPortalProps {
  activeTab: string;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ activeTab }) => {
  const {
    currentSchool,
    currentSession,
    students,
    assessments,
    attendance,
    messages,
    loginParentWithMFA,
    sendParentMessage,
  } = usePortal();

  // Login form state
  const [inputCode, setInputCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [candidateStudent, setCandidateStudent] = useState<Student | null>(null);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaError, setMfaError] = useState('');

  // Parent message state
  const [messageRecipient, setMessageRecipient] = useState<'Class Teacher' | 'Subject Teacher' | 'Headteacher'>('Class Teacher');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageSentFeedback, setMessageSentFeedback] = useState(false);

  // Digital Report Card Modal
  const [showReportModal, setShowReportModal] = useState(false);

  // Current authenticated learner
  const activeLearner: Student | undefined = currentSession?.role === 'parent' ? currentSession.student : undefined;

  // Assessments for active learner
  const learnerAssessments = assessments.filter(
    (a) => a.schoolId === currentSchool.id && a.studentId === activeLearner?.id
  );

  // Attendance for active learner
  const learnerAttendanceSessions = attendance.filter(
    (att) =>
      att.schoolId === currentSchool.id &&
      att.classId === activeLearner?.classId &&
      att.streamId === activeLearner?.streamId
  );

  let totalSessions = 0;
  let presentDays = 0;
  let lateDays = 0;
  let absentDays = 0;
  let excusedDays = 0;

  learnerAttendanceSessions.forEach((sess) => {
    if (activeLearner && sess.records[activeLearner.id]) {
      totalSessions++;
      const st = sess.records[activeLearner.id];
      if (st === 'present') presentDays++;
      else if (st === 'late') lateDays++;
      else if (st === 'absent') absentDays++;
      else if (st === 'excused') excusedDays++;
    }
  });

  const attendanceRate = totalSessions > 0 ? Math.round(((presentDays + lateDays) / totalSessions) * 100) : 96;

  // Score average
  const totalScore = learnerAssessments.reduce((acc, curr) => acc + (curr.totalFinalScore || 0), 0);
  const averageGrade = learnerAssessments.length > 0 ? (totalScore / learnerAssessments.length).toFixed(1) : '89.4';

  // Handle initial student code lookup
  const handleStudentCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const clean = inputCode.trim().toUpperCase();

    // Check school prefix match
    const found = students.find(
      (s) => s.schoolId === currentSchool.id && s.studentCode.trim().toUpperCase() === clean
    );

    if (!found) {
      setLoginError(
        `Learner Code "${clean}" not recognized in ${currentSchool.name}. Verify student ID card or switch to the correct institution.`
      );
      return;
    }

    setCandidateStudent(found);
    setShowMfaModal(true);
    setMfaError('');
  };

  // Handle MFA verification
  const handleVerifyOtp = (otp: string) => {
    if (!candidateStudent) return;
    const res = loginParentWithMFA(candidateStudent.studentCode, otp);
    if (res.success) {
      setShowMfaModal(false);
      setCandidateStudent(null);
    } else {
      setMfaError(res.error || 'Authentication failed. Please verify 6-digit passcode.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLearner || !messageSubject || !messageContent) return;

    sendParentMessage({
      studentId: activeLearner.id,
      parentName: activeLearner.parentName,
      recipient: messageRecipient,
      subject: messageSubject,
      message: messageContent,
    });

    setMessageSentFeedback(true);
    setMessageSubject('');
    setMessageContent('');
    setTimeout(() => setMessageSentFeedback(false), 2500);
  };

  // Learner messages
  const learnerMessages = messages.filter((m) => m.studentId === activeLearner?.id);

  // IF NOT AUTHENTICATED AS PARENT YET:
  if (!activeLearner) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Parent &amp; Learner Academic Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Access real-time continuous assessment reports, Activities of Integration (AOI), and attendance logs for {currentSchool.name}
            </p>
          </div>

          <form onSubmit={handleStudentCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Unique Student Number or Code
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder={`e.g. ${currentSchool.code}-S1-102`}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold tracking-wider bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Each subscribed school has a unique student namespace (e.g. {currentSchool.code}-S1-XXX) to prevent cross-institution access.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Verify Student Code &amp; Launch MFA
            </button>
          </form>

          {/* Quick Demo Helpers */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Demo Learner Credentials for {currentSchool.name}:
            </div>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 3).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setInputCode(s.studentCode)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 transition-colors text-slate-800 dark:text-slate-200"
                >
                  {s.studentCode} ({s.firstName})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MFA Verification Modal */}
        {candidateStudent && (
          <MfaModal
            isOpen={showMfaModal}
            onClose={() => setShowMfaModal(false)}
            onVerify={handleVerifyOtp}
            expectedPin={candidateStudent.mfaSecretPin}
            learnerName={`${candidateStudent.firstName} ${candidateStudent.lastName}`}
            studentCode={candidateStudent.studentCode}
            error={mfaError}
          />
        )}
      </div>
    );
  }

  // IF AUTHENTICATED AS PARENT:
  return (
    <div className="space-y-6">
      {/* Learner Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Authenticated Parent / Learner Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            {activeLearner.firstName} {activeLearner.lastName}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 mt-1">
            <span>Class: <strong>{activeLearner.classId} {activeLearner.streamId}</strong></span>
            <span>·</span>
            <span>Student Code: <strong className="font-mono">{activeLearner.studentCode}</strong></span>
            <span>·</span>
            <span>Parent: <strong>{activeLearner.parentName}</strong></span>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2 text-xs font-semibold bg-white text-indigo-950 hover:bg-indigo-50 rounded-xl shadow-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          View &amp; Print Official Report Card
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Attendance Rate</div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {attendanceRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            {presentDays} of {totalSessions || 1} Sessions Present
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Aggregate Average</div>
          <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
            {averageGrade}%
          </div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">
            Weighted AOI + End of Term
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">Overall Competence</div>
          <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            Outstanding (3.0)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Integration Mastery Tier
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">MFA Security PIN</div>
          <div className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
            {activeLearner.mfaSecretPin}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Registered passkey
          </div>
        </div>
      </div>

      {/* 1. PROGRESS / COMPETENCIES TAB */}
      {(activeTab === 'progress' || activeTab === 'report_card') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subject Assessments &amp; Continuous Activities of Integration (AOI)
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Term 2 2026 Academic Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learnerAssessments.map((a) => {
              const subject = currentSchool.subjects.find((s) => s.id === a.subjectId);
              return (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {subject?.name || a.subjectId}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Evaluated by {a.updatedBy}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        {a.totalFinalScore}%
                      </span>
                      <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {a.competencyGrade}
                      </span>
                    </div>
                  </div>

                  {/* AOI Continuous Breakdown */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Activities of Integration (20% Continuous Weight):
                    </div>
                    {a.aoiScores.map((aoi, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{aoi.title}</div>
                          <div className="text-[10px] text-slate-400 italic truncate">{aoi.remarks}</div>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                          {aoi.score} / {aoi.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* End of Term Exam */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">End-of-Term Standardized Exam:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {a.endOfTermScore} / 80
                    </span>
                  </div>

                  {/* Teacher Remark */}
                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl text-xs italic text-slate-700 dark:text-slate-300">
                    &ldquo;{a.teacherRemarks}&rdquo;
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE LOG TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Official Learner Attendance Log
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recorded daily by Class Master during morning registration sessions
          </p>

          <div className="space-y-2">
            {learnerAttendanceSessions.map((sess) => {
              const status = sess.records[activeLearner.id] || 'present';
              return (
                <div
                  key={sess.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white font-mono">{sess.date}</div>
                      <div className="text-[11px] text-slate-400">Logged by: {sess.loggedBy}</div>
                    </div>
                  </div>

                  <span
                    className={`font-semibold uppercase px-2.5 py-1 rounded-lg text-[11px] ${
                      status === 'present'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : status === 'late'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CONTACT TEACHER TAB */}
      {activeTab === 'contact_teacher' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Send Direct Inquiry to Teachers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submit questions regarding student performance, Activities of Integration, or school events
            </p>

            <form onSubmit={handleSendMessage} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient
                </label>
                <select
                  value={messageRecipient}
                  onChange={(e) =>
                    setMessageRecipient(e.target.value as 'Class Teacher' | 'Subject Teacher' | 'Headteacher')
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Class Teacher">Class Teacher (Mr. David Okello)</option>
                  <option value="Subject Teacher">Chemistry Teacher (Ms. Sarah Kembabazi)</option>
                  <option value="Headteacher">Headteacher (Dr. Margaret Namubiru)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inquiry Subject *
                </label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="e.g. Question on holiday chemistry coursework"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Details *
                </label>
                <textarea
                  rows={3}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Write your message to the educator..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {messageSentFeedback && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Message delivered to faculty portal!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Message
              </button>
            </form>
          </div>

          {/* Conversation History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Communication History
            </h3>

            <div className="space-y-3">
              {learnerMessages.length > 0 ? (
                learnerMessages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white">{m.subject}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">{m.message}</p>
                    {m.reply && (
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-950 dark:text-indigo-200 text-[11px]">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                          Faculty Response:
                        </span>
                        {m.reply}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No prior messages submitted yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Report Card Modal */}
      {showReportModal && (
        <DigitalReportCardModal
          student={activeLearner}
          isOpen={true}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
