"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BuildingIcon } from "@/components/icons";
import { LanguageToggle } from "@/components/language-toggle";

type AppShellProps = {
  companiesLabel: string;
  signOutLabel: string;
  onSignOut: () => void;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({
  companiesLabel,
  signOutLabel,
  onSignOut,
  actions,
  children,
}: AppShellProps) {
  return (
    <div className="app-canvas">
      <div className="app-frame">
        <aside className="sidebar">
          <nav className="sidebar-nav" aria-label={companiesLabel}>
            <Link href="/companies" className="nav-item is-active" aria-current="page">
              <BuildingIcon />
              {companiesLabel}
            </Link>
          </nav>
          <div className="sidebar-footer">
            <button type="button" className="btn btn-ghost sidebar-signout" onClick={onSignOut}>
              {signOutLabel}
            </button>
          </div>
        </aside>
        <div className="app-main">
          <header className="page-header">
            <div className="page-tools">
              <LanguageToggle />
            </div>
            <div className="page-title-row">
              <h1 className="page-title">Companies / Bedrijven</h1>
              {actions}
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
