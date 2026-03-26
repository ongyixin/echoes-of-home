"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full" role="banner">
      <div
        className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto"
        style={{
          background: "rgba(253, 248, 240, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded-lg"
          aria-label="Echoes of Home — go to home page"
        >
          {/* Logo mark */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm group-hover:scale-105 transition-transform"
            style={{ background: "linear-gradient(135deg, #e8927c, #c4684a)" }}
            aria-hidden="true"
          >
            ◎
          </div>
          <div>
            <span className="font-serif text-lg font-semibold text-[#4a3728] leading-none">
              Echoes
            </span>
            <span className="font-serif text-lg font-light text-[#c4684a] leading-none ml-1">
              of Home
            </span>
          </div>
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-2">
            <li className="hidden sm:block">
              <Link
                href="/live"
                className="px-4 py-2 text-sm text-[#7a5c4e] hover:text-[#c4684a] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded-lg"
              >
                Live
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link
                href="/connect"
                className="px-4 py-2 text-sm text-[#7a5c4e] hover:text-[#c4684a] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded-lg"
              >
                Connect
              </Link>
            </li>
            <li className="hidden sm:block">
              <Link
                href="/#memories"
                className="px-4 py-2 text-sm text-[#7a5c4e] hover:text-[#c4684a] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#e8927c] rounded-lg"
              >
                Memories
              </Link>
            </li>
            <li>
              <a
                href="/#upload-section"
                className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#e8927c] focus-visible:ring-offset-2"
                style={{ background: "linear-gradient(135deg, #e8927c, #c4684a)" }}
              >
                Get Started
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {/* Subtle separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#f9d5d3]/60 to-transparent" aria-hidden="true" />
    </header>
  );
}
