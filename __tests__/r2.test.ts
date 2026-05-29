import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('R2 presign route', () => {
  beforeEach(() => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-internal-key')
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'test-account')
    vi.stubEnv('CLOUDFLARE_R2_ACCESS_KEY_ID', 'test-key-id')
    vi.stubEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY', 'test-secret')
    vi.stubEnv('CLOUDFLARE_R2_BUCKET_NAME', 'test-bucket')
  })

  it('rejects requests without X-Internal-API-Key with 401', async () => {
    const { POST } = await import('@/app/api/r2/presign/route')
    const req = new Request('http://localhost/api/r2/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ r2Key: 'test/file.zip' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })

  it('rejects requests with wrong API key', async () => {
    const { POST } = await import('@/app/api/r2/presign/route')
    const req = new Request('http://localhost/api/r2/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-api-key': 'wrong' },
      body: JSON.stringify({ r2Key: 'test/file.zip' }),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(401)
  })

  it('rejects body missing both r2Key and r2Keys', async () => {
    const { POST } = await import('@/app/api/r2/presign/route')
    const req = new Request('http://localhost/api/r2/presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-api-key': 'test-internal-key' },
      body: JSON.stringify({}),
    })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
  })
})
