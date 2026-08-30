const STYLES = {
  active: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  present: 'bg-green-100 text-green-700',
  converted: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  new: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-orange-100 text-orange-700',
  on_leave: 'bg-orange-100 text-orange-700',
  full: 'bg-orange-100 text-orange-700',
  inactive: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
  overdue: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
  left: 'bg-gray-100 text-gray-700',
  completed: 'bg-gray-100 text-gray-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase().replace(' ', '_');
  const style = STYLES[key] || 'bg-gray-100 text-gray-700';
  const label = (status || '').replace('_', ' ');
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
