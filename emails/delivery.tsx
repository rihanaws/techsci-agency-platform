import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface DeliveryEmailProps {
  productName: string
  customerName: string
  downloadUrl: string
  expiresAt: string
}

export default function DeliveryEmail({ productName, customerName, downloadUrl, expiresAt }: DeliveryEmailProps) {
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  return (
    <Html><Head />
      <Preview>Your {productName} download is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Rihan Consulting</Text>
          <Text style={h1}>Your order is ready!</Text>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Thank you for purchasing <strong>{productName}</strong>. Your download link is ready below.
          </Text>
          <Section style={btnSection}>
            <Button href={downloadUrl} style={button}>Download {productName}</Button>
          </Section>
          <Text style={warning}>⚠️ This link expires on {expiryDate} (48 hours). Download before it expires.</Text>
          <Hr style={hr} />
          <Text style={footer}>Rihan Consulting · <a href="mailto:hello@rihan.cloud" style={link}>hello@rihan.cloud</a></Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system, sans-serif' }
const container = { backgroundColor: '#ffffff', margin: '40px auto', padding: '40px', maxWidth: '600px', borderRadius: '8px' }
const brand = { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#4f98a3', marginBottom: '8px' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 24px' }
const text = { fontSize: '15px', lineHeight: '1.6', color: '#333333' }
const btnSection = { margin: '32px 0' }
const button = { backgroundColor: '#4f98a3', color: '#ffffff', padding: '14px 28px', borderRadius: '6px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }
const warning = { fontSize: '13px', color: '#b45309', backgroundColor: '#fffbeb', padding: '12px 16px', borderRadius: '6px', border: '1px solid #f59e0b' }
const hr = { borderColor: '#e2e8f0', margin: '32px 0' }
const footer = { fontSize: '12px', color: '#999999', textAlign: 'center' as const }
const link = { color: '#4f98a3' }
