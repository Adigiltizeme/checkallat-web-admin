interface Props {
  message: string;
  icon?: string;
  description?: string;
}

export function EmptyState({ message, icon = '📭', description }: Props) {
  return (
    <div className="p-12 text-center text-gray-500">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-medium text-gray-700">{message}</p>
      {description && <p className="text-sm mt-1 text-gray-500">{description}</p>}
    </div>
  );
}
