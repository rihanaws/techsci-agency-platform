import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getR2Client } from './client'

const TTL_SECONDS = 48 * 60 * 60 // 48h — never change this

export async function generatePresignedUrl(r2Key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: r2Key,
  })
  return getSignedUrl(getR2Client(), command, { expiresIn: TTL_SECONDS })
}

export async function generatePresignedUrls(r2Keys: string[]): Promise<string[]> {
  return Promise.all(r2Keys.map(generatePresignedUrl))
}
