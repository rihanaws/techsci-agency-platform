"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#2e2d2a]/80 bg-[#171614]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold text-[#e8e5de]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f98a3] text-sm font-bold text-[#171614]">
            RC
          </span>
          <span className="text-base font-semibold">Rihan Consulting</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#c9c7c0] transition hover:text-[#e8e5de]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            className="rounded-lg bg-[#4f98a3] px-4 py-2 text-sm font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
          >
            Browse Products
          </Link>
        </nav>
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-[#2e2d2a] p-2 text-[#e8e5de] md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={`md:hidden overflow-hidden border-t border-[#2e2d2a]/80 bg-[#171614]/95 transition-all duration-300 ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#c9c7c0] transition hover:text-[#e8e5de]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="rounded-lg bg-[#4f98a3] px-4 py-2 text-center text-sm font-semibold text-[#171614] transition hover:bg-[#3d7a84]"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </header>
  );
}
