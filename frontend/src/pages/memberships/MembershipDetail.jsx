import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { membershipApi } from '../../api/membershipApi';

export default function MembershipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { membershipApi.getFullProfile(id).then(setPlan).finally(() => setLoading(false)); }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!plan) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/memberships')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Memberships</button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{plan.name}</h2>
          <StatusBadge status={plan.status} />
        </div>
        <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Edit Plan</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-xs text-gray-500 uppercase">Price</p><p className="text-2xl font-bold">${plan.price}/mo</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-xs text-gray-500 uppercase">Duration</p><p className="text-2xl font-bold">{plan.duration_days} Days</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-xs text-gray-500 uppercase">Active Members</p><p className="text-2xl font-bold">{plan.activeMemberCount}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5"><p className="text-xs text-gray-500 uppercase">Renewal Rate</p><p className="text-2xl font-bold">{plan.renewal_rate}%</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Recent Members</h3>
          {plan.members.length === 0 ? <p className="text-sm text-gray-400">No members on this plan yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="py-2">Name</th><th>Join Date</th><th>Status</th></tr></thead>
              <tbody>
                {plan.members.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="py-2">{m.name}</td><td>{m.join_date}</td><td><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Included Features</h3>
          <ul className="space-y-2 text-sm">
            {(plan.features || []).map((f, i) => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" />{f}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
