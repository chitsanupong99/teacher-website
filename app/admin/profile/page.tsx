'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Profile {
  id?: string
  name: string
  position: string
  school: string
  phone: string
  email: string
  line_id: string
  facebook: string
  education: string
  experience: string
  expertise: string
  image_url: string
}

const empty: Profile = { name: '', position: '', school: '', phone: '', email: '', line_id: '', facebook: '', education: '', experience: '', expertise: '', image_url: '' }

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase.from('teacher_profile').select('*').single()
    if (data) setProfile(data)
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    if (profile.id) {
      await supabase.from('teacher_profile').update(profile).eq('id', profile.id)
    } else {
      await supabase.from('teacher_profile').insert(profile)
    }
    setSaving(false)
    setSaved(true)
    setEditMode(false)
    setTimeout(() => setSaved(false), 3000)
    fetchProfile()
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
        .btn-primary:hover { transform: translateY(-1px); }
        .btn-outline { background: #fff; color: #6366f1; border: 1.5px solid #6366f1; }
        .btn-outline:hover { background: #eef2ff; }
        .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 24px; }
        .card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #f3f4f6; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .avatar-wrap { text-align: center; margin-bottom: 20px; }
        .avatar {
          width: 100px; height: 100px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; margin: 0 auto 12px;
          overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-name { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 700; color: #1e1b4b; }
        .avatar-pos { font-size: 13px; color: #9ca3af; margin-top: 4px; }
        .contact-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
        .contact-item:last-child { border-bottom: none; }
        .contact-icon { font-size: 18px; width: 24px; text-align: center; }
        .section-title { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 600; color: #1e1b4b; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #eef2ff; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
        .form-input {
          width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px;
          padding: 11px 14px; font-size: 14px; font-family: 'Sarabun', sans-serif;
          color: #111827; background: #fafafa; outline: none; transition: all 0.2s;
        }
        .form-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
        .form-input:disabled { background: #f9fafb; color: #6b7280; cursor: not-allowed; }
        textarea.form-input { resize: vertical; min-height: 80px; }
        .success-banner {
          background: #f0fdf4; border: 1px solid #86efac; color: #16a34a;
          border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;
          font-size: 14px; font-weight: 500;
        }
        .info-text { font-size: 14px; color: #374151; padding: 4px 0; }
      `}</style>

      <>
        <div className="main">
          <div className="topbar">
            <div>
              <div className="page-title">👤 โปรไฟล์ครู</div>
              <div className="page-sub">ข้อมูลส่วนตัวและข้อมูลติดต่อ</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editMode ? (
                <>
                  <button className="btn btn-outline" onClick={() => setEditMode(false)}>ยกเลิก</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setEditMode(true)}>✏️ แก้ไขข้อมูล</button>
              )}
            </div>
          </div>

          {saved && <div className="success-banner">✅ บันทึกข้อมูลเรียบร้อยแล้ว</div>}

          <div className="profile-grid">
            {/* Left Card */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="avatar-wrap">
                  <div className="avatar">
                    {profile.image_url ? <img src={profile.image_url} alt="avatar" /> : '👨‍🏫'}
                  </div>
                  <div className="avatar-name">{profile.name || 'ชื่อครู'}</div>
                  <div className="avatar-pos">{profile.position || 'ตำแหน่ง'}</div>
                  <div className="avatar-pos" style={{ marginTop: 4 }}>{profile.school || 'สังกัด'}</div>
                </div>
                {editMode && (
                  <div>
  <input
    type="file"
    accept=".jpg,.jpeg,.png,.webp"
    style={{ display: 'none' }}
    id="profile-upload"
    onChange={async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const fileExt = file.name.split('.').pop()
      const fileName = `profile_${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('logo').upload(fileName, file)
      if (error) { alert('อัปโหลดไม่สำเร็จ: ' + error.message); return }
      const { data: urlData } = supabase.storage.from('logo').getPublicUrl(fileName)
      setProfile({ ...profile, image_url: urlData.publicUrl })
    }}
  />
  <label htmlFor="profile-upload" style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 8, padding: '16px', border: '2px dashed #e5e7eb',
    borderRadius: 12, cursor: 'pointer', background: '#fafafa'
  }}>
    {profile.image_url
      ? <img src={profile.image_url} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
      : <div style={{ fontSize: 32 }}>📷</div>
    }
    <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 500 }}>
      คลิกเพื่ออัปโหลดรูปโปรไฟล์
    </div>
  </label>
</div>
                )}
              </div>

              <div className="card">
                <div className="section-title">📞 ข้อมูลติดต่อ</div>
                {[
                  { icon: '📱', label: 'เบอร์โทร', key: 'phone' },
                  { icon: '✉️', label: 'อีเมล', key: 'email' },
                  { icon: '💬', label: 'Line ID', key: 'line_id' },
                  { icon: '👥', label: 'Facebook', key: 'facebook' },
                ].map((c, i) => (
                  <div key={i} className="contact-item">
                    <span className="contact-icon">{c.icon}</span>
                    {editMode ? (
                      <input className="form-input" style={{ flex: 1 }} placeholder={c.label} value={(profile as any)[c.key]} onChange={e => setProfile({ ...profile, [c.key]: e.target.value })} />
                    ) : (
                      <span className="info-text">{(profile as any)[c.key] || '-'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card */}
            <div className="card">
              <div className="section-title">📋 ข้อมูลทั่วไป</div>
              <div className="form-grid">
                {[
                  { label: 'ชื่อ-นามสกุล', key: 'name', placeholder: 'เช่น นายสมชาย ใจดี' },
                  { label: 'ตำแหน่ง', key: 'position', placeholder: 'เช่น ครูชำนาญการ' },
                  { label: 'สังกัด/โรงเรียน', key: 'school', placeholder: 'เช่น โรงเรียนสมชาย', full: true },
                  { label: 'วิชาที่สอน/ความเชี่ยวชาญ', key: 'expertise', placeholder: 'เช่น คณิตศาสตร์, วิทยาศาสตร์', full: true },
                ].map((f, i) => (
                  <div key={i} className={`form-group ${f.full ? 'full' : ''}`}>
                    <label className="form-label">{f.label}</label>
                    {editMode ? (
                      <input className="form-input" placeholder={f.placeholder} value={(profile as any)[f.key]} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })} />
                    ) : (
                      <div className="info-text">{(profile as any)[f.key] || '-'}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="section-title" style={{ marginTop: 8 }}>🎓 ประวัติการศึกษา</div>
              <div className="form-group">
                {editMode ? (
                  <textarea className="form-input" placeholder="เช่น ปริญญาตรี ครุศาสตร์ มหาวิทยาลัย..." value={profile.education} onChange={e => setProfile({ ...profile, education: e.target.value })} />
                ) : (
                  <div className="info-text" style={{ whiteSpace: 'pre-wrap' }}>{profile.education || '-'}</div>
                )}
              </div>

              <div className="section-title">💼 ประวัติการทำงาน</div>
              <div className="form-group">
                {editMode ? (
                  <textarea className="form-input" placeholder="เช่น ครูประจำวิชา โรงเรียน... ปี 2560-ปัจจุบัน" value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} />
                ) : (
                  <div className="info-text" style={{ whiteSpace: 'pre-wrap' }}>{profile.experience || '-'}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  )
}