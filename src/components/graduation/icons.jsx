const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const CloseIcon = (props) => (
  <svg {...base} {...props}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const ARROW_PATHS = {
  left: <polyline points="15 18 9 12 15 6" />,
  right: <polyline points="9 18 15 12 9 6" />,
  up: <polyline points="18 15 12 9 6 15" />,
  down: <polyline points="6 9 12 15 18 9" />,
};

export const ArrowIcon = ({ direction = 'right', ...props }) => (
  <svg {...base} {...props}>{ARROW_PATHS[direction]}</svg>
);

export const LongArrowIcon = (props) => (
  <svg {...base} width={18} height={18} strokeWidth={2.5} {...props}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

export const PlayIcon = (props) => (
  <svg {...base} fill="currentColor" stroke="none" {...props}><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" /></svg>
);

export const PauseIcon = (props) => (
  <svg {...base} fill="currentColor" stroke="none" {...props}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
);

export const SoundOnIcon = (props) => (
  <svg {...base} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
);

export const SoundOffIcon = (props) => (
  <svg {...base} {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
);

export const CheckIcon = (props) => (
  <svg {...base} width={16} height={16} strokeWidth={2.5} {...props}><polyline points="20 6 9 17 4 12" /></svg>
);

export const SparkIcon = (props) => (
  <svg {...base} width={16} height={16} {...props}><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z" /></svg>
);

export const CameraIcon = (props) => (
  <svg {...base} width={16} height={16} {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
);

export const ClockIcon = (props) => (
  <svg {...base} width={16} height={16} {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

export const ExpandIcon = (props) => (
  <svg {...base} width={18} height={18} {...props}><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
);
