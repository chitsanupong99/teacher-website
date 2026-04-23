'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false) // ✅ เพิ่มบรรทัดนี้ เพื่อบอกให้เลิกโหลด
      router.push('/admin/login')
    } else {
      setLoading(false)
    }
  }

  // เช็คก่อนว่านี่คือหน้า Login หรือเปล่า
  if (pathname === '/admin/login') {
    return <>{children}</> // ถ้าเป็นหน้า Login ให้แสดงแค่หน้า Login ไปเลย ไม่ต้องเอา Sidebar มาด้วย
  }

  // ส่วน Loading เดิม
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2ff', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#6366f1', fontSize: 18 }}>กำลังโหลด...</p>
    </div>
  )

  // ส่วน Return ปกติที่มี Sidebar...
  return (
    <>
      <style>{`
        .layout { display: flex; min-height: 100vh; }
        .main { margin-left: 240px; padding: 32px; flex: 1; min-height: 100vh; }
        
        @media (max-width: 768px) {
          .main { margin-left: 0; padding: 80px 20px 32px; }
        }
      `}</style>

      <div className="layout">
        <AdminSidebar activePath={pathname} />

        {/* Main Content */}
        <div className="main">
          {children}
        </div>
      </div>
    </>
  )
}