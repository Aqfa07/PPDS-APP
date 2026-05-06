import { getPendaftarById } from '@/lib/actions/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, User, MapPin, Building, GraduationCap, Calendar, Download } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DokumenAction } from '@/components/admin/DokumenAction'
import { formatDate } from '@/lib/utils'

export default async function PendaftarDetail({ params }: { params: { id: string } }) {
  const pendaftar = await getPendaftarById(params.id)
  
  if (!pendaftar) {
    redirect('/admin/dashboard')
  }

  const bio = pendaftar.biodata_peserta

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <Link href="/admin/dashboard" className="btn-secondary px-2">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Detail Pendaftar
            <StatusBadge status={pendaftar.status} />
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {pendaftar.nomor_pendaftaran ?? 'Draft'} • {pendaftar.program_studi?.nama_prodi}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Biodata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Informasi Pribadi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Nama Lengkap</span>
                <span className="font-semibold text-slate-700">{bio?.nama_lengkap ?? '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">NIK</span>
                <span className="font-medium text-slate-700">{bio?.nik ?? '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Tempat, Tanggal Lahir</span>
                <span className="text-slate-700">
                  {bio?.tempat_lahir ?? '-'}, {bio?.tanggal_lahir ? formatDate(bio.tanggal_lahir) : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Jenis Kelamin</span>
                <span className="text-slate-700">{bio?.jenis_kelamin === 'L' ? 'Laki-laki' : bio?.jenis_kelamin === 'P' ? 'Perempuan' : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Gelar</span>
                <span className="text-slate-700">{bio?.gelar_depan} {bio?.nama_lengkap} {bio?.gelar_belakang}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" /> Kontak & Alamat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Email</span>
                <span className="text-slate-700">{pendaftar.profiles?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">No. HP</span>
                <span className="text-slate-700">{bio?.no_hp ?? '-'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 block text-xs mb-0.5">Alamat Lengkap</span>
                <span className="text-slate-700">{bio?.alamat ?? '-'}, {bio?.kota ?? '-'}, {bio?.provinsi ?? '-'} {bio?.kode_pos}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" /> Institusi & Profesi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Asal Institusi</span>
                <span className="font-medium text-slate-700">{bio?.asal_institusi ?? '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs mb-0.5">Nomor STR</span>
                <span className="text-slate-700">{bio?.no_str ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Dokumen */}
        <div className="space-y-6">
          <div className="card bg-slate-50 border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Dokumen Peserta
            </h2>
            
            {!pendaftar.dokumen_peserta || pendaftar.dokumen_peserta.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Belum ada dokumen yang diunggah.</p>
            ) : (
              <div className="space-y-3">
                {pendaftar.dokumen_peserta.map((doc: any) => (
                  <div key={doc.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{doc.jenis_dokumen.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={doc.nama_file}>
                          {doc.nama_file} ({(doc.ukuran_file / 1024).toFixed(0)} KB)
                        </p>
                      </div>
                      {doc.signed_url ? (
                        <a href={doc.signed_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                          <Download className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-rose-500">URL Expired</span>
                      )}
                    </div>
                    
                    {/* Validasi Action */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-50">
                      <span className="text-[10px] text-slate-400">Validasi:</span>
                      <DokumenAction dokumenId={doc.id} currentStatus={doc.status_validasi} />
                    </div>
                    {doc.catatan_validasi && (
                      <p className="text-[10px] text-rose-600 bg-rose-50 p-1.5 rounded mt-1">
                        Catatan: {doc.catatan_validasi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
