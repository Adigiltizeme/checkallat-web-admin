'use client';

import Link from 'next/link';

interface Pro {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  companyName?: string;
  serviceCategories: string[];
  status: string;
  averageRating?: number;
  segment: string;
}

interface ProTableProps {
  data: Pro[];
}

export function ProTable({ data }: ProTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Professionnel
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Catégories
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Segment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Note
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((pro) => (
            <tr key={pro.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {pro.user.firstName} {pro.user.lastName}
                </div>
                <div className="text-sm text-gray-500">
                  {pro.companyName || pro.user.phone}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {pro.serviceCategories.slice(0, 2).join(', ')}
                  {pro.serviceCategories.length > 2 && '...'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`px-2 py-1 rounded text-xs ${
                  pro.segment === 'premium'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {pro.segment}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    pro.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : pro.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {pro.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {pro.averageRating ? `${pro.averageRating.toFixed(1)}/5` : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link
                  href={`/pros/${pro.id}`}
                  className="text-primary hover:text-primary-dark"
                >
                  Voir détails
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun professionnel trouvé
        </div>
      )}
    </div>
  );
}
