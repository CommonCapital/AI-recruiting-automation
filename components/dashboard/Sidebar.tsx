"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarClock,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",            label: "Home",                 icon: LayoutDashboard },
  { href: "/dashboard/jobs",       label: "Jobs",                 icon: Briefcase },
  { href: "/dashboard/candidates", label: "Candidates",           icon: Users },
  { href: "/dashboard/schedules",  label: "Schedules / Interview",icon: CalendarClock },
  { href: "/dashboard/settings",   label: "Settings",             icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className="relative flex flex-col min-h-screen transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 68 : 240,
        background: "#102a43",
        boxShadow: "4px 0 24px rgba(10,31,51,0.18)",
        flexShrink: 0,
      }}
    >
      {/* ── Logo / App Name ─────────────────────────────────── */}
      <div
        className="flex items-center border-b shrink-0"
        style={{
          gap: 10,
          padding: collapsed ? "22px 0" : "22px 20px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderColor: "#243b53",
        }}
      >
        {/* Logo mark */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
            boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
          }}
        >
          <Zap size={18} color="#fff" strokeWidth={2.5} />
        </div>

        {!collapsed && (
          <div>
            <span className="text-white font-extrabold tracking-tight" style={{ fontSize: 17 }}>
              Hire<span style={{ color: "#3b82f6" }}>ly</span>
            </span>
            <span
              className="block font-medium"
              style={{ fontSize: 10, color: "#829ab1", letterSpacing: "0.05em", marginTop: -2 }}
            >
              AI RECRUITMENT
            </span>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ──────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute flex items-center justify-center bg-white rounded-full z-10"
        style={{
          top: 26, right: -12, width: 24, height: 24,
          border: "1.5px solid #d9e2ec",
          boxShadow: "0 2px 8px rgba(10,31,51,0.15)",
        }}
      >
        <ChevronLeft
          size={13}
          color="#334e68"
          style={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
          }}
        />
      </button>

      {/* ── Nav items ────────────────────────────────────────── */}
      <nav className="flex flex-col flex-1 gap-1" style={{ padding: "16px 10px" }}>
        {!collapsed && (
          <p
            className="font-semibold"
            style={{ fontSize: 10, color: "#627d98", letterSpacing: "0.08em", padding: "4px 10px 8px", margin: 0 }}
          >
            MENU
          </p>
        )}

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center rounded-[10px] transition-all duration-150"
              style={{
                gap: 10,
                padding: collapsed ? "11px 0" : "11px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "rgba(59,130,246,0.14)" : "transparent",
                borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                textDecoration: "none",
                position: "relative",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon
                size={18}
                color={isActive ? "#60a5fa" : "#829ab1"}
                strokeWidth={isActive ? 2.5 : 2}
                style={{ flexShrink: 0 }}
              />
              {!collapsed && (
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#ffffff" : "#9fb3c8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              )}
              {/* Active dot when collapsed */}
              {collapsed && isActive && (
                <span
                  style={{
                    position: "absolute", right: 6, top: "50%",
                    transform: "translateY(-50%)",
                    width: 5, height: 5, borderRadius: "50%", background: "#3b82f6",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: Clerk UserButton ─────────────────────────── */}
      <div
        className="shrink-0"
        style={{
          padding: collapsed ? "16px 10px" : "16px 14px",
          borderTop: "1px solid #243b53",
        }}
      >
        {!collapsed && (
          <p
            className="font-semibold"
            style={{ fontSize: 10, color: "#627d98", letterSpacing: "0.08em", marginBottom: 10, padding: "0 2px" }}
          >
            ACCOUNT
          </p>
        )}

        <div
          className="flex items-center"
          style={{ gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start" }}
        >
          {/* showName only when expanded */}
          <UserButton
            showName={!collapsed}
            appearance={{
              elements: {
                rootBox: { width: collapsed ? "auto" : "100%" },
                userButtonBox: {
                  flexDirection: "row",
                  gap: "10px",
                  width: collapsed ? "auto" : "100%",
                  padding: collapsed ? "8px 0" : "8px 12px",
                  borderRadius: "12px",
                  border: "1px solid #243b53",
                  background: "rgba(255,255,255,0.05)",
                  color: "#ffffff",
                },
                userButtonOuterIdentifier: {
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ffffff",
                },
                userButtonTrigger: {
                  "&:focus": { boxShadow: "none" },
                },
              },
            }}
          />
        </div>
      </div>
    </aside>
  );
}