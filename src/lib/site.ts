export const site = {
  name: "Aerobox",
  url: "https://aerobox.design",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM ?? "https://t.me/hanwork12345",
  telegramHandle: "@hanwork12345",
  upwork:
    process.env.NEXT_PUBLIC_UPWORK ??
    "https://www.upwork.com/freelancers/~0197d12036a1e14224?mp_source=share",
  email: "farhanwork.2009@gmail.com",
  availability: "Available for new projects — Q4 2026",
  bookingNote: "Currently booking projects for Q4 2026. Tell me what you're building and I'll reply with next steps.",
  inProgressCount: 2,
  timeZone: "Asia/Jakarta",
  timeZoneLabel: "GMT+7",
};

export const socials = {
  x: { label: "X", href: "https://x.com/UI_Farhan" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammadfarhanudin/" },
  dribbble: { label: "Dribbble", href: "https://dribbble.com/muhammadfarhanudin" },
  behance: { label: "Behance", href: "https://www.behance.net/Muhammadfarhanudin" },
  contra: { label: "Contra", href: "https://contra.com/Muhammadfarhanudin/work?r=Muhammadfarhanudin" },
  ondesign: { label: "On.design", href: "https://on.design/ui_farhan" },
  upwork: { label: "Upwork", href: site.upwork },
} as const;

export type SocialKey = keyof typeof socials;
