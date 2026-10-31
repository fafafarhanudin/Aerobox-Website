"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/** The panel shows first; the screen settles in once its pixels arrive (no pop, no grey flash). */
export function FadeImage({ className = "", alt, ...props }: ImageProps) {
  const [ready, setReady] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      onLoad={() => setReady(true)}
      className={`${className} transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${
        ready ? "scale-100 opacity-100 blur-0" : "scale-[1.01] opacity-0 blur-[6px]"
      }`}
    />
  );
}
