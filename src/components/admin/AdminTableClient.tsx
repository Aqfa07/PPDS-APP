'use client'
import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { updateStatusPendaftar } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { StatusPendaftaran } from '@/lib/validations/schemas'

interface Props {
  initialData:  any[]
  initialCount: number
  searchParams: { status?: string; prodi?: string; q?: string; page?: string }
  prodiList:   { id: string; nama_prodi: string; nama_singkat: string; kode_prodi: string }[]
}

const STATUS_OPTIONS = [
  { value: '',                       label: 'Semua Status' },
  { value: 'draft',                  label: 'Draft' },
  { value: 'submitted',              label: 'Submitted' },
  { value: 'verifikasi_berkas',      label: 'Verifikasi Berkas' },
  { value: 'verifikasi_pembayaran',  label: 'Verifikasi Pembayaran' },
  { value: 'lulus_administrasi',     label: 'Lulus Administrasi' },
  { value: 'lulus_ujian',            label: 'Lulus Ujian' },
  { value: 'lulus_final',            label: 'Lulus Final' },
  { value: 'ditolak',                label: 'Tidak Lulus' },
]

export function AdminTableClient({ initialData, initialCount, searchParams, prodiList }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()
  const [updating, startUpdate] = useTransition()
  const [data,  setData]  = useState(initialData)
  const [count, setCount] = useState(initialCount)

  const currentPage = parseInt(searchParams.page ?? '1')
  const limit       = 20
  const totalPages  = Math.ceil(count / limit)

  const updateParam = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString())
    if (value) sp.set(key, value)
    else        sp.delete(key)
    sp.delete('page')
    router.push(`${pathname}?${sp.toString()}`)
  }

  const handleUpdateStatus = (id: string, status: StatusPendaftaran) => {
    startUpdate(async () => {
      const result = await updateStatusPendaftar(id, status)
      if (result.error) { toast.error(result.error); return }
      toast.success('Status berhasil diperbarui')
      // Update local state optimistically
      setData(prev => prev.map(p => p.id === id ? { ...p, status } : p))
    })
  }

  return (
    <div className="space-y-4">
      {/* ─ Filter Bar ─ */}
      <div className="card-flat flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-pendaftar"
            type="text"
            defaultValue={searchParams.q}
            placeholder="Cari nama atau nomor pendaftaran…"
            className="input-field pl-9 py-2 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('q', e.currentTarget.value)
            }}
          />
        </div>

        <select
          id="filter-status"
          defaultValue={searchParams.status ?? ''}
          onChange={(e) => updateParam('status', e.target.value)}
          className="input-field w-auto py-2 text-sm"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          id="filter-prodi"
          defaultValue={searchParams.prodi ?? ''}
          onChange={(e) => updateParam('prodi', e.target.value)}
          className="input-field w-auto py-2 text-sm"
        >
          <option value="">Semua Prodi</option>
          {prodiList.map(p => (
            <option key={p.id} value={p.id}>{p.nama_singkat ?? p.nama_prodi}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">{count} pendaftar</span>
      </div>

      {/* ─ Table ─ */}
      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-slate-100 bg-white shadow-soft-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['No. Pendaftaran', 'Nama Peserta', 'Program Studi', 'Status', 'Tgl. Daftar', 'Dokumen', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-slate-500">Tidak ada data pendaftar</p>
                    <p className="text-xs">Coba ubah filter pencarian</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((p: any, idx: number) => {
                const dokLen   = p.dokumen_peserta?.length ?? 0
                const validDok = p.dokumen_peserta?.filter((d: any) => d.status_validasi === 'valid').length ?? 0

                return (
                  <tr
                    key={p.id}
                    className={`border-b border-slate-50 hover:bg-emerald-50/30 transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {p.nomor_pendaftaran
                        ? <span className="bg-slate-100 px-1.5 py-0.5 rounded">{p.nomor_pendaftaran}</span>
                        : <span className="text-slate-300">-</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700 truncate max-w-[180px]">
                        {p.profiles?.full_name ?? '-'}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">{p.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {p.program_studi?.nama_singkat ?? p.program_studi?.nama_prodi ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className={`text-xs font-bold ${validDok > 0 && validDok === dokLen ? 'text-emerald-600' : dokLen > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                          {validDok}/{dokLen}
                        </div>
                        <span className="text-xs text-slate-400">valid</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/admin/dashboard/${p.id}`}
                          id={`btn-view-${p.id}`}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </Link>
                        {(p.status === 'submitted' || p.status === 'verifikasi_berkas') && (
                          <>
                            <button
                              id={`btn-approve-${p.id}`} disabled={updating} onClick={() => handleUpdateStatus(p.id, 'lulus_administrasi')}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lulus Adm
                            </button>
                            <button
                              id={`btn-reject-${p.id}`} disabled={updating} onClick={() => handleUpdateStatus(p.id, 'ditolak')}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors font-medium disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </>
                        )}
                        {p.status === 'lulus_administrasi' && (
                          <>
                            <button
                              id={`btn-approve-ujian-${p.id}`} disabled={updating} onClick={() => handleUpdateStatus(p.id, 'lulus_ujian')}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lulus Ujian
                            </button>
                            <button
                              id={`btn-reject-ujian-${p.id}`} disabled={updating} onClick={() => handleUpdateStatus(p.id, 'ditolak')}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors font-medium disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </>
                        )}
                        {p.status === 'lulus_ujian' && (
                          <>
                            <button
                              id={`btn-approve-final-${p.id}`} disabled={updating} onClick={() => handleUpdateStatus(p.id, 'lulus_final')}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lulus Final
                            </button>
                            <button
                              id={`btn-reject-final-${p.id}`} disabled={updating} onClick={() => handleUpdateStatus(p.id, 'ditolak')}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors font-medium disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─ Pagination ─ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> · {count} total pendaftar
          </p>
          <div className="flex gap-2">
            <button
              id="btn-prev-page"
              disabled={currentPage <= 1}
              onClick={() => updateParam('page', String(currentPage - 1))}
              className="btn-secondary py-2 px-3 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-next-page"
              disabled={currentPage >= totalPages}
              onClick={() => updateParam('page', String(currentPage + 1))}
              className="btn-secondary py-2 px-3 text-xs disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
