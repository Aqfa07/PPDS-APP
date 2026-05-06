import type { StatusPendaftaran } from '@/lib/validations/schemas'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<StatusPendaftaran, { label: string; className: string; dot: string }> = {
  draft:                  { label: 'Draft',                  className: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400'   },
  submitted:              { label: 'Menunggu Verifikasi',    className: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500'    },
  verifikasi_berkas:      { label: 'Verifikasi Berkas',      className: 'bg-sky-50 text-sky-700',         dot: 'bg-sky-500'     },
  verifikasi_pembayaran:  { label: 'Verifikasi Pembayaran',  className: 'bg-amber-50 text-amber-700',     dot: 'bg-amber-400'   },
  lulus_administrasi:     { label: 'Lulus Administrasi',     className: 'bg-teal-50 text-teal-700',       dot: 'bg-teal-500'    },
  lulus_ujian:            { label: 'Lulus Ujian',            className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  lulus_final:            { label: 'Lulus Final ✓',          className: 'bg-emerald-100 text-emerald-800 font-bold', dot: 'bg-emerald-600' },
  ditolak:                { label: 'Tidak Lulus',            className: 'bg-rose-50 text-rose-700',       dot: 'bg-rose-400'    },
}

interface StatusBadgeProps {
  status: StatusPendaftaran
  size?:  'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label:     status,
    className: 'bg-slate-100 text-slate-600',
    dot:       'bg-slate-400',
  }

  return (
    <span className={cn(
      'badge',
      config.className,
      size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
