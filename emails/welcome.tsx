import {
  Body, Button, Container, Head, Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  customerName: string
  communityUrl: string
}

export default function WelcomeEmail({ customerName, communityUrl }: WelcomeEmailProps) {
  return (
    <Html><Head />
      <Preview>Welcome to the Autonomous Founder Systems community</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>Rihan Consulting</Text>
          <Text style={h1}>Welcome to Autonomous Founder Systems!</Text>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>You're in. Welcome to a private network of founders building with AI, automation, and zero-human systems.</Text>
          <Text style={listItem}>→ Access the community via the button below</Text>
          <Text style={listItem}>→ Introduce yourself in #introductions</Text>
          <Text style={listItem}>→ New content drops every Monday</Text>
          <Section style={btnSection}>
            <Button href={communityUrl} style={button}>Enter the Community →</Button>
          </Section>
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
const listItem = { fontSize: '15px', color: '#333333', marginLeft: '8px', marginBottom: '4px' }
const btnSection = { margin: '32px 0' }
const button = { backgroundColor: '#4f98a3', color: '#ffffff', padding: '14px 28px', borderRadius: '6px', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }
const hr = { borderColor: '#e2e8f0', margin: '32px 0' }
const footer = { fontSize: '12px', color: '#999999', textAlign: 'center' as const }
const link = { color: '#4f98a3' }
