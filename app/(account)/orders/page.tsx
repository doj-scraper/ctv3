import { auth } from '@clerk/nextjs/server';
import { ArrowRight, Package2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUserOrders } from '@/app/actions/order.actions';
import { Button } from '@/components/ui/Button';
import { MetricTile } from '@/components/ui/MetricTile';
import { SectionIntro } from '@/components/ui/SectionIntro';

export const dynamic = 'force-dynamic';


function formatMoney(amount: number | string | { toString(): string }) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/');
  }

  const res = await getUserOrders();
  if (!res.success) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-6 pt-28 lg:px-12">
        <div className="w-full rounded-[1.5rem] border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-200">
          <div className="text-micro text-red-300">Order Rail Error</div>
          <div className="mt-3 font-mono">ERR_FETCH_ORDERS: {res.error}</div>
        </div>
      </div>
    );
  }

  const orders = (res.orders || []) as any[];
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order) => sum + Number(order.total), 0);
  const totalUnits = orders.reduce(
    (sum: number, order) => sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
    0
  );
  const latestOrder = orders[0];

  return (
    <div className="px-6 pb-16 pt-24 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end">
          <SectionIntro
            eyebrow="Order Rail"
            title={
              <>
                ACCOUNT <span className="text-ct-accent">LEDGER</span>
              </>
            }
            description="Track settled orders, inspect line items, and keep purchasing history visible without leaving the sourcing system."
            className="animate-rise-in"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile label="Orders" value={String(totalOrders)} className="animate-rise-in animation-delay-100" />
            <MetricTile label="Units" value={String(totalUnits)} className="animate-rise-in animation-delay-200" />
            <MetricTile label="Settled" value={formatMoney(totalRevenue)} accent className="animate-rise-in animation-delay-300" />
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-ct-text-secondary/20 bg-ct-bg-secondary/30 px-6 py-16 text-center">
            <div className="rounded-full border border-ct-text-secondary/10 bg-ct-bg/60 p-4">
              <Package2 className="h-8 w-8 text-ct-text-secondary/40" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-ct-text">No order history yet</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-ct-text-secondary">
              Once allocations convert into real orders, this ledger becomes the operational history for your
              sourcing activity.
            </p>
            <div className="mt-7">
              <Link href="/catalog">
                <Button className="rounded-full px-7 uppercase tracking-[0.14em]">
                  Open Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <aside className="animate-rise-in h-fit rounded-[1.5rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.72),rgba(7,10,18,0.92))] p-6 xl:sticky xl:top-24">
              <div className="text-micro text-ct-accent">Latest Activity</div>
              <div className="mt-5 space-y-5">
                <div>
                  <div className="text-micro text-ct-text-secondary">Latest reference</div>
                  <div className="mt-2 font-mono text-lg text-ct-text uppercase">
                    {latestOrder ? latestOrder.id.slice(-8) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-micro text-ct-text-secondary">Latest settled total</div>
                  <div className="mt-2 text-2xl font-semibold text-ct-text">
                    {latestOrder ? formatMoney(latestOrder.total) : '$0.00'}
                  </div>
                </div>
                <div>
                  <div className="text-micro text-ct-text-secondary">Current status</div>
                  <div className="mt-2 inline-flex rounded-full border border-ct-accent/20 bg-ct-accent/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ct-accent">
                    {latestOrder?.status || 'No orders'}
                  </div>
                </div>
                <div className="rounded-[1rem] border border-ct-text-secondary/10 bg-ct-bg/55 p-4">
                  <div className="text-micro text-ct-text-secondary">Ledger note</div>
                  <p className="mt-3 text-sm leading-6 text-ct-text-secondary">
                    This surface is intentionally dense enough for auditing, but still aligned with the rest of
                    the storefront instead of reading like a detached back-office tool.
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {orders.map((order, index) => (
                <article
                  key={order.id}
                  className={`animate-rise-in overflow-hidden rounded-[1.5rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.7),rgba(7,10,18,0.94))] ${
                    index === 0 ? 'animation-delay-100' : index === 1 ? 'animation-delay-200' : 'animation-delay-300'
                  }`}
                >
                  <div className="grid gap-4 border-b border-ct-text-secondary/10 bg-ct-bg/50 p-5 sm:grid-cols-2 xl:grid-cols-4">
                    <LedgerCell label="Reference" value={order.id.slice(-8).toUpperCase()} mono />
                    <LedgerCell
                      label="Timestamp"
                      value={new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })}
                      mono
                    />
                    <div>
                      <div className="text-micro text-ct-text-secondary">Status</div>
                      <div className="mt-2 inline-flex rounded-full border border-ct-accent/20 bg-ct-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-ct-accent">
                        {order.status}
                      </div>
                    </div>
                    <LedgerCell label="Settled total" value={formatMoney(order.total)} alignRight />
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="text-micro text-ct-text-secondary">Line Items</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-ct-text-secondary">
                        {order.items.length} components
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="grid gap-3 rounded-[1rem] border border-ct-text-secondary/10 bg-ct-bg/45 px-4 py-4 sm:grid-cols-[90px_minmax(0,1fr)_140px]"
                        >
                          <div>
                            <div className="text-micro text-ct-text-secondary">Qty</div>
                            <div className="mt-2 font-mono text-lg text-ct-text">{item.quantity}</div>
                          </div>
                          <div>
                            <div className="text-micro text-ct-text-secondary">Component</div>
                            <div className="mt-2 text-sm font-medium uppercase tracking-[0.05em] text-ct-text">
                              {item.partName}
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <div className="text-micro text-ct-text-secondary">Unit price</div>
                            <div className="mt-2 font-mono text-base text-ct-text">
                              {formatMoney(item.unitPrice)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LedgerCell({
  label,
  value,
  mono = false,
  alignRight = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? 'xl:text-right' : ''}>
      <div className="text-micro text-ct-text-secondary">{label}</div>
      <div className={`mt-2 ${mono ? 'font-mono' : ''} text-sm text-ct-text sm:text-base`}>
        {value}
      </div>
    </div>
  );
}
