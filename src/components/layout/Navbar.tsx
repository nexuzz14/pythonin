'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/materi', label: 'Materi' },
  { href: '/latihan', label: 'Latihan' },
  { href: '/progress', label: 'Progress' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600 transition-colors hover:text-blue-700 min-h-[44px] min-w-[44px] py-2"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-mono font-bold text-lg shadow-sm">
            Py
          </span>
          <span className="text-slate-900">Pythonin</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-1" aria-label="Navigasi Utama">
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors min-h-[44px] min-w-[44px] ${
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 md:hidden min-h-[44px] min-w-[44px]"
        >
          <span className="sr-only">Buka menu</span>
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pt-2 pb-4 md:hidden shadow-md">
          <nav className="flex flex-col gap-1" aria-label="Navigasi Menu Mobile">
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors min-h-[44px] ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
