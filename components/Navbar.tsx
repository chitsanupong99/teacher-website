'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SiteSettings {
  site_name: string
  logo_url: string | null
  logo_emoji: string
  nav_color: string
  nav_text_color: string
}

interface NavbarProps {
  router?: any // Next.js router instance
  onShowProfileModal?: () => void
}

export default function Navbar({ router, onShowProfileModal }: NavbarProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const defaultRouter = useRouter()
  const activeRouter = router || defaultRouter

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_name, logo_url, logo_emoji, nav_color, nav_text_color')
        .single()

      if (error) {
        console.error('Error fetching site settings:', error)
        // Set default values if error
        setSettings({
          site_name: 'Teacher Portal',
          logo_url: null,
          logo_emoji: '🎓',
          nav_color: '#ffffff',
          nav_text_color: '#1e1b4b'
        })
      } else {
        setSettings({
          site_name: data.site_name || 'Teacher Portal',
          logo_url: data.logo_url,
          logo_emoji: data.logo_emoji || '🎓',
          nav_color: data.nav_color || '#ffffff',
          nav_text_color: data.nav_text_color || '#1e1b4b'
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setSettings({
        site_name: 'Teacher Portal',
        logo_url: null,
        logo_emoji: '🎓',
        nav_color: '#ffffff',
        nav_text_color: '#1e1b4b'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !settings) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        padding: '0 40px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
      }}>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div
      className="navbar"
      style={{
        background: `rgba(${hexToRgb(settings.nav_color)}, 0.85)`,
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
        padding: '0 40px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 24px rgba(99,102,241,0.08)'
      }}
    >
      <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
        <div
          className="nav-logo-icon"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            color: settings.nav_text_color
          }}
        >
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                objectFit: 'cover'
              }}
            />
          ) : (
            settings.logo_emoji
          )}
        </div>
        <span
          className="nav-logo-text"
          style={{
            fontFamily: "'Prompt', sans-serif",
            fontSize: '18px',
            fontWeight: '700',
            color: settings.nav_text_color
          }}
        >
          {settings.site_name}
        </span>
      </div>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href="#announcements"
          className="nav-link"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: settings.nav_text_color,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: '1px solid transparent',
            background: 'rgba(255,255,255,0.9)',
            fontFamily: "'Sarabun', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ประกาศ
        </a>
        <a
          href="#contents"
          className="nav-link"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: settings.nav_text_color,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: '1px solid transparent',
            background: 'rgba(255,255,255,0.9)',
            fontFamily: "'Sarabun', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          เนื้อหา
        </a>
        <a
          href="#gallery"
          className="nav-link"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: settings.nav_text_color,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: '1px solid transparent',
            background: 'rgba(255,255,255,0.9)',
            fontFamily: "'Sarabun', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Gallery
        </a>
        <a
          href="#contact"
          className="nav-link"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: settings.nav_text_color,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: '1px solid transparent',
            background: 'rgba(255,255,255,0.9)',
            fontFamily: "'Sarabun', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ติดต่อ
        </a>
        <button
          className="nav-link"
          onClick={() => onShowProfileModal && onShowProfileModal()}
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: settings.nav_text_color,
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: '1px solid transparent',
            background: 'rgba(255,255,255,0.9)',
            fontFamily: "'Sarabun', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          👤 โปรไฟล์ครู
        </button>
        <button
          className="nav-btn"
          onClick={() => activeRouter.push('/student')}
          style={{
            padding: '10px 22px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            cursor: 'pointer',
            border: 'none',
            fontFamily: "'Sarabun', sans-serif",
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
            minWidth: '190px'
          }}
        >
          🔍 ตรวจสอบผลการเรียน
        </button>
        <button
          className="nav-secret-btn"
          onClick={() => activeRouter.push('/admin/login')}
          title="Admin"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '400',
            color: '#d1d5db',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textDecoration: 'none',
            border: '1px solid transparent',
            background: 'rgba(255,255,255,0.4)',
            fontFamily: "'Sarabun', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0.6'
          }}
        >
          🔐
        </button>
      </div>
    </div>
  )
}

// Helper function to convert hex color to rgb
function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }

  // Handle 6-digit hex
  if (hex.length === 6) {
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result) {
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `${r}, ${g}, ${b}`
    }
  }

  // Default fallback
  return '255, 255, 255'
}