import { getOrdersByPage } from '@/lib/notion/orders'
import { OrderRow } from './OrderRow'
import Link from 'next/link'

interface PageProps { searchParams: Promise<{ cursor?: string }> }
export const revalidate = 0

export default async function AdminOrders({ searchParams }: PageProps) {
  const { cursor } = await searchParams
  const { orders, nextCursor } = await getOrdersByPage(20, cursor)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-[#e8e5de]">Orders Directory</h1>
        <p className="mt-1 text-sm text-[#9c9890]">Manage orders. Update status inline. Resend ZIP delivery emails.</p>
      </div>
      <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2e2d2a] bg-[#171614] text-xs font-semibold uppercase tracking-wider text-[#6b6861]">
                {['Event ID','Customer','Product','Amount','Status','Resend','Date'].map(h => (
                  <th key={h} className="px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2d2a] text-sm text-[#c9c7c0]">
              {orders.map(order => <OrderRow key={order.eventId} order={order} />)}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-[#6b6861]">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {(nextCursor || cursor) && (
          <div className="flex items-center justify-between border-t border-[#2e2d2a] px-6 py-4 bg-[#171614]">
            <div>{cursor && <Link href="/admin/orders" className="rounded-lg border border-[#2e2d2a] bg-[#1c1b19] px-4 py-2 text-xs text-[#e8e5de] hover:bg-[#2e2d2a]">← First</Link>}</div>
            <div>{nextCursor && <Link href={`/admin/orders?cursor=${nextCursor}`} className="rounded-lg border border-[#2e2d2a] bg-[#1c1b19] px-4 py-2 text-xs text-[#e8e5de] hover:bg-[#2e2d2a]">Next →</Link>}</div>
          </div>
        )}
      </div>
    </div>
  )
}
