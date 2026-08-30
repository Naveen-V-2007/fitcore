import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function BarChartCard({ title, data, dataKey = 'total', xKey = 'day', highlightIndex }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} fontSize={12} />
          <YAxis axisLine={false} tickLine={false} fontSize={12} />
          <Tooltip cursor={{ fill: '#f7f9ef' }} />
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Bar key={i} fill={i === highlightIndex ? '#84c22a' : '#d9e8b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
