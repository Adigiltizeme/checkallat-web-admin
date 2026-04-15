'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Activity[]>('/admin/recent-activity')
      .then((data) => setActivities(data.slice(0, 10)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Aucune activité récente</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 text-sm">
            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900">{activity.description}</p>
              <p className="text-gray-500 text-xs mt-1">
                {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
