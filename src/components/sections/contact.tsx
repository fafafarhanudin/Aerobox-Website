import { CornerDownLeft } from "@untitled-ui/icons-react";
import { Eyebrow, Key, Legend } from "@/components/ui";
import { EmailKey } from "@/components/email-key";
import { site } from "@/lib/site";

export function Contact() {
  return (
    <section
      id="contact"
      className="flex scroll-mt-4 flex-col items-center gap-8 border-b border-line px-5 py-14 md:px-8 md:py-[72px] lg:px-12 lg:py-[120px]"
    >
      <div className="flex flex-col items-center gap-4">
        <Eyebrow index="08" label="Contact" tone="live" />
        <h2 className="font-heading text-center text-[36px] leading-[42px] tracking-[-0.32px] text-ink md:text-[48px] md:leading-[56px] lg:text-[64px] lg:leading-[68px]">
          Got something to ship?
          <br />
          <span className="text-ink-3">Let&apos;s make it precise.</span>
        </h2>
      </div>
      <p className="max-w-[480px] text-center text-[16px] leading-[26px] tracking-[-0.16px] text-ink-2">{site.bookingNote}</p>
      <div className="flex w-full flex-col items-stretch gap-2.5 md:w-auto md:flex-row md:items-end md:gap-3">
        <Key
          href={site.telegram}
          variant="primary"
          capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]"
        >
          Send a message
          <Legend>
            <CornerDownLeft width={12} height={12} strokeWidth={1.2} />
          </Legend>
        </Key>
        <EmailKey
          label="Send an email"
          capClassName="h-12 gap-2.5 pl-[18px] pr-3 text-[16px] font-medium leading-5 tracking-[-0.16px]"
        />
      </div>
    </section>
  );
}
