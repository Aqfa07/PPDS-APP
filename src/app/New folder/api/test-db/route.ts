import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test 1: Koneksi dasar
    const prodiData = await prisma.programStudi.findMany({
      select: { id: true, nama_prodi: true, kode_prodi: true },
      take: 5
    })

    // Test 2: Tabel profiles
    const profileCount = await prisma.user.count()

    // Test 3: Tabel pendaftaran
    const pendaftaranCount = await prisma.pendaftaran.count({
      where: { deleted_at: null }
    })

    return NextResponse.json({
      status: 'OK',
      database_url: 'Neon PostgreSQL',
      tables: {
        program_studi:  { ok: true, count: prodiData.length, sample: prodiData.map(p => p.nama_prodi) },
        users:          { ok: true, count: profileCount },
        pendaftaran:    { ok: true, count: pendaftaranCount },
      },
      message: 'Koneksi ke Neon berhasil! Semua tabel terdeteksi.',
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'FATAL_ERROR',
      error: err.message,
    }, { status: 500 })
  }
}
