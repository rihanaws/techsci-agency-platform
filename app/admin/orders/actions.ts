'use server'

import { updateOrderStatus, OrderStatus } from '@/lib/notion/orders'
import { revalidatePath } from 'next/cache'

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
