import { DateRange } from '@/lib/types';

interface Props {
  label?: string;
  value: DateRange;
  onChange: (v: DateRange) => void;
}

export function DateRangeFilter({ label = 'Date :', value, onChange }: Props) {
  const hasValue =
    (value.mode === 'single' && !!value.singleDate) ||
    (value.mode === 'range' && (!!value.start || !!value.end));

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>

      <select
        value={value.mode}
        onChange={e =>
          onChange({ start: null, end: null, mode: e.target.value as 'range' | 'single', singleDate: null })
        }
        className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto"
      >
        <option value="range">Période</option>
        <option value="single">Date unique</option>
      </select>

      {value.mode === 'single' ? (
        <input
          type="date"
          value={value.singleDate || ''}
          onChange={e =>
            onChange({ ...value, singleDate: e.target.value, start: e.target.value, end: e.target.value })
          }
          className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300 w-full sm:w-auto"
        />
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.start || ''}
            onChange={e => onChange({ ...value, start: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300"
          />
          <span className="text-gray-500 text-sm">à</span>
          <input
            type="date"
            value={value.end || ''}
            onChange={e => onChange({ ...value, end: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm bg-white border-gray-300"
          />
        </div>
      )}

      {hasValue && (
        <button
          onClick={() => onChange({ start: null, end: null, mode: value.mode, singleDate: null })}
          className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
