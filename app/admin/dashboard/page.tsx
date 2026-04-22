'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Announcement {
  id: string
  title: string
  content: string
  created_at: string
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    classrooms: 0,
    students: 0,
    subjects: 0,
    tasks: 0
  })
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [classroomsRes, studentsRes, subjectsRes, announcementsRes] = await Promise.all([
        supabase.from('classrooms').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3)
      ])

      setStats({
        classrooms: classroomsRes.count || 0,
        students: studentsRes.count || 0,
        subjects: subjectsRes.count || 0,
        tasks: 0 // TODO: Add tasks table if needed
      })

      setRecentAnnouncements(announcementsRes.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2ff', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#6366f1', fontSize: 18 }}>กำลังโหลด...</p>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; background: #f8f9ff; }

        .layout { display: flex; min-height: 100vh; }

        .main { padding: 32px; flex: 1; }

        .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .page-title { font-family: 'Prompt', sans-serif; font-size: 24px; font-weight: 700; color: #1e1b4b; }
        .page-sub { color: #9ca3af; font-size: 13px; margin-top: 2px; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }

        .stat-card {
          background: #fff; border-radius: 16px;
          padding: 20px; border: 1px solid #f3f4f6;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .stat-num { font-family: 'Prompt', sans-serif; font-size: 28px; font-weight: 700; color: #1e1b4b; }
        .stat-label { font-size: 13px; color: #9ca3af; margin-top: 2px; }

        .cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .card {
          background: #fff; border-radius: 16px;
          padding: 20px; border: 1px solid #f3f4f6;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .card-title { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 600; color: #1e1b4b; margin-bottom: 16px; }

        .quick-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 12px; border-radius: 10px;
          background: #f8f9ff; margin-bottom: 8px;
          cursor: pointer; transition: all 0.2s;
          border: 1px solid #e5e7eb;
          color: #374151; font-size: 14px; text-decoration: none;
        }
        .quick-btn:hover { background: #eef2ff; border-color: #6366f1; color: #6366f1; }
        .quick-icon { font-size: 20px; }

        .announce-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .announce-item:last-child { border-bottom: none; }
        .announce-title { font-size: 14px; font-weight: 500; color: #374151; }
        .announce-date { font-size: 12px; color: #9ca3af; margin-top: 2px; }
      `}</style>

      <>
        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">Dashboard</div>
              <div className="page-sub">ภาพรวมระบบจัดการครู</div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            {[
              { icon: '🏫', label: 'ห้องเรียน', num: stats.classrooms.toString(), bg: '#eef2ff' },
              { icon: '👨‍🎓', label: 'นักเรียนทั้งหมด', num: stats.students.toString(), bg: '#f0fdf4' },
              { icon: '📚', label: 'วิชาที่สอน', num: stats.subjects.toString(), bg: '#fff7ed' },
              { icon: '📝', label: 'รายการงาน', num: stats.tasks.toString(), bg: '#fdf4ff' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                </div>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cards */}
          <div className="cards-row">
            <div className="card">
              <div className="card-title">⚡ เมนูด่วน</div>
              {[
                { icon: '✅', label: 'เช็คชื่อวันนี้' },
                { icon: '📝', label: 'กรอกคะแนน' },
                { icon: '📢', label: 'โพสประกาศ' },
                { icon: '📁', label: 'อัปโหลดเอกสาร' },
              ].map((b, i) => (
                <div key={i} className="quick-btn">
                  <span className="quick-icon">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">📢 ประกาศล่าสุด</div>
              {recentAnnouncements.length > 0 ? (
                recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="announce-item">
                    <div className="announce-title">{announcement.title}</div>
                    <div className="announce-date">
                      {new Date(announcement.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="announce-item">
                  <div className="announce-title">ยังไม่มีประกาศ</div>
                  <div className="announce-date">เริ่มโพสประกาศได้เลย</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    </>
  )
}