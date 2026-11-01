// components/ImageGallery.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = { images: string[] };

export default function ImageGallery({ images }: Props) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number; time: number } | null>(
    null
  );

  const openAt = (i: number) => {
    setDirection(1);
    setIdx(i);
    setOpen(true);
  };

  const next = useCallback(() => {
    if (images.length < 2) return;
    setDirection(1);
    setIdx((i) => (i + 1) % images.length);
  }, [images.length]);
  const prev = useCallback(() => {
    if (images.length < 2) return;
    setDirection(-1);
    setIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

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
        setDirection(-1);
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setDirection(1);
        setIdx(images.length - 1);
      }
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length, next, prev]);

  // Pointer swipe handlers (left/right)
  const onPointerDown = (e: React.PointerEvent) => {
    // Only primary button / touch
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!e.isPrimary || (e.target as HTMLElement).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    swipeStart.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
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

  if (!images || images.length === 0) return null;

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
            className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center"
          >
            {/* Backdrop */}
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/80"
            />

            {/* Image + controls */}
            <div
              className="relative h-[80vh] w-[92vw] max-w-6xl select-none"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => { swipeStart.current = null; }}
              style={{ touchAction: "pan-y" }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={idx}
                    custom={direction}
                    src={images[idx]}
                    alt={`Photo ${idx + 1} of ${images.length}`}
                    draggable={false}
                    variants={{
                      enter: (d: number) => ({ x: reduceMotion ? 0 : `${d * 100}%` }),
                      center: { x: 0 },
                      exit: (d: number) => ({ x: reduceMotion ? 0 : `${-d * 100}%` }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 0.61, 0.36, 1] }}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  />
                </AnimatePresence>
              </div>

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

              <div aria-live="polite" aria-atomic="true" className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-white/90">
                {idx + 1} / {images.length}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
