'use server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { StatusPendaftaran } from '@/lib/validations/schemas'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export interface PendaftarFilter {
  status?:           StatusPendaftaran
  program_studi_id?: string
  search?:           string
  page?:             number
  limit?:            number
}

export async function getAllPendaftar(filters: PendaftarFilter = {}) {
  const { page = 1, limit = 20, status, program_studi_id, search } = filters
  const offset = (page - 1) * limit

  try {
    const where: any = { deleted_at: null }
    if (status) where.status = status
    if (program_studi_id) where.program_studi_id = program_studi_id
    if (search) {
      where.OR = [
        { nomor_pendaftaran: { contains: search, mode: 'insensitive' } },
        { user: { full_name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [data, count] = await prisma.$transaction([
      prisma.pendaftaran.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: { select: { id: true, email: true, full_name: true } },
          program_studi: { select: { nama_prodi: true, nama_singkat: true, kode_prodi: true } },
          dokumen_peserta: { select: { id: true, jenis_dokumen: true, status_validasi: true } }
        }
      }),
      prisma.pendaftaran.count({ where })
    ])

    return { data: data.map(d => ({...d, profiles: d.user})), count }
  } catch (error: any) {
    return { data: [], count: 0, error: error.message }
  }
}

export async function getPendaftarById(pendaftaranId: string) {
  try {
    const data = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        user: { 
          select: { email: true, full_name: true },
        },
        program_studi: { select: { nama_prodi: true, nama_singkat: true, kode_prodi: true } },
        dokumen_peserta: { select: { id: true, jenis_dokumen: true, nama_file: true, storage_path: true, status_validasi: true, catatan_validasi: true, ukuran_file: true, created_at: true } }
      }
    })

    if (!data) return null

    const biodata = await prisma.biodataPeserta.findUnique({
      where: { user_id: data.user_id }
    })

    const transformedData = {
      ...data,
      profiles: data.user,
      biodata_peserta: biodata,
      // For Cloudinary we can just use the storage_path directly as the URL
      dokumen_peserta: data.dokumen_peserta.map(doc => ({
        ...doc,
        signed_url: doc.storage_path
      }))
    }

    return transformedData
  } catch (error) {
    return null
  }
}

export async function updateStatusPendaftar(
  pendaftaranId: string,
  status: StatusPendaftaran,
  catatan?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' }

  try {
    const pendaftaran = await prisma.pendaftaran.findUnique({ where: { id: pendaftaranId }})
    if (!pendaftaran) return { error: 'Pendaftaran tidak ditemukan' }
    
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.pendaftaran.update({
        where: { id: pendaftaranId },
        data: {
          status: status,
          catatan_admin: catatan ?? null,
          tanggal_verifikasi: status === 'verifikasi_berkas' || status === 'verifikasi_pembayaran' ? new Date() : pendaftaran.tanggal_verifikasi,
          tanggal_kelulusan: status === 'lulus_final' ? new Date() : pendaftaran.tanggal_kelulusan,
        }
      })

      await tx.logAktivitas.create({
        data: {
          aktor_id: session.user.id,
          target_tabel: 'pendaftaran',
          target_id: pendaftaranId,
          aksi: 'UPDATE_STATUS',
          nilai_lama: { status: pendaftaran.status },
          nilai_baru: { status: status, catatan: catatan },
          keterangan: `Status diubah menjadi ${status} oleh Admin`
        }
      })

      // Jika lulus final, update kuota_terisi di prodi
      if (pendaftaran.status !== 'lulus_final' && status === 'lulus_final') {
        await tx.programStudi.update({
          where: { id: pendaftaran.program_studi_id },
          data: { kuota_terisi: { increment: 1 } }
        })
      }

      return updated
    })

    revalidatePath('/admin/dashboard')
    return { success: true, data: result }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getDashboardStats() {
  try {
    const [totalPendaftar, prodiAktif, statusCounts] = await Promise.all([
      prisma.pendaftaran.count({ where: { deleted_at: null } }),
      prisma.programStudi.count({ where: { is_active: true } }),
      prisma.pendaftaran.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { deleted_at: null }
      })
    ])

    const countByStatus = statusCounts.reduce((acc, curr) => {
      acc[curr.status as string] = curr._count.status
      return acc
    }, {} as Record<string, number>)

    return {
      total_pendaftar: totalPendaftar,
      total_prodi: prodiAktif,
      menunggu_verifikasi: (countByStatus['submitted'] || 0) + (countByStatus['verifikasi_berkas'] || 0),
      lulus_final: countByStatus['lulus_final'] || 0,
      ditolak: countByStatus['ditolak'] || 0,
    }
  } catch (error) {
    return null
  }
}

export async function exportPendaftarData(filters: PendaftarFilter = {}) {
  const { status, program_studi_id } = filters

  try {
    const where: any = { deleted_at: null }
    if (status) where.status = status
    if (program_studi_id) where.program_studi_id = program_studi_id

    const data = await prisma.pendaftaran.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { email: true, full_name: true, biodata: true }
        },
        program_studi: { select: { nama_prodi: true, kode_prodi: true } },
        dokumen_peserta: { select: { jenis_dokumen: true, status_validasi: true } }
      }
    })

    const rows = data.map(p => ({
      'No. Pendaftaran': p.nomor_pendaftaran ?? '-',
      'Nama Lengkap':    p.user.full_name ?? p.user.biodata?.nama_lengkap ?? '-',
      'Email':           p.user.email ?? '-',
      'NIK':             p.user.biodata?.nik ?? '-',
      'No. HP':          p.user.biodata?.no_hp ?? '-',
      'Asal Institusi':  p.user.biodata?.asal_institusi ?? '-',
      'Program Studi':   p.program_studi?.nama_prodi ?? '-',
      'Status':          p.status,
      'Tgl. Daftar':     p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-',
      'Tgl. Submit':     p.tanggal_submit ? new Date(p.tanggal_submit).toLocaleDateString('id-ID') : '-',
      'Kelengkapan Dok': p.dokumen_peserta?.length ?? 0,
    }))

    return { data: rows }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getProgramStudiList() {
  try {
    const data = await prisma.programStudi.findMany({
      where: { is_active: true },
      select: { id: true, nama_prodi: true, nama_singkat: true, kode_prodi: true },
      orderBy: { nama_prodi: 'asc' }
    })
    return data.map(d => ({
      ...d,
      nama_singkat: d.nama_singkat ?? d.nama_prodi
    }))
  } catch (error) {
    return []
  }
}

export async function getLogAktivitas(targetId: string, limit = 20) {
  try {
    const data = await prisma.logAktivitas.findMany({
      where: { target_id: targetId },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        aktor: { select: { full_name: true, email: true, role: true } }
      }
    })
    return data
  } catch (error) {
    return []
  }
}
