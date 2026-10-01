import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { SocialKey } from "@/lib/site";

type KeyVariant = "secondary" | "primary" | "accent";
type KeySize = "sm" | "md" | "lg";

type KeyBase = {
  variant?: KeyVariant;
  size?: KeySize;
  pressed?: boolean;
  className?: string;
  capClassName?: string;
  children: ReactNode;
};

type KeyAsLink = KeyBase & { href: string } & Omit<ComponentPropsWithoutRef<"a">, "className" | "children" | "href">;
type KeyAsButton = KeyBase & { href?: undefined } & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Key(props: KeyAsLink | KeyAsButton) {
  const { variant = "secondary", size = "md", pressed, className = "", capClassName = "", children, ...rest } = props;
  const cls = [
    "key",
    variant !== "secondary" && `key--${variant}`,
    size !== "md" && `key--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const cap = <span className={`key__cap ${capClassName}`}>{children}</span>;

  if (props.href !== undefined) {
    const { href, ...anchor } = rest as KeyAsLink;
    const external = /^(https?:|mailto:)/.test(href);
    if (external) {
      return (
        <a
          href={href}
          className={cls}
          data-pressed={pressed || undefined}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          {...anchor}
        >
          {cap}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} data-pressed={pressed || undefined} {...anchor}>
        {cap}
      </Link>
    );
  }

  const button = rest as Omit<KeyAsButton, keyof KeyBase>;
  return (
    <button type="button" className={cls} data-pressed={pressed || undefined} {...button}>
      {cap}
    </button>
  );
}

export function Legend({ children }: { children: ReactNode }) {
  return (
    <span className="legend" aria-hidden="true">
      {children}
    </span>
  );
}

export function Eyebrow({
  index,
  label,
  count,
  tone = "accent",
  className = "",
}: {
  index?: string;
  label: string;
  count?: ReactNode;
  tone?: "accent" | "live";
  className?: string;
}) {
  return (
    <span className={`eyebrow ${className}`}>
      <span className={`eyebrow__led eyebrow__led--${tone}`} aria-hidden="true" />
      {index && <span className="eyebrow__index">{index}</span>}
      <span className="eyebrow__label">{label}</span>
      {count !== undefined && (
        <>
          <span className="eyebrow__rule" aria-hidden="true" />
          <span className="eyebrow__count">{count}</span>
        </>
      )}
    </span>
  );
}

export function Logomark({ size = 28 }: { size?: number }) {
  const s = size / 28;
  return (
    <span
      className="relative block shrink-0 overflow-hidden bg-black"
      style={{
        width: size,
        height: size,
        borderRadius: 7 * s,
        boxShadow:
          "0 3.8px 7.5px rgba(0,0,0,.1), 0 1.75px 2.3px -.6px rgba(42,42,42,.14), 0 .6px .6px rgba(42,42,42,.08), inset 0 1.75px 1.75px rgba(255,255,255,.1), inset 0 -1.7px 2.3px rgba(0,0,0,.08)",
      }}
      aria-hidden="true"
    >
      <Image
        src="/assets/nav/glow-a.svg"
        alt=""
        width={78}
        height={78}
        className="absolute max-w-none mix-blend-plus-lighter"
        style={{ left: -36.8 * s, top: -36.8 * s, width: 78.1 * s, height: 78.1 * s }}
      />
      <Image
        src="/assets/nav/glow-b.svg"
        alt=""
        width={78}
        height={78}
        className="absolute max-w-none mix-blend-plus-lighter"
        style={{ left: -11.3 * s, top: -13.5 * s, width: 78.1 * s, height: 78.1 * s }}
      />
      <Image
        src="/assets/nav/logo-x.svg"
        alt=""
        width={12}
        height={17}
        className="absolute left-1/2 top-1/2 max-w-none"
        style={{ width: 12.32 * s, height: 17.36 * s, transform: `translate(-50%, -50%) translateY(${1.1 * s}px)` }}
      />
    </span>
  );
}

export function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <Logomark />
      <span className="text-[18px] font-semibold leading-6 tracking-[-0.18px] text-ink">Aerobox</span>
    </span>
  );
}

const logoSrc: Record<Exclude<SocialKey, "x" | "contra">, string> = {
  linkedin: "/assets/about/linkedin.svg",
  dribbble: "/assets/about/dribbble.svg",
  behance: "/assets/about/behance.svg",
  ondesign: "/assets/about/ondesign.svg",
  upwork: "/assets/about/upwork.svg",
};

export function SocialLogo({
  name,
  size = 20,
  tone = "dark",
}: {
  name: SocialKey;
  size?: number;
  tone?: "dark" | "light";
}) {
  if (name === "x") {
    return (
      <span
        className={`relative grid shrink-0 place-items-center overflow-hidden ${tone === "dark" ? "bg-black" : "bg-white"}`}
        style={{ width: size, height: size, borderRadius: size / 4 }}
      >
        <Image
          src={tone === "dark" ? "/assets/nav/social-x.svg" : "/assets/about/x-dark.svg"}
          alt=""
          width={13}
          height={13}
          style={{ width: size * 0.64, height: size * 0.64 }}
        />
      </span>
    );
  }
  if (name === "contra") {
    return (
      <span
        className="relative grid shrink-0 place-items-center overflow-hidden bg-black"
        style={{ width: size, height: size, borderRadius: size / 4 }}
      >
        <Image src="/assets/nav/contra.png" alt="" width={18} height={18} style={{ width: size * 0.84, height: size * 0.84 }} />
      </span>
    );
  }
  return <Image src={logoSrc[name]} alt="" width={size} height={size} className="shrink-0" style={{ width: size, height: size }} />;
}
