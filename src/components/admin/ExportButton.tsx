'use client'
import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { exportPendaftarData } from '@/lib/actions/admin'
import type { StatusPendaftaran } from '@/lib/validations/schemas'

interface ExportButtonProps {
  status?:           StatusPendaftaran
  program_studi_id?: string
}

export function ExportButton({ status, program_studi_id }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await exportPendaftarData({ status, program_studi_id })
      if (result.error) { toast.error(result.error); return }

      const { utils, writeFile } = await import('xlsx')
      const ws = utils.json_to_sheet(result.data ?? [])
      const wb = utils.book_new()
      utils.book_append_sheet(wb, ws, 'Data Pendaftar')

      // Auto-fit columns
      const cols = Object.keys(result.data?.[0] ?? {}).map(key => ({
        wch: Math.max(key.length, 15)
      }))
      ws['!cols'] = cols

      const filename = `PPDS-Pendaftar-${new Date().toISOString().split('T')[0]}.xlsx`
      writeFile(wb, filename)
      toast.success(`Data berhasil diekspor: ${filename}`)
    } catch (err) {
      toast.error('Gagal mengekspor data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      id="btn-export-excel"
      onClick={handleExport}
      disabled={loading}
      className="btn-secondary flex items-center gap-2"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Mengekspor...</>
      ) : (
        <><Download className="w-4 h-4" /> Export Excel</>
      )}
    </button>
  )
}
