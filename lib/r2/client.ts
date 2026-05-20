import { S3Client } from '@aws-sdk/client-s3'

const globalForR2 = globalThis as unknown as { r2Client?: S3Client }

export function getR2Client(): S3Client {
  if (globalForR2.r2Client) return globalForR2.r2Client

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  })

  if (process.env.NODE_ENV !== 'production') globalForR2.r2Client = client
  return client
}
