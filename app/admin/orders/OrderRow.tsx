'use client'

import { useState } from 'react'
import { changeOrderStatus } from './actions'
import type { NotionOrder, OrderStatus } from '@/lib/notion/orders'

interface OrderRowProps {
  order: NotionOrder
}

export function OrderRow({ order }: OrderRowProps) {
  const [status, setStatus] = useState<string>(order.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true)
    const res = await changeOrderStatus(order.eventId, newStatus)
    setIsUpdating(false)
    if (res.success) {
      setStatus(newStatus)
    } else {
      alert(`Failed to update status: ${res.error}`)
    }
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
        {(order.amount / 100).toLocaleString('en-US', {
          style: 'currency',
          currency: order.currency.toUpperCase(),
        })}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <select
            value={status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className={`rounded-lg border border-[#2e2d2a] bg-[#171614] px-2 py-1 text-xs font-medium focus:border-[#4f98a3] focus:outline-none disabled:opacity-50 cursor-pointer ${
              status === 'fulfilled'
                ? 'text-green-400 border-green-500/20'
                : status === 'awaiting_intake'
                ? 'text-yellow-400 border-yellow-500/20'
                : status === 'awaiting_onboarding'
                ? 'text-[#4f98a3] border-[#4f98a3]/20'
                : 'text-red-400 border-red-500/20'
            }`}
          >
            <option value="fulfilled">fulfilled</option>
            <option value="awaiting_intake">awaiting_intake</option>
            <option value="awaiting_onboarding">awaiting_onboarding</option>
            <option value="routing_failed">routing_failed</option>
          </select>
          {isUpdating && (
            <svg className="h-3 w-3 animate-spin text-[#4f98a3]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-xs text-[#6b6861]">
        {new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </td>
    </tr>
  )
}
