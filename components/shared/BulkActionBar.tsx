export interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: 'danger' | 'warning' | 'default';
  disabled?: boolean;
}

interface Props {
  count: number;
  nounSingular?: string;
  nounPlural?: string;
  actions: BulkAction[];
  onClear: () => void;
  loading?: boolean;
}

const VARIANT_CLASS: Record<NonNullable<BulkAction['variant']>, string> = {
  danger:  'text-white bg-red-600 hover:bg-red-700',
  warning: 'text-white bg-yellow-600 hover:bg-yellow-700',
  default: 'text-white bg-primary hover:bg-primary-dark',
};

export function BulkActionBar({
  count,
  nounSingular = 'élément',
  nounPlural,
  actions,
  onClear,
  loading,
}: Props) {
  const noun = count === 1 ? nounSingular : (nounPlural ?? `${nounSingular}s`);

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-primary">
        {count} {noun} sélectionné{count > 1 ? 's' : ''}
      </span>
      <div className="flex gap-2 ml-auto">
        <button
          onClick={onClear}
          disabled={loading}
          className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Désélectionner
        </button>
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.disabled || loading}
            className={`px-3 py-1.5 text-sm rounded-md disabled:opacity-50 flex items-center gap-1.5 ${
              VARIANT_CLASS[action.variant ?? 'default']
            }`}
          >
            {loading ? '…' : action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
