'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface CalendarEvent { id: string; title: string; date: string; description: string }

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState({ title: '', date: '', description: '' })
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data } = await supabase.from('calendar_events').select('*').order('date')
    setEvents(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.title || !form.date) return
    if (editItem) {
      await supabase.from('calendar_events').update(form).eq('id', editItem.id)
    } else {
      await supabase.from('calendar_events').insert(form)
    }
    setShowModal(false)
    setForm({ title: '', date: '', description: '' })
    setEditItem(null)
    fetchEvents()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบกิจกรรมนี้?')) return
    await supabase.from('calendar_events').delete().eq('id', id)
    fetchEvents()
  }

  const openEdit = (e: CalendarEvent) => {
    setEditItem(e)
    setForm({ title: e.title, date: e.date, description: e.description })
    setShowModal(true)
  }

  // Calendar logic
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
  const dayNames = ['อา','จ','อ','พ','พฤ','ศ','ส']

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).slice(0, 5)

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#6366f1' }}>กำลังโหลด...</div>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; background: #f8f9ff; }
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

        .calendar-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }

        .calendar-card {
          background: #fff; border-radius: 20px; padding: 24px;
          border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .cal-title { font-family: 'Prompt', sans-serif; font-size: 20px; font-weight: 700; color: #1e1b4b; }
        .cal-nav { display: flex; gap: 8px; }
        .cal-nav-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1.5px solid #e5e7eb;
          background: #fff; cursor: pointer; font-size: 16px; display: flex;
          align-items: center; justify-content: center; transition: all 0.2s; color: #6b7280;
        }
        .cal-nav-btn:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }

        .cal-days-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px; }
        .cal-day-name { text-align: center; font-size: 12px; font-weight: 600; color: #9ca3af; padding: 4px; }

        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .cal-day {
          min-height: 80px; border-radius: 12px; padding: 8px;
          border: 1.5px solid transparent; cursor: pointer; transition: all 0.2s;
          background: #fafafa; position: relative;
        }
        .cal-day:hover { border-color: #a5b4fc; background: #f0f2ff; }
        .cal-day.today { border-color: #6366f1; background: #eef2ff; }
        .cal-day.empty { background: transparent; border-color: transparent; cursor: default; }
        .cal-day-num {
          font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px;
          width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .cal-day.today .cal-day-num { background: #6366f1; color: #fff; }
        .cal-event-dot {
          font-size: 11px; background: #eef2ff; color: #6366f1;
          border-radius: 4px; padding: 1px 6px; margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-weight: 500;
        }

        .upcoming-card {
          background: #fff; border-radius: 20px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .upcoming-title { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 700; color: #1e1b4b; margin-bottom: 16px; }
        .event-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .event-item:last-child { border-bottom: none; }
        .event-date-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 100px; margin-bottom: 6px;
        }
        .event-title { font-size: 14px; font-weight: 600; color: #1e1b4b; margin-bottom: 2px; }
        .event-desc { font-size: 12px; color: #9ca3af; }
        .event-actions { display: flex; gap: 6px; margin-top: 8px; }
        .action-btn {
          padding: 4px 10px; border-radius: 7px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s;
        }
        .action-edit { background: #eef2ff; color: #6366f1; }
        .action-edit:hover { background: #e0e7ff; }
        .action-delete { background: #fef2f2; color: #ef4444; }
        .action-delete:hover { background: #fee2e2; }

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
        textarea.form-input { resize: vertical; min-height: 80px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end; }
        .btn-cancel { background: #f3f4f6; color: #6b7280; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; }
        .btn-cancel:hover { background: #e5e7eb; }
      `}</style>

      <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">📅 ปฏิทินการเรียน</div>
              <div className="page-sub">จัดการกำหนดการและกิจกรรมต่างๆ</div>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ title: '', date: '', description: '' }); setShowModal(true) }}>
              + เพิ่มกิจกรรม
            </button>
          </div>

          <div className="calendar-layout">
            {/* Calendar */}
            <div className="calendar-card">
              <div className="cal-header">
                <div className="cal-title">{monthNames[month]} {year + 543}</div>
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
                  <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date())}>วันนี้</button>
                  <button className="cal-nav-btn" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
                </div>
              </div>
              <div className="cal-days-header">
                {dayNames.map(d => <div key={d} className="cal-day-name">{d}</div>)}
              </div>
              <div className="cal-grid">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="cal-day empty" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = getEventsForDay(day)
                  return (
                    <div key={day} className={`cal-day ${isToday(day) ? 'today' : ''}`}
                      onClick={() => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        setForm({ title: '', date: dateStr, description: '' })
                        setEditItem(null)
                        setShowModal(true)
                      }}>
                      <div className="cal-day-num">{day}</div>
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className="cal-event-dot">📌 {e.title}</div>
                      ))}
                      {dayEvents.length > 2 && <div className="cal-event-dot">+{dayEvents.length - 2} เพิ่มเติม</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upcoming */}
            <div className="upcoming-card">
              <div className="upcoming-title">📌 กิจกรรมที่จะมาถึง</div>
              {upcomingEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                  ไม่มีกิจกรรมที่จะมาถึง
                </div>
              ) : (
                upcomingEvents.map(e => (
                  <div key={e.id} className="event-item">
                    <div className="event-date-badge">📅 {formatDate(e.date)}</div>
                    <div className="event-title">{e.title}</div>
                    {e.description && <div className="event-desc">{e.description}</div>}
                    <div className="event-actions">
                      <button className="action-btn action-edit" onClick={() => openEdit(e)}>✏️ แก้ไข</button>
                      <button className="action-btn action-delete" onClick={() => handleDelete(e.id)}>🗑️ ลบ</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editItem ? '✏️ แก้ไขกิจกรรม' : '📅 เพิ่มกิจกรรม'}</div>
            <div className="form-group">
              <label className="form-label">ชื่อกิจกรรม</label>
              <input className="form-input" placeholder="เช่น สอบกลางภาค, กิจกรรมวันวิทย์" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">วันที่</label>
              <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">รายละเอียด</label>
              <textarea className="form-input" placeholder="รายละเอียดเพิ่มเติม..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSave}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}