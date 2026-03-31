import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Clock3,
  Database,
  Globe2,
  Headphones,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { MetricTile } from '@/components/ui/MetricTile';
import { SectionIntro } from '@/components/ui/SectionIntro';

export const metadata = {
  title: 'Why CellTech | Enterprise-Grade Cell Phone Parts',
  description:
    'Discover why 500+ service centers choose CellTech for wholesale cell phone parts. Verified OEM quality, real-time inventory, and next-day shipping.',
};

const coreCapabilities = [
  {
    title: 'Verified Supply',
    description:
      'OEM and high-grade refurbished components are screened before they hit your bench, reducing rework and protecting your margin.',
    eyebrow: 'Quality Rail',
    icon: ShieldCheck,
  },
  {
    title: 'Operational Inventory',
    description:
      'Live stock visibility and allocation-ready catalog flows keep technicians from quoting parts that are already gone.',
    eyebrow: 'Inventory Rail',
    icon: Database,
  },
  {
    title: 'Fulfillment Velocity',
    description:
      'Fast shipping windows and dependable downstream handling keep high-volume service teams moving instead of waiting.',
    eyebrow: 'Delivery Rail',
    icon: Truck,
  },
];

const supportingSignals = [
  {
    title: 'Low-latency search',
    description: 'Fast catalog entry built for SKU, model, and part-family lookups.',
    icon: Zap,
  },
  {
    title: 'Technical support',
    description: 'Human support for compatibility, sourcing, and order-state questions.',
    icon: Headphones,
  },
  {
    title: 'Global reach',
    description: 'Fulfillment-ready workflows for multi-region sourcing operations.',
    icon: Globe2,
  },
  {
    title: 'Warranty posture',
    description: 'Quality-backed parts designed to reduce downstream warranty noise.',
    icon: Award,
  },
  {
    title: 'Live refresh cadence',
    description: 'Inventory and pricing flows are structured around current stock state.',
    icon: Clock3,
  },
  {
    title: 'Bulk-ready economics',
    description: 'Commercial teams can source for repeat demand rather than one-off jobs.',
    icon: Database,
  },
];

const metrics = [
  { label: 'Service centers', value: '500+' },
  { label: 'Trackable SKUs', value: '10K+' },
  { label: 'Fulfillment rate', value: '99.7%' },
  { label: 'Average dispatch', value: '<24h' },
];

export default function FeaturesPage() {
  return (
    <div className="pb-20 pt-24">
      <section className="px-6 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-end">
          <SectionIntro
            eyebrow="CellTech Capabilities"
            title={
              <>
                BUILT FOR <span className="text-ct-accent">HIGH-THROUGHPUT</span> SERVICE TEAMS
              </>
            }
            description="CellTech is designed for repair operations that need better sourcing velocity, tighter inventory confidence, and a UI that behaves like an operational tool rather than a generic wholesale storefront."
            className="animate-rise-in"
          />

          <div className="animate-rise-in animation-delay-150 rounded-[1.5rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.75),rgba(7,10,18,0.95))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="text-micro text-ct-text-secondary">Operating Envelope</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <MetricTile key={metric.label} label={metric.label} value={metric.value} className="bg-ct-bg/50" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 px-6 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          {coreCapabilities.map((capability, index) => (
            <article
              key={capability.title}
              className={`animate-rise-in group rounded-[1.5rem] border border-ct-text-secondary/10 bg-[linear-gradient(180deg,rgba(17,23,37,0.72),rgba(7,10,18,0.92))] p-6 sm:p-7 transition-[border-color,transform,box-shadow] hover:-translate-y-1 hover:border-ct-accent/20 hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)] ${
                index === 0 ? 'animation-delay-100' : index === 1 ? 'animation-delay-200' : 'animation-delay-300'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-micro text-ct-accent">{capability.eyebrow}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-ct-accent/20 bg-ct-accent/10 transition-colors group-hover:bg-ct-accent/15">
                  <capability.icon className="h-5 w-5 text-ct-accent" />
                </div>
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-ct-text">{capability.title}</h2>
              <p className="mt-4 text-sm leading-7 text-ct-text-secondary">{capability.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 px-6 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-[1.75rem] border border-ct-text-secondary/10 bg-ct-bg-secondary/25 p-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:p-8">
          <SectionIntro
            eyebrow="Support Signals"
            title={
              <>
                EVERYTHING A MODERN <span className="text-ct-accent">BUYING TEAM</span> EXPECTS
              </>
            }
            description="The goal is not decorative feature density. It is dependable procurement, clearer order-state awareness, and fewer bottlenecks between search, selection, and shipment."
            className="animate-rise-in"
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {supportingSignals.map((signal, index) => (
              <div
                key={signal.title}
                className={`animate-rise-in rounded-[1.15rem] border border-ct-text-secondary/10 bg-ct-bg/50 p-5 ${
                  index % 3 === 0
                    ? 'animation-delay-100'
                    : index % 3 === 1
                      ? 'animation-delay-200'
                      : 'animation-delay-300'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ct-accent/20 bg-ct-accent/10">
                  <signal.icon className="h-4.5 w-4.5 text-ct-accent" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-ct-text">{signal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ct-text-secondary">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-14 px-6 lg:px-12">
        <div className="animate-rise-in animation-delay-150 mx-auto max-w-5xl rounded-[1.9rem] border border-ct-accent/15 bg-[linear-gradient(180deg,rgba(17,23,37,0.88),rgba(7,10,18,0.98))] p-8 text-center shadow-[0_28px_60px_rgba(0,0,0,0.34)] sm:p-10">
          <div className="text-micro text-ct-accent">Next Step</div>
          <h2 className="mt-4 heading-display text-3xl text-ct-text sm:text-4xl">
            READY TO MOVE INTO THE <span className="text-ct-accent">CATALOG RAIL</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ct-text-secondary sm:text-base">
            Use the live search surface, inspect actual stock state, and stage allocations without leaving
            the core sourcing flow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/catalog">
              <Button size="lg" className="rounded-full px-8 uppercase tracking-[0.14em]">
                Explore Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="lg" className="rounded-full border border-ct-text-secondary/10 px-8 uppercase tracking-[0.14em]">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
