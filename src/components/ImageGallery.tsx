// components/ImageGallery.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = { images: string[] };

export default function ImageGallery({ images }: Props) {
  // Don't render anything if there are no images
  if (!images || images.length === 0) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  // lock body scroll + focus management
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  // keyboard controls: ArrowLeft, ArrowRight, Escape (and optional Home/End)
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "Home") {
        e.preventDefault();
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIdx(images.length - 1);
      }
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  return (
    <>
      {/* Inline gallery */}
      <div className="grid grid-cols-4 gap-2">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => openAt(i)}
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100"
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open &&
        createPortal(
          <div
            aria-modal="true"
            role="dialog"
            aria-label="Image viewer"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Backdrop */}
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/80"
            />

            {/* Image + controls */}
            <div className="relative max-h-[90vh] max-w-[92vw]">
              <img
                src={images[idx]}
                alt={`Photo ${idx + 1} of ${images.length}`}
                className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              />

              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="absolute -top-12 right-0 rounded-lg bg-white/90 px-3 py-1 text-sm font-medium shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                ✕ Close (Esc)
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-[-56px] top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Previous image (Left arrow)"
                  >
                    ←
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-[-56px] top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Next image (Right arrow)"
                  >
                    →
                  </button>
                </>
              )}

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/90">
                {idx + 1} / {images.length}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
