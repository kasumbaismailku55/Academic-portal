import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { Student } from '../../types';
import { Printer, Download, X, Award, ShieldCheck, Calendar, User, FileText, Check, Edit3 } from 'lucide-react';

interface DigitalReportCardModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalReportCardModal: React.FC<DigitalReportCardModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const { currentSchool, assessments, attendance, updateClassTeacherRemarks } = usePortal();

  const isALevel = student.classId.includes('5') || student.classId.includes('6');

  // Existing custom remarks
  const streamKey = `${student.classId} ${student.streamId}`;
  const existingStreamRemarks = currentSchool.classTeacherRemarksMap?.[streamKey];

  const [classTeacherName, setClassTeacherName] = useState(
    existingStreamRemarks?.teacherName || (student.streamId === 'Sciences' ? 'Ms. Sarah Kembabazi' : 'Mr. David Okello')
  );
  const [classTeacherRemarkText, setClassTeacherRemarkText] = useState(
    existingStreamRemarks?.remarks ||
      (isALevel
        ? 'A very focused and disciplined candidate with high analytical rigor in practical paper examinations.'
        : 'An exemplary and well-disciplined learner with commendable mastery of integration competencies.')
  );
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  if (!isOpen) return null;

  // Filter student assessments for current school and term
  const studentAssessments = assessments.filter(
    (a) => a.schoolId === currentSchool.id && a.studentId === student.id
  );

  // Compute student attendance stats
  const classAttendanceSessions = attendance.filter(
    (att) =>
      att.schoolId === currentSchool.id &&
      att.classId === student.classId &&
      att.streamId === student.streamId
  );

  let totalSessions = 0;
  let presentDays = 0;
  let lateDays = 0;
  let absentDays = 0;

  classAttendanceSessions.forEach((sess) => {
    const status = sess.records[student.id];
    if (status) {
      totalSessions++;
      if (status === 'present') presentDays++;
      else if (status === 'late') lateDays++;
      else if (status === 'absent') absentDays++;
    }
  });

  const attendanceRate = totalSessions > 0 ? Math.round(((presentDays + lateDays) / totalSessions) * 100) : 100;

  // Calculate A-Level Points total (Max 17: 3 Principals x 5 pts max = 15; 2 Subsidiaries x 1 pt max = 2)
  let aLevelTotalPoints = 0;
  if (isALevel) {
    studentAssessments.forEach((rec) => {
      const sub = currentSchool.subjects.find((s) => s.id === rec.subjectId);
      if (sub?.isSubsidiary) {
        // Subsidiaries strictly max 1 point
        aLevelTotalPoints += Math.min(1, rec.aLevelPoints ?? 1);
      } else {
        // Principal subjects max 5 points (A=5, B=4, C=3, D=2, E=1, O=0)
        aLevelTotalPoints += Math.min(5, rec.aLevelPoints ?? 4);
      }
    });
    // Cap total at 17 max
    aLevelTotalPoints = Math.min(17, aLevelTotalPoints);
  }

  // Calculate overall O-Level academic averages
  const totalScoreSum = studentAssessments.reduce((acc, curr) => acc + (curr.totalFinalScore || 0), 0);
  const averageScore = studentAssessments.length > 0 ? (totalScoreSum / studentAssessments.length).toFixed(1) : '86.5';

  const handlePrint = () => {
    window.print();
  };

  const handleSaveRemarks = () => {
    updateClassTeacherRemarks(streamKey, classTeacherName, classTeacherRemarkText);
    setIsEditingRemarks(false);
  };

  const handleExportJSON = () => {
    const reportData = {
      institution: currentSchool.name,
      schoolCode: currentSchool.code,
      term: currentSchool.currentTerm,
      academicYear: currentSchool.academicYear,
      level: isALevel ? 'A-Level (UACE)' : 'O-Level (UCE New Curriculum)',
      student: {
        id: student.id,
        code: student.studentCode,
        fullName: `${student.firstName} ${student.lastName}`,
        class: `${student.classId} ${student.streamId}`,
        parentName: student.parentName,
      },
      attendance: {
        totalSessions,
        presentDays,
        lateDays,
        absentDays,
        attendanceRate: `${attendanceRate}%`,
      },
      aLevelPointsTotal: isALevel ? `${aLevelTotalPoints} / 17 Points` : undefined,
      subjectRecords: studentAssessments.map((a) => {
        const sub = currentSchool.subjects.find((s) => s.id === a.subjectId);
        return {
          subject: sub?.name || a.subjectId,
          isSubsidiary: sub?.isSubsidiary,
          paper1: a.paper1Score,
          paper2: a.paper2Score,
          aoi1: a.aoi1,
          aoi2: a.aoi2,
          projectScore: a.projectScore,
          midTermScore: a.midTermScore,
          endOfTermScore: a.endOfTermScore,
          finalScore: a.totalFinalScore,
          grade: isALevel ? a.aLevelGrade : a.competencyGrade,
          points: isALevel ? a.aLevelPoints : undefined,
          descriptor: a.descriptor,
          remarks: a.teacherRemarks,
        };
      }),
      classTeacher: {
        name: classTeacherName,
        remarks: classTeacherRemarkText,
      },
      averageScore: !isALevel ? `${averageScore}%` : undefined,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ReportCard_${student.studentCode}_${currentSchool.currentTerm}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>
              {isALevel ? 'A-Level Senior High Scholastic Assessment Report' : 'O-Level Competency & AOI Report Card'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{student.studentCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingRemarks(!isEditingRemarks)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingRemarks ? 'Close Remarks Editor' : 'Edit Class Teacher Signature'}
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editable Remarks Drawer when activated */}
        {isEditingRemarks && (
          <div className="no-print p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-200 dark:border-indigo-800 text-xs space-y-3">
            <div className="font-semibold text-indigo-900 dark:text-indigo-300">
              Customize Class Teacher Name &amp; Signature for {streamKey}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Class Teacher Full Name
                </label>
                <input
                  type="text"
                  value={classTeacherName}
                  onChange={(e) => setClassTeacherName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Class Teacher Conduct Remark
                </label>
                <input
                  type="text"
                  value={classTeacherRemarkText}
                  onChange={(e) => setClassTeacherRemarkText(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveRemarks}
                className="px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Apply to Report Card
              </button>
            </div>
          </div>
        )}

        {/* Printable Official Document */}
        <div id="printable-report-card" className="p-8 sm:p-12 text-slate-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
            <div className="flex items-center justify-between mb-3">
              <div className="w-20 h-20 shrink-0">
                {(currentSchool.badgeUrl || currentSchool.logoUrl) ? (
                  <img
                    src={currentSchool.badgeUrl || currentSchool.logoUrl}
                    alt={currentSchool.name}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-300 shadow-2xs"
                  />
                ) : (
                  <div className="w-20 h-20 bg-indigo-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-2xs">
                    {currentSchool.code}
                  </div>
                )}
              </div>
              <div className="flex-1 px-4 text-center">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 font-serif">
                  {currentSchool.name}
                </h1>
                <p className="text-xs italic font-serif text-slate-700 mt-0.5">
                  &ldquo;{currentSchool.motto}&rdquo;
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  {currentSchool.address} · Tel: {currentSchool.phone} · Email: {currentSchool.email}
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-slate-100 border border-slate-300 text-slate-900 font-bold text-xs uppercase tracking-wider">
                  {isALevel
                    ? `Uganda Advanced Certificate of Education (A-Level) Report — ${currentSchool.currentTerm} ${currentSchool.academicYear}`
                    : `Competency Assessment & Activities of Integration (AOI) Report — ${currentSchool.currentTerm} ${currentSchool.academicYear}`}
                </div>
              </div>
              <div className="w-20 h-20 shrink-0 flex flex-col items-center justify-center border border-slate-300 rounded-lg p-1 bg-slate-50 text-[9px] text-slate-600 text-center font-mono">
                <ShieldCheck className="w-6 h-6 text-indigo-700 mb-0.5" />
                <span>OFFICIAL</span>
                <span>AUTHENTIC</span>
              </div>
            </div>

            {/* Learner Biodata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs mt-4">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Learner Full Name</span>
                <span className="font-bold text-slate-900">{student.firstName} {student.lastName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Unique Student ID</span>
                <span className="font-mono font-bold text-slate-900">{student.studentCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Class &amp; Stream</span>
                <span className="font-bold text-slate-900">{student.classId} {student.streamId}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  {isALevel ? 'A-Level Points Tally' : 'Attendance Rate'}
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {isALevel ? `${aLevelTotalPoints} / 17 Points Max` : `${attendanceRate}% (${presentDays}/${totalSessions || 1} Days)`}
                </span>
              </div>
            </div>
          </div>

          {/* O-LEVEL REPORT FORMAT (S.1, S.2, S.3, S.4) */}
          {!isALevel && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  O-Level Competency Breakdown &amp; Continuous Integration
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  AOI 1 + AOI 2 (20%) · Project (10%) · Mid-Term · End of Term (80%)
                </span>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-2 text-center">AOI 1 (/10)</th>
                      <th className="py-2.5 px-2 text-center">AOI 2 (/10)</th>
                      <th className="py-2.5 px-2 text-center">Project (/10)</th>
                      <th className="py-2.5 px-2 text-center">Mid-Term</th>
                      <th className="py-2.5 px-2 text-center">End Term (/80)</th>
                      <th className="py-2.5 px-2 text-center">Average %</th>
                      <th className="py-2.5 px-3">Competency Descriptor</th>
                      <th className="py-2.5 px-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentAssessments.map((rec) => {
                      const subject = currentSchool.subjects.find((s) => s.id === rec.subjectId);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {subject?.name || rec.subjectId}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {rec.aoi1 ?? rec.aoiScores[0]?.score ?? 8.5}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {rec.aoi2 ?? rec.aoiScores[1]?.score ?? 8.5}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-medium text-indigo-700">
                            {rec.projectScore ?? 9.0}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {rec.midTermScore ?? 78}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {rec.endOfTermScore}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-950">
                            {rec.totalFinalScore}%
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`font-semibold ${
                                rec.descriptor === 'Outstanding'
                                  ? 'text-emerald-700'
                                  : rec.descriptor === 'Moderate'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {rec.descriptor}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px] italic">
                            &ldquo;{rec.teacherRemarks}&rdquo;
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* A-LEVEL REPORT FORMAT (S.5, S.6) */}
          {isALevel && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  A-Level Subject Papers &amp; 17-Point UACE Grading Key
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Principal Max 5 pts (A=5, B=4, C=3, D=2, E=1, O=0) · Subsidiaries Max 1 pt (GP, Sub Math/ICT)
                </span>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                      <th className="py-2.5 px-3">Subject Name</th>
                      <th className="py-2.5 px-2 text-center">Paper 1 (/100)</th>
                      <th className="py-2.5 px-2 text-center">Paper 2 (/100)</th>
                      <th className="py-2.5 px-2 text-center">Combined %</th>
                      <th className="py-2.5 px-2 text-center">Grade</th>
                      <th className="py-2.5 px-2 text-center">Points Tally</th>
                      <th className="py-2.5 px-3">Subject Category</th>
                      <th className="py-2.5 px-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentAssessments.map((rec) => {
                      const subject = currentSchool.subjects.find((s) => s.id === rec.subjectId);
                      const isSub = subject?.isSubsidiary;
                      const pointsEarned = isSub
                        ? Math.min(1, rec.aLevelPoints ?? 1)
                        : Math.min(5, rec.aLevelPoints ?? 5);

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            {subject?.name || rec.subjectId}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {rec.paper1Score ?? 75}
                          </td>
                          <td className="py-2 px-2 text-center font-mono">
                            {isSub ? '—' : (rec.paper2Score ?? 72)}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-medium">
                            {rec.totalFinalScore}%
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-slate-900 font-mono">
                            {rec.aLevelGrade || (pointsEarned === 5 ? 'A' : pointsEarned === 4 ? 'B' : 'C')}
                          </td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-indigo-700">
                            {pointsEarned} {pointsEarned === 1 ? 'Pt' : 'Pts'}
                          </td>
                          <td className="py-2 px-3 text-[11px]">
                            {isSub ? (
                              <span className="font-semibold text-amber-700">Subsidiary (Max 1 Pt)</span>
                            ) : (
                              <span className="font-semibold text-indigo-700">Principal (Max 5 Pts)</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px] italic">
                            &ldquo;{rec.teacherRemarks}&rdquo;
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* A-Level Total Points Summary Box */}
              <div className="mt-3 p-3 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between text-xs">
                <div className="text-slate-600">
                  <strong>Total Aggregate Points:</strong> Calculated from 3 Principal Subjects (Max 15 pts) + 2 Subsidiaries (Max 2 pts)
                </div>
                <div className="text-base font-black font-mono text-indigo-900 bg-white px-3 py-1 border border-slate-300 rounded-md">
                  {aLevelTotalPoints} / 17 POINTS MAX
                </div>
              </div>
            </div>
          )}

          {/* Remarks & Signatures Section */}
          <div className="space-y-4 pt-3 border-t border-slate-300">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase text-slate-700 block">
                  Class Teacher&apos;s Remarks ({streamKey})
                </span>
                <span className="text-[11px] text-slate-600 font-semibold font-serif">
                  Class Teacher: {classTeacherName}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs italic text-slate-800">
                &ldquo;{classTeacherRemarkText}&rdquo;
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase text-slate-700 block mb-1">
                Headteacher&apos;s Official Evaluation &amp; Recommendation
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs italic text-slate-800">
                &ldquo;An outstanding scholastic performance. Keep up the high standard of academic excellence and leadership.&rdquo;
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="text-center border-t border-dashed border-slate-400 pt-2">
                <span className="text-xs font-serif font-bold text-slate-800">{classTeacherName}</span>
                <span className="text-[10px] text-slate-500 block uppercase">
                  Class Teacher Signature ({student.classId} {student.streamId})
                </span>
              </div>
              <div className="text-center border-t border-dashed border-slate-400 pt-2">
                <span className="text-xs font-serif font-bold text-slate-800">Dr. Margaret Namubiru</span>
                <span className="text-[10px] text-slate-500 block uppercase">Headteacher &amp; Institutional Seal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
