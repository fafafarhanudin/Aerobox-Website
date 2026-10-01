import Image from "next/image";

import { Eyebrow } from "@/components/ui";
import { Marquee } from "@/components/marquee";

const rows = [
  { src: "/assets/clients/row-a.png", width: 2778, direction: "left" as const },
  { src: "/assets/clients/row-b.png", width: 2902, direction: "right" as const },
];

export function Clients() {
  return (
    <section aria-label="Clients" className="flex flex-col items-center gap-[38px] border-b border-line py-10">
      <Eyebrow label="Trusted by 60+ founders and teams" />
      <div className="flex w-full flex-col gap-6">
        {rows.map((r, i) => (
          <Marquee
            key={r.src}
            label={i === 0 ? "Client logos" : "More client logos"}
            duration={40}
            direction={r.direction}
            fade="w-20 md:w-40"
            pauseOnHover={false}
            className="h-8"
          >
            <Image
              src={r.src}
              alt={i === 0 ? "Logos of AKY, Nova, Kreo, Affine, Berachain, Storms, Everflow, Datalyr and other clients" : "Logos of Humwork, HeyCasper, Moolah, Roots, Interview Coder, Retainable, Drewl and other clients"}
              width={r.width}
              height={32}
              unoptimized
              className="h-8 max-w-none"
              style={{ width: r.width }}
            />
          </Marquee>
        ))}
      </div>
    </section>
  );
}
