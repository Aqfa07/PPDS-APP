import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  publicId?: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<{ url: string; public_id: string; bytes: number; format: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format,
        })
      }
    )

    uploadStream.end(fileBuffer)
  })
}

export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error)
      resolve(result)
    })
  })
}

export default cloudinary
