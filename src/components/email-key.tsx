"use client";

import { useEffect, useState } from "react";
import { Check, Mail01 } from "@untitled-ui/icons-react";
import { Key, Legend } from "@/components/ui";
import { site } from "@/lib/site";

export const mailtoHref = `mailto:${site.email}?subject=${encodeURIComponent("Project inquiry via Aerobox")}`;

export function EmailKey({
  label,
  variant = "secondary",
  size = "md",
  className,
  capClassName,
}: {
  label: string;
  variant?: "secondary" | "primary";
  size?: "sm" | "md";
  className?: string;
  capClassName: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  return (
    <Key
      href={mailtoHref}
      variant={variant}
      size={size}
      className={className}
      capClassName={capClassName}
      title={site.email}
      onClick={() => {
        navigator.clipboard?.writeText(site.email).then(() => setCopied(true), () => {});
      }}
    >
      <span aria-live="polite">{copied ? "Email copied" : label}</span>
      <Legend>
        {copied ? <Check width={12} height={12} strokeWidth={1.6} /> : <Mail01 width={12} height={12} strokeWidth={1.2} />}
      </Legend>
    </Key>
  );
}
