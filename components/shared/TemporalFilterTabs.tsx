export interface TemporalTab {
  key: string;
  label: string;
  count: number;
  tooltip?: string;
}

interface Props {
  tabs: TemporalTab[];
  active: string;
  onChange: (key: string) => void;
}

export function TemporalFilterTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:flex sm:space-x-1 gap-1 sm:gap-0 bg-gray-100 p-1 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          title={tab.tooltip}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors text-center ${
            active === tab.key
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
          }`}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
