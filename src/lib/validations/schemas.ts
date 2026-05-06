import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export const RegisterSchema = z.object({
  email:     z.string().email('Format email tidak valid'),
  password:  z.string().min(8, 'Password minimal 8 karakter'),
  full_name: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100),
})

// ─── Biodata ──────────────────────────────────────────────────
export const BiodataSchema = z.object({
  nik:             z.string().length(16, 'NIK harus tepat 16 digit').regex(/^\d+$/, 'NIK hanya angka'),
  nama_lengkap:    z.string().min(3, 'Nama minimal 3 karakter').max(100),
  tempat_lahir:    z.string().min(2, 'Tempat lahir wajib diisi'),
  tanggal_lahir:   z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenis_kelamin:   z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin' }),
  no_hp:           z.string().regex(/^08[0-9]{8,11}$/, 'Format: 08xxxxxxxxxx'),
  alamat:          z.string().min(10, 'Alamat minimal 10 karakter'),
  provinsi:        z.string().min(2),
  kota:            z.string().min(2),
  kode_pos:        z.string().length(5, 'Kode pos 5 digit').regex(/^\d+$/),
  asal_institusi:  z.string().min(5, 'Nama institusi minimal 5 karakter'),
  gelar_depan:     z.string().optional(),
  gelar_belakang:  z.string().optional(),
  no_str:          z.string().optional(),
  masa_berlaku_str:z.string().optional(),
})

// ─── Prodi Selection ──────────────────────────────────────────
export const ProdiSchema = z.object({
  program_studi_id: z.string().uuid('Pilih program studi'),
})

// ─── Dokumen Upload ───────────────────────────────────────────
export const DokumenUploadSchema = z.object({
  jenis_dokumen: z.enum([
    'KTP', 'IJAZAH_PROFESI', 'TRANSKRIP_NILAI', 'STR',
    'SURAT_REKOMENDASI', 'SURAT_IZIN_INSTITUSI', 'FOTO',
    'BUKTI_BAYAR', 'DOKUMEN_LAINNYA'
  ]),
  file: z.instanceof(File, { message: 'File wajib dipilih' })
    .refine(f => f.type === 'application/pdf', 'Hanya file PDF yang diizinkan')
    .refine(f => f.size <= 2 * 1024 * 1024, 'Ukuran file maksimal 2MB'),
})

// ─── Types ────────────────────────────────────────────────────
export type LoginInput     = z.infer<typeof LoginSchema>
export type RegisterInput  = z.infer<typeof RegisterSchema>
export type BiodataInput   = z.infer<typeof BiodataSchema>
export type ProdiInput     = z.infer<typeof ProdiSchema>
export type DokumenInput   = z.infer<typeof DokumenUploadSchema>

export type StatusPendaftaran =
  | 'draft' | 'submitted' | 'verifikasi_berkas' | 'verifikasi_pembayaran'
  | 'lulus_administrasi' | 'lulus_ujian' | 'lulus_final' | 'ditolak'

export type JenisDokumen =
  | 'KTP' | 'IJAZAH_PROFESI' | 'TRANSKRIP_NILAI' | 'STR'
  | 'SURAT_REKOMENDASI' | 'SURAT_IZIN_INSTITUSI' | 'FOTO'
  | 'BUKTI_BAYAR' | 'DOKUMEN_LAINNYA'
