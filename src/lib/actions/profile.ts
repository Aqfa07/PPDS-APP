'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import bcrypt from 'bcryptjs'

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' }
  }

  const fullName = formData.get('full_name') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = undefined

  try {
    if (avatarFile && avatarFile.size > 0) {
      const fileBuffer = Buffer.from(await avatarFile.arrayBuffer())
      const folder = 'ppds-avatars'
      const publicId = `${session.user.id}_${Date.now()}`
      
      const result = await uploadToCloudinary(fileBuffer, folder, publicId, 'image')
      avatarUrl = result.url
    }

    const updateData: any = { full_name: fullName, updated_at: new Date() }
    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    })

    revalidatePath('/peserta/dashboard')
    revalidatePath('/peserta/settings')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal memperbarui profil' }
  }
}

export async function updatePassword(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: 'Tidak terautentikasi' }
  }

  const newPassword = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    return { error: 'Password tidak cocok' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password minimal 6 karakter' }
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password_hash: hashedPassword }
    })

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Gagal mengubah password' }
  }
}
