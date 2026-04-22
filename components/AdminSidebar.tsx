'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SiteSettings {
  site_name: string
  logo_url: string | null
  logo_emoji: string
}

interface AdminSidebarProps {
  activePath: string
}

export default function AdminSidebar({ activePath }: AdminSidebarProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_name, logo_url, logo_emoji')
        .single()

      if (error) {
        console.error('Error fetching site settings:', error)
        setSettings({
          site_name: 'Admin Panel',
          logo_url: null,
          logo_emoji: '🎓'
        })
      } else {
        setSettings({
          site_name: data.site_name || 'Admin Panel',
          logo_url: data.logo_url,
          logo_emoji: data.logo_emoji || '🎓'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setSettings({
        site_name: 'Admin Panel',
        logo_url: null,
        logo_emoji: '🎓'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const menuItems = [
    {
      section: 'เมนูหลัก',
      items: [
        { icon: '📊', label: 'Dashboard', path: '/admin/dashboard' },
        { icon: '👤', label: 'โปรไฟล์ครู', path: '/admin/profile' },
        { icon: '📢', label: 'ประกาศ', path: '/admin/announcements' },
      ]
    },
    {
      section: 'การเรียนการสอน',
      items: [
        { icon: '🏫', label: 'จัดการชั้นเรียน', path: '/admin/classrooms' },
        { icon: '✅', label: 'เช็คชื่อ', path: '/admin/attendance' },
        { icon: '📝', label: 'คะแนน', path: '/admin/scores' },
        { icon: '📅', label: 'ปฏิทิน', path: '/admin/calendar' },
      ]
    },
    {
      section: 'เนื้อหา',
      items: [
        { icon: '📚', label: 'เนื้อหา/ใบงาน', path: '/admin/contents' },
        { icon: '📁', label: 'เอกสาร', path: '/admin/documents' },
        { icon: '🖼️', label: 'ผลงาน & Gallery', path: '/admin/gallery' },
      ]
    },
    {
      section: 'ระบบ',
      items: [
        { icon: '⚙️', label: 'ตั้งค่าเว็บไซต์', path: '/admin/settings' },
      ]
    }
  ]

  if (loading) {
    return (
      <div style={{
        width: '240px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Prompt:wght@400;600;700&display=swap');

        .sidebar {
          width: 240px; background: #fff;
          border-right: 1px solid #e5e7eb;
          display: flex; flex-direction: column;
          padding: 24px 16px; position: fixed;
          top: 0; left: 0; height: 100vh; overflow-y: auto;
          z-index: 100;
        }

        .logo { display: flex; align-items: center; gap: 10px; padding: 0 8px; margin-bottom: 32px; }
        .logo-icon { font-size: 24px; }
        .logo-img { max-width: 36px; max-height: 36px; border-radius: 8px; object-fit: cover; }
        .logo-text { font-family: 'Prompt', sans-serif; font-size: 16px; font-weight: 700; color: #1e1b4b; }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          color: #6b7280; font-size: 14px; font-weight: 500;
          cursor: pointer; margin-bottom: 4px;
          transition: all 0.2s; text-decoration: none;
        }
        .nav-item:hover { background: #f0f2ff; color: #6366f1; }
        .nav-item.active { background: #eef2ff; color: #6366f1; font-weight: 600; }
        .nav-icon { font-size: 18px; width: 24px; text-align: center; }

        .nav-section { font-size: 11px; color: #9ca3af; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 16px 12px 8px; }

        .logout-btn {
          margin-top: auto; display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          color: #ef4444; font-size: 14px; font-weight: 500;
          cursor: pointer; border: none; background: none;
          width: 100%; font-family: 'Sarabun', sans-serif;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: #fef2f2; }
      `}</style>

      <div className="sidebar">
        <div className="logo">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="logo" className="logo-img" />
          ) : (
            <span className="logo-icon">{settings?.logo_emoji || '🎓'}</span>
          )}
          <span className="logo-text">{settings?.site_name || 'Admin Panel'}</span>
        </div>

        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="nav-section">{section.section}</div>
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className={`nav-item ${activePath === item.path ? 'active' : ''}`}
                onClick={() => router.push(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}

        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span> ออกจากระบบ
        </button>
      </div>
    </>
  )
}