import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line/70 px-5 py-4 sm:flex-row">
      <p className="text-[13px] text-muted">
        Page <span className="font-semibold text-navy">{page}</span> of{' '}
        <span className="font-semibold text-navy">{pages}</span> · {total} records
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-navy transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-accent-soft px-2 text-[13px] font-semibold text-accent">
          {page}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-navy transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
