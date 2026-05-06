import { Suspense } from 'react'
import { getDashboardStats } from '@/lib/actions/admin'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/db'
import {
  Users, FileCheck, GraduationCap, XCircle,
  BarChart3
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard Admin' }

function StatCard({
  label, value, icon: Icon, color, sub
}: { label: string; value: number | string; icon: any; color: string; sub?: string }) {
  return (
    <div className="card flex items-center gap-4 p-5 hover:shadow-soft transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { status?: string; prodi?: string; q?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { full_name: true, role: true }
  })

  const stats = await getDashboardStats()

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ─ Page Title ─ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Pendaftaran PPDS</h1>
            <p className="text-slate-500 text-sm mt-1">
              Pantau statistik pendaftaran Program Pendidikan Dokter Spesialis FK UNAND.
            </p>
          </div>
        </div>

        {/* ─ Stats Cards ─ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Pendaftar" value={stats?.total_pendaftar ?? 0}
            icon={Users} color="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Menunggu Verifikasi" value={stats?.menunggu_verifikasi ?? 0}
            icon={FileCheck} color="bg-amber-50 text-amber-600"
            sub="submitted + verifikasi"
          />
          <StatCard
            label="Lulus Final" value={stats?.lulus_final ?? 0}
            icon={GraduationCap} color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Tidak Lulus" value={stats?.ditolak ?? 0}
            icon={XCircle} color="bg-rose-50 text-rose-600"
          />
        </div>

        {/* ─ Status Distribution ─ */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-700">Distribusi Status Pendaftaran</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Draft',                 key: 'draft',                  color: 'bg-slate-300'    },
              { label: 'Submitted',             key: 'submitted',              color: 'bg-blue-400'     },
              { label: 'Verifikasi Berkas',     key: 'verifikasi_berkas',      color: 'bg-sky-400'      },
              { label: 'Verifikasi Pembayaran', key: 'verifikasi_pembayaran',  color: 'bg-amber-400'    },
              { label: 'Lulus Administrasi',    key: 'lulus_administrasi',     color: 'bg-teal-400'     },
              { label: 'Lulus Ujian',           key: 'lulus_ujian',            color: 'bg-emerald-400'  },
              { label: 'Lulus Final',           key: 'lulus_final',            color: 'bg-emerald-600'  },
              { label: 'Tidak Lulus',           key: 'ditolak',                color: 'bg-rose-400'     },
            ].map(({ label, key, color }) => {
              const count = (stats as any)?.[key] ?? 0
              const total = stats?.total_pendaftar || 1
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-44 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 w-6 text-right">{count}</span>
                  <span className="text-xs text-slate-400 w-8">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}
