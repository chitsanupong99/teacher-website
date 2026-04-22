'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Settings {
  id: string
  site_name: string
  nav_color: string
  nav_text_color: string
  logo_url: string | null // เพิ่มมารองรับ URL รูปภาพ
  logo_emoji?: string // เก็บไว้กัน Error ตอนดึงข้อมูลเก่า
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false) // State สำหรับสถานะตอนกำลังอัปโหลด

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').single()
    setSettings(data)
    setLoading(false)
  }

  // ฟังก์ชันใหม่: สำหรับจัดการการอัปโหลดรูปภาพ
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }
      const file = event.target.files[0]
      setUploading(true)

      // 1. ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน (ใช้เวลาปัจจุบัน + นามสกุลไฟล์)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      // 2. อัปโหลดไฟล์ไปที่ถัง (Bucket) ชื่อ 'logo'
      const { error: uploadError } = await supabase.storage
        .from('logo')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // 3. ดึงลิงก์ URL สาธารณะของไฟล์ที่เพิ่งอัปโหลด
      const { data } = supabase.storage.from('logo').getPublicUrl(fileName)

      // 4. เอา URL ไปอัปเดตใน State ของ settings
      if (settings) {
        setSettings({ ...settings, logo_url: data.publicUrl })
      }
      
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    await supabase.from('site_settings').update({
      site_name: settings.site_name,
      nav_color: settings.nav_color,
      nav_text_color: settings.nav_text_color,
      logo_url: settings.logo_url // บันทึก URL ลงฐานข้อมูลด้วย
    }).eq('id', settings.id)
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
        .card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .card-title { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 600; color: #1e1b4b; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #eef2ff; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .form-input {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 11px 14px; font-size: 14px; font-family: 'Sarabun', sans-serif;
          color: #111827; background: #fafafa; outline: none; transition: all 0.2s;
        }
        .form-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
        .color-wrap { display: flex; align-items: center; gap: 12px; }
        .color-input { width: 48px; height: 40px; border: 1.5px solid #e5e7eb; border-radius: 10px; cursor: pointer; padding: 4px; background: #fafafa; }
        .color-text { flex: 1; }
        .preview-box {
          border-radius: 14px; overflow: hidden; border: 1px solid #f3f4f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-top: 8px;
        }
        .preview-navbar {
          padding: 0 24px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .preview-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; font-family: 'Prompt', sans-serif; }
        .preview-logo-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; overflow: hidden; }
        .preview-links { display: flex; gap: 16px; font-size: 13px; opacity: 0.7; }
        .preview-btn { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; }
        .preview-content { padding: 20px 24px; background: #f8f9ff; }
        .preview-content-text { font-size: 12px; color: #9ca3af; }
        .success-banner {
          background: #f0fdf4; border: 1px solid #86efac; color: #16a34a;
          border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
          font-size: 14px; font-weight: 500;
        }
        /* CSS สำหรับกล่องอัปโหลดรูป */
        .upload-box {
          border: 2px dashed #e5e7eb; border-radius: 10px; padding: 20px;
          text-align: center; cursor: pointer; transition: all 0.2s;
          position: relative; background: #fafafa;
        }
        .upload-box:hover { border-color: #6366f1; background: #eef2ff; }
        .upload-input {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0; cursor: pointer;
        }
      `}</style>

      <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">⚙️ ตั้งค่าเว็บไซต์</div>
              <div className="page-sub">ปรับแต่ง Navbar และหน้าตาเว็บไซต์</div>
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
            </button>
          </div>

          {saved && <div className="success-banner">✅ บันทึกการตั้งค่าเรียบร้อยแล้ว</div>}

          {settings && (
            <>
              {/* Preview */}
              <div className="card">
                <div className="card-title">👁️ ตัวอย่าง Navbar</div>
                <div className="preview-box">
                  <div className="preview-navbar" style={{ background: settings.nav_color, color: settings.nav_text_color }}>
                    <div className="preview-logo" style={{ color: settings.nav_text_color }}>
                      <div className="preview-logo-icon">
                        {settings.logo_url ? (
                          <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          '🎓'
                        )}
                      </div>
                      {settings.site_name}
                    </div>
                    <div className="preview-links" style={{ color: settings.nav_text_color }}>
                      <span>ประกาศ</span>
                      <span>เนื้อหา</span>
                      <span>Gallery</span>
                    </div>
                    <div className="preview-btn">ตรวจสอบผลการเรียน</div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-content-text">ตัวอย่างหน้าเว็บไซต์</div>
                  </div>
                </div>
              </div>

              {/* Settings Form */}
              <div className="card">
                <div className="card-title">🎨 ตั้งค่า Navbar</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">ชื่อเว็บไซต์</label>
                    <input className="form-input" placeholder="เช่น Teacher Portal" value={settings.site_name} onChange={e => setSettings({ ...settings, site_name: e.target.value })} />
                  </div>

                  {/* เปลี่ยนจาก Emoji เป็นอัปโหลดรูปภาพตรงนี้ */}
                  <div className="form-group">
                    <label className="form-label">โลโก้เว็บไซต์ (อัปโหลดรูปภาพ)</label>
                    <div className="upload-box">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="upload-input" 
                        onChange={handleImageUpload} 
                        disabled={uploading} 
                      />
                      {uploading ? (
                        <div style={{ color: '#6366f1', fontWeight: 500, padding: '20px 0' }}>⏳ กำลังอัปโหลด...</div>
                      ) : settings.logo_url ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <img 
                            src={settings.logo_url} 
                            alt="Logo Preview" 
                            style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, background: '#fff', border: '1px solid #e5e7eb', padding: 4 }} 
                          />
                          <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 500 }}>คลิกเพื่อเปลี่ยนรูปใหม่</span>
                        </div>
                      ) : (
                        <div style={{ padding: '10px 0' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
                          <div style={{ fontSize: 14, color: '#374151', fontWeight: 600 }}>คลิกเพื่อเลือกไฟล์รูปภาพ</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>รองรับ JPG, PNG, GIF</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">สีพื้นหลัง Navbar</label>
                    <div className="color-wrap">
                      <input type="color" className="color-input" value={settings.nav_color} onChange={e => setSettings({ ...settings, nav_color: e.target.value })} />
                      <input className={`form-input color-text`} value={settings.nav_color} onChange={e => setSettings({ ...settings, nav_color: e.target.value })} placeholder="#ffffff" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {['#ffffff', '#1e1b4b', '#6366f1', '#0f172a', '#f8f9ff', '#fdf4ff'].map(color => (
                        <div key={color} onClick={() => setSettings({ ...settings, nav_color: color })}
                          style={{ width: 32, height: 32, borderRadius: 8, background: color, border: settings.nav_color === color ? '3px solid #6366f1' : '1.5px solid #e5e7eb', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">สีตัวอักษร Navbar</label>
                    <div className="color-wrap">
                      <input type="color" className="color-input" value={settings.nav_text_color} onChange={e => setSettings({ ...settings, nav_text_color: e.target.value })} />
                      <input className={`form-input color-text`} value={settings.nav_text_color} onChange={e => setSettings({ ...settings, nav_text_color: e.target.value })} placeholder="#1e1b4b" />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {['#1e1b4b', '#ffffff', '#6366f1', '#374151', '#111827', '#6b7280'].map(color => (
                        <div key={color} onClick={() => setSettings({ ...settings, nav_text_color: color })}
                          style={{ width: 32, height: 32, borderRadius: 8, background: color, border: settings.nav_text_color === color ? '3px solid #6366f1' : '1.5px solid #e5e7eb', cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </>
  )
}