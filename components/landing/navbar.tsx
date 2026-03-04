"use client";

import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-navy-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-blue-500 flex items-center justify-center shadow-lg shadow-navy-900/20 group-hover:shadow-navy-900/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight">
              AI Recruiter
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 rounded-lg hover:bg-navy-50 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="px-4 py-2 text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
            >
              Log in
            </a>
            <a
              href="#cta"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 rounded-xl shadow-lg shadow-navy-900/25 hover:shadow-navy-900/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              Get Started Free
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-navy-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-navy-700 hover:text-navy-900 hover:bg-navy-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-navy-100 mt-3 space-y-2">
              <a
                href="#"
                className="block px-4 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50 rounded-lg text-center"
              >
                Log in
              </a>
              <a
                href="#cta"
                className="block px-4 py-3 text-sm font-semibold text-white bg-navy-900 rounded-xl text-center"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
