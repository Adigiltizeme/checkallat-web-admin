'use client';

export interface CategoryTabItem {
  key: string;
  label: string;
  icon?: string;
  count?: number;
}

interface Props {
  tabs: CategoryTabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}

export function CategoryTabs({ tabs, active, onChange, className = '' }: Props) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map(tab => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
              isActive
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary',
            ].join(' ')}
          >
            {tab.icon && <span className="text-base leading-none">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={[
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-semibold rounded-full',
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600',
                ].join(' ')}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
