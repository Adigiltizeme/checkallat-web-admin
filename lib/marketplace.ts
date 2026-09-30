export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: 'À confirmer', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Acceptée', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'En préparation', color: 'bg-indigo-100 text-indigo-800' },
  ready: { label: 'Prête', color: 'bg-purple-100 text-purple-800' },
  in_delivery: { label: 'En livraison', color: 'bg-cyan-100 text-cyan-800' },
  delivered: { label: 'Livrée', color: 'bg-teal-100 text-teal-800' },
  completed: { label: 'Terminée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export const FULFILLMENT_LABELS: Record<string, string> = {
  checkallpack: '🛵 CheckAllPack',
  transport: '🚚 CheckAll@t (camionnette)',
  seller_delivery: '🏪 Livraison vendeur',
  pickup: '🛍️ Retrait en boutique',
};
