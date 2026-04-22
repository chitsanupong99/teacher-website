'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

interface Profile { name: string; position: string; school: string; image_url: string; expertise: string; email: string; phone: string; line_id: string; facebook: string; education?: string; experience?: string }
interface Announcement { id: string; title: string; content: string; created_at: string }
interface Content { id: string; title: string; description: string; type: string; url: string; subject_id: string }
interface Subject { id: string; name: string }
interface Gallery { id: string; title: string; image_url: string }

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contents, setContents] = useState<Content[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [filterType, setFilterType] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => { fetchData() }, [])
  useEffect(() => { if (!loading) setTimeout(() => setVisible(true), 100) }, [loading])

  const fetchData = async () => {
    const [{ data: pro }, { data: ann }, { data: con }, { data: sub }, { data: gal }] = await Promise.all([
      supabase.from('teacher_profile').select('*').single(),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('contents').select('*').order('created_at', { ascending: false }),
      supabase.from('subjects').select('*').order('name'),
      supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(6),
    ])
    setProfile(pro)
    setAnnouncements(ann || [])
    setContents(con || [])
    setSubjects(sub || [])
    setGallery(gal || [])
    setLoading(false)
  }

  const filtered = contents.filter(c => {
    if (filterType && c.type !== filterType) return false
    if (filterSubject && c.subject_id !== filterSubject) return false
    return true
  })

  const typeColors: Record<string, { bg: string; color: string; icon: string }> = {
    'ใบงาน': { bg: '#eef2ff', color: '#6366f1', icon: '📋' },
    'เนื้อหา': { bg: '#f0fdf4', color: '#16a34a', icon: '📖' },
    'แบบฝึกหัด': { bg: '#fff7ed', color: '#d97706', icon: '✏️' },
    'ลิงก์อบรม': { bg: '#fdf4ff', color: '#9333ea', icon: '🔗' },
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 2s linear infinite' }}>🎓</div>
      <div style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>กำลังโหลด...</div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Sarabun', sans-serif; background: #f8f9ff; overflow-x: hidden; }

        /* Animations */
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.05); } }
        @keyframes slideRight { from { transform:translateX(-20px); opacity:0; } to { transform:translateX(0); opacity:1; } }

        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.4s ease both; }

        /* Navbar */
        .navbar {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99,102,241,0.1);
          padding: 0 40px; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
          box-shadow: 0 4px 24px rgba(99,102,241,0.08);
        }
        .nav-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .nav-logo-icon {
          width: 40px; height: 40px; background: linear-gradient(135deg,#6366f1,#8b5cf6);
          border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .nav-logo-text { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 700; color: #1e1b4b; }
        .nav-links { display: flex; align-items: center; gap: 12px; }
        .nav-link {
          padding: 10px 16px; border-radius: 12px; font-size: 14px; font-weight: 500;
          color: #4b5563; cursor: pointer; transition: all 0.2s; text-decoration: none;
          border: 1px solid transparent; background: rgba(255,255,255,0.9); font-family: 'Sarabun', sans-serif;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .nav-link:hover { background: #eef2ff; color: #4338ca; border-color: rgba(99,102,241,0.18); }
        .nav-btn {
          padding: 10px 22px; border-radius: 14px; font-size: 14px; font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 12px rgba(99,102,241,0.35);
          min-width: 190px;
        }
        .nav-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.45); }
        .nav-secret-btn {
          padding: 8px 12px; border-radius: 8px; font-size: 16px; font-weight: 400;
          color: #d1d5db; cursor: pointer; transition: all 0.2s; text-decoration: none;
          border: 1px solid transparent; background: rgba(255,255,255,0.4); font-family: 'Sarabun', sans-serif;
          display: inline-flex; align-items: center; justify-content: center; opacity: 0.6;
        }
        .nav-secret-btn:hover { opacity: 1; color: #9ca3af; background: rgba(255,255,255,0.5); }

        /* Stats bar */
        .stats-bar {
          background: #fff; margin: 24px 40px 0; border-radius: 20px;
          padding: 24px 32px; display: flex; gap: 0;
          box-shadow: 0 8px 40px rgba(99,102,241,0.12);
          position: relative; z-index: 2;
        }
        .stat-item { flex: 1; text-align: center; position: relative; }
        .stat-item:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 10%; height: 80%;
          width: 1px; background: #f3f4f6;
        }
        .stat-num { font-family: 'Prompt', sans-serif; font-size: 28px; font-weight: 700; color: #6366f1; }
        .stat-label { font-size: 12px; color: #9ca3af; margin-top: 2px; }

        /* Container */
        .container { max-width: 1100px; margin: 0 auto; padding: 48px 40px; }

        /* Section */
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .section-title { font-family: 'Prompt', sans-serif; font-size: 22px; font-weight: 700; color: #1e1b4b; display: flex; align-items: center; gap: 10px; }
        .section-line { flex: 1; height: 2px; background: linear-gradient(90deg, #e0e7ff, transparent); margin-left: 16px; }

        /* Announcements */
        .announce-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 56px; }
        .announce-card {
          background: #fff; border-radius: 16px; padding: 22px;
          border: 1px solid #f3f4f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s; cursor: default;
          position: relative; overflow: hidden;
        }
        .announce-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
        }
        .announce-card:hover { box-shadow: 0 8px 28px rgba(99,102,241,0.12); transform: translateY(-3px); border-color: #e0e7ff; }
        .announce-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 600;
          padding: 3px 10px; border-radius: 100px; margin-bottom: 10px;
        }
        .announce-title { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 600; color: #1e1b4b; margin-bottom: 8px; }
        .announce-content { font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 12px; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .announce-date { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }

        /* Filter */
        .filter-wrap {
          background: #fff; border-radius: 16px; padding: 16px 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex; gap: 10px; align-items: center; margin-bottom: 20px; flex-wrap: wrap;
        }
        .filter-label { font-size: 13px; color: #9ca3af; font-weight: 600; }
        .type-tab {
          padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500;
          cursor: pointer; border: 1.5px solid #e5e7eb; background: #fff; color: #6b7280;
          transition: all 0.2s; font-family: 'Sarabun', sans-serif;
        }
        .type-tab:hover { border-color: #a5b4fc; color: #6366f1; }
        .type-tab.active { border-color: #6366f1; background: #eef2ff; color: #6366f1; font-weight: 600; }
        .filter-select {
          border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 7px 14px;
          font-size: 13px; font-family: 'Sarabun', sans-serif; color: #111827;
          background: #fff; outline: none; transition: all 0.2s;
        }
        .filter-select:focus { border-color: #6366f1; }

        /* Content grid */
        .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 56px; }
        .content-card {
          background: #fff; border-radius: 16px; padding: 20px;
          border: 1px solid #f3f4f6; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s; cursor: default;
        }
        .content-card:hover { box-shadow: 0 8px 28px rgba(99,102,241,0.12); transform: translateY(-4px); border-color: #e0e7ff; }
        .type-badge-wrap { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .type-badge { padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .content-title { font-family: 'Prompt', sans-serif; font-size: 15px; font-weight: 600; color: #1e1b4b; margin-bottom: 6px; line-height: 1.4; }
        .content-desc { font-size: 13px; color: #9ca3af; margin-bottom: 12px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .content-link {
          font-size: 13px; color: #6366f1; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          background: #eef2ff; padding: 6px 14px; border-radius: 8px;
          font-weight: 500; transition: all 0.2s;
        }
        .content-link:hover { background: #e0e7ff; transform: translateX(2px); }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%);
          border-radius: 24px; padding: 48px; text-align: center; color: #fff;
          margin-bottom: 56px; position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .cta-content { position: relative; z-index: 1; }
        .cta-icon { font-size: 48px; margin-bottom: 16px; display: block; animation: float 3s ease-in-out infinite; }
        .cta-title { font-family: 'Prompt', sans-serif; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .cta-sub { font-size: 15px; opacity: 0.75; margin-bottom: 28px; }
        .cta-btn {
          background: #fff; color: #6366f1;
          border: none; border-radius: 14px; padding: 16px 40px;
          font-size: 16px; font-weight: 700; cursor: pointer;
          font-family: 'Sarabun', sans-serif; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 32px rgba(0,0,0,0.3); }

        /* Gallery */
        .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 56px; }
        .gallery-item { border-radius: 16px; overflow: hidden; aspect-ratio: 1; position: relative; cursor: pointer; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .gallery-item:hover img { transform: scale(1.08); }
        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(99,102,241,0.85), transparent);
          display: flex; align-items: flex-end; justify-content: center;
          opacity: 0; transition: opacity 0.3s; color: #fff; font-weight: 600; font-size: 14px;
          padding: 16px;
        }
        .gallery-item:hover .gallery-overlay { opacity: 1; }

        /* Contact */
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 56px; }
        .contact-card {
          background: #fff; border-radius: 16px; padding: 18px 20px;
          border: 1px solid #f3f4f6; display: flex; align-items: center; gap: 14px;
          transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .contact-card:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.1); border-color: #e0e7ff; transform: translateY(-2px); }
        .contact-icon-wrap { width: 44px; height: 44px; border-radius: 12px; background: #eef2ff; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .contact-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .contact-value { font-size: 14px; font-weight: 500; color: #374151; margin-top: 2px; }

        /* Footer */
        .footer {
          background: #1e1b4b; color: rgba(255,255,255,0.5);
          text-align: center; padding: 28px; font-size: 13px;
        }
        .footer span { color: rgba(255,255,255,0.8); font-weight: 600; }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(15,23,42,0.7);
          display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 100;
          backdrop-filter: blur(8px); animation: fadeIn 0.2s ease;
        }
        .modal {
          width: min(100%, 680px); max-height: 88vh; overflow-y: auto;
          background: #fff; border-radius: 24px; padding: 0;
          box-shadow: 0 32px 80px rgba(15,23,42,0.25); position: relative;
          animation: fadeUp 0.3s ease;
        }
        .modal-header {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          padding: 28px 32px; color: #fff; border-radius: 24px 24px 0 0;
          position: sticky; top: 0; z-index: 1;
        }
        .modal-close {
          position: absolute; top: 20px; right: 20px; border: none;
          background: rgba(255,255,255,0.2); font-size: 18px; cursor: pointer;
          color: #fff; width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.3); }
        .modal-avatar { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 3px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 12px; overflow: hidden; }
        .modal-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .modal-name { font-family: 'Prompt', sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .modal-pos { font-size: 14px; opacity: 0.8; }
        .modal-body { padding: 28px 32px; }
        .modal-section { margin-bottom: 24px; }
        .modal-section-title {
          font-size: 11px; font-weight: 700; color: #9ca3af;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
        }
        .modal-section-title::after { content: ''; flex: 1; height: 1px; background: #f3f4f6; }
        .modal-text { font-size: 14px; color: #4b5563; line-height: 1.8; white-space: pre-wrap; }
        .modal-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .modal-chip { background: #eef2ff; color: #4338ca; padding: 6px 16px; border-radius: 100px; font-size: 13px; font-weight: 500; }
        .modal-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .modal-contact-item { background: #f8f9ff; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
        .modal-contact-icon { font-size: 20px; }
        .modal-contact-label { font-size: 11px; color: #9ca3af; }
        .modal-contact-value { font-size: 13px; font-weight: 500; color: #374151; }
      `}</style>

      {/* Navbar */}
      <Navbar onShowProfileModal={() => setShowProfileModal(true)} />

      {/* Stats Bar */}
      <div style={{ padding: '0 40px' }}>
        <div className="stats-bar fade-up-1">
          {[
            { num: contents.length, label: 'เนื้อหาทั้งหมด' },
            { num: announcements.length, label: 'ประกาศ' },
            { num: gallery.length, label: 'รูปกิจกรรม' },
            { num: subjects.length, label: 'วิชาที่สอน' },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container">

        {/* ประกาศ */}
        {announcements.length > 0 && (
          <div id="announcements" className="fade-up-2">
            <div className="section-header">
              <div className="section-title">📢 ประกาศล่าสุด <div className="section-line" /></div>
            </div>
            <div className="announce-grid">
              {announcements.slice(0, 3).map((a, i) => (
                <div key={a.id} className="announce-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="announce-badge">🔔 ประกาศ</div>
                  <div className="announce-title">{a.title}</div>
                  <div className="announce-content">{a.content}</div>
                  <div className="announce-date">📅 {formatDate(a.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* เนื้อหา */}
        <div id="contents" className="fade-up-3">
          <div className="section-header">
            <div className="section-title">📚 เนื้อหาและใบงาน <div className="section-line" /></div>
          </div>
          <div className="filter-wrap">
            <span className="filter-label">ประเภท:</span>
            {['', 'ใบงาน', 'เนื้อหา', 'แบบฝึกหัด', 'ลิงก์อบรม'].map(t => (
              <button key={t} className={`type-tab ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>
                {t ? `${typeColors[t]?.icon} ${t}` : '✨ ทั้งหมด'}
              </button>
            ))}
            <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">📖 ทุกวิชา</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', background: '#fff', borderRadius: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>ยังไม่มีเนื้อหา</div>
            </div>
          ) : (
            <div className="content-grid">
              {filtered.map((c, i) => (
                <div key={c.id} className="content-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="type-badge-wrap">
                    <span className="type-badge" style={{ background: typeColors[c.type]?.bg, color: typeColors[c.type]?.color }}>
                      {typeColors[c.type]?.icon} {c.type}
                    </span>
                  </div>
                  <div className="content-title">{c.title}</div>
                  {c.description && <div className="content-desc">{c.description}</div>}
                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="content-link">🔗 เปิดดูเนื้อหา</a>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="cta-section fade-up-4">
          <div className="cta-content">
            <span className="cta-icon">🎓</span>
            <div className="cta-title">ตรวจสอบผลการเรียนของคุณ</div>
            <div className="cta-sub">กรอกรหัสนักเรียนเพื่อดูคะแนน การเข้าเรียน และข้อมูลการเรียนทั้งหมด</div>
            <button className="cta-btn" onClick={() => router.push('/student')}>
              🔍 ตรวจสอบผลการเรียนเดี๋ยวนี้
            </button>
          </div>
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <div id="gallery" className="fade-up">
            <div className="section-header">
              <div className="section-title">🖼️ Gallery กิจกรรม <div className="section-line" /></div>
            </div>
            <div className="gallery-grid">
              {gallery.map(g => (
                <div key={g.id} className="gallery-item">
                  <img src={g.image_url} alt={g.title} />
                  <div className="gallery-overlay">{g.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ติดต่อ */}
        {profile && (
          <div id="contact" className="fade-up">
            <div className="section-header">
              <div className="section-title">📞 ข้อมูลติดต่อ <div className="section-line" /></div>
            </div>
            <div className="contact-grid">
              {[
                { icon: '📱', label: 'เบอร์โทร', value: profile.phone },
                { icon: '✉️', label: 'อีเมล', value: profile.email },
                { icon: '💬', label: 'Line ID', value: profile.line_id },
                { icon: '👥', label: 'Facebook', value: profile.facebook },
              ].filter(c => c.value).map((c, i) => (
                <div key={i} className="contact-card">
                  <div className="contact-icon-wrap">{c.icon}</div>
                  <div>
                    <div className="contact-label">{c.label}</div>
                    <div className="contact-value">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="footer">
        Teacher Portal · พัฒนาเพื่อ <span>การศึกษาไทย</span>
      </div>

      {/* Profile Modal */}
      {showProfileModal && profile && (
        <div className="modal-backdrop" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
              <div className="modal-avatar">
                {profile.image_url ? <img src={profile.image_url} alt="avatar" /> : '👨‍🏫'}
              </div>
              <div className="modal-name">{profile.name}</div>
              <div className="modal-pos">{profile.position} · {profile.school}</div>
            </div>
            <div className="modal-body">
              {profile.expertise && (
                <div className="modal-section">
                  <div className="modal-section-title">ความเชี่ยวชาญ</div>
                  <div className="modal-chips">
                    {profile.expertise.split(',').map((e, i) => <span key={i} className="modal-chip">{e.trim()}</span>)}
                  </div>
                </div>
              )}
              {profile.education && (
                <div className="modal-section">
                  <div className="modal-section-title">ประวัติการศึกษา</div>
                  <div className="modal-text">{profile.education}</div>
                </div>
              )}
              {profile.experience && (
                <div className="modal-section">
                  <div className="modal-section-title">ประวัติการทำงาน</div>
                  <div className="modal-text">{profile.experience}</div>
                </div>
              )}
              <div className="modal-section">
                <div className="modal-section-title">ข้อมูลติดต่อ</div>
                <div className="modal-contact-grid">
                  {[
                    { icon: '📱', label: 'เบอร์โทร', value: profile.phone },
                    { icon: '✉️', label: 'อีเมล', value: profile.email },
                    { icon: '💬', label: 'Line ID', value: profile.line_id },
                    { icon: '👥', label: 'Facebook', value: profile.facebook },
                  ].filter(c => c.value).map((c, i) => (
                    <div key={i} className="modal-contact-item">
                      <span className="modal-contact-icon">{c.icon}</span>
                      <div>
                        <div className="modal-contact-label">{c.label}</div>
                        <div className="modal-contact-value">{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}