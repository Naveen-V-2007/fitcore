import { useEffect, useState } from 'react';
import { Users, UserCheck, ClipboardCheck, Wallet } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import BarChartCard from '../components/charts/BarChartCard';
import { memberApi } from '../api/memberApi';
import { attendanceApi } from '../api/attendanceApi';
import { paymentApi } from '../api/paymentApi';
import { reportApi } from '../api/reportApi';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { profile } = useAuth();
  const [memberStats, setMemberStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [m, a, p, r] = await Promise.all([
          memberApi.getStats(),
          attendanceApi.getStats(),
          paymentApi.getStats(),
          reportApi.getRevenueTrend(),
        ]);
        setMemberStats(m);
        setAttendanceStats(a);
        setPaymentStats(p);
        setRevenueTrend(r);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Good morning, {profile?.full_name || 'Admin'} 👋</h2>
        <p className="text-gray-500 text-sm">Here's what's happening at your gym today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={memberStats?.total ?? 0} icon={Users} />
        <StatCard label="Active Members" value={memberStats?.active ?? 0} icon={UserCheck} />
        <StatCard label="Today's Attendance" value={attendanceStats?.totalToday ?? 0} icon={ClipboardCheck} />
        <StatCard label="Monthly Revenue" value={`$${(paymentStats?.totalMonth ?? 0).toLocaleString()}`} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard title="Revenue Trend (Last 7 Days)" data={revenueTrend} dataKey="total" xKey="day" />
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Gym Capacity</h3>
          <p className="text-4xl font-bold">{attendanceStats?.currentlyIn ?? 0} <span className="text-base text-gray-400 font-normal">/ {attendanceStats?.capacityMax} Max</span></p>
          <p className="text-sm text-gray-500 mt-1">{attendanceStats?.capacityPercent ?? 0}% Occupied</p>
        </div>
      </div>
    </div>
  );
}
