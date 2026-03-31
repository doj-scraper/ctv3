import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/features', label: 'Capabilities' },
  { href: '/orders', label: 'Orders' },
];

const OPERATIONAL_NOTES = [
  'Verified OEM sourcing',
  'Same-day dispatch windows',
  'MOQ-friendly procurement',
  'Live stock visibility',
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-ct-bg-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,0.9fr)] lg:px-12">
        <div className="space-y-5">
          <Link href="/home" className="group inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ct-accent text-sm font-bold text-ct-bg transition-transform group-hover:-translate-y-0.5">
              CT
            </div>
            <div>
              <div className="heading-display text-lg tracking-[0.04em] text-ct-text">
                CELL<span className="text-ct-accent">TECH</span>
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ct-text-secondary">
                Wholesale parts for repair operations
              </div>
            </div>
          </Link>

          <p className="max-w-md text-sm leading-6 text-ct-text-secondary">
            OEM-grade mobile components, transparent stock visibility, and a procurement rail built for
            repeat service-center buying.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
          <div className="space-y-4">
            <div className="text-micro text-ct-text-secondary">Navigation</div>
            <div className="grid gap-2 text-sm">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="text-ct-text-secondary transition-colors hover:text-ct-accent">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-micro text-ct-text-secondary">Operations</div>
            <div className="grid gap-2 text-sm text-ct-text-secondary">
              {OPERATIONAL_NOTES.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-micro text-ct-text-secondary">Contact</div>
            <div className="grid gap-3 text-sm">
              <a
                href="mailto:sales@celltech.com"
                className="inline-flex items-center gap-3 text-ct-text-secondary transition-colors hover:text-ct-accent"
              >
                <Mail className="h-4 w-4" />
                sales@celltech.com
              </a>
              <a
                href="tel:+18005550123"
                className="inline-flex items-center gap-3 text-ct-text-secondary transition-colors hover:text-ct-accent"
              >
                <Phone className="h-4 w-4" />
                +1 (800) 555-0123
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-micro text-ct-text-secondary">Hours</div>
            <div className="grid gap-1 text-sm text-ct-text-secondary">
              <span>Mon-Fri: 8am-6pm ET</span>
              <span>Sat: 9am-2pm ET</span>
              <span>Sun: Closed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs uppercase tracking-[0.18em] text-ct-text-secondary/70 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <span>© {currentYear} CellTech Distributor. All rights reserved.</span>
          <span>Built for service-center throughput</span>
        </div>
      </div>
    </footer>
  );
}
