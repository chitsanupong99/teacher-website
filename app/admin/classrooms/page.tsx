'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Subject {
  id: string
  name: string
}

interface Classroom {
  id: string
  name: string
  subject_id?: string
  subject_ids?: string[]
}

export default function Classrooms() {
  const router = useRouter()
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [editItem, setEditItem] = useState<Classroom | null>(null)
  const [form, setForm] = useState({ name: '', subject_id: '', subject_ids: [] as string[] })
  const [subjectForm, setSubjectForm] = useState({ name: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: cls } = await supabase.from('classrooms').select('*').order('created_at')
      const { data: sub } = await supabase.from('subjects').select('*').order('name')
      setClassrooms(cls || [])
      setSubjects(sub || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
  if (!form.name) return
  setError('')

  try {
    const payload = {
      name: form.name,
      subject_id: form.subject_id || null
    }

    if (editItem) {
      const { error } = await supabase
        .from('classrooms')
        .update(payload)
        .eq('id', editItem.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('classrooms')
        .insert(payload)
      if (error) throw error
    }

    setShowModal(false)
    setForm({ name: '', subject_id: '', subject_ids: [] })
    setEditItem(null)
    fetchData()
  } catch (err: any) {
    setError(err?.message || 'ไม่สามารถบันทึกได้')
  }
}
  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบห้องเรียนนี้?')) return
    setError('')

    try {
      const response = await fetch(`/api/classrooms?id=${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error(await response.text())
      fetchData()
    } catch (err: any) {
      const message = err?.message || JSON.stringify(err)
      console.error('Error deleting classroom:', message)
      setError(message || 'ไม่สามารถลบห้องเรียนได้ โปรดตรวจสอบสิทธิ์และ schema ของฐานข้อมูล')
    }
  }

  const handleSaveSubject = async () => {
    if (!subjectForm.name) return
    await supabase.from('subjects').insert(subjectForm)
    setShowSubjectModal(false)
    setSubjectForm({ name: '' })
    fetchData()
  }

  const openEdit = (cls: Classroom) => {
    setEditItem(cls)
    setForm({
      name: cls.name,
      subject_id: cls.subject_id || '',
      subject_ids: cls.subject_ids || (cls.subject_id ? [cls.subject_id] : []),
    })
    setShowModal(true)
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
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99,102,241,0.4); }
        .btn-outline { background: #fff; color: #6366f1; border: 1.5px solid #6366f1; }
        .btn-outline:hover { background: #eef2ff; }
        .btn-group { display: flex; gap: 8px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .cls-card {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .cls-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.1); border-color: #e0e7ff; }
        .cls-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .cls-icon { width: 44px; height: 44px; background: #eef2ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .cls-name { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 600; color: #1e1b4b; margin-bottom: 4px; }
        .cls-subject { font-size: 13px; color: #9ca3af; }
        .cls-actions { display: flex; gap: 6px; margin-top: 16px; }
        .action-btn {
          padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s;
        }
        .action-edit { background: #eef2ff; color: #6366f1; }
        .action-edit:hover { background: #e0e7ff; }
        .action-delete { background: #fef2f2; color: #ef4444; }
        .action-delete:hover { background: #fee2e2; }
        .action-students { background: #f0fdf4; color: #16a34a; }
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 12px;
          color: #b91c1c;
          padding: 12px 16px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .action-students:hover { background: #dcfce7; }
        .subject-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
        .chip {
          padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 500;
          background: #eef2ff; color: #6366f1; border: 1px solid #e0e7ff;
        }
        .empty { text-align: center; padding: 60px; color: #9ca3af; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          backdrop-filter: blur(4px);
        }
        .modal {
          background: #fff; border-radius: 20px; padding: 32px;
          width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
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
              <div className="page-title">🏫 จัดการชั้นเรียน</div>
              <div className="page-sub">เพิ่ม ลบ แก้ไข ห้องเรียนและนักเรียน</div>
            </div>
            <div className="btn-group">
              <button className="btn btn-outline" onClick={() => setShowSubjectModal(true)}>+ เพิ่มวิชา</button>
              <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ name: '', subject_id: '', subject_ids: [] }); setShowModal(true) }}>+ เพิ่มห้องเรียน</button>
            </div>
          </div>
          {error && (
            <div className="error-banner">{error}</div>
          )}          {subjects.length > 0 && (
            <div className="subject-chips">
              <span style={{ fontSize: 13, color: '#9ca3af', alignSelf: 'center' }}>วิชาทั้งหมด:</span>
              {subjects.map(s => <span key={s.id} className="chip">{s.name}</span>)}
            </div>
          )}

          {classrooms.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🏫</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีห้องเรียน</div>
              <div style={{ fontSize: 14 }}>กดปุ่ม "เพิ่มห้องเรียน" เพื่อเริ่มต้น</div>
            </div>
          ) : (
            <div className="grid">
              {classrooms.map(cls => {
                const assignedSubjectIds = cls.subject_ids?.length ? cls.subject_ids : (cls.subject_id ? [cls.subject_id] : [])
                const assignedSubjects = assignedSubjectIds.map(id => subjects.find(s => s.id === id)).filter(Boolean)
                return (
                  <div key={cls.id} className="cls-card">
                    <div className="cls-header">
                      <div className="cls-icon">🏫</div>
                    </div>
                    <div className="cls-name">{cls.name}</div>
                    <div className="cls-subject">
                      {assignedSubjects.length > 0
                        ? assignedSubjects.map(s => s?.name).join(', ')
                        : 'ยังไม่ได้กำหนดวิชา'}
                    </div>
                    <div className="cls-actions">
                      <button className="action-btn action-students" onClick={() => router.push(`/admin/classrooms/${cls.id}`)}>👨‍🎓 นักเรียน</button>
                      <button className="action-btn action-edit" onClick={() => openEdit(cls)}>✏️ แก้ไข</button>
                      <button className="action-btn action-delete" onClick={() => handleDelete(cls.id)}>🗑️ ลบ</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </>

      {/* Modal เพิ่ม/แก้ไขห้องเรียน */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editItem ? '✏️ แก้ไขห้องเรียน' : '🏫 เพิ่มห้องเรียน'}</div>
            <div className="form-group">
              <label className="form-label">ชื่อห้องเรียน</label>
              <input className="form-input" placeholder="เช่น ม.1/1, ปวช.1/2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">วิชา</label>
             <select
  className="form-input"
  value={form.subject_id}
  onChange={e => setForm({ ...form, subject_id: e.target.value })}
>
  <option value="">-- เลือกวิชา --</option>
              </select>
              <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>กด Ctrl/Cmd เพื่อเลือกหลายวิชา</div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSave}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มวิชา */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📚 เพิ่มวิชา</div>
            <div className="form-group">
              <label className="form-label">ชื่อวิชา</label>
              <input className="form-input" placeholder="เช่น คณิตศาสตร์, วิทยาศาสตร์" value={subjectForm.name} onChange={e => setSubjectForm({ name: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowSubjectModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSaveSubject}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}