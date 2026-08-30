import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#84c22a', '#b7dd7c', '#e6f2c9'];

export default function DonutChartCard({ title, data, centerLabel = 'Total' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="percent" nameKey="plan" innerRadius={40} outerRadius={60} startAngle={90} endAngle={-270}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
            {centerLabel}
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((d, i) => (
            <li key={d.plan} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {d.plan} ({d.percent}%)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
