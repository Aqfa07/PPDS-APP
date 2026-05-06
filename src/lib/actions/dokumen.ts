'use server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['application/pdf']

export type JenisDokumen =
  | 'KTP' | 'IJAZAH_PROFESI' | 'TRANSKRIP_NILAI' | 'STR'
  | 'SURAT_REKOMENDASI' | 'SURAT_IZIN_INSTITUSI' | 'FOTO'
  | 'BUKTI_BAYAR' | 'DOKUMEN_LAINNYA'

export async function uploadDokumen(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' }

  const file          = formData.get('file') as File
  const jenisDokumen  = formData.get('jenis_dokumen') as JenisDokumen
  const pendaftaranId = formData.get('pendaftaran_id') as string

  // Validasi Server-side
  if (!file || file.size === 0)        return { error: 'File tidak ditemukan' }
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Hanya file PDF yang diizinkan' }
  if (file.size > MAX_FILE_SIZE)       return { error: 'Ukuran file maksimal 2MB' }
  if (!jenisDokumen)                   return { error: 'Jenis dokumen wajib diisi' }
  if (!pendaftaranId)                  return { error: 'ID pendaftaran tidak valid' }

  try {
    // Verifikasi pendaftaran milik user ini
    const pendaftaran = await prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId }
    })

    if (!pendaftaran || pendaftaran.user_id !== session.user.id) {
      return { error: 'Pendaftaran tidak ditemukan' }
    }

    const timestamp   = Date.now()
    const folder = `ppds-dokumen/${session.user.id}/${pendaftaranId}`
    const publicId = `${jenisDokumen}_${timestamp}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const result = await uploadToCloudinary(fileBuffer, folder, publicId, 'raw')

    const existingDoc = await prisma.dokumenPeserta.findFirst({
      where: { pendaftaran_id: pendaftaranId, jenis_dokumen: jenisDokumen }
    })

    let dokumen
    if (existingDoc) {
      dokumen = await prisma.dokumenPeserta.update({
        where: { id: existingDoc.id },
        data: {
          nama_file: file.name,
          storage_path: result.url,
          ukuran_file: file.size,
          mime_type: file.type,
          status_validasi: 'menunggu'
        }
      })
    } else {
      dokumen = await prisma.dokumenPeserta.create({
        data: {
          pendaftaran_id: pendaftaranId,
          jenis_dokumen: jenisDokumen,
          nama_file: file.name,
          storage_path: result.url,
          ukuran_file: file.size,
          mime_type: file.type,
          status_validasi: 'menunggu'
        }
      })
    }

    await prisma.logAktivitas.create({
      data: {
        aktor_id: session.user.id,
        target_tabel: 'dokumen_peserta',
        target_id: dokumen.id,
        aksi: 'UPLOAD_DOKUMEN',
        nilai_baru: { jenis_dokumen: jenisDokumen, nama_file: file.name }
      }
    })

    revalidatePath('/peserta/daftar')
    return { success: true, dokumenId: dokumen.id }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getSignedUrl(storagePath: string) {
  // Karena kita pakai Cloudinary secure_url, kita tidak butuh signed url lagi
  // Kembalikan storagePath secara langsung
  return { url: storagePath }
}

export async function validateDokumen(
  dokumenId: string,
  status: 'valid' | 'ditolak',
  catatan?: string
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: 'Tidak terautentikasi' }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doc = await tx.dokumenPeserta.findUnique({ where: { id: dokumenId }})
      if (!doc) throw new Error('Dokumen tidak ditemukan')

      const updated = await tx.dokumenPeserta.update({
        where: { id: dokumenId },
        data: {
          status_validasi: status,
          catatan_validasi: catatan ?? null,
          divalidasi_oleh: session.user.id,
          divalidasi_pada: new Date()
        }
      })

      await tx.logAktivitas.create({
        data: {
          aktor_id: session.user.id,
          target_tabel: 'dokumen_peserta',
          target_id: dokumenId,
          aksi: 'VALIDASI_DOKUMEN',
          nilai_lama: { status: doc.status_validasi },
          nilai_baru: { status, catatan },
          keterangan: `Admin mengubah status menjadi ${status}`
        }
      })

      return updated
    })

    revalidatePath('/admin/dashboard')
    return { success: true, data: result }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getDokumenByPendaftaran(pendaftaranId: string) {
  try {
    const data = await prisma.dokumenPeserta.findMany({
      where: { pendaftaran_id: pendaftaranId },
      select: { id: true, jenis_dokumen: true, nama_file: true, storage_path: true, status_validasi: true, catatan_validasi: true, ukuran_file: true, created_at: true },
      orderBy: { created_at: 'asc' }
    })

    // Add signed_url for compatibility with frontend components
    return data.map(doc => ({
      ...doc,
      signed_url: doc.storage_path
    }))
  } catch (error) {
    return []
  }
}
