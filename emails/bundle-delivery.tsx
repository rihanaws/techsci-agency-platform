import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface BundleDeliveryEmailProps {
  bundleName: string
  customerName: string
  downloads: Array<{ label: string; url: string }>
  expiresAt: string
}

export default function BundleDeliveryEmail({ bundleName, customerName, downloads, expiresAt }: BundleDeliveryEmailProps) {
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  return (
    <Html><Head />
      <Preview>Your {bundleName} downloads are ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Rihan Consulting</Text>
          <Text style={h1}>Your bundle is ready!</Text>
          <Text style={text}>Hi {customerName}, your <strong>{bundleName}</strong> purchase is confirmed. All {downloads.length} assets are ready below.</Text>
          <Section style={downloadList}>
            {downloads.map((d, i) => (
              <div key={i} style={downloadRow}>
                <Text style={downloadLabel}>{d.label}</Text>
                <Button href={d.url} style={button}>Download →</Button>
              </div>
            ))}
          </Section>
          <Text style={warning}>⚠️ All links expire on {expiryDate} (48 hours).</Text>
          <Hr style={hr} />
          <Text style={footer}>Rihan Consulting · <a href="mailto:hello@rihan.cloud" style={link}>hello@rihan.cloud</a></Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system, sans-serif' }
const container = { backgroundColor: '#ffffff', margin: '40px auto', padding: '40px', maxWidth: '600px', borderRadius: '8px' }
const brand = { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#4f98a3' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 24px' }
const text = { fontSize: '15px', lineHeight: '1.6', color: '#333333' }
const downloadList = { margin: '24px 0' }
const downloadRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }
const downloadLabel = { fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: 0 }
const button = { backgroundColor: '#4f98a3', color: '#ffffff', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', fontSize: '13px', textDecoration: 'none' }
const warning = { fontSize: '13px', color: '#b45309', backgroundColor: '#fffbeb', padding: '12px 16px', borderRadius: '6px', border: '1px solid #f59e0b' }
const hr = { borderColor: '#e2e8f0', margin: '32px 0' }
const footer = { fontSize: '12px', color: '#999999', textAlign: 'center' as const }
const link = { color: '#4f98a3' }
