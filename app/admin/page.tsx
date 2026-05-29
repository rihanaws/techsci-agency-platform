import { getRecentOrders } from '@/lib/notion/orders'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboard() {
  const orders = await getRecentOrders(50)

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const totalSalesCents = orders
    .filter(o => o.status !== 'routing_failed')
    .reduce((sum, o) => sum + o.amount, 0)

  const ordersToday = orders.filter(o => new Date(o.createdAt) >= startOfToday).length

  const activeSubs = orders.filter(
    o => ['community', 'managed-devops'].includes(o.productSlug) && o.status !== 'routing_failed'
  ).length

  const mrrCents = orders
    .filter(o => ['community', 'managed-devops'].includes(o.productSlug) && o.status !== 'routing_failed')
    .reduce((sum, o) => sum + o.amount, 0)

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      fulfilled: 'bg-green-500/10 text-green-400 border border-green-500/20',
      awaiting_intake: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
      awaiting_onboarding: 'bg-[#4f98a3]/10 text-[#4f98a3] border border-[#4f98a3]/20',
      routing_failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
    }
    return map[status] ?? 'bg-[#2e2d2a] text-[#9c9890]'
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-[#e8e5de]">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-[#9c9890]">Real-time operational metrics from Notion.</p>
      </div>

      {/* 4 required stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: fmt(totalSalesCents) },
          { label: 'Orders Today', value: String(ordersToday), accent: true },
          { label: 'Active Subscriptions', value: String(activeSubs) },
          { label: 'MRR', value: fmt(mrrCents) },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[#6b6861]">{card.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${card.accent ? 'text-[#4f98a3]' : 'text-[#e8e5de]'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent 20 orders */}
      <div className="rounded-xl border border-[#2e2d2a] bg-[#1c1b19] overflow-hidden">
        <div className="border-b border-[#2e2d2a] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#e8e5de]">Recent Activity</h2>
          <Link href="/admin/orders" className="text-xs font-medium text-[#4f98a3] hover:underline">View All →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2e2d2a] bg-[#171614] text-xs font-semibold uppercase tracking-wider text-[#6b6861]">
                {['Event ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e2d2a] text-sm text-[#c9c7c0]">
              {orders.slice(0, 20).map(order => (
                <tr key={order.eventId} className="hover:bg-[#2e2d2a]/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-[#9c9890]">{order.eventId}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#e8e5de]">{order.customerName}</div>
                    <div className="text-xs text-[#6b6861]">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{order.productSlug}</td>
                  <td className="px-6 py-4">{fmt(order.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#6b6861]">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-[#6b6861]">No orders logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
