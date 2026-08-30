import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import { reportApi } from '../../api/reportApi';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [topTrainers, setTopTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportApi.getSummary(),
      reportApi.getRevenueTrend(),
      reportApi.getMembershipDistribution(),
      reportApi.getTopTrainers(),
    ]).then(([s, t, d, tt]) => { setSummary(s); setTrend(t); setDistribution(d); setTopTrainers(tt); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading reports...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Reports</h2><p className="text-gray-500 text-sm">Analyze gym performance and business activity.</p></div>
        <button className="flex items-center gap-2 border border-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50"><Download size={16} /> Export</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${(summary?.totalRevenue ?? 0).toLocaleString()}`} />
        <StatCard label="Member Growth" value={`+${summary?.memberGrowth ?? 0}`} />
        <StatCard label="Class Attendance" value={`${summary?.classAttendance ?? 0}%`} />
        <StatCard label="Lead Conversion" value={`${summary?.leadConversion ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard title="Revenue Trends" data={trend} dataKey="total" xKey="day" />
        <DonutChartCard title="Membership Distribution" data={distribution} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold mb-4">Top Performing Trainers</h3>
        <ul className="space-y-3 text-sm">
          {topTrainers.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gray-200" /> {t.name}
              </span>
              <span className="text-gray-500">{t.members?.[0]?.count ?? 0} members</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
