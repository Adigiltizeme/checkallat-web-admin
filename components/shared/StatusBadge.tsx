export interface StatusConfig {
  label: string;
  color: string;
  icon?: string;
}

interface StatusBadgeProps {
  status: string;
  config: Record<string, StatusConfig>;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export function StatusBadge({ status, config, size = 'sm', showIcon = false }: StatusBadgeProps) {
  const cfg = config[status] ?? { label: status, color: 'bg-gray-100 text-gray-700' };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${cfg.color}`}
    >
      {showIcon && cfg.icon && <span>{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}
