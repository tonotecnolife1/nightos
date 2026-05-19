"use client";

import Image from "next/image";
import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = "画像", onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/90 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pearl/20 backdrop-blur-sm flex items-center justify-center text-pearl hover:bg-pearl/30 transition z-10"
        aria-label="閉じる"
      >
        <X size={18} />
      </button>

      {/* Image — stop propagation so tap on image doesn't close */}
      <div
        className="relative max-w-[92vw] max-h-[88dvh] w-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[88dvh] rounded-card object-contain shadow-warm"
        />
      </div>
    </div>
  );
}
