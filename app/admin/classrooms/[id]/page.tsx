'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

interface Student { id: string; name: string; student_code: string; classroom_id: string }
interface Classroom { id: string; name: string }
interface ImportStudent { student_code: string; name: string }

export default function ClassroomStudents() {
  const router = useRouter()
  const params = useParams()
  const classroomId = params.id as string

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<Student | null>(null)
  const [form, setForm] = useState({ name: '', student_code: '' })
  const [search, setSearch] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState<ImportStudent[]>([])
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; skipped: number } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: cls } = await supabase.from('classrooms').select('*').eq('id', classroomId).single()
    const { data: stu } = await supabase.from('students').select('*').eq('classroom_id', classroomId).order('student_code')
    setClassroom(cls)
    setStudents(stu || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!form.name || !form.student_code) return
    if (editItem) {
      await supabase.from('students').update(form).eq('id', editItem.id)
    } else {
      await supabase.from('students').insert({ ...form, classroom_id: classroomId })
    }
    setShowModal(false)
    setForm({ name: '', student_code: '' })
    setEditItem(null)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบนักเรียนนี้?')) return
    await supabase.from('students').delete().eq('id', id)
    fetchData()
  }

  const openEdit = (s: Student) => {
    setEditItem(s)
    setForm({ name: s.name, student_code: s.student_code })
    setShowModal(true)
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_code.includes(search)
  )

  const downloadTemplate = () => {
    const data = [
      { 'รหัสนักเรียน': '6601001', 'ชื่อ-นามสกุล': 'นายสมชาย ใจดี' },
      { 'รหัสนักเรียน': '6601002', 'ชื่อ-นามสกุล': 'นางสาวสมหญิง รักเรียน' },
      { 'รหัสนักเรียน': '6601003', 'ชื่อ-นามสกุล': 'นายสมศักดิ์ มุ่งมั่น' }
    ]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')

    // ปรับความกว้างคอลัมน์
    const colWidths = [
      { wch: 15 }, // รหัสนักเรียน
      { wch: 25 }  // ชื่อ-นามสกุล
    ]
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, 'template_รายชื่อนักเรียน.xlsx')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // แปลงข้อมูลเป็น array ของ objects
      const headers = jsonData[0] as string[]
      const rows = jsonData.slice(1) as any[][]

      const parsedData: ImportStudent[] = rows.map(row => ({
        student_code: row[headers.indexOf('รหัสนักเรียน')] || '',
        name: row[headers.indexOf('ชื่อ-นามสกุล')] || ''
      })).filter(item => item.student_code && item.name)

      setImportData(parsedData)
      setShowImportModal(true)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleImport = async () => {
    setImportLoading(true)
    let success = 0
    let skipped = 0

    for (const student of importData) {
      // ตรวจสอบว่ารหัสนักเรียนซ้ำหรือไม่
      const { data: existing } = await supabase
        .from('students')
        .select('id')
        .eq('student_code', student.student_code)
        .single()

      if (existing) {
        skipped++
        continue
      }

      const { error } = await supabase
        .from('students')
        .insert({
          student_code: student.student_code,
          name: student.name,
          classroom_id: classroomId
        })

      if (!error) {
        success++
      }
    }

    setImportResult({ success, skipped })
    setImportLoading(false)
    setShowImportModal(false)
    setImportData([])
    fetchData()
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
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: #6366f1; font-size: 14px; font-weight: 500;
          cursor: pointer; margin-bottom: 16px; background: none; border: none;
          font-family: 'Sarabun', sans-serif; padding: 0;
        }
        .back-btn:hover { text-decoration: underline; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
        .search-box {
          flex: 1; max-width: 320px; border: 1.5px solid #e5e7eb;
          border-radius: 10px; padding: 10px 14px 10px 36px;
          font-size: 14px; font-family: 'Sarabun', sans-serif;
          background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%239ca3af' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z'/%3E%3C/svg%3E") no-repeat 12px center;
          outline: none; transition: all 0.2s; color: #111827;
        }
        .search-box:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.08); }
        .btn {
          padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
        .btn-primary:hover { transform: translateY(-1px); }
        .stats-bar { display: flex; gap: 12px; margin-bottom: 20px; }
        .stat-pill {
          background: #fff; border: 1px solid #f3f4f6; border-radius: 10px;
          padding: 10px 16px; font-size: 13px; color: #6b7280;
        }
        .stat-pill strong { color: #1e1b4b; font-family: 'Prompt', sans-serif; }
        .table-wrap { background: #fff; border-radius: 16px; border: 1px solid #f3f4f6; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f8f9ff; padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #9ca3af; letter-spacing: 0.05em; text-transform: uppercase; }
        td { padding: 14px 16px; font-size: 14px; color: #374151; border-top: 1px solid #f3f4f6; }
        tr:hover td { background: #fafbff; }
        .badge {
          display: inline-block; padding: 4px 10px; border-radius: 100px;
          font-size: 12px; font-weight: 600; background: #eef2ff; color: #6366f1;
        }
        .action-btn {
          padding: 5px 12px; border-radius: 7px; font-size: 12px; font-weight: 600;
          cursor: pointer; border: none; font-family: 'Sarabun', sans-serif; transition: all 0.2s; margin-left: 4px;
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
        .modal { background: #fff; border-radius: 20px; padding: 32px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
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
        .import-modal { background: #fff; border-radius: 20px; padding: 32px; width: 100%; max-width: 800px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); max-height: 80vh; overflow-y: auto; }
        .import-preview { margin-top: 20px; }
        .import-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .import-table th, .import-table td { padding: 8px 12px; text-align: left; border: 1px solid #e5e7eb; }
        .import-table th { background: #f8f9ff; font-weight: 600; }
        .import-result { margin-top: 20px; padding: 16px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; }
        .import-result.success { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
        .import-result.warning { background: #fffbeb; border-color: #fde68a; color: #92400e; }
      `}</style>

      <div className="main">
          <button className="back-btn" onClick={() => router.push('/admin/classrooms')}>← กลับไปจัดการชั้นเรียน</button>
          <div className="topbar">
            <div>
              <div className="page-title">👨‍🎓 {classroom?.name}</div>
              <div className="page-sub">จัดการรายชื่อนักเรียน</div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={downloadTemplate}>
                📥 ดาวน์โหลด Template
              </button>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                📤 นำเข้าจาก Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm({ name: '', student_code: '' }); setShowModal(true) }}>
                + เพิ่มนักเรียน
              </button>
            </div>
          </div>

          <div className="stats-bar">
            <div className="stat-pill">นักเรียนทั้งหมด <strong>{students.length} คน</strong></div>
          </div>

          <div className="toolbar">
            <input className="search-box" placeholder="ค้นหาชื่อหรือรหัสนักเรียน..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>รหัสนักเรียน</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>ยังไม่มีนักเรียน</td></tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td><span className="badge">{s.student_code}</span></td>
                      <td>{s.name}</td>
                      <td>
                        <button className="action-btn action-edit" onClick={() => openEdit(s)}>✏️ แก้ไข</button>
                        <button className="action-btn action-delete" onClick={() => handleDelete(s.id)}>🗑️ ลบ</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editItem ? '✏️ แก้ไขนักเรียน' : '👨‍🎓 เพิ่มนักเรียน'}</div>
            <div className="form-group">
              <label className="form-label">รหัสนักเรียน</label>
              <input className="form-input" placeholder="เช่น 6601001" value={form.student_code} onChange={e => setForm({ ...form, student_code: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">ชื่อ-นามสกุล</label>
              <input className="form-input" placeholder="เช่น นายสมชาย ใจดี" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleSave}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="import-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">📤 นำเข้าข้อมูลนักเรียน</div>
            <div className="import-preview">
              <p>พบข้อมูลนักเรียนทั้งหมด {importData.length} คน</p>
              <table className="import-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>รหัสนักเรียน</th>
                    <th>ชื่อ-นามสกุล</th>
                  </tr>
                </thead>
                <tbody>
                  {importData.map((student, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{student.student_code}</td>
                      <td>{student.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowImportModal(false)}>ยกเลิก</button>
              <button className="btn btn-primary" onClick={handleImport} disabled={importLoading}>
                {importLoading ? 'กำลังนำเข้า...' : 'ยืนยันการนำเข้า'}
              </button>
            </div>
          </div>
        </div>
      )}

      {importResult && (
        <div className="modal-overlay" onClick={() => setImportResult(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✅ นำเข้าข้อมูลเสร็จสิ้น</div>
            <div className={`import-result ${importResult.skipped > 0 ? 'warning' : 'success'}`}>
              <p>นำเข้าสำเร็จ: {importResult.success} คน</p>
              {importResult.skipped > 0 && <p>ข้าม (รหัสซ้ำ): {importResult.skipped} คน</p>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setImportResult(null)}>ตกลง</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}