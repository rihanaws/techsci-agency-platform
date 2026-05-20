import { getOrdersByPage } from '@/lib/notion/orders'
import { OrderRow } from './OrderRow'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ cursor?: string }>
}

export const revalidate = 0 // always fetch fresh data

export default async function AdminOrders({ searchParams }: PageProps) {
  const { cursor } = await searchParams
  const { orders, nextCursor } = await getOrdersByPage(20, cursor)

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#e8e5de]">Orders Directory</h1>
          <p className="mt-1 text-sm text-[#9c9890]">
            Manage all customer orders logged in the Notion database.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2e2d2a] bg-[#171614] text-xs font-semibold uppercase tracking-wider text-[#6b6861]">
                <th className="px-6 py-3">Event ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Logged Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2d2a] text-sm text-[#c9c7c0]">
              {orders.map((order) => (
                <OrderRow key={order.eventId} order={order} />
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6b6861]">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(nextCursor || cursor) && (
          <div className="flex items-center justify-between border-t border-[#2e2d2a] px-6 py-4 bg-[#171614]">
            <div>
              {cursor && (
                <Link
                  href="/admin/orders"
                  className="rounded-lg border border-[#2e2d2a] bg-[#1c1b19] px-4 py-2 text-xs font-semibold text-[#e8e5de] hover:bg-[#2e2d2a]"
                >
                  ← First Page
                </Link>
              )}
            </div>
            <div>
              {nextCursor && (
                <Link
                  href={`/admin/orders?cursor=${nextCursor}`}
                  className="rounded-lg border border-[#2e2d2a] bg-[#1c1b19] px-4 py-2 text-xs font-semibold text-[#e8e5de] hover:bg-[#2e2d2a]"
                >
                  Next Page →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
