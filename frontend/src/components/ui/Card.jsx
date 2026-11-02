export const Card = ({ className = '', hover = false, children, ...rest }) => (
  <div
    className={`rounded-[20px] border border-line/70 bg-white shadow-soft ${hover ? 'transition duration-200 hover:-translate-y-1 hover:border-navy/15 hover:shadow-lift' : ''} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const GoldRule = ({ className = '' }) => (
  <span className={`block h-[3px] w-10 rounded-full bg-gold ${className}`} />
);

export const Eyebrow = ({ children, tone = 'accent' }) => (
  <p
    className={`mb-2.5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${
      tone === 'gold' ? 'text-[#a8760a]' : 'text-accent'
    }`}
  >
    <span className={`h-px w-6 ${tone === 'gold' ? 'bg-gold' : 'bg-accent/70'}`} />
    {children}
  </p>
);

export const PageHeader = ({ eyebrow, title, subtitle, actions, action }) => {
  const headerActions = actions || action;
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{subtitle}</p>}
      </div>
      {headerActions && <div className="flex shrink-0 flex-wrap gap-2.5">{headerActions}</div>}
    </div>
  );
};

export const SectionTitle = ({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      {icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          {icon}
        </span>
      )}
      <div>
        <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

export default Card;
