import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, trend, trendLabel, icon: Icon }) {
  const isPositive = typeof trend === 'number' ? trend >= 0 : true;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend !== undefined && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-brand-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend > 0 ? '+' : ''}{trend}% {trendLabel || 'from last period'}
        </p>
      )}
    </div>
  );
}
