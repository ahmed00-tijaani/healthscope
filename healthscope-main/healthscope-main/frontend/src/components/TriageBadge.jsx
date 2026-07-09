const CONFIG = {
  EMERGENCY: {
    label: 'Emergency',
    bg: 'bg-red-500',
    ring: 'ring-red-300',
    text: 'text-white',
    animate: 'animate-pulseAlert',
  },
  URGENT: {
    label: 'Urgent',
    bg: 'bg-amber-400',
    ring: 'ring-amber-200',
    text: 'text-brand-navy',
    animate: '',
  },
  NON_URGENT: {
    label: 'Non-Urgent',
    bg: 'bg-brand-teal',
    ring: 'ring-brand-teal/30',
    text: 'text-white',
    animate: '',
  },
}

export default function TriageBadge({ level }) {
  const config = CONFIG[level] || CONFIG.NON_URGENT

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wide ring-4 ${config.bg} ${config.ring} ${config.text} ${config.animate}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
      {config.label}
    </span>
  )
}
