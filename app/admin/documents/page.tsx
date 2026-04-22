'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Document { id: string; title: string; url: string; created_at: string }

const getFileIcon = (url: string) => {
  if (url.includes('.pdf')) return '📄'
  if (url.includes('.doc') || url.includes('.docx')) return '📝'
  if (url.includes('.xls') || url.includes('.xlsx')) return '📊'
  if (url.includes('.ppt') || url.includes('.pptx')) return '📑'
  if (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg')) return '🖼️'
  return '📎'
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [progress, setProgress] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
    setDocuments(data || [])
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!file || !title) return
    setUploading(true)
    setProgress('กำลังอัปโหลด...')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      setProgress('เกิดข้อผิดพลาด: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

    await supabase.from('documents').insert({
      title,
      url: urlData.publicUrl
    })

    setUploading(false)
    setProgress('')
    setTitle('')
    setFile(null)
    setShowModal(false)
    fetchDocuments()
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm('ยืนยันการลบเอกสารนี้?')) return
    const fileName = doc.url.split('/').pop()
    await supabase.storage.from('documents').remove([fileName!])
    await supabase.from('documents').delete().eq('id', doc.id)
    fetchDocuments()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  }

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
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .doc-card {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s; display: flex; flex-direction: column; gap: 12px;
        }
        .doc-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.1); border-color: #e0e7ff; }
        .doc-icon { font-size: 40px; }
        .doc-title { font-family: 'Prompt', sans-serif; font-size: 15px; font-weight: 600; color: #1e1b4b; }
        .doc-date { font-size: 12px; color: #9ca3af; }
        .doc-actions { display: flex; gap: 6px; margin-top: auto; }
        .action-btn {
          padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
        }
        .action-view { background: #eef2ff; color: #6366f1; }
        .action-view:hover { background: #e0e7ff; }
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
        .file-upload {
          border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px;
          cursor: pointer; transition: all 0.2s; background: #fafafa;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 120px; gap: 8px;
        }
        .file-upload:hover { border-color: #6366f1; background: #eef2ff; }
        .file-upload input { display: none; }
        .file-name { font-size: 13px; color: #6366f1; margin-top: 8px; font-weight: 500; }
        .progress { font-size: 13px; color: #6366f1; margin-top: 8px; text-align: center; }
        .modal-actions { display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end; }
        .btn-cancel { background: #f3f4f6; color: #6b7280; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; }
        .btn-cancel:hover { background: #e5e7eb; }
      `}</style>

      <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">📁 ระบบเอกสาร</div>
              <div className="page-sub">อัปโหลดและจัดเก็บเอกสารต่างๆ</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ อัปโหลดเอกสาร</button>
          </div>

          {documents.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีเอกสาร</div>
              <div style={{ fontSize: 14 }}>กดปุ่ม "อัปโหลดเอกสาร" เพื่อเริ่มต้น</div>
            </div>
          ) : (
            <div className="grid">
              {documents.map(doc => (
                <div key={doc.id} className="doc-card">
                  <div className="doc-icon">{getFileIcon(doc.url)}</div>
                  <div>
                    <div className="doc-title">{doc.title}</div>
                    <div className="doc-date">{formatDate(doc.created_at)}</div>
                  </div>
                  <div className="doc-actions">
                    <a href={doc.url} target="_blank" rel="noreferrer" className="action-btn action-view">👁️ เปิด</a>
                    <button className="action-btn action-delete" onClick={() => handleDelete(doc)}>🗑️ ลบ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📁 อัปโหลดเอกสาร</div>
            <div className="form-group">
              <label className="form-label">ชื่อเอกสาร</label>
              <input className="form-input" placeholder="เช่น แผนการสอนภาคเรียนที่ 1" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ไฟล์เอกสาร</label>
              <label className="file-upload">
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: 32 }}>📎</div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>คลิกเพื่อเลือกไฟล์</div>
                <div style={{ fontSize: 12, color: '#d1d5db' }}>PDF, Word, Excel, PowerPoint, รูปภาพ</div>
                {file && <div className="file-name">✅ {file.name}</div>}
              </label>
            </div>
            {progress && <div className="progress">{progress}</div>}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file || !title}>
                {uploading ? 'กำลังอัปโหลด...' : '📤 อัปโหลด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}