"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export const disciplines = [
  { id: "websites", key: "W", short: "Websites", title: "Websites", body: "Landing pages and marketing sites that convert." },
  { id: "web-apps", key: "A", short: "Web apps", title: "Web apps", body: "Product flows for SaaS and AI tools." },
  { id: "dashboards", key: "D", short: "Dashboards", title: "Dashboards", body: "Dense data that still reads at a glance." },
  { id: "mobile", key: "M", short: "Mobile apps", title: "Mobile apps", body: "iOS and Android, from first flow to handoff." },
  { id: "branding", key: "B", short: "Branding", title: "Branding", body: "Identity systems that stay consistent everywhere." },
  { id: "logos", key: "L", short: "Logos", title: "Logo design", body: "Marks that work from 16px to a billboard." },
  { id: "illustration", key: "I", short: "Illustration", title: "Illustration", body: "Custom spot art instead of stock." },
  { id: "animation", key: "N", short: "Animation", title: "Animation", body: "Motion for product demos and launches." },
  { id: "decks", key: "P", short: "Pitch decks", title: "Pitch decks", body: "Decks that make the numbers clear." },
  { id: "framer", key: "F", short: "Framer", title: "No-code development", body: "Framer sites I design, build and ship myself." },
] as const;

export type DisciplineId = (typeof disciplines)[number]["id"];

const Ctx = createContext<{ active: DisciplineId; setActive: (id: DisciplineId) => void } | null>(null);

export function DisciplineProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<DisciplineId>("dashboards");
  return <Ctx.Provider value={{ active, setActive }}>{children}</Ctx.Provider>;
}

export function useDiscipline() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDiscipline must be used inside DisciplineProvider");
  return ctx;
}
