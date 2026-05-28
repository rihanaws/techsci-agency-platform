'use server'

import { updateOrderStatus, type OrderStatus } from '@/lib/notion/orders'
import { revalidatePath } from 'next/cache'
import { PRODUCT_CATALOG, type ProductSlug } from '@/lib/products/catalog'
import { generatePresignedUrls } from '@/lib/r2/presign'
import { sendZipDeliveryEmail } from '@/lib/resend/emails'

export async function changeOrderStatus(eventId: string, newStatus: OrderStatus) {
  try {
    await updateOrderStatus(eventId, newStatus)
    revalidatePath('/admin')
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('Failed to change order status', err)
    return { success: false, error: (err as Error).message }
  }
}

export async function resendDelivery(
  eventId: string,
  productSlug: string,
  customerEmail: string,
  customerName: string,
) {
  const product = PRODUCT_CATALOG[productSlug as ProductSlug]
  if (!product) return { success: false, error: `Unknown slug: ${productSlug}` }

  const keys = product.r2Keys as string[]
  if (keys.length === 0) {
    return { success: false, error: 'No R2 assets — intake or subscription product.' }
  }

  try {
    const urls = await generatePresignedUrls(keys)
    await sendZipDeliveryEmail(customerEmail, customerName, product.name, urls)
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err) {
    console.error('Resend delivery failed', err)
    return { success: false, error: (err as Error).message }
  }
}
