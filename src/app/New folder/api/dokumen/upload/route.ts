import { NextRequest, NextResponse } from 'next/server'
import { uploadDokumen } from '@/lib/actions/dokumen'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result   = await uploadDokumen(formData)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true, dokumenId: result.dokumenId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Terjadi kesalahan' }, { status: 500 })
  }
}
