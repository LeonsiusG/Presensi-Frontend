'use client'

import { useEffect, useMemo, useState } from 'react'

/* ======================== Types ======================== */
type Role = 'ADMIN' | 'SISWA'

type Siswa = {
  id: string
  name: string
  email: string
  password: string
  role?: Role
  nis?: string
  kelas?: string
  createdAt?: string
}

type Attendance = {
  id: string
  userId: string   // id Siswa
  date: string
  checkInAt?: string
  checkOutAt?: string
  checkInNote?: string
  checkOutNote?: string
  latitude?: number
  longitude?: number
  createdAt?: string
}

/* ======================== LocalStorage ======================== */
const LS_SISWA = 'presensi_siswa'
const LS_ATTS = 'presensi_attendances'
const LS_SESSION = 'presensi_session'

/* ======================== Utils ======================== */
const uid = (p='id') => `${p}_${Math.random().toString(36).slice(2,10)}`
const todayYMD = (d=new Date()) => {
  const z = new Date(d); z.setHours(0,0,0,0)
  const y = z.getFullYear(); const m = String(z.getMonth()+1).padStart(2,'0'); const dd = String(z.getDate()).padStart(2,'0')
  return `${y}-${m}-${dd}`
}

function loadSiswa(): Siswa[] { if (typeof window==='undefined') return []; const r = localStorage.getItem(LS_SISWA); return r ? JSON.parse(r) : [] }
function saveSiswa(v: Siswa[]) { localStorage.setItem(LS_SISWA, JSON.stringify(v)) }
function loadAtts(): Attendance[] { if (typeof window==='undefined') return []; const r = localStorage.getItem(LS_ATTS); return r ? JSON.parse(r) : [] }
function saveAtts(v: Attendance[]) { localStorage.setItem(LS_ATTS, JSON.stringify(v)) }
function loadSession(): Siswa | null { if (typeof window==='undefined') return null; const r = localStorage.getItem(LS_SESSION); return r ? JSON.parse(r) : null }
function saveSession(v: Siswa | null) { if (!v) localStorage.removeItem(LS_SESSION); else localStorage.setItem(LS_SESSION, JSON.stringify(v)) }

/* ======================== Seed Awal ======================== */
function ensureSeed() {
  const s = loadSiswa()
  if (s.length === 0) {
    saveSiswa([
      { id: uid('usr'), name: 'Admin', email: 'admin@sekolah.sch.id', password: '123456', role: 'ADMIN', createdAt: new Date().toISOString() },
      { id: uid('usr'), name: 'Budi Santoso', email: 'budi@sekolah.sch.id', password: '123456', role: 'SISWA', nis: '2024001', kelas: 'XII IPA 2', createdAt: new Date().toISOString() },
    ])
  }
  if (loadAtts().length === 0) saveAtts([])
}

/* ======================== Page ======================== */
export default function Page() {
  const [siswa, setSiswa] = useState<Siswa[]>([])
  const [atts, setAtts] = useState<Attendance[]>([])
  const [me, setMe] = useState<Siswa | null>(null)

  useEffect(() => { ensureSeed(); setSiswa(loadSiswa()); setAtts(loadAtts()); setMe(loadSession()) }, [])
  useEffect(() => { if (siswa.length) saveSiswa(siswa) }, [siswa])
  useEffect(() => { saveAtts(atts) }, [atts])
  useEffect(() => { saveSession(me) }, [me])

  if (!me) return <Login siswa={siswa} onLogin={setMe} />

  return (
    <div className="min-h-screen">
      <Header me={me} onLogout={() => setMe(null)} />

      <main className="mx-auto max-w-5xl p-4 space-y-6">
        <Welcome me={me} />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card title="Presensi Hari Ini">
              <CheckInOut me={me} atts={atts} setAtts={setAtts} />
            </Card>
            <Card title="Riwayat Presensi">
              <AttendanceTable me={me} siswa={siswa} atts={atts} />
            </Card>
          </div>

          {me.role === 'ADMIN' && (
            <div className="md:col-span-1">
              <Card title="Kelola Siswa (Admin)">
                <AdminSiswa siswa={siswa} setSiswa={setSiswa} />
              </Card>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-white/60">Selamat Berjuang! Sukses👍</footer>
    </div>
  )
}

/* ======================== UI helpers ======================== */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-(--card) shadow-lg shadow-black/30 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 text-white/90 font-semibold">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Header({ me, onLogout }: { me: Siswa; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-backdrop-filter:bg-black/20 bg-black/10 border-b border-white/10">
      <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg md:text-xl font-semibold">Presensi Sekolah</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5">Frontend</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5">{me.name}</span>
          <button onClick={onLogout} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 border border-white/10 bg-white/5 hover:bg-white/10">Keluar</button>
        </div>
      </div>
    </header>
  )
}

function Welcome({ me }: { me: Siswa }) {
  const now = new Date()
  const greet = now.getHours() < 12 ? 'Selamat pagi' : now.getHours() < 18 ? 'Selamat siang' : 'Selamat malam'
  return (
    <div className="rounded-2xl border border-white/10 bg-(--card) shadow-lg shadow-black/30 p-4 flex items-center justify-between">
      <div>
        <div className="text-lg font-semibold">{greet}, {me.name}</div>
        <div className="text-sm text-white/70">
          {new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(now)}
        </div>
      </div>
      <div className="text-right text-xs text-white/60">
        {me.role === 'SISWA' ? (
          <>
            <div>NIS: {me.nis || '-'}</div>
            <div>Kelas: {me.kelas || '-'}</div>
          </>
        ) : (
          <div>Admin • {me.email}</div>
        )}
      </div>
    </div>
  )
}

/* ======================== Auth (Login) ======================== */
function Login({ siswa, onLogin }: { siswa: Siswa[]; onLogin: (u: Siswa) => void }) {
  const [email, setEmail] = useState('admin@sekolah.sch.id')
  const [password, setPassword] = useState('123456')
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const found = siswa.find(u => u.email === email && u.password === password)
    if (!found) return setErr('Email atau password salah')
    onLogin(found)
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-(--card) shadow-lg shadow-black/30 p-5">
        <div className="text-center mb-4">
          <div className="text-xl font-semibold">Presensi Sekolah</div>
          <div className="text-xs text-white/70 mt-1">Frontend (LocalStorage)</div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div className="text-sm text-red-300">{err}</div>}
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 bg-(--brand) text-black hover:brightness-95 active:scale-[.98] shadow-md">Masuk</button>
        </form>
        <div className="text-xs text-white/60 mt-3">
          Demo: <b>admin@sekolah.sch.id/123456</b> atau <b>budi@sekolah.sch.id/123456</b>
        </div>
      </div>
    </div>
  )
}

/* ======================== Presensi ======================== */
function CheckInOut({ me, atts, setAtts }: { me: Siswa; atts: Attendance[]; setAtts: (v: Attendance[]) => void }) {
  const [noteIn, setNoteIn] = useState('')
  const [noteOut, setNoteOut] = useState('')

  const today = todayYMD()
  const myToday = useMemo(() => atts.find(a => a.userId === me.id && a.date === today), [atts, me.id, today])

  const canIn = !myToday || !myToday.checkInAt
  const canOut = !!myToday?.checkInAt && !myToday?.checkOutAt

  const doIn = async () => {
    let coords: { latitude?: number; longitude?: number } = {}
    if (navigator.geolocation) {
      try {
        coords = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve({})
          )
        })
      } catch {}
    }
    const now = new Date().toISOString()
    const existing = atts.find(a => a.userId === me.id && a.date === today)
    if (existing && existing.checkInAt) return alert('Sudah absen masuk hari ini')

    let next: Attendance[]
    if (existing) {
      next = atts.map(a => a.id === existing.id ? { ...a, checkInAt: now, checkInNote: noteIn, ...coords } : a)
    } else {
      next = [...atts, { id: uid('att'), userId: me.id, date: today, checkInAt: now, checkInNote: noteIn, ...coords, createdAt: now }]
    }
    setAtts(next)
    setNoteIn('')
  }

  const doOut = () => {
    if (!myToday?.checkInAt) return alert('Silakan absen masuk dulu')
    if (myToday?.checkOutAt) return alert('Sudah absen pulang')
    const now = new Date().toISOString()
    setAtts(atts.map(a => a.id === myToday.id ? { ...a, checkOutAt: now, checkOutNote: noteOut } : a))
    setNoteOut('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Catatan masuk (opsional)" value={noteIn} onChange={e=>setNoteIn(e.target.value)} />
        <button disabled={!canIn} onClick={doIn}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${canIn ? 'bg-(--brand) text-black hover:brightness-95' : 'opacity-50 cursor-not-allowed border border-white/10 bg-white/10 text-white'}`}>
          Absen Masuk
        </button>
      </div>

      <div className="flex gap-2">
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Catatan pulang (opsional)" value={noteOut} onChange={e=>setNoteOut(e.target.value)} />
        <button disabled={!canOut} onClick={doOut}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${canOut ? 'border border-white/10 bg-white/5 hover:bg-white/10' : 'opacity-50 cursor-not-allowed border border-white/10 bg-white/10'}`}>
          Absen Pulang
        </button>
      </div>

      <div className="text-xs text-white/70">
        {myToday?.checkInAt ? <>Masuk: {new Date(myToday.checkInAt).toLocaleTimeString('id-ID')}</> : 'Belum absen masuk hari ini'}
        {myToday?.checkOutAt && <> • Pulang: {new Date(myToday.checkOutAt).toLocaleTimeString('id-ID')}</>}
      </div>
    </div>
  )
}

/* ======================== Tabel Riwayat ======================== */
function AttendanceTable({ me, siswa, atts }: { me: Siswa; siswa: Siswa[]; atts: Attendance[] }) {
  const [filterSiswa, setFilterSiswa] = useState<string>(me.role === 'ADMIN' ? 'all' : (me.id as string))
  const [search, setSearch] = useState('')

  useEffect(() => { if (me.role !== 'ADMIN') setFilterSiswa(me.id as string) }, [me])

  const rows = useMemo(() => {
    return atts
      .filter(a => (filterSiswa === 'all' ? true : a.userId === filterSiswa))
      .filter(a => {
        if (!search) return true
        const s = siswa.find(u => u.id === a.userId)
        const q = `${s?.name} ${s?.email} ${s?.nis ?? ''} ${s?.kelas ?? ''} ${a.checkInNote ?? ''} ${a.checkOutNote ?? ''}`.toLowerCase()
        return q.includes(search.toLowerCase())
      })
      .sort((a,b) => b.date.localeCompare(a.date))
  }, [atts, filterSiswa, search, siswa])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {me.role === 'ADMIN' && (
          <select value={filterSiswa} onChange={e=>setFilterSiswa(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none">
            <option value="all">Semua siswa</option>
            {siswa
              .filter(s => s.role === 'SISWA')
              .map(s => <option key={s.id} value={s.id}>{s.name} ({s.kelas || '-'})</option>)}
          </select>
        )}
        <input className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)"
               placeholder="Cari nama/NIS/kelas/catatan" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5">
              <th className="p-2 border-b border-white/10 text-left text-white/80">Tanggal</th>
              {me.role === 'ADMIN' && <th className="p-2 border-b border-white/10 text-left text-white/80">Siswa</th>}
              {me.role === 'ADMIN' && <th className="p-2 border-b border-white/10 text-left text-white/80">NIS / Kelas</th>}
              <th className="p-2 border-b border-white/10 text-left text-white/80">Masuk</th>
              <th className="p-2 border-b border-white/10 text-left text-white/80">Pulang</th>
              <th className="p-2 border-b border-white/10 text-left text-white/80">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const s = siswa.find(u => u.id === r.userId)
              return (
                <tr key={r.id} className="odd:bg-white/0 even:bg-white/[0.03]">
                  <td className="p-2 border-b border-white/5 text-white/90">{r.date}</td>
                  {me.role === 'ADMIN' && <td className="p-2 border-b border-white/5 text-white/90">{s?.name}</td>}
                  {me.role === 'ADMIN' && <td className="p-2 border-b border-white/5 text-white/90">{s?.nis || '-'} / {s?.kelas || '-'}</td>}
                  <td className="p-2 border-b border-white/5 text-white/90">{r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString('id-ID') : '-'}</td>
                  <td className="p-2 border-b border-white/5 text-white/90">{r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString('id-ID') : '-'}</td>
                  <td className="p-2 border-b border-white/5 text-white/90">
                    <div>Masuk: {r.checkInNote || '-'}</div>
                    <div>Pulang: {r.checkOutNote || '-'}</div>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr><td className="p-3 border-b border-white/5 text-center text-white/60" colSpan={me.role === 'ADMIN' ? 6 : 4}>Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ======================== Admin Kelola Siswa ======================== */
function AdminSiswa({ siswa, setSiswa }: { siswa: Siswa[]; setSiswa: (u: Siswa[]) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('123456')
  const [nis, setNis] = useState('')
  const [kelas, setKelas] = useState('X')
  const role: Role = 'SISWA'

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !nis) return alert('Nama, Email, dan NIS wajib diisi')
    if (siswa.some(s => s.email === email)) return alert('Email sudah digunakan')
    if (siswa.some(s => s.nis === nis)) return alert('NIS sudah digunakan')
    setSiswa([{ id: uid('usr'), name, email, password, role, nis, kelas, createdAt: new Date().toISOString() }, ...siswa])
    setName(''); setEmail(''); setPassword('123456'); setNis(''); setKelas('X')
  }

  const remove = (id: string) => {
    if (!confirm('Hapus siswa ini?')) return
    setSiswa(siswa.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="space-y-2">
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Nama Siswa" value={name} onChange={e=>setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="NIS" value={nis} onChange={e=>setNis(e.target.value)} />
          <input className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Kelas (mis. XII IPA 2)" value={kelas} onChange={e=>setKelas(e.target.value)} />
        </div>
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-(--ring)" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 bg-(--brand) text-black hover:brightness-95 active:scale-[.98] shadow-md">Tambah Siswa</button>
      </form>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-2 border-b border-white/10 text-white/80">Nama</th>
              <th className="p-2 border-b border-white/10 text-white/80">NIS</th>
              <th className="p-2 border-b border-white/10 text-white/80">Kelas</th>
              <th className="p-2 border-b border-white/10 text-white/80">Email</th>
              <th className="p-2 border-b border-white/10 text-white/80 w-20">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {siswa.filter(s=>s.role==='SISWA').map(s => (
              <tr key={s.id} className="odd:bg-white/0 even:bg-white/[0.03]">
                <td className="p-2 border-b border-white/5 text-white/90">{s.name}</td>
                <td className="p-2 border-b border-white/5 text-white/90">{s.nis}</td>
                <td className="p-2 border-b border-white/5 text-white/90">{s.kelas}</td>
                <td className="p-2 border-b border-white/5 text-white/90">{s.email}</td>
                <td className="p-2 border-b border-white/5">
                  <button onClick={() => remove(s.id)} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-1.5 text-sm border border-white/10 bg-white/5 hover:bg-white/10">Hapus</button>
                </td>
              </tr>
            ))}
            {siswa.filter(s=>s.role==='SISWA').length === 0 && (
              <tr><td className="p-3 border-b border-white/5 text-center text-white/60" colSpan={5}>Belum ada siswa</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

