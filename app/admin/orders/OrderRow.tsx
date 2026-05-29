'use client'

import { useState } from 'react'
import { changeOrderStatus, resendDelivery } from './actions'
import type { NotionOrder, OrderStatus } from '@/lib/notion/orders'

export function OrderRow({ order }: { order: NotionOrder }) {
  const [status, setStatus] = useState(order.status)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true)
    const res = await changeOrderStatus(order.eventId, newStatus)
    setIsUpdating(false)
    if (res.success) setStatus(newStatus)
    else alert(`Failed: ${res.error}`)
  }

  const handleResend = async () => {
    setIsResending(true)
    setResendMsg(null)
    const res = await resendDelivery(order.eventId, order.productSlug, order.customerEmail, order.customerName)
    setIsResending(false)
    setResendMsg(res.success ? '✓ Sent' : `Error: ${res.error}`)
    setTimeout(() => setResendMsg(null), 4000)
  }

  const statusClass: Record<string, string> = {
    fulfilled: 'text-green-400 border-green-500/20',
    awaiting_intake: 'text-yellow-400 border-yellow-500/20',
    awaiting_onboarding: 'text-[#4f98a3] border-[#4f98a3]/20',
    routing_failed: 'text-red-400 border-red-500/20',
  }

  return (
    <tr className="hover:bg-[#2e2d2a]/20 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-[#9c9890]">{order.eventId}</td>
      <td className="px-6 py-4">
        <div className="font-medium text-[#e8e5de]">{order.customerName}</div>
        <div className="text-xs text-[#6b6861]">{order.customerEmail}</div>
      </td>
      <td className="px-6 py-4 font-mono text-xs">{order.productSlug}</td>
      <td className="px-6 py-4 text-sm font-medium">
        {(order.amount / 100).toLocaleString('en-US', { style: 'currency', currency: order.currency.toUpperCase() })}
      </td>
      <td className="px-6 py-4">
        <select value={status} disabled={isUpdating}
          onChange={e => handleStatusChange(e.target.value as OrderStatus)}
          className={`rounded-lg border bg-[#171614] px-2 py-1 text-xs font-medium focus:border-[#4f98a3] focus:outline-none disabled:opacity-50 cursor-pointer ${statusClass[status] ?? 'text-[#9c9890] border-[#2e2d2a]'}`}>
          <option value="fulfilled">fulfilled</option>
          <option value="awaiting_intake">awaiting_intake</option>
          <option value="awaiting_onboarding">awaiting_onboarding</option>
          <option value="routing_failed">routing_failed</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <button onClick={handleResend} disabled={isResending}
          className="text-xs text-[#4f98a3] hover:underline disabled:opacity-50 whitespace-nowrap">
          {isResending ? 'Sending...' : resendMsg ?? 'Resend Delivery'}
        </button>
      </td>
      <td className="px-6 py-4 text-xs text-[#6b6861]">
        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
    </tr>
  )
}
