'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sarabun', sans-serif; }
        .page {
          min-height: 100vh;
          background: #f0f2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .blob1 {
          position: absolute;
          width: 500px; height: 500px;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          border-radius: 50%;
          top: -180px; left: -120px;
          opacity: 0.25;
          filter: blur(60px);
        }
        .blob2 {
          position: absolute;
          width: 350px; height: 350px;
          background: linear-gradient(135deg, #c084fc, #a855f7);
          border-radius: 50%;
          bottom: -100px; right: -80px;
          opacity: 0.2;
          filter: blur(50px);
        }
        .card {
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 20px 60px rgba(99,102,241,0.12), 0 4px 20px rgba(0,0,0,0.06);
          width: 100%;
          max-width: 480px;
          min-height: 560px;
          display: flex;
          overflow: hidden;
          position: relative;
          z-index: 1;
          justify-content: center;
        }
        .left {
          display: none;
        }
        .left::before {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
          top: -80px; right: -80px;
        }
        .left::after {
          content: '';
          position: absolute;
          width: 200px; height: 200px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          bottom: -60px; left: -40px;
        }
        .logo-area { display: flex; align-items: center; gap: 10px; }
        .logo-icon {
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .logo-text {
          font-family: 'Prompt', sans-serif;
          font-size: 16px; font-weight: 600;
          color: #ffffff; letter-spacing: 0.02em;
        }
        .ill-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .ill-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .ill-avatar {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }
        .ill-name { color: #fff; font-weight: 600; font-size: 15px; }
        .ill-role { color: rgba(255,255,255,0.7); font-size: 12px; }
        .ill-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .stat-box {
          background: rgba(255,255,255,0.12);
          border-radius: 12px; padding: 12px; text-align: center;
        }
        .stat-num { color: #fff; font-size: 22px; font-weight: 700; font-family: 'Prompt', sans-serif; }
        .stat-label { color: rgba(255,255,255,0.7); font-size: 11px; margin-top: 2px; }
        .ill-bar-wrap { margin-top: 14px; }
        .ill-bar-label { display: flex; justify-content: space-between; color: rgba(255,255,255,0.8); font-size: 12px; margin-bottom: 6px; }
        .ill-bar-bg { background: rgba(255,255,255,0.15); border-radius: 100px; height: 6px; }
        .ill-bar-fill { background: #fff; border-radius: 100px; height: 6px; width: 78%; }
        .left-footer { color: rgba(255,255,255,0.6); font-size: 12px; text-align: center; }
        .right {
          width: 100%;
          padding: 52px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .welcome-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: #eef2ff; color: #6366f1;
          font-size: 12px; font-weight: 600;
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 20px; width: fit-content; letter-spacing: 0.04em;
        }
        .form-title {
          font-family: 'Prompt', sans-serif;
          font-size: 32px; font-weight: 700;
          color: #1e1b4b; line-height: 1.2; margin-bottom: 8px;
        }
        .form-sub { color: #9ca3af; font-size: 14px; margin-bottom: 36px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .form-group { margin-bottom: 20px; }
        .input-box { position: relative; }
        .input-field {
          width: 100%;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 13px 16px 13px 46px;
          font-size: 14px;
          font-family: 'Sarabun', sans-serif;
          color: #111827; background: #fafafa;
          outline: none; transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #6366f1; background: #fff;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.08);
        }
        .input-field::placeholder { color: #d1d5db; }
        .input-ico {
          position: absolute; left: 15px; top: 50%;
          transform: translateY(-50%); font-size: 16px; opacity: 0.5;
        }
        .btn-login {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; border: none; border-radius: 12px;
          padding: 15px; font-size: 15px; font-weight: 600;
          font-family: 'Sarabun', sans-serif;
          cursor: pointer; margin-top: 4px; transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(99,102,241,0.4); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .error-msg {
          background: #fef2f2; border: 1px solid #fecaca;
          color: #dc2626; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; margin-bottom: 16px;
        }
        .bottom-note { text-align: center; margin-top: 24px; font-size: 12px; color: #d1d5db; }
        .btn-home-top {
          position: absolute; top: 24px; right: 24px;
          background: #fff; color: #6366f1; border: 1.5px solid #e5e7eb;
          border-radius: 10px; padding: 10px 20px;
          font-size: 14px; font-weight: 600; font-family: 'Sarabun', sans-serif;
          cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block;
        }
        .btn-home-top:hover { background: #eef2ff; border-color: #6366f1; }
      `}</style>

      <div className="page">
        <a href="/" className="btn-home-top">← หน้าหลัก</a>
        <div className="blob1" /><div className="blob2" />
        <div className="card">
          <div className="left">
            <div className="logo-area">
              <div className="logo-icon">🎓</div>
              <span className="logo-text">Teacher Portal</span>
            </div>
            <div className="ill-card">
              <div className="ill-header">
                <div className="ill-avatar">👨‍🏫</div>
                <div>
                  <div className="ill-name">ครูประจำวิชา</div>
                  <div className="ill-role">ภาคเรียนที่ 1/2567</div>
                </div>
              </div>
              <div className="ill-stats">
                <div className="stat-box">
                  <div className="stat-num">4</div>
                  <div className="stat-label">ห้องเรียน</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">128</div>
                  <div className="stat-label">นักเรียน</div>
                </div>
              </div>
              <div className="ill-bar-wrap">
                <div className="ill-bar-label"><span>การเข้าเรียนเฉลี่ย</span><span>78%</span></div>
                <div className="ill-bar-bg"><div className="ill-bar-fill" /></div>
              </div>
            </div>
            <div className="left-footer">ระบบจัดการสำหรับครูผู้สอน</div>
          </div>

          <div className="right">
            <div className="welcome-tag">✦ ยินดีต้อนรับ</div>
            <h1 className="form-title">เข้าสู่ระบบ<br />จัดการครู</h1>
            <p className="form-sub">กรอกข้อมูลเพื่อเข้าใช้งานระบบ</p>

            {error && <div className="error-msg">⚠️ {error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">อีเมล</label>
                <div className="input-box">
                  <span className="input-ico">✉️</span>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="teacher@school.ac.th"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">รหัสผ่าน</label>
                <div className="input-box">
                  <span className="input-ico">🔒</span>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ →'}
              </button>
            </form>

            <p className="bottom-note">สำหรับครูผู้สอนเท่านั้น · Teacher Management System v1.0</p>
          </div>
        </div>
      </div>
    </>
  )
}