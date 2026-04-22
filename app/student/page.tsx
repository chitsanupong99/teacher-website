'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Student { id: string; name: string; student_code: string; classroom_id: string }
interface Classroom { id: string; name: string }
interface Assignment { id: string; title: string; max_score: number }
interface Score { assignment_id: string; score: number }
interface Attendance { date: string; status: string }

export default function StudentPage() {
  const router = useRouter()
  const [studentCode, setStudentCode] = useState('')
  const [student, setStudent] = useState<Student | null>(null)
  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [scores, setScores] = useState<Score[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'scores' | 'attendance'>('scores')

  const handleSearch = async () => {
    if (!studentCode.trim()) return
    setLoading(true)
    setError('')
    setStudent(null)

    const { data: stu } = await supabase
      .from('students').select('*').eq('student_code', studentCode.trim()).single()

    if (!stu) {
      setError('ไม่พบรหัสนักเรียนนี้ในระบบ')
      setLoading(false)
      return
    }

    setStudent(stu)

    const { data: cls } = await supabase.from('classrooms').select('*').eq('id', stu.classroom_id).single()
    setClassroom(cls)

    const { data: att } = await supabase.from('attendance')
      .select('*').eq('student_id', stu.id).order('date', { ascending: false })
    setAttendance(att || [])

    const { data: sc } = await supabase.from('scores').select('*').eq('student_id', stu.id)
    setScores(sc || [])

    if (sc && sc.length > 0) {
      const assignIds = sc.map((s: Score) => s.assignment_id)
      const { data: ass } = await supabase.from('assignments').select('*').in('id', assignIds)
      setAssignments(ass || [])
    }

    setLoading(false)
  }

  const getTotalScore = () => scores.reduce((sum, s) => sum + (s.score || 0), 0)
  const getMaxScore = () => assignments.reduce((sum, a) => sum + a.max_score, 0)
  const getAttendanceCount = (status: string) => attendance.filter(a => a.status === status).length
  const getAttendancePercent = () => {
    if (attendance.length === 0) return 0
    return Math.round((getAttendanceCount('มา') / attendance.length) * 100)
  }

  const statusConfig: Record<string, { color: string; bg: string }> = {
    'มา': { color: '#16a34a', bg: '#f0fdf4' },
    'สาย': { color: '#d97706', bg: '#fffbeb' },
    'ลา': { color: '#6366f1', bg: '#eef2ff' },
    'ขาด': { color: '#dc2626', bg: '#fef2f2' },
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Sarabun', sans-serif; background: #f8f9ff; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }

        .navbar {
          background: rgba(255,255,255,0.9); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99,102,241,0.1);
          padding: 0 40px; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
          box-shadow: 0 4px 24px rgba(99,102,241,0.08);
        }
        .nav-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .nav-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#6366f1,#8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .nav-logo-text { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 700; color: #1e1b4b; }
        .nav-back { padding: 8px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; border: 1.5px solid #e5e7eb; background: #fff; font-family: 'Sarabun', sans-serif; transition: all 0.2s; }
        .nav-back:hover { border-color: #6366f1; color: #6366f1; }

        .hero {
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 40%, #7c3aed 100%);
          padding: 60px 40px 80px; text-align: center; color: #fff; position: relative; overflow: hidden;
        }
        .hero-dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 30px 30px; pointer-events: none; }
        .hero-icon { font-size: 56px; margin-bottom: 16px; display: block; animation: float 3s ease-in-out infinite; }
        .hero-title { font-family: 'Prompt', sans-serif; font-size: 36px; font-weight: 800; margin-bottom: 8px; }
        .hero-sub { font-size: 16px; opacity: 0.7; margin-bottom: 32px; }

        .search-wrap {
          display: flex; gap: 12px; justify-content: center; max-width: 480px; margin: 0 auto;
        }
        .search-input {
          flex: 1; border: 2px solid rgba(255,255,255,0.3);
          border-radius: 14px; padding: 14px 20px; font-size: 16px;
          font-family: 'Sarabun', sans-serif; color: #fff;
          background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
          outline: none; transition: all 0.2s; text-align: center;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.5); }
        .search-input:focus { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.18); }
        .search-btn {
          padding: 14px 28px; border-radius: 14px; font-size: 15px; font-weight: 700;
          background: #fff; color: #6366f1; border: none; cursor: pointer;
          font-family: 'Sarabun', sans-serif; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2); white-space: nowrap;
        }
        .search-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .search-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .error-msg {
          background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626;
          border-radius: 12px; padding: 14px 20px; text-align: center;
          font-size: 14px; font-weight: 500; max-width: 480px; margin: 0 auto;
        }

        .container { max-width: 900px; margin: 0 auto; padding: 40px 32px; }

        .student-header {
          background: #fff; border-radius: 20px; padding: 28px 32px;
          border: 1px solid #f3f4f6; box-shadow: 0 4px 20px rgba(99,102,241,0.08);
          display: flex; align-items: center; gap: 20px; margin-bottom: 24px;
        }
        .student-avatar {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px; flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .student-name { font-family: 'Prompt', sans-serif; font-size: 22px; font-weight: 700; color: #1e1b4b; margin-bottom: 4px; }
        .student-info { font-size: 14px; color: #9ca3af; }
        .student-badge { display: inline-flex; align-items: center; gap: 6px; background: #eef2ff; color: #6366f1; padding: 4px 14px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: 6px; }

        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        .summary-card {
          background: #fff; border-radius: 16px; padding: 18px;
          border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          text-align: center; transition: all 0.2s;
        }
        .summary-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.1); }
        .summary-icon { font-size: 28px; margin-bottom: 8px; }
        .summary-num { font-family: 'Prompt', sans-serif; font-size: 26px; font-weight: 700; color: #1e1b4b; }
        .summary-label { font-size: 12px; color: #9ca3af; margin-top: 2px; }

        .tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 14px; padding: 4px; margin-bottom: 20px; width: fit-content; }
        .tab { padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s; color: #6b7280; background: none; }
        .tab.active { background: #fff; color: #6366f1; font-weight: 600; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

        .table-wrap { background: #fff; border-radius: 16px; border: 1px solid #f3f4f6; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8f9ff; padding: 12px 20px; text-align: left; font-size: 12px; font-weight: 600; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; }
        td { padding: 14px 20px; font-size: 14px; color: #374151; border-top: 1px solid #f3f4f6; }
        tr:hover td { background: #fafbff; }

        .score-bar-wrap { display: flex; align-items: center; gap: 10px; }
        .score-bar-bg { flex: 1; height: 8px; background: #f3f4f6; border-radius: 100px; overflow: hidden; }
        .score-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 100px; transition: width 0.8s ease; }
        .score-val { font-family: 'Prompt', sans-serif; font-weight: 700; color: #6366f1; font-size: 15px; white-space: nowrap; }

        .status-badge { display: inline-flex; align-items: center; padding: 5px 14px; border-radius: 100px; font-size: 13px; font-weight: 600; }

        .att-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
        .att-card { border-radius: 12px; padding: 14px; text-align: center; border: 1.5px solid; }
        .att-num { font-family: 'Prompt', sans-serif; font-size: 22px; font-weight: 700; }
        .att-label { font-size: 12px; margin-top: 2px; }

        .progress-circle-wrap { display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .progress-info { font-size: 14px; color: #9ca3af; margin-top: 8px; }

        .empty { text-align: center; padding: 48px; color: #9ca3af; }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }

        .not-searched {
          text-align: center; padding: 80px 32px;
        }
        .not-searched-icon { font-size: 80px; margin-bottom: 20px; animation: float 3s ease-in-out infinite; }
        .not-searched-title { font-family: 'Prompt', sans-serif; font-size: 22px; font-weight: 700; color: #1e1b4b; margin-bottom: 8px; }
        .not-searched-sub { font-size: 15px; color: #9ca3af; }
      `}</style>

      {/* Navbar */}
      <div className="navbar">
        <div className="nav-logo" onClick={() => router.push('/home')}>
          <div className="nav-logo-icon">🎓</div>
          <span className="nav-logo-text">Teacher Portal</span>
        </div>
        <button className="nav-back" onClick={() => router.push('/home')}>← กลับหน้าหลัก</button>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-dots" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="hero-icon">🔍</span>
          <div className="hero-title">ตรวจสอบผลการเรียน</div>
          <div className="hero-sub">กรอกรหัสนักเรียนเพื่อดูคะแนนและการเข้าเรียน</div>
          <div className="search-wrap">
            <input
              className="search-input"
              placeholder="กรอกรหัสนักเรียน..."
              value={studentCode}
              onChange={e => setStudentCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? '⏳' : '🔍 ค้นหา'}
            </button>
          </div>
          {error && (
            <div style={{ maxWidth: 480, margin: '16px auto 0' }}>
              <div className="error-msg">⚠️ {error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {!student && !error && (
          <div className="not-searched fade-up">
            <div className="not-searched-icon">📋</div>
            <div className="not-searched-title">กรอกรหัสนักเรียนด้านบน</div>
            <div className="not-searched-sub">เพื่อดูผลการเรียน คะแนน และการเข้าเรียนของคุณ</div>
          </div>
        )}

        {student && (
          <div className="fade-up">
            {/* Student Header */}
            <div className="student-header">
              <div className="student-avatar">👨‍🎓</div>
              <div>
                <div className="student-name">{student.name}</div>
                <div className="student-info">รหัสนักเรียน: {student.student_code}</div>
                <div className="student-badge">🏫 {classroom?.name || 'ไม่ระบุห้อง'}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>การเข้าเรียน</div>
                <div style={{ fontFamily: 'Prompt', fontSize: 32, fontWeight: 700, color: getAttendancePercent() >= 80 ? '#16a34a' : '#dc2626' }}>
                  {getAttendancePercent()}%
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="summary-grid">
              {[
                { icon: '📝', num: assignments.length, label: 'รายการงาน' },
                { icon: '⭐', num: `${getTotalScore()}/${getMaxScore()}`, label: 'คะแนนรวม' },
                { icon: '✅', num: getAttendanceCount('มา'), label: 'เข้าเรียน' },
                { icon: '❌', num: getAttendanceCount('ขาด'), label: 'ขาดเรียน' },
              ].map((s, i) => (
                <div key={i} className="summary-card">
                  <div className="summary-icon">{s.icon}</div>
                  <div className="summary-num">{s.num}</div>
                  <div className="summary-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button className={`tab ${tab === 'scores' ? 'active' : ''}`} onClick={() => setTab('scores')}>📝 คะแนน</button>
              <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>✅ การเข้าเรียน</button>
            </div>

            {/* Scores Tab */}
            {tab === 'scores' && (
              assignments.length === 0 ? (
                <div className="empty"><div className="empty-icon">📭</div><div>ยังไม่มีข้อมูลคะแนน</div></div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>รายการงาน</th>
                        <th>คะแนนเต็ม</th>
                        <th>คะแนนที่ได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, i) => {
                        const score = scores.find(s => s.assignment_id === a.id)
                        const pct = score ? (score.score / a.max_score) * 100 : 0
                        return (
                          <tr key={a.id}>
                            <td>{i + 1}</td>
                            <td style={{ fontWeight: 500 }}>{a.title}</td>
                            <td>{a.max_score}</td>
                            <td>
                              <div className="score-bar-wrap">
                                <div className="score-bar-bg">
                                  <div className="score-bar-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="score-val">
                                  {score ? score.score : '-'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      <tr style={{ background: '#f8f9ff' }}>
                        <td colSpan={2} style={{ fontWeight: 700, color: '#1e1b4b' }}>รวม</td>
                        <td style={{ fontWeight: 700 }}>{getMaxScore()}</td>
                        <td style={{ fontFamily: 'Prompt', fontWeight: 700, color: '#6366f1', fontSize: 16 }}>{getTotalScore()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Attendance Tab */}
            {tab === 'attendance' && (
              <>
                <div className="att-summary">
                  {[
                    { label: 'มา', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                    { label: 'สาย', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
                    { label: 'ลา', color: '#6366f1', bg: '#eef2ff', border: '#a5b4fc' },
                    { label: 'ขาด', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
                  ].map(s => (
                    <div key={s.label} className="att-card" style={{ background: s.bg, borderColor: s.border }}>
                      <div className="att-num" style={{ color: s.color }}>{getAttendanceCount(s.label)}</div>
                      <div className="att-label" style={{ color: s.color }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {attendance.length === 0 ? (
                  <div className="empty"><div className="empty-icon">📭</div><div>ยังไม่มีข้อมูลการเข้าเรียน</div></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>วันที่</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((a, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{formatDate(a.date)}</td>
                            <td>
                              <span className="status-badge" style={{ background: statusConfig[a.status]?.bg, color: statusConfig[a.status]?.color }}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}