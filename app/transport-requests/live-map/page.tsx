import dynamic from 'next/dynamic';

const LiveMapClient = dynamic(
  () => import('@/components/transport/LiveMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement de la carte...</p>
        </div>
      </div>
    ),
  },
);

export default function LiveMapPage() {
  return (
    // -m-6 cancels the p-6 of the main layout; height fills the viewport minus the header (h-16 = 64px)
    <div className="-m-6" style={{ height: 'calc(100vh - 64px)' }}>
      <LiveMapClient />
    </div>
  );
}
