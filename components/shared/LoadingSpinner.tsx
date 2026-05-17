interface Props {
  sizePx?: number;
  className?: string;
  label?: string;
}

export function LoadingSpinner({ sizePx = 32, className, label = 'Chargement...' }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 ${className ?? ''}`}>
      <div
        className="inline-block animate-spin rounded-full border-4 border-gray-300 border-t-primary"
        style={{ width: sizePx, height: sizePx }}
      />
      {label && <p className="text-gray-600 text-sm">{label}</p>}
    </div>
  );
}
