import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client } from './client'

export async function uploadToR2(
  buffer: Buffer,
  r2Key: string,
  contentType: string = 'application/pdf',
): Promise<string> {
  const client = getR2Client()
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      Body: buffer,
      ContentType: contentType,
    }),
  )

  // Return the public domain link if configured, or a standard endpoint structure
  const publicDomain = process.env.R2_PUBLIC_DOMAIN
  if (publicDomain) {
    const domain = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain
    return `${domain}/${r2Key}`
  }

  return `https://${bucketName}.r2.cloudflarestorage.com/${r2Key}`
}
