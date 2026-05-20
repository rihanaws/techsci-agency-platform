export async function htmlToPdf(html: string): Promise<Buffer> {
  const res = await fetch('https://api.doppio.sh/v1/pdf/sync', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DOPPIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page: {
        setContent: { html, waitUntil: 'networkidle0' },
        pdf: {
          format: 'A4',
          printBackground: true,
          margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        },
      },
    }),
  })

  if (!res.ok) throw new Error(`Doppio error: ${res.status} ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}
