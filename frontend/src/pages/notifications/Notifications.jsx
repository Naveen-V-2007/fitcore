import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle2, UserPlus, CreditCard, Calendar, Activity } from 'lucide-react';
import { activityApi } from '../../api/activityApi';

export default function Notifications() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await activityApi.getAll?.() || [];
      setActivities(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'member_registered':
        return <UserPlus size={16} className="text-emerald-600" />;
      case 'payment_received':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'class_booked':
        return <Calendar size={16} className="text-amber-600" />;
      default:
        return <Activity size={16} className="text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity & Notifications</h2>
          <p className="text-gray-500 text-sm">System audit log, recent actions, and member events.</p>
        </div>
        <button
          onClick={fetchActivities}
          className="flex items-center gap-2 border border-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Bell size={16} /> Refresh Feed
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-sm">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading activity stream...</p>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">Actions taken across the app will appear here in real time.</p>
          </div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
              <div className="p-2 rounded-xl bg-gray-100 mt-0.5">
                {getActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.title || item.action}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.description || item.details || 'System event recorded'}</p>
                <span className="text-[11px] text-gray-400 mt-1.5 block">
                  {new Date(item.created_at || Date.now()).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
