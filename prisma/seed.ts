import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash password for admin
  const passwordHash = await bcrypt.hash('admin123', 10)

  // Seed Admin Prodi
  const adminProdi = await prisma.user.upsert({
    where: { email: 'admin.prodi@fk.unand.ac.id' },
    update: {},
    create: {
      email: 'admin.prodi@fk.unand.ac.id',
      full_name: 'Admin Prodi Jantung',
      password_hash: passwordHash,
      role: 'admin_prodi',
      is_active: true,
    },
  })

  // Seed Admin Fakultas
  const adminFakultas = await prisma.user.upsert({
    where: { email: 'admin.fakultas@fk.unand.ac.id' },
    update: {},
    create: {
      email: 'admin.fakultas@fk.unand.ac.id',
      full_name: 'Admin Dekanat FK',
      password_hash: passwordHash,
      role: 'admin_fakultas',
      is_active: true,
    },
  })

  // Seed Program Studi
  const prodi1 = await prisma.programStudi.upsert({
    where: { kode_prodi: 'PDS-JP' },
    update: {},
    create: {
      kode_prodi: 'PDS-JP',
      nama_prodi: 'Ilmu Penyakit Jantung dan Pembuluh Darah',
      nama_singkat: 'Kardiologi',
      deskripsi: 'Program Pendidikan Dokter Spesialis Jantung dan Pembuluh Darah',
      kuota: 15,
      kuota_terisi: 0,
      periode_buka: new Date('2025-01-01'),
      periode_tutup: new Date('2025-06-30'),
      biaya_pendaftaran: 1500000,
      persyaratan_khusus: 'Minimal STR aktif 2 tahun',
      is_active: true,
    },
  })

  const prodi2 = await prisma.programStudi.upsert({
    where: { kode_prodi: 'PDS-B' },
    update: {},
    create: {
      kode_prodi: 'PDS-B',
      nama_prodi: 'Ilmu Bedah',
      nama_singkat: 'Bedah',
      deskripsi: 'Program Pendidikan Dokter Spesialis Ilmu Bedah Umum',
      kuota: 20,
      kuota_terisi: 0,
      periode_buka: new Date('2025-01-01'),
      periode_tutup: new Date('2025-06-30'),
      biaya_pendaftaran: 1500000,
      persyaratan_khusus: 'Sertifikat ATLS aktif',
      is_active: true,
    },
  })

  console.log('Seed berhasil dilakukan')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
