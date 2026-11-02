import { useState } from 'react';
import { BookOpen } from 'lucide-react';

const BookCover = ({ src, title, className = 'h-12 w-9', showLabel = false, fit = 'cover' }) => {
  const [failed, setFailed] = useState(false);
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

  if (!src || failed) {
    return (
      <div
        className={`${className} relative flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-navy/10 bg-gradient-to-br from-surface via-blush-soft to-gold-soft text-navy/60`}
        title={title}
      >
        <BookOpen className={showLabel ? 'h-8 w-8' : 'h-4 w-4'} />
        {showLabel && (
          <>
            <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-navy/45">Library</span>
            <span className="absolute inset-x-2 top-2 h-px bg-accent/40" />
            <span className="absolute inset-x-2 bottom-2 h-px bg-gold/60" />
          </>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-lg border border-line ${fitClass} shadow-[0_3px_12px_rgba(41,37,34,0.14)]`}
    />
  );
};

export default BookCover;
