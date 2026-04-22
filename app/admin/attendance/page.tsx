'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

interface Classroom { id: string; name: string; subject_id?: string; subject_ids?: string[] }
interface Subject { id: string; name: string }
interface Student { id: string; name: string; student_code: string }
interface AttendanceRecord { student_id: string; status: string }

export default function AttendancePage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    const { data: cls } = await supabase.from('classrooms').select('*').order('name')
    const { data: sub } = await supabase.from('subjects').select('*').order('name')
    setClassrooms(cls || [])
    setSubjects(sub || [])
    setLoading(false)
  }

  const fetchStudents = async (classId: string, subjectId: string) => {
    const { data: stu } = await supabase.from('students').select('*').eq('classroom_id', classId).order('student_code')
    setStudents(stu || [])

    let query = supabase.from('attendance').select('*').eq('classroom_id', classId).eq('date', selectedDate)
    if (subjectId) query = query.eq('subject_id', subjectId)

    const { data: att } = await query

    const attMap: Record<string, string> = {}
    stu?.forEach(s => { attMap[s.id] = 'มา' })
    att?.forEach(a => { attMap[a.student_id] = a.status })
    setAttendance(attMap)
  }

  useEffect(() => {
    const classroom = classrooms.find(c => c.id === selectedClass)
    const assigned = classroom?.subject_ids?.length
      ? classroom.subject_ids
      : classroom?.subject_id
        ? [classroom.subject_id]
        : []

    if (assigned.length > 0) {
      const nextSubject = assigned.includes(selectedSubject) ? selectedSubject : assigned[0]
      setSelectedSubject(nextSubject)
      if (selectedClass) fetchStudents(selectedClass, nextSubject)
    } else {
      setSelectedSubject('')
      if (selectedClass) fetchStudents(selectedClass, '')
    }
  }, [selectedClass, selectedDate, classrooms])

  const handleStatus = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const handleSave = async () => {
    setSaving(true)
    let deleteQuery = supabase.from('attendance').delete()
      .eq('classroom_id', selectedClass)
      .eq('date', selectedDate)

    if (selectedSubject) {
      deleteQuery = deleteQuery.eq('subject_id', selectedSubject)
    }

    await deleteQuery

    const records = students.map(s => ({
      student_id: s.id,
      classroom_id: selectedClass,
      subject_id: selectedSubject || undefined,
      date: selectedDate,
      status: attendance[s.id] || 'มา'
    }))

    await supabase.from('attendance').insert(records)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const exportExcel = async () => {
    const classroom = classrooms.find(c => c.id === selectedClass)
    if (!classroom) return

    // สร้างข้อมูลสำหรับ export
    const exportData = students.map(student => ({
      'รหัสนักเรียน': student.student_code,
      'ชื่อ-นามสกุล': student.name,
      [selectedDate]: attendance[student.id] || 'มา'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance')

    // ปรับความกว้างคอลัมน์
    const colWidths = [
      { wch: 15 }, // รหัสนักเรียน
      { wch: 25 }, // ชื่อ-นามสกุล
      { wch: 10 }  // สถานะ
    ]
    ws['!cols'] = colWidths

    // สร้างชื่อไฟล์
    const date = new Date(selectedDate)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const filename = `เช็คชื่อ_${classroom.name}_${month}_${year}.xlsx`

    XLSX.writeFile(wb, filename)
  }

  const statusConfig = [
    { label: 'มา', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
    { label: 'สาย', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    { label: 'ลา', color: '#6366f1', bg: '#eef2ff', border: '#a5b4fc' },
    { label: 'ขาด', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  ]

  const countStatus = (status: string) => Object.values(attendance).filter(s => s === status).length

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
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .stat-pill {
          border-radius: 12px; padding: 14px 16px; text-align: center;
          border: 1.5px solid;
        }
        .stat-num { font-family: 'Prompt', sans-serif; font-size: 24px; font-weight: 700; }
        .stat-label { font-size: 12px; margin-top: 2px; }
        .table-wrap { background: #fff; border-radius: 16px; border: 1px solid #f3f4f6; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8f9ff; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; }
        td { padding: 12px 16px; font-size: 14px; color: #374151; border-top: 1px solid #f3f4f6; }
        tr:hover td { background: #fafbff; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; background: #eef2ff; color: #6366f1; }
        .status-btns { display: flex; gap: 6px; }
        .status-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: 1.5px solid transparent;
          font-family: 'Sarabun', sans-serif; transition: all 0.15s;
        }
        .empty { text-align: center; padding: 60px; color: #9ca3af; }
        .success-banner {
          background: #f0fdf4; border: 1px solid #86efac; color: #16a34a;
          border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
          font-size: 14px; font-weight: 500;
        }
      `}</style>

      <>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">✅ ระบบเช็คชื่อ</div>
              <div className="page-sub">บันทึกการเข้าเรียนรายวัน</div>
            </div>
            {selectedClass && students.length > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={exportExcel}>
                  📊 Export Excel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : '💾 บันทึกการเช็คชื่อ'}
                </button>
              </div>
            )}
          </div>

          {saved && <div className="success-banner">✅ บันทึกการเช็คชื่อเรียบร้อยแล้ว</div>}

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
              <select
                className="filter-select"
                value={selectedSubject}
                onChange={e => {
                  setSelectedSubject(e.target.value)
                  if (selectedClass) fetchStudents(selectedClass, e.target.value)
                }}
                disabled={!selectedClass}
              >
                <option value="">-- เลือกวิชา --</option>
                {(() => {
                  const classroom = classrooms.find(c => c.id === selectedClass)
                  const assignedIds = classroom?.subject_ids?.length ? classroom.subject_ids : classroom?.subject_id ? [classroom.subject_id] : []
                  return assignedIds.map(id => {
                    const subj = subjects.find(s => s.id === id)
                    return subj ? <option key={id} value={id}>{subj.name}</option> : null
                  })
                })()}
              </select>
            </div>
            <div className="filter-group">
              <span className="filter-label">วันที่</span>
              <input type="date" className="filter-select" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>
          </div>

          {selectedClass && students.length > 0 && (
            <>
              <div className="stats-row">
                {statusConfig.map(s => (
                  <div key={s.label} className="stat-pill" style={{ background: s.bg, borderColor: s.border }}>
                    <div className="stat-num" style={{ color: s.color }}>{countStatus(s.label)}</div>
                    <div className="stat-label" style={{ color: s.color }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>รหัส</th>
                      <th>ชื่อ-นามสกุล</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td><span className="badge">{s.student_code}</span></td>
                        <td>{s.name}</td>
                        <td>
                          <div className="status-btns">
                            {statusConfig.map(st => (
                              <button
                                key={st.label}
                                className="status-btn"
                                style={{
                                  background: attendance[s.id] === st.label ? st.bg : '#f9fafb',
                                  borderColor: attendance[s.id] === st.label ? st.border : '#e5e7eb',
                                  color: attendance[s.id] === st.label ? st.color : '#9ca3af',
                                }}
                                onClick={() => handleStatus(s.id, st.label)}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedClass && students.length === 0 && (
            <div className="empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🎓</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีนักเรียนในห้องนี้</div>
              <div style={{ fontSize: 14 }}>กรุณาเพิ่มนักเรียนในระบบจัดการชั้นเรียนก่อน</div>
            </div>
          )}

          {!selectedClass && (
            <div className="empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>เลือกห้องเรียนเพื่อเริ่มเช็คชื่อ</div>
            </div>
          )}
        </div>
      </>
    </>
  )
}