# Portal Pendaftaran PPDS FK UNAND 🏥

Aplikasi web modern untuk manajemen pendaftaran Program Pendidikan Dokter Spesialis (PPDS) Fakultas Kedokteran Universitas Andalas. Aplikasi ini dirancang untuk mendigitalisasi proses pendaftaran, pemberkasan, dan seleksi calon peserta spesialis.

## ✨ Fitur Utama

### 🎓 Portal Peserta (Calon Dokter Spesialis)
- **Autentikasi Aman:** Sistem registrasi dan login yang aman.
- **Profil Peserta:** Manajemen biodata lengkap (Pendidikan, Pekerjaan, Alamat).
- **Pengajuan Pendaftaran:** Form pendaftaran program studi pilihan yang dinamis.
- **Manajemen Dokumen (PDF):** Unggah dokumen persyaratan wajib (Ijazah, STR, Rekomendasi, Bukti Bayar) langsung ke Cloud.
- **Live Tracking:** Melacak status pendaftaran dan validasi berkas secara *real-time* (Draft ➔ Submitted ➔ Lulus/Ditolak).

### 🛡️ Portal Admin (Prodi & Fakultas)
- **Dashboard Analitik:** Statistik pendaftar dan distribusi status pendaftaran.
- **Verifikasi Dokumen:** Admin dapat melihat PDF secara langsung dan memberikan status *Valid/Tolak* dengan catatan.
- **Manajemen Status:** Memajukan status pendaftaran calon peserta ke tahap selanjutnya (Verifikasi Berkas ➔ Lulus Administrasi ➔ Lulus Ujian ➔ Lulus Final).
- **Audit Log:** Riwayat perubahan status pendaftaran dan aktivitas admin terarsip otomatis.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Aplikasi ini menggunakan teknologi web modern untuk menjamin kecepatan, skalabilitas, dan keamanan:

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Authentication:** [NextAuth.js v4](https://next-auth.js.org/) (Credentials Provider dengan bcryptjs)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Provider:** [Neon.tech](https://neon.tech/) (Serverless PostgreSQL)
- **File Storage:** [Cloudinary](https://cloudinary.com/) (Penyimpanan persisten untuk Dokumen PDF dan Foto Profil)

> *Catatan: Aplikasi ini sebelumnya menggunakan arsitektur Supabase (BaaS), namun telah dimigrasi sepenuhnya ke arsitektur mandiri (Neon + Prisma + Cloudinary) untuk mencegah isu auto-pause pada serverless database.*

---

## 🚀 Panduan Instalasi Lokal

Jika Anda ingin menjalankan aplikasi ini di komputer lokal, ikuti langkah-langkah berikut:

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME-ANDA/NAMA-REPO-ANDA.git
cd ppds-fk-unand
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root folder dan isi dengan kredensial berikut:

```env
# Database (Dapatkan dari Dashboard Neon.tech)
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="buat-string-rahasia-acak-disini"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (Dapatkan dari Dashboard Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Sinkronisasi Database & Seeding
Jalankan perintah ini untuk membuat tabel-tabel di database Neon Anda dan mengisi data awal (Admin & Program Studi):

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```

Buka `http://localhost:3000` di browser Anda.

---

## 🔑 Akun Uji Coba (Testing)

Anda dapat menggunakan akun berikut untuk mendemonstrasikan sistem sebagai Admin:

**Admin Program Studi:**
- Email: `admin.prodi@fk.unand.ac.id`
- Password: `admin123`

**Admin Fakultas:**
- Email: `admin.fakultas@fk.unand.ac.id`
- Password: `admin123`

Untuk mengetes sebagai peserta, silakan melakukan registrasi (Sign Up) layaknya pengguna baru.

---

## 📝 Lisensi

Dikembangkan sebagai *Showcase Portfolio*. Segala merek dagang (FK UNAND) yang ada pada proyek ini hanya untuk keperluan demonstrasi sistem perangkat lunak, tidak terafiliasi secara resmi dengan Universitas Andalas.
