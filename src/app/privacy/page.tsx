import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { pageMeta } from "@/lib/meta";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "Privacy Policy",
  "What Aerobox collects when you contact us, use the asset library or support the work, and how to have it removed.",
  "/privacy",
);

const updated = "October 12, 2026";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "The short version",
    body: (
      <p>
        Aerobox is run by one designer. This site sets no advertising cookies and does not sell or share your data. We only keep what you send us yourself, and only for as long as we need it to reply or to show it
        where you asked us to.
      </p>
    ),
  },
  {
    title: "When you contact us",
    body: (
      <p>
        Messages sent by Telegram ({site.telegramHandle}) or email ({site.email}) stay in those services and in our
        inbox. We use them to reply and to work on your project, and delete them on request once a project is closed.
      </p>
    ),
  },
  {
    title: "Asset library forms",
    body: (
      <p>
        The sponsor, request and support forms on /library send your name, email and message to a private Google
        Sheet, so we can answer. They are not used for mailing lists or shared with anyone.
      </p>
    ),
  },
  {
    title: "Supporting the work",
    body: (
      <p>
        On /support, the name and message you choose to make public appear on the supporters wall together with the
        amount. Nothing is public unless you tick it. Your email, if you give one, goes only to the payment provider
        for your receipt; we do not store it, and card or bank details are handled entirely by the provider.
      </p>
    ),
  },
  {
    title: "Hosting and fonts",
    body: (
      <p>
        The site is hosted on Vercel, which keeps standard server logs (such as IP address and browser) for security
        and reliability. The asset library loads fonts from Google Fonts, which receives your IP address when the font
        files are requested.
      </p>
    ),
  },
  ...(process.env.NEXT_PUBLIC_GA_ID
    ? [{
        title: "Visit statistics",
        body: (
          <p>
            We use Google Analytics to count visits and clicks on the contact links (Telegram, email, profiles), so we
            know which pages help people get in touch. It does not use advertising features, and the numbers are only
            read in aggregate.
          </p>
        ),
      }]
    : []),
  {
    title: "Your choices",
    body: (
      <p>
        Ask us to see, correct or delete anything you sent at{" "}
        <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-4">
          {site.email}
        </a>
        . We reply within a few days. If this policy changes, the date below changes with it.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-10 border-b border-line px-5 py-16 md:px-8 md:py-24">
      <div className="flex flex-col gap-4">
        <Eyebrow label="Privacy" />
        <h1 className="font-heading text-[34px] leading-[40px] tracking-[-0.34px] text-ink md:text-[48px] md:leading-[56px]">
          Privacy Policy
        </h1>
        <p className="text-[14px] leading-5 text-ink-3">Last updated {updated}</p>
      </div>
      {sections.map((s) => (
        <div key={s.title} className="flex flex-col gap-3 text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">
          <h2 className="text-[18px] font-medium leading-6 tracking-[-0.18px] text-ink">{s.title}</h2>
          {s.body}
        </div>
      ))}
    </section>
  );
}
