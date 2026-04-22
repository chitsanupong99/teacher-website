'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface GalleryItem { id: string; title: string; image_url: string; created_at: string }
interface Portfolio { id: string; title: string; description: string; url: string; subject_id: string; created_at: string }
interface Subject { id: string; name: string }

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'gallery' | 'portfolio'>('gallery')
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [galleryForm, setGalleryForm] = useState({ title: '' })
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', url: '', subject_id: '' })
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [editPortfolio, setEditPortfolio] = useState<Portfolio | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: gal } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
    const { data: por } = await supabase.from('portfolios').select('*').order('created_at', { ascending: false })
    const { data: sub } = await supabase.from('subjects').select('*').order('name')
    setGallery(gal || [])
    setPortfolios(por || [])
    setSubjects(sub || [])
    setLoading(false)
  }

  const handleUploadGallery = async () => {
    if (!file || !galleryForm.title) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('gallery').upload(fileName, file)
    if (error) { setUploading(false); alert('เกิดข้อผิดพลาด: ' + error.message); return }
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName)
    await supabase.from('gallery').insert({ title: galleryForm.title, image_url: urlData.publicUrl })
    setUploading(false)
    setShowModal(false)
    setFile(null)
    setGalleryForm({ title: '' })
    fetchData()
  }

  const handleDeleteGallery = async (item: GalleryItem) => {
    if (!confirm('ยืนยันการลบรูปนี้?')) return
    const fileName = item.image_url.split('/').pop()
    await supabase.storage.from('gallery').remove([fileName!])
    await supabase.from('gallery').delete().eq('id', item.id)
    fetchData()
  }

  const handleSavePortfolio = async () => {
    if (!portfolioForm.title) return
    if (editPortfolio) {
      await supabase.from('portfolios').update(portfolioForm).eq('id', editPortfolio.id)
    } else {
      await supabase.from('portfolios').insert(portfolioForm)
    }
    setShowPortfolioModal(false)
    setPortfolioForm({ title: '', description: '', url: '', subject_id: '' })
    setEditPortfolio(null)
    fetchData()
  }

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm('ยืนยันการลบผลงานนี้?')) return
    await supabase.from('portfolios').delete().eq('id', id)
    fetchData()
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })

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
        .tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 12px; padding: 4px; margin-bottom: 24px; width: fit-content; }
        .tab {
          padding: 8px 20px; border-radius: 10px; font-size: 14px; font-weight: 500;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif;
          transition: all 0.2s; color: #6b7280; background: none;
        }
        .tab.active { background: #fff; color: #6366f1; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
        .gallery-card {
          background: #fff; border-radius: 16px; overflow: hidden;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .gallery-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.1); transform: translateY(-2px); }
        .gallery-img { width: 100%; height: 160px; object-fit: cover; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 40px; }
        .gallery-img img { width: 100%; height: 160px; object-fit: cover; }
        .gallery-info { padding: 12px; }
        .gallery-title { font-size: 14px; font-weight: 600; color: #1e1b4b; margin-bottom: 4px; }
        .gallery-date { font-size: 12px; color: #9ca3af; }
        .gallery-actions { display: flex; gap: 6px; margin-top: 8px; }
        .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .portfolio-card {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }
        .portfolio-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.1); border-color: #e0e7ff; }
        .portfolio-title { font-family: 'Prompt', sans-serif; font-size: 15px; font-weight: 600; color: #1e1b4b; margin-bottom: 6px; }
        .portfolio-desc { font-size: 13px; color: #9ca3af; margin-bottom: 10px; line-height: 1.5; }
        .portfolio-subject { font-size: 12px; color: #6366f1; background: #eef2ff; padding: 3px 10px; border-radius: 100px; display: inline-block; margin-bottom: 10px; }
        .portfolio-link { font-size: 13px; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
        .portfolio-link:hover { text-decoration: underline; }
        .action-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
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
        .file-upload {
          border: 2px dashed #e5e7eb; border-radius: 12px; padding: 24px;
          text-align: center; cursor: pointer; transition: all 0.2s; background: #fafafa;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .file-upload:hover { border-color: #6366f1; background: #eef2ff; }
        .file-upload input { display: none; }
        .modal-actions { display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end; }
        .btn-cancel { background: #f3f4f6; color: #6b7280; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; }
        .btn-cancel:hover { background: #e5e7eb; }
      `}</style>

      <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">🖼️ ผลงาน & Gallery</div>
              <div className="page-sub">จัดเก็บรูปกิจกรรมและผลงานครู</div>
            </div>
            <button className="btn btn-primary" onClick={() => tab === 'gallery' ? setShowModal(true) : setShowPortfolioModal(true)}>
              {tab === 'gallery' ? '+ อัปโหลดรูป' : '+ เพิ่มผลงาน'}
            </button>
          </div>

          <div className="tabs">
            <button className={`tab ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>🖼️ Gallery กิจกรรม</button>
            <button className={`tab ${tab === 'portfolio' ? 'active' : ''}`} onClick={() => setTab('portfolio')}>🏆 ผลงานครู</button>
          </div>

          {tab === 'gallery' && (
            gallery.length === 0 ? (
              <div className="empty">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีรูปภาพ</div>
                <div style={{ fontSize: 14 }}>กดปุ่ม "อัปโหลดรูป" เพื่อเริ่มต้น</div>
              </div>
            ) : (
              <div className="gallery-grid">
                {gallery.map(item => (
                  <div key={item.id} className="gallery-card">
                    <div className="gallery-img">
                      <img src={item.image_url} alt={item.title} />
                    </div>
                    <div className="gallery-info">
                      <div className="gallery-title">{item.title}</div>
                      <div className="gallery-date">{formatDate(item.created_at)}</div>
                      <div className="gallery-actions">
                        <button className="action-btn action-delete" onClick={() => handleDeleteGallery(item)}>🗑️ ลบ</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'portfolio' && (
            portfolios.length === 0 ? (
              <div className="empty">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 8 }}>ยังไม่มีผลงาน</div>
                <div style={{ fontSize: 14 }}>กดปุ่ม "เพิ่มผลงาน" เพื่อเริ่มต้น</div>
              </div>
            ) : (
              <div className="portfolio-grid">
                {portfolios.map(p => (
                  <div key={p.id} className="portfolio-card">
                    <div className="portfolio-title">{p.title}</div>
                    {p.description && <div className="portfolio-desc">{p.description}</div>}
                    {p.subject_id && <div className="portfolio-subject">{subjects.find(s => s.id === p.subject_id)?.name}</div>}
                    {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="portfolio-link">🔗 ดูผลงาน</a>}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn action-edit" onClick={() => { setEditPortfolio(p); setPortfolioForm({ title: p.title, description: p.description, url: p.url, subject_id: p.subject_id }); setShowPortfolioModal(true) }}>✏️ แก้ไข</button>
                      <button className="action-btn action-delete" onClick={() => handleDeletePortfolio(p.id)}>🗑️ ลบ</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      {/* Modal อัปโหลดรูป */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🖼️ อัปโหลดรูปภาพ</div>
            <div className="form-group">
              <label className="form-label">ชื่อรูป/กิจกรรม</label>
              <input className="form-input" placeholder="เช่น กิจกรรมวันวิทยาศาสตร์" value={galleryForm.title} onChange={e => setGalleryForm({ title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">รูปภาพ</label>
              <label className="file-upload">
                <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={e => setFile(e.target.files?.[0] || null)} />
                <div style={{ fontSize: 32 }}>🖼️</div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>คลิกเพื่อเลือกรูปภาพ</div>
                <div style={{ fontSize: 12, color: '#d1d5db' }}>JPG, PNG, GIF, WEBP</div>
                {file && <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 500 }}>✅ {file.name}</div>}
              </label>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleUploadGallery} disabled={uploading || !file || !galleryForm.title}>
                {uploading ? 'กำลังอัปโหลด...' : '📤 อัปโหลด'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มผลงาน */}
      {showPortfolioModal && (
        <div className="modal-overlay" onClick={() => setShowPortfolioModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editPortfolio ? '✏️ แก้ไขผลงาน' : '🏆 เพิ่มผลงาน'}</div>
            <div className="form-group">
              <label className="form-label">ชื่อผลงาน</label>
              <input className="form-input" placeholder="เช่น รางวัลครูดีเด่น 2567" value={portfolioForm.title} onChange={e => setPortfolioForm({ ...portfolioForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">คำอธิบาย</label>
              <textarea className="form-input" placeholder="รายละเอียดผลงาน..." value={portfolioForm.description} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">ลิงก์ผลงาน</label>
              <input className="form-input" placeholder="https://..." value={portfolioForm.url} onChange={e => setPortfolioForm({ ...portfolioForm, url: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">วิชา</label>
              <select className="form-input" value={portfolioForm.subject_id} onChange={e => setPortfolioForm({ ...portfolioForm, subject_id: e.target.value })}>
                <option value="">-- เลือกวิชา --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => { setShowPortfolioModal(false); setEditPortfolio(null) }}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSavePortfolio}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}