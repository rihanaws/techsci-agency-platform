import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getR2Client } from './client'

const TTL_SECONDS = 48 * 60 * 60 // 48h: match delivery link expiry + tests expect 172800

export async function generatePresignedUrl(r2Key: string): Promise<string> {
  const bucketName = requireEnv('CLOUDFLARE_R2_BUCKET_NAME')
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
  })
  return getSignedUrl(getR2Client(), command, { expiresIn: TTL_SECONDS })
}

export async function generatePresignedUrls(r2Keys: string[]): Promise<string[]> {
  return Promise.all(r2Keys.map(generatePresignedUrl))
}

function requireEnv(key: 'CLOUDFLARE_R2_BUCKET_NAME'): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`[r2/presign] Missing ${key}. Set Cloudflare R2 bucket env var.`)
  }
  return value
}
