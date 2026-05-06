import { Suspense } from 'react'
import { getProgramStudiList } from '@/lib/actions/admin'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { ExportButton } from '@/components/admin/ExportButton'
import { AdminTableServer } from '@/components/admin/AdminTableServer'
import { ClipboardList } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Data Pendaftar PPDS' }

export default async function AdminPendaftarPage({
  searchParams,
}: {
  searchParams: { status?: string; prodi?: string; q?: string; page?: string }
}) {
  const prodiList = await getProgramStudiList()

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ─ Page Title ─ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-emerald-600" />
              Data Pendaftar PPDS
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola, verifikasi, dan pantau status seluruh pendaftar.
            </p>
          </div>
          <ExportButton
            status={searchParams.status as any}
            program_studi_id={searchParams.prodi}
          />
        </div>

        {/* ─ Data Table ─ */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Suspense fallback={<TableSkeleton rows={10} />}>
            <AdminTableServer
              searchParams={searchParams}
              prodiList={prodiList}
            />
          </Suspense>
        </section>
      </main>
    </div>
  )
}
