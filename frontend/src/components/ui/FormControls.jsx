import { classNames } from '../../utils/format';

const baseLabel = 'mb-1.5 block text-[13px] font-medium text-navy/80';
const baseInput =
  'block w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder-faint transition duration-200 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:cursor-not-allowed disabled:bg-surface';

export const Field = ({ label, error, required, hint, children }) => (
  <div>
    <label className={baseLabel}>
      {label}
      {required && <span className="ml-0.5 text-gold">*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1.5 text-xs text-faint">{hint}</p>}
    {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
  </div>
);

export const Input = ({ error, className, ...props }) => (
  <input
    className={classNames(baseInput, error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10', className)}
    {...props}
  />
);

export const Select = ({ error, className, children, ...props }) => (
  <select
    className={classNames(baseInput, 'select-arrow', error && 'border-rose-300', className)}
    {...props}
  >
    {children}
  </select>
);

export const Textarea = ({ error, className, ...props }) => (
  <textarea
    className={classNames(baseInput, 'min-h-[100px] resize-y', error && 'border-rose-300', className)}
    {...props}
  />
);

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-[0_2px_10px_rgba(228,61,18,0.28)]',
    secondary: 'border border-line bg-white text-navy hover:bg-surface hover:border-navy/20',
    outline: 'border border-navy/15 bg-transparent text-navy hover:bg-navy/5',
    danger: 'bg-rose text-white hover:bg-[#bd3f58] shadow-[0_2px_10px_rgba(214,83,109,0.28)]',
    ghost: 'text-muted hover:bg-surface hover:text-navy',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_1px_2px_rgba(41,37,34,0.12)]',
    gold: 'bg-gold text-navy hover:bg-[#d99f12] shadow-[0_1px_2px_rgba(41,37,34,0.12)]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-[13px] rounded-lg',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  };
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};
