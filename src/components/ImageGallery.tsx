type Props = {
  images: string[];
  startInFullscreen?: boolean;
  className?: string;          // for the thumbnail container
  imageClassName?: string;     // for each thumbnail
};

export default function ImageGallery({
  images,
  startInFullscreen = false,
  className = "grid grid-cols-2 gap-2 sm:grid-cols-3",
  imageClassName = "h-36 w-full object-cover rounded-lg cursor-pointer"
}: Props) {
  const [open, setOpen] = useState(startInFullscreen);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, next, prev]);

  return (
    <>
      {/* Thumbnails */}
      <div className={className} aria-label="Property photos">
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`Photo ${i + 1}`}
            className={imageClassName}
            onClick={() => { setIndex(i); setOpen(true); }}
            loading="lazy"
          />
        ))}
      </div>

      {/* Full-screen overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 text-white/90 hover:text-white text-3xl"
          >
            ×
          </button>

          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 text-white/90 hover:text-white text-4xl"
          >
            ‹
          </button>

          <img
            src={images[index]}
            alt={`Photo ${index + 1}`}
            className="max-h-[90vh] max-w-[95vw] object-contain shadow-2xl rounded-xl"
          />

          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-white/90 hover:text-white text-4xl"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
