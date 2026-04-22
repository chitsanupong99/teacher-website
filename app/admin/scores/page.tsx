'use client'
import * as XLSX from 'xlsx'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Classroom { id: string; name: string }
interface Subject { id: string; name: string }
interface Student { id: string; name: string; student_code: string }
interface Assignment { id: string; title: string; max_score: number; subject_id: string }

export default function ScoresPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [assignForm, setAssignForm] = useState({ title: '', max_score: '' })

  useEffect(() => {
    fetchInit()
  }, [])

  const fetchInit = async () => {
    const { data: cls } = await supabase.from('classrooms').select('*').order('name')
    const { data: sub } = await supabase.from('subjects').select('*').order('name')
    setClassrooms(cls || [])
    setSubjects(sub || [])
    setLoading(false)
  }

  const fetchStudentsAndScores = async () => {
    if (!selectedClass) return
    const { data: stu } = await supabase.from('students').select('*').eq('classroom_id', selectedClass).order('student_code')
    setStudents(stu || [])

    if (selectedSubject) {
      const { data: ass } = await supabase.from('assignments').select('*').eq('subject_id', selectedSubject).order('created_at')
      setAssignments(ass || [])

      if (stu && ass) {
        const { data: sc } = await supabase.from('scores').select('*')
          .in('student_id', stu.map(s => s.id))
          .in('assignment_id', ass.map(a => a.id))

        const scoreMap: Record<string, Record<string, string>> = {}
        stu.forEach(s => { scoreMap[s.id] = {} })
        sc?.forEach(s => {
          if (!scoreMap[s.student_id]) scoreMap[s.student_id] = {}
          scoreMap[s.student_id][s.assignment_id] = s.score?.toString() || ''
        })
        setScores(scoreMap)
      }
    }
  }

  useEffect(() => { fetchStudentsAndScores() }, [selectedClass, selectedSubject])

  const handleScoreChange = (studentId: string, assignId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [assignId]: value }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    for (const student of students) {
      for (const assign of assignments) {
        const scoreVal = scores[student.id]?.[assign.id]
        const { data: existing } = await supabase.from('scores').select('id')
          .eq('student_id', student.id).eq('assignment_id', assign.id).single()

        if (existing) {
          await supabase.from('scores').update({ score: scoreVal ? parseFloat(scoreVal) : null }).eq('id', existing.id)
        } else if (scoreVal !== undefined && scoreVal !== '') {
          await supabase.from('scores').insert({ student_id: student.id, assignment_id: assign.id, score: parseFloat(scoreVal) })
        }
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleAddAssignment = async () => {
    if (!assignForm.title || !assignForm.max_score || !selectedSubject) return
    await supabase.from('assignments').insert({
      title: assignForm.title,
      max_score: parseFloat(assignForm.max_score),
      subject_id: selectedSubject
    })
    setShowModal(false)
    setAssignForm({ title: '', max_score: '' })
    fetchStudentsAndScores()
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('ยืนยันการลบรายการงานนี้?')) return
    await supabase.from('scores').delete().eq('assignment_id', id)
    await supabase.from('assignments').delete().eq('id', id)
    fetchStudentsAndScores()
  }

  const getTotalScore = (studentId: string) => {
    return assignments.reduce((sum, a) => {
      const s = parseFloat(scores[studentId]?.[a.id] || '0')
      return sum + (isNaN(s) ? 0 : s)
    }, 0)
  }

  const getMaxTotal = () => assignments.reduce((sum, a) => sum + a.max_score, 0)
const handleExport = () => {
  const rows = students.map((s, i) => {
    const row: Record<string, any> = {
      '#': i + 1,
      'รหัสนักเรียน': s.student_code,
      'ชื่อ-นามสกุล': s.name,
    }
    assignments.forEach(a => {
      row[`${a.title} (${a.max_score})`] = scores[s.id]?.[a.id] || ''
    })
    row['รวม'] = getTotalScore(s.id)
    row['เต็ม'] = getMaxTotal()
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'คะแนน')
  const className = classrooms.find(c => c.id === selectedClass)?.name || 'ห้องเรียน'
  const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'วิชา'
  XLSX.writeFile(wb, `คะแนน_${className}_${subjectName}.xlsx`)
}
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#6366f1' }}>กำลังโหลด...</div>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; background: #f8f9ff; }
        .layout { display: flex; min-height: 100vh; }
        .main { padding: 32px; flex: 1; }
        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-family: 'Prompt', sans-serif; font-size: 24px; font-weight: 700; color: #1e1b4b; }
        .page-sub { color: #9ca3af; font-size: 13px; margin-top: 2px; }
        .btn {
          padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .btn-outline { background: #fff; color: #6366f1; border: 1.5px solid #6366f1; }
        .btn-outline:hover { background: #eef2ff; }
        .filter-bar {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          display: flex; gap: 16px; align-items: flex-end; margin-bottom: 20px;
        }
        .filter-group { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .filter-label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }
        .filter-select {
          border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px;
          font-size: 14px; font-family: 'Sarabun', sans-serif; color: #111827;
          background: #fafafa; outline: none; transition: all 0.2s;
        }
        .filter-select:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
        .table-wrap { background: #fff; border-radius: 16px; border: 1px solid #f3f4f6; overflow-x: auto; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        th { background: #f8f9ff; padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 600; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap; }
        th.left { text-align: left; }
        td { padding: 10px 16px; font-size: 14px; color: #374151; border-top: 1px solid #f3f4f6; text-align: center; }
        td.left { text-align: left; }
        tr:hover td { background: #fafbff; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; background: #eef2ff; color: #6366f1; }
        .score-input {
          width: 60px; border: 1.5px solid #e5e7eb; border-radius: 8px;
          padding: 6px 8px; font-size: 14px; text-align: center;
          font-family: 'Sarabun', sans-serif; outline: none; transition: all 0.2s;
          background: #fafafa;
        }
        .score-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
        .total-cell { font-family: 'Prompt', sans-serif; font-weight: 700; color: #6366f1; }
        .assign-header { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .assign-max { font-size: 10px; color: #9ca3af; font-weight: 400; }
        .delete-assign { background: none; border: none; cursor: pointer; color: #fca5a5; font-size: 12px; padding: 0; }
        .delete-assign:hover { color: #ef4444; }
        .empty { text-align: center; padding: 60px; color: #9ca3af; }
        .success-banner {
          background: #f0fdf4; border: 1px solid #86efac; color: #16a34a;
          border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
          font-size: 14px; font-weight: 500;
        }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px);
        }
        .modal { background: #fff; border-radius: 20px; padding: 32px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .modal-title { font-family: 'Prompt', sans-serif; font-size: 20px; font-weight: 700; color: #1e1b4b; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .form-input {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 11px 14px; font-size: 14px; font-family: 'Sarabun', sans-serif;
          color: #111827; background: #fafafa; outline: none; transition: all 0.2s;
        }
        .form-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
        .modal-actions { display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end; }
        .btn-cancel { background: #f3f4f6; color: #6b7280; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; }
        .btn-cancel:hover { background: #e5e7eb; }
      `}</style>

      <>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">📝 ระบบคะแนน</div>
              <div className="page-sub">กรอกคะแนนรายบุคคลแต่ละงาน</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedClass && selectedSubject && (
                <button className="btn btn-outline" onClick={() => setShowModal(true)}>+ เพิ่มรายการงาน</button>
              )}
              {students.length > 0 && assignments.length > 0 && (
                <button className="btn btn-outline" onClick={handleExport}>
                 📊 Export Excel
                </button>
            )}
            {students.length > 0 && assignments.length > 0 && (
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'กำลังบันทึก...' : '💾 บันทึกคะแนน'}
                </button>
           )}
            </div>
          </div>

          {saved && <div className="success-banner">✅ บันทึกคะแนนเรียบร้อยแล้ว</div>}

          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-label">ห้องเรียน</span>
              <select className="filter-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">-- เลือกห้องเรียน --</option>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">วิชา</span>
              <select className="filter-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                <option value="">-- เลือกวิชา --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {selectedClass && selectedSubject && students.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="left">#</th>
                    <th className="left">รหัส</th>
                    <th className="left">ชื่อ-นามสกุล</th>
                    {assignments.map(a => (
                      <th key={a.id}>
                        <div className="assign-header">
                          <span>{a.title}</span>
                          <span className="assign-max">เต็ม {a.max_score}</span>
                          <button className="delete-assign" onClick={() => handleDeleteAssignment(a.id)}>🗑️</button>
                        </div>
                      </th>
                    ))}
                    <th>รวม / {getMaxTotal()}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={s.id}>
                      <td className="left">{i + 1}</td>
                      <td className="left"><span className="badge">{s.student_code}</span></td>
                      <td className="left">{s.name}</td>
                      {assignments.map(a => (
                        <td key={a.id}>
                          <input
                            className="score-input"
                            type="number"
                            min="0"
                            max={a.max_score}
                            value={scores[s.id]?.[a.id] || ''}
                            onChange={e => handleScoreChange(s.id, a.id, e.target.value)}
                            placeholder="-"
                          />
                        </td>
                      ))}
                      <td className="total-cell">{getTotalScore(s.id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(!selectedClass || !selectedSubject) && (
            <div className="empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>เลือกห้องเรียนและวิชาเพื่อเริ่มกรอกคะแนน</div>
            </div>
          )}
        </div>
      </>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📝 เพิ่มรายการงาน</div>
            <div className="form-group">
              <label className="form-label">ชื่องาน</label>
              <input className="form-input" placeholder="เช่น งานที่ 1, สอบกลางภาค" value={assignForm.title} onChange={e => setAssignForm({ ...assignForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">คะแนนเต็ม</label>
              <input className="form-input" type="number" placeholder="เช่น 10, 20, 100" value={assignForm.max_score} onChange={e => setAssignForm({ ...assignForm, max_score: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleAddAssignment}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}