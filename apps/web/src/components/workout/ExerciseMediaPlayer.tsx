import { useEffect, useMemo, useRef, useState } from 'react';

interface ResolvedExerciseMedia {
  aspectRatio?: number;
  blurhash?: string;
  lqipBase64?: string;
  urls?: {
    mp4?: string | null;
    webm?: string | null;
    poster?: string | null;
  };
}

interface ExerciseMediaPlayerProps {
  media?: ResolvedExerciseMedia;
  fallbackLabel?: string;
  className?: string;
}

export function ExerciseMediaPlayer({
  media,
  fallbackLabel = 'VISUAL FEED ABSENT',
  className,
}: ExerciseMediaPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const hasVideo = Boolean(media?.urls?.mp4 || media?.urls?.webm);
  const poster = media?.urls?.poster || undefined;

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const placeholderStyle = useMemo(() => {
    if (!media?.lqipBase64) return undefined;
    return {
      backgroundImage: `url(data:image/webp;base64,${media.lqipBase64})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } as const;
  }, [media?.lqipBase64]);

  return (
    <div
      ref={containerRef}
      className={`aspect-video bg-hayl-bg relative flex items-center justify-center border-b border-hayl-border overflow-hidden ${className ?? ''}`.trim()}
    >
      {hasVideo ? (
        <>
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${isReady ? 'opacity-0' : 'opacity-100'}`}
            style={placeholderStyle}
          >
            <div className="absolute inset-0 bg-hayl-bg/35" />
          </div>

          {isInView && (
            <video
              className={`h-full w-full object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
              onLoadedData={() => setIsReady(true)}
            >
              {media?.urls?.webm ? <source src={media.urls.webm} type="video/webm" /> : null}
              {media?.urls?.mp4 ? <source src={media.urls.mp4} type="video/mp4" /> : null}
            </video>
          )}
        </>
      ) : (
        <p className="font-heading text-xl text-hayl-muted uppercase tracking-widest opacity-20">
          {fallbackLabel}
        </p>
      )}
    </div>
  );
}
