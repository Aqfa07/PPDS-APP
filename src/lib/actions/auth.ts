'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { RegisterSchema, LoginSchema } from '@/lib/validations/schemas'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function registerUser(formData: FormData) {
  const raw = {
    email:     formData.get('email') as string,
    password:  formData.get('password') as string,
    full_name: formData.get('full_name') as string,
  }

  const validated = RegisterSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.data.email }
    })

    if (existingUser) {
      return { error: 'Email sudah terdaftar.' }
    }

    const hashedPassword = await bcrypt.hash(validated.data.password, 10)

    await prisma.user.create({
      data: {
        email: validated.data.email,
        password_hash: hashedPassword,
        full_name: validated.data.full_name,
        role: 'calon_peserta',
        is_active: true
      }
    })

    return { success: true, message: 'Registrasi berhasil! Akun langsung aktif.' }
  } catch (error: any) {
    return { error: error.message || 'Terjadi kesalahan saat registrasi.' }
  }
}

export async function loginUser(formData: FormData) {
  // Login dengan NextAuth ditangani di sisi client menggunakan signIn('credentials', ...)
  // Fungsi ini tidak dipakai lagi, tetapi dipertahankan agar tidak error di file yang import sebelum difix
  return { error: 'Gunakan signIn dari next-auth/react' }
}

export async function getSession() {
  const session = await getServerSession(authOptions)
  return session
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const profile = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  return profile
}
