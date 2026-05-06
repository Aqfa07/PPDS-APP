'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { BiodataSchema, ProdiSchema } from '@/lib/validations/schemas'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { deleteFromCloudinary } from '@/lib/cloudinary'

export async function saveDraft(
  step: 1 | 2,
  data: Record<string, unknown>,
  pendaftaranId?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' }

  if (step === 1) {
    const validated = BiodataSchema.safeParse(data)
    if (!validated.success) return { error: validated.error.errors[0].message }

    try {
      await prisma.biodataPeserta.upsert({
        where: { user_id: session.user.id },
        update: validated.data,
        create: {
          user_id: session.user.id,
          ...validated.data
        }
      })
      return { success: true }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  if (step === 2) {
    const validated = ProdiSchema.safeParse(data)
    if (!validated.success) return { error: validated.error.errors[0].message }

    try {
      if (pendaftaranId) {
        await prisma.pendaftaran.updateMany({
          where: { id: pendaftaranId, user_id: session.user.id, status: 'draft' },
          data: { program_studi_id: validated.data.program_studi_id, updated_at: new Date() }
        })
        return { success: true, pendaftaranId }
      } else {
        const newPendaftaran = await prisma.pendaftaran.create({
          data: {
            user_id: session.user.id,
            program_studi_id: validated.data.program_studi_id,
            status: 'draft'
          }
        })
        return { success: true, pendaftaranId: newPendaftaran.id }
      }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  return { error: 'Step tidak valid' }
}

export async function getPendaftaranDraft() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  try {
    const data = await prisma.pendaftaran.findFirst({
      where: { user_id: session.user.id, status: 'draft', deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: {
        program_studi: { select: { nama_prodi: true, kode_prodi: true } },
        dokumen_peserta: { select: { jenis_dokumen: true, status_validasi: true } }
      }
    })
    return data
  } catch (error) {
    return null
  }
}

export async function getBiodata() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  try {
    const data = await prisma.biodataPeserta.findUnique({
      where: { user_id: session.user.id }
    })
    return data
  } catch (error) {
    return null
  }
}

export async function getPendaftaranByUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  try {
    const data = await prisma.pendaftaran.findMany({
      where: { user_id: session.user.id, deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: {
        program_studi: { select: { nama_prodi: true, nama_singkat: true } },
        dokumen_peserta: { select: { id: true, jenis_dokumen: true, status_validasi: true, nama_file: true } }
      }
    })
    return data
  } catch (error) {
    return null
  }
}

export async function submitPendaftaran(pendaftaranId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' }

  try {
    const pendaftaran = await prisma.pendaftaran.findUnique({ where: { id: pendaftaranId }})
    if (!pendaftaran || pendaftaran.user_id !== session.user.id || pendaftaran.status !== 'draft') {
      return { error: 'Pendaftaran tidak valid' }
    }

    const year = new Date().getFullYear().toString()
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    const count = await prisma.pendaftaran.count({
      where: { created_at: { gte: new Date(new Date().getFullYear(), 0, 1) } }
    })
    const seq = (count + 1).toString().padStart(5, '0')
    const nomor_pendaftaran = `PPDS-${year}${month}-${seq}`

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.pendaftaran.update({
        where: { id: pendaftaranId },
        data: {
          status: 'submitted',
          nomor_pendaftaran,
          tanggal_submit: new Date()
        }
      })

      await tx.logAktivitas.create({
        data: {
          aktor_id: session.user.id,
          target_tabel: 'pendaftaran',
          target_id: pendaftaranId,
          aksi: 'SUBMIT_PENDAFTARAN',
          nilai_baru: { status: 'submitted', nomor_pendaftaran },
          keterangan: 'Peserta mensubmit pendaftaran'
        }
      })

      return updated
    })

    revalidatePath('/peserta/dashboard')
    return { success: true, data: result }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function cancelPendaftaran(pendaftaranId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' }

  try {
    const draft = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: { dokumen_peserta: true }
    })

    if (!draft || draft.user_id !== session.user.id || draft.status !== 'draft') {
      return { error: 'Draft tidak ditemukan atau tidak bisa dibatalkan' }
    }

    // Delete files from Cloudinary
    if (draft.dokumen_peserta.length > 0) {
      for (const doc of draft.dokumen_peserta) {
        // Extract public_id from secure_url (storage_path) or keep it if we stored public_id
        // As a fallback, we extract it from the url: /v1234567/folder/file.ext
        const urlParts = doc.storage_path.split('/')
        const fileName = urlParts.pop()?.split('.')[0]
        const folder = urlParts.slice(urlParts.findIndex(p => p === 'ppds-dokumen')).join('/')
        if (fileName) {
          try {
            await deleteFromCloudinary(`${folder}/${fileName}`, 'raw')
          } catch (e) {
            // Ignore error
          }
        }
      }
    }

    await prisma.pendaftaran.delete({ where: { id: pendaftaranId }})
    
    revalidatePath('/peserta/dashboard')
    revalidatePath('/peserta/daftar')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getProgramStudi() {
  try {
    const data = await prisma.programStudi.findMany({
      where: { is_active: true },
      select: { id: true, kode_prodi: true, nama_prodi: true, nama_singkat: true, kuota: true, kuota_terisi: true, biaya_pendaftaran: true, deskripsi: true, periode_tutup: true },
      orderBy: { nama_prodi: 'asc' }
    })
    return data
  } catch (error) {
    return []
  }
}
