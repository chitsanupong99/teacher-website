'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Content { id: string; title: string; description: string; type: string; url: string; subject_id: string }
interface Subject { id: string; name: string }

const contentTypes = ['ใบงาน', 'เนื้อหา', 'แบบฝึกหัด', 'ลิงก์อบรม']
const typeColors: Record<string, { bg: string; color: string }> = {
  'ใบงาน': { bg: '#eef2ff', color: '#6366f1' },
  'เนื้อหา': { bg: '#f0fdf4', color: '#16a34a' },
  'แบบฝึกหัด': { bg: '#fff7ed', color: '#d97706' },
  'ลิงก์อบรม': { bg: '#fdf4ff', color: '#9333ea' },
}

export default function ContentsPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Content | null>(null)
  const [filterType, setFilterType] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [form, setForm] = useState({ title: '', description: '', type: 'ใบงาน', url: '', subject_id: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: con } = await supabase.from('contents').select('*').order('created_at', { ascending: false })
    const { data: sub } = await supabase.from('subjects').select('*').order('name')
    setContents(con || [])
    setSubjects(sub || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.title) return
    if (editItem) {
      await supabase.from('contents').update(form).eq('id', editItem.id)
    } else {
      await supabase.from('contents').insert(form)
    }
    setShowModal(false)
    setForm({ title: '', description: '', type: 'ใบงาน', url: '', subject_id: '' })
    setEditItem(null)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบรายการนี้?')) return
    await supabase.from('contents').delete().eq('id', id)
    fetchData()
  }

  const openEdit = (c: Content) => {
    setEditItem(c)
    setForm({ title: c.title, description: c.description, type: c.type, url: c.url, subject_id: c.subject_id })
    setShowModal(true)
  }

  const filtered = contents.filter(c => {
    if (filterType && c.type !== filterType) return false
    if (filterSubject && c.subject_id !== filterSubject) return false
    return true
  })

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
        .filter-bar {
          background: #fff; border-radius: 16px; padding: 16px 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
        }
        .filter-label { font-size: 13px; color: #9ca3af; font-weight: 500; }
        .filter-select {
          border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 8px 12px;
          font-size: 14px; font-family: 'Sarabun', sans-serif; color: #111827;
          background: #fafafa; outline: none; transition: all 0.2s;
        }
        .filter-select:focus { border-color: #6366f1; }
        .type-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .type-tab {
          padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500;
          cursor: pointer; border: 1.5px solid #e5e7eb; background: #fff; color: #6b7280;
          transition: all 0.2s; font-family: 'Sarabun', sans-serif;
        }
        .type-tab.active { border-color: #6366f1; background: #eef2ff; color: #6366f1; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .content-card {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .content-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.1); border-color: #e0e7ff; }
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .type-badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .card-title { font-family: 'Prompt', sans-serif; font-size: 15px; font-weight: 600; color: #1e1b4b; margin-bottom: 6px; }
        .card-desc { font-size: 13px; color: #9ca3af; margin-bottom: 12px; line-height: 1.5; }
        .card-subject { font-size: 12px; color: #6366f1; background: #eef2ff; padding: 3px 10px; border-radius: 100px; display: inline-block; margin-bottom: 12px; }
        .card-link { font-size: 13px; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
        .card-link:hover { text-decoration: underline; }
        .card-actions { display: flex; gap: 6px; }
        .action-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s;
        }
        .action-edit { background: #eef2ff; color: #6366f1; }
        .action-edit:hover { background: #e0e7ff; }
        .action-delete { background: #fef2f2; color: #ef4444; }
        .action-delete:hover { background: #fee2e2; }
        .empty { text-align: center; padding: 60px; color: #9ca3af; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px);
        }
        .modal { background: #fff; border-radius: 20px; padding: 32px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
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

      <>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">📚 เนื้อหา/ใบงาน</div>
              <div className="page-sub">จัดการเนื้อหา ใบงาน แบบฝึกหัด และลิงก์อบรม</div>
            </div>
            <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ title: '', description: '', type: 'ใบงาน', url: '', subject_id: '' }); setShowModal(true) }}>
              + เพิ่มเนื้อหา
            </button>
          </div>

          <div className="filter-bar">
            <span className="filter-label">กรองตามประเภท:</span>
            <div className="type-tabs">
              <button className={`type-tab ${filterType === '' ? 'active' : ''}`} onClick={() => setFilterType('')}>ทั้งหมด</button>
              {contentTypes.map(t => (
                <button key={t} className={`type-tab ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
              ))}
            </div>
            <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">ทุกวิชา</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีเนื้อหา</div>
              <div style={{ fontSize: 14 }}>กดปุ่ม "เพิ่มเนื้อหา" เพื่อเริ่มต้น</div>
            </div>
          ) : (
            <div className="grid">
              {filtered.map(c => (
                <div key={c.id} className="content-card">
                  <div className="card-top">
                    <span className="type-badge" style={{ background: typeColors[c.type]?.bg, color: typeColors[c.type]?.color }}>{c.type}</span>
                  </div>
                  <div className="card-title">{c.title}</div>
                  {c.description && <div className="card-desc">{c.description}</div>}
                  {c.subject_id && <div className="card-subject">{subjects.find(s => s.id === c.subject_id)?.name}</div>}
                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="card-link">🔗 เปิดลิงก์</a>}
                  <div className="card-actions">
                    <button className="action-btn action-edit" onClick={() => openEdit(c)}>✏️ แก้ไข</button>
                    <button className="action-btn action-delete" onClick={() => handleDelete(c.id)}>🗑️ ลบ</button>
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
            <div className="modal-title">{editItem ? '✏️ แก้ไขเนื้อหา' : '📚 เพิ่มเนื้อหา'}</div>
            <div className="form-group">
              <label className="form-label">ประเภท</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {contentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ชื่อเรื่อง</label>
              <input className="form-input" placeholder="เช่น ใบงานที่ 1 เรื่องการบวก" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">คำอธิบาย</label>
              <textarea className="form-input" placeholder="รายละเอียดเพิ่มเติม..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">ลิงก์ (URL)</label>
              <input className="form-input" placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">วิชา</label>
              <select className="form-input" value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
                <option value="">-- เลือกวิชา --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
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