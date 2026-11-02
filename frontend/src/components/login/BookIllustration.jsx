const standingBooks = [
  {
    x: 54,
    y: 152,
    w: 34,
    h: 122,
    rotate: -8,
    fill: 'url(#navyBook)',
    spine: '#171412',
    delay: '0s',
    duration: '5.6s',
    enter: '260ms',
  },
  {
    x: 92,
    y: 134,
    w: 34,
    h: 140,
    rotate: -3,
    fill: 'url(#indigoBook)',
    spine: '#a8330d',
    delay: '0.8s',
    duration: '6.4s',
    enter: '320ms',
  },
  {
    x: 312,
    y: 158,
    w: 34,
    h: 116,
    rotate: 7,
    fill: 'url(#burgundyBook)',
    spine: '#8f3049',
    delay: '0.4s',
    duration: '6.9s',
    enter: '380ms',
  },
  {
    x: 350,
    y: 170,
    w: 30,
    h: 104,
    rotate: 11,
    fill: 'url(#ivoryBook)',
    spine: '#c08f0f',
    delay: '1.2s',
    duration: '5.9s',
    enter: '440ms',
  },
];

const floatingPages = [
  { transform: 'translate(118 96) rotate(-14)', delay: '0s', enter: '500ms' },
  { transform: 'translate(300 82) rotate(9) scale(0.9)', delay: '2.1s', enter: '560ms' },
  { transform: 'translate(250 56) rotate(-5) scale(0.75)', delay: '4.2s', enter: '620ms' },
];

const particles = [
  { cx: 96, cy: 132, r: 1.8, delay: '0s' },
  { cx: 150, cy: 86, r: 1.3, delay: '1.1s' },
  { cx: 268, cy: 72, r: 1.6, delay: '0.6s' },
  { cx: 344, cy: 120, r: 1.4, delay: '1.7s' },
  { cx: 196, cy: 58, r: 1.1, delay: '2.2s' },
  { cx: 310, cy: 198, r: 1.5, delay: '0.9s' },
  { cx: 68, cy: 210, r: 1.2, delay: '1.4s' },
  { cx: 258, cy: 152, r: 1.3, delay: '2.6s' },
];

const BookIllustration = ({ className = '' }) => (
  <svg
    viewBox="0 0 440 330"
    className={className}
    role="img"
    aria-label="Illustration of hardcover books and an open book glowing on a shelf"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <linearGradient id="navyBook" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b342e" />
        <stop offset="100%" stopColor="#211d1a" />
      </linearGradient>
      <linearGradient id="indigoBook" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f2622f" />
        <stop offset="100%" stopColor="#c5320d" />
      </linearGradient>
      <linearGradient id="burgundyBook" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0708a" />
        <stop offset="100%" stopColor="#b83f58" />
      </linearGradient>
      <linearGradient id="ivoryBook" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f8d47a" />
        <stop offset="100%" stopColor="#d99f12" />
      </linearGradient>
      <linearGradient id="pageGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fffaf0" />
        <stop offset="100%" stopColor="#f0e6cf" />
      </linearGradient>
      <linearGradient id="goldRibbon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe08a" />
        <stop offset="100%" stopColor="#d99f12" />
      </linearGradient>
      <linearGradient id="shelfGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7a2410" stopOpacity="0" />
        <stop offset="50%" stopColor="#7a2410" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#7a2410" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="glowIndigo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffd6a8" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#ffd6a8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="glowGold" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff0b8" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#fff0b8" stopOpacity="0" />
      </radialGradient>
      <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>

    <g className="illus-glow">
      <ellipse cx="220" cy="192" rx="196" ry="134" fill="url(#glowIndigo)" />
    </g>
    <g className="illus-glow" style={{ animationDelay: '1.4s' }}>
      <ellipse cx="220" cy="266" rx="122" ry="72" fill="url(#glowGold)" />
    </g>

    <g className="illus-in">
      <ellipse cx="220" cy="278" rx="152" ry="14" fill="#6b1f0a" opacity="0.45" filter="url(#softBlur)" />
      <rect x="46" y="271.5" width="352" height="3" rx="1.5" fill="url(#shelfGrad)" />
    </g>

    {standingBooks.map((b, i) => (
      <g key={i} className="illus-in" style={{ '--illus-delay': b.enter }}>
        <g className="illus-float" style={{ animationDelay: b.delay, animationDuration: b.duration }}>
          <g transform={`rotate(${b.rotate} ${b.x + b.w / 2} ${b.y + b.h})`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill={b.fill} />
            <rect x={b.x} y={b.y} width="7" height={b.h} rx="3" fill={b.spine} />
            <rect x={b.x + 1} y={b.y + 6} width="5" height={b.h - 12} fill="#ffffff" opacity="0.06" />
            <rect x={b.x + 7} y={b.y + 2} width={b.w - 9} height="4" rx="1.5" fill="url(#pageGrad)" opacity="0.85" />
            <rect
              x={b.x + 7}
              y={b.y + b.h - 6}
              width={b.w - 9}
              height="4"
              rx="1.5"
              fill="url(#pageGrad)"
              opacity="0.7"
            />
            <rect x={b.x + 1} y={b.y + 16} width="5" height="2.2" rx="1.1" fill="#efb11d" opacity="0.9" />
            <rect x={b.x + 1} y={b.y + b.h - 20} width="5" height="2.2" rx="1.1" fill="#efb11d" opacity="0.9" />
          </g>
        </g>
      </g>
    ))}

    <g className="illus-in" style={{ '--illus-delay': '150ms' }}>
      <g className="illus-float-slow" style={{ animationDelay: '0.3s', animationDuration: '7s' }}>
        <path d="M216 236 Q182 220 144 224 L144 290 Q180 286 216 298 Z" fill="url(#navyBook)" />
        <path d="M224 236 Q258 220 296 224 L296 290 Q260 286 224 298 Z" fill="url(#navyBook)" />
        <path d="M216 240 Q186 226 152 230 L152 286 Q184 282 216 292 Z" fill="url(#pageGrad)" />
        <path d="M224 240 Q254 226 288 230 L288 286 Q256 282 224 292 Z" fill="url(#pageGrad)" />
        <path d="M220 238 L220 293" stroke="#b9ab8c" strokeWidth="1" opacity="0.6" />
        <g stroke="#c9bda2" strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
          <path d="M164 248 L206 255" />
          <path d="M164 258 L206 265" />
          <path d="M164 268 L200 274" />
          <path d="M164 278 L186 283" />
          <path d="M234 255 L276 248" />
          <path d="M234 265 L276 258" />
          <path d="M234 274 L270 268" />
          <path d="M234 283 L256 278" />
        </g>
      </g>
      <g className="illus-float-slow" style={{ animationDelay: '1.6s', animationDuration: '8.2s' }}>
        <path d="M214 236 L226 234 L230 292 L219 286 L210 292 Z" fill="url(#goldRibbon)" />
      </g>
    </g>

    {floatingPages.map((p, i) => (
      <g key={i} className="illus-in" style={{ '--illus-delay': p.enter }}>
        <g className="illus-page" style={{ animationDelay: p.delay }}>
          <g transform={p.transform}>
            <path d="M0 0 L30 5 L27 40 L-3 33 Z" fill="url(#pageGrad)" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="0.6" />
            <g stroke="#c9bda2" strokeWidth="1.1" strokeLinecap="round" opacity="0.6">
              <path d="M4 11 L23 15" />
              <path d="M4 21 L23 25" />
            </g>
          </g>
        </g>
      </g>
    ))}

    <g className="illus-in" style={{ '--illus-delay': '560ms' }}>
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={p.r}
          fill="#ffe7ad"
          className="illus-particle"
          style={{ animationDelay: p.delay }}
        />
      ))}
      <g className="illus-particle" style={{ animationDelay: '1.8s' }}>
        <g transform="translate(132 118) scale(0.9)">
          <path
            d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"
            fill="#ffe7ad"
            opacity="0.85"
          />
        </g>
      </g>
    </g>
  </svg>
);

export default BookIllustration;
