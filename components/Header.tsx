'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse' },
  { href: '/to-watch', label: 'Watch List' },
  { href: '/watched', label: 'Watched' },
  { href: '/search', label: 'Search' },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="header-logo">IUFLIX</Link>
      <nav className={`header-nav${menuOpen ? ' open' : ''}`}>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        <Link href="/blacklisted" className={`blacklist-btn${pathname === '/blacklisted' ? ' active' : ''}`} aria-label="Blacklisted">
          Blacklist
        </Link>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
