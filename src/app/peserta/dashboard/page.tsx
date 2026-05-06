import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPendaftaranByUser } from '@/lib/actions/pendaftaran'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate } from '@/lib/utils'
import {
  Stethoscope, FileText, Clock, CheckCircle2,
  PlusCircle, LogOut, User, ChevronRight, AlertCircle
} from 'lucide-react'
import { CancelDraftButton } from '@/components/registration/CancelDraftButton'
import { PengumumanReveal } from '@/components/registration/PengumumanReveal'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Peserta' }

export default async function PesertaDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { full_name: true, email: true, avatar_url: true }
  })

  const pendaftaranList = await getPendaftaranByUser()
  const pendaftaran = pendaftaranList?.[0] ?? null

  const dokumenValid = pendaftaran?.dokumen_peserta?.filter(
    (d: any) => d.status_validasi === 'valid'
  ).length ?? 0
  const dokumenTotal = pendaftaran?.dokumen_peserta?.length ?? 0

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ─ Welcome ─ */}
        <div className="animate-in">
          <h1 className="text-2xl font-bold text-slate-800">
            Selamat datang, <span className="text-emerald-600">{profile?.full_name ?? 'Dokter'}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau status pendaftaran PPDS Anda di sini.
          </p>
        </div>

        {(!profile?.full_name || !profile?.avatar_url) && !pendaftaran && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Profil Anda Belum Lengkap</h3>
              <p className="text-sm text-amber-700 mt-1">
                Sangat disarankan untuk melengkapi Foto Profil dan Nama Lengkap Anda sebelum memulai pendaftaran.
              </p>
              <Link href="/peserta/settings" className="inline-block mt-3 text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors">
                Lengkapi Profil Sekarang
              </Link>
            </div>
          </div>
        )}

        {/* ─ Status Pendaftaran ─ */}
        {pendaftaran ? (
          <div className="space-y-4 animate-in">
            {/* Reveal Pengumuman Final */}
            {['lulus_administrasi', 'lulus_ujian', 'lulus_final', 'ditolak'].includes(pendaftaran.status) && (
              <PengumumanReveal 
                status={pendaftaran.status} 
                prodiName={(pendaftaran as any).program_studi?.nama_prodi ?? 'Program Studi'} 
              />
            )}

            {/* Status Card */}
            <div className="card border-l-4 border-l-emerald-500">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={pendaftaran.status} />
                    {pendaftaran.nomor_pendaftaran && (
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {pendaftaran.nomor_pendaftaran}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {(pendaftaran as any).program_studi?.nama_prodi ?? 'Program Studi'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Didaftarkan {formatDate(pendaftaran.created_at.toISOString())}
                  </p>
                  {pendaftaran.catatan_admin && (
                    <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">{pendaftaran.catatan_admin}</p>
                    </div>
                  )}
                </div>

                {pendaftaran.status === 'draft' && (
                  <div className="flex flex-col gap-2 items-end">
                    <Link href="/peserta/daftar" className="btn-primary text-sm whitespace-nowrap justify-center">
                      Lanjutkan <ChevronRight className="w-4 h-4" />
                    </Link>
                    <CancelDraftButton pendaftaranId={pendaftaran.id} />
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Status */}
            <div className="card">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Alur Seleksi</h3>
              <div className="space-y-3">
                {[
                  { label: 'Pendaftaran Dibuat',       status: 'draft',                  done: true  },
                  { label: 'Formulir Disubmit',        status: 'submitted',              done: ['submitted','verifikasi_berkas','verifikasi_pembayaran','lulus_administrasi','lulus_ujian','lulus_final'].includes(pendaftaran.status) },
                  { label: 'Verifikasi Berkas',        status: 'verifikasi_berkas',      done: ['verifikasi_berkas','verifikasi_pembayaran','lulus_administrasi','lulus_ujian','lulus_final'].includes(pendaftaran.status) },
                  { label: 'Verifikasi Pembayaran',    status: 'verifikasi_pembayaran',  done: ['verifikasi_pembayaran','lulus_administrasi','lulus_ujian','lulus_final'].includes(pendaftaran.status) },
                  { label: 'Lulus Administrasi',       status: 'lulus_administrasi',     done: ['lulus_administrasi','lulus_ujian','lulus_final'].includes(pendaftaran.status) },
                  { label: 'Lulus Ujian',              status: 'lulus_ujian',            done: ['lulus_ujian','lulus_final'].includes(pendaftaran.status) },
                  { label: 'Lulus Final ✓',            status: 'lulus_final',            done: pendaftaran.status === 'lulus_final' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      step.done ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}>
                      {step.done
                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                        : <span className="w-2 h-2 rounded-full bg-slate-400" />
                      }
                    </div>
                    <span className={`text-sm ${step.done ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dokumen */}
            {dokumenTotal > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Dokumen Diunggah</h3>
                  <span className={`text-sm font-bold ${dokumenValid === dokumenTotal ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {dokumenValid}/{dokumenTotal} valid
                  </span>
                </div>
                <div className="space-y-2">
                  {pendaftaran.dokumen_peserta?.map((dok: any) => (
                    <div key={dok.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{dok.jenis_dokumen.replace(/_/g, ' ')}</span>
                      </div>
                      <StatusBadge
                        status={dok.status_validasi === 'valid' ? 'lulus_final'
                               : dok.status_validasi === 'ditolak' ? 'ditolak'
                               : 'submitted'}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
                {pendaftaran.status === 'draft' && (
                  <Link href="/peserta/daftar" className="btn-secondary w-full mt-3 text-sm justify-center">
                    Lengkapi Dokumen
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Belum ada pendaftaran */
          <div className="card text-center py-12 animate-in">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Pendaftaran</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Anda belum memiliki pendaftaran PPDS aktif. Mulai proses pendaftaran sekarang untuk mengajukan lamaran ke program spesialisasi pilihan Anda.
            </p>
            <Link href="/peserta/daftar" id="btn-mulai-daftar" className="btn-primary inline-flex">
              <PlusCircle className="w-4 h-4" />
              Mulai Pendaftaran
            </Link>
          </div>
        )}

        {/* ─ Info Penting ─ */}
        <div className="card bg-emerald-50 border-emerald-100 animate-in">
          <h3 className="font-semibold text-emerald-800 text-sm mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Informasi Pendaftaran
          </h3>
          <ul className="text-sm text-emerald-700 space-y-1 list-disc list-inside">
            <li>Periode pendaftaran: <strong>1 Januari – 31 Maret 2025</strong></li>
            <li>Dokumen wajib: KTP, Ijazah Profesi, STR, Surat Rekomendasi, Bukti Bayar</li>
            <li>Format dokumen: PDF, maksimal 2MB per file</li>
            <li>Biaya pendaftaran: <strong>Rp 500.000</strong></li>
          </ul>
        </div>
      </main>
    </div>
  )
}
