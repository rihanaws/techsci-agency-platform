import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#2e2d2a] bg-[#1c1b19]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div className="space-y-4 text-sm text-[#c9c7c0]">
          <div className="flex items-center gap-3 text-[#e8e5de]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f98a3] text-sm font-bold text-[#171614]">
              RC
            </span>
            <span className="text-base font-semibold">Company</span>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/about" className="hover:text-[#e8e5de]">
              About
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#e8e5de]">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-[#e8e5de]">
              Terms
            </Link>
          </div>
        </div>
        <div className="space-y-4 text-sm text-[#c9c7c0]">
          <h3 className="text-base font-semibold text-[#e8e5de]">Products</h3>
          <Link href="/products" className="hover:text-[#e8e5de]">
            Browse all products
          </Link>
        </div>
        <div className="space-y-4 text-sm text-[#c9c7c0]">
          <h3 className="text-base font-semibold text-[#e8e5de]">Contact</h3>
          <a href="mailto:hello@rihan.cloud" className="hover:text-[#e8e5de]">
            hello@rihan.cloud
          </a>
        </div>
      </div>
      <div className="border-t border-[#2e2d2a] px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-[#9c9890] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4f98a3] text-xs font-bold text-[#171614]">
              RC
            </span>
            <span>
              © 2026 Rihan Consulting. Operated by TechSci Inc (Delaware
              C-Corp).
            </span>
          </div>
          <span>All products delivered digitally. No refunds on digital goods.</span>
        </div>
      </div>
    </footer>
  );
}
