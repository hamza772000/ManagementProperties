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
  const swipeStart = useRef<{ x: number; y: number; time: number } | null>(
    null
  );
  const didSwipe = useRef(false);

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

  // Pointer swipe handlers (left/right)
  const onPointerDown = (e: React.PointerEvent) => {
    // Only primary button / touch
    if (e.pointerType === "mouse" && e.button !== 0) return;
    didSwipe.current = false;
    swipeStart.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    // If horizontal move dominates and exceeds threshold, mark as swipe
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    const dt = Date.now() - swipeStart.current.time;
    swipeStart.current = null;

    // Consider it a swipe if quick or sufficiently long horizontal gesture
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const longEnough = Math.abs(dx) > 60 || (Math.abs(dx) > 35 && dt < 350);
    if (horizontal && longEnough) {
      if (dx < 0) {
        next();
      } else {
        prev();
      }
    }
  };

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
            <div
              className="relative max-h-[90vh] max-w-[92vw] select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              // Allow vertical gestures (for potential pull-down UI) but handle horizontal swipes
              style={{ touchAction: "pan-y" }}
            >
              <img
                src={images[idx]}
                alt={`Photo ${idx + 1} of ${images.length}`}
                className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl pointer-events-none"
              />

              <button
                ref={closeBtnRef}
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 md:right-0 md:-top-12 rounded-lg bg-white/90 px-3 py-1 text-sm font-medium shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                ✕ Close (Esc)
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Previous image (Left arrow)"
                  >
                    ←
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
