# Presensi Online — Frontend (Next.js + Tailwind v4)

Web presensi sederhana **tanpa backend**. Data disimpan di **localStorage**.

## Cara Menjalankan

```bash
npm run dev
# buka http://localhost:3000
```

Memakai Tailwind v4  `app/globals.css`:

```css
@import "tailwindcss/preflight";
@import "tailwindcss/utilities";
```

## Login

* Admin: `admin@mail.com / 123456`
* Member: `budi@mail.com / 123456`

## Cara Pakai 

1. **Login** menggunakan salah satu akun yang telah saya sediakan.
2. **Presensi**: isi Catatan (opsional) → klik **Check-in** lalu **Check-out** (1x per hari).
3. **Riwayat**: lihat daftar presensi; Admin bisa filter per pengguna.
4. **Pengguna**:

   * **Admin**: tambah/hapus user.
   * **Siswa**: Presensi
5. **Analisis**: pilih **rentang tanggal** (dan Siswa untuk Admin) untuk melihat:

   * total hari hadir,
   * **% kehadiran**,
   * rata-rata jam **check-in** dan **check-out**.

## Fitur Utama

* **Autentikasi & Otorisasi** (role Admin/Siswa)
* **Kelola Data Pengguna** (create/-)
* **Pencatatan Presensi** (check-in/out)
* **Riwayat Presensi** per pengguna
* **Analisis Kehadiran** (persentase & rata-rata jam)

## Catatan

* Tidak ada keamanan.
* Untuk myempurnakan web: dibutuhkannya bantuan dari backend (API, DB, JWT).
