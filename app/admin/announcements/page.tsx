'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Announcement { id: string; title: string; content: string; created_at: string }

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Announcement | null>(null)
  const [form, setForm] = useState({ title: '', content: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.title) return
    if (editItem) {
      await supabase.from('announcements').update(form).eq('id', editItem.id)
    } else {
      await supabase.from('announcements').insert(form)
    }
    setShowModal(false)
    setForm({ title: '', content: '' })
    setEditItem(null)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบประกาศนี้?')) return
    await supabase.from('announcements').delete().eq('id', id)
    fetchData()
  }

  const openEdit = (a: Announcement) => {
    setEditItem(a)
    setForm({ title: a.title, content: a.content })
    setShowModal(true)
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

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
        .announce-list { display: flex; flex-direction: column; gap: 16px; }
        .announce-card {
          background: #fff; border-radius: 16px; padding: 24px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .announce-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.1); border-color: #e0e7ff; }
        .announce-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .announce-title { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 600; color: #1e1b4b; }
        .announce-date { font-size: 12px; color: #9ca3af; white-space: nowrap; margin-left: 16px; }
        .announce-content { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 16px; white-space: pre-wrap; }
        .announce-actions { display: flex; gap: 6px; }
        .action-btn {
          padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s;
        }
        .action-edit { background: #eef2ff; color: #6366f1; }
        .action-edit:hover { background: #e0e7ff; }
        .action-delete { background: #fef2f2; color: #ef4444; }
        .action-delete:hover { background: #fee2e2; }
        .new-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #fef3c7; color: #d97706; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 100px; margin-left: 8px;
        }
        .empty { text-align: center; padding: 60px; color: #9ca3af; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px);
        }
        .modal { background: #fff; border-radius: 20px; padding: 32px; width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .modal-title { font-family: 'Prompt', sans-serif; font-size: 20px; font-weight: 700; color: #1e1b4b; margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .form-input {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 11px 14px; font-size: 14px; font-family: 'Sarabun', sans-serif;
          color: #111827; background: #fafafa; outline: none; transition: all 0.2s;
        }
        .form-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
        textarea.form-input { resize: vertical; min-height: 120px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end; }
        .btn-cancel { background: #f3f4f6; color: #6b7280; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; }
        .btn-cancel:hover { background: #e5e7eb; }
      `}</style>

      <>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">📢 ระบบประกาศ</div>
              <div className="page-sub">โพสประกาศข่าวสารให้นักเรียนเห็น</div>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ title: '', content: '' }); setShowModal(true) }}>
              + โพสประกาศ
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีประกาศ</div>
              <div style={{ fontSize: 14 }}>กดปุ่ม "โพสประกาศ" เพื่อเริ่มต้น</div>
            </div>
          ) : (
            <div className="announce-list">
              {announcements.map((a, i) => (
                <div key={a.id} className="announce-card">
                  <div className="announce-header">
                    <div>
                      <span className="announce-title">{a.title}</span>
                      {i === 0 && <span className="new-badge">🔔 ล่าสุด</span>}
                    </div>
                    <span className="announce-date">{formatDate(a.created_at)}</span>
                  </div>
                  <div className="announce-content">{a.content}</div>
                  <div className="announce-actions">
                    <button className="action-btn action-edit" onClick={() => openEdit(a)}>✏️ แก้ไข</button>
                    <button className="action-btn action-delete" onClick={() => handleDelete(a.id)}>🗑️ ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editItem ? '✏️ แก้ไขประกาศ' : '📢 โพสประกาศใหม่'}</div>
            <div className="form-group">
              <label className="form-label">หัวข้อประกาศ</label>
              <input className="form-input" placeholder="เช่น แจ้งกำหนดสอบกลางภาค" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">เนื้อหาประกาศ</label>
              <textarea className="form-input" placeholder="รายละเอียดประกาศ..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSave}>โพส</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}