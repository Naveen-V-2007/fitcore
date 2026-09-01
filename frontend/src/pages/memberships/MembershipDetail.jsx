import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import EditPlanModal from '../../components/memberships/EditPlanModal';
import { membershipApi } from '../../api/membershipApi';

export default function MembershipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fallback to getById if getFullProfile is not explicitly defined
      const data = membershipApi.getFullProfile 
        ? await membershipApi.getFullProfile(id) 
        : await membershipApi.getById(id);
      setPlan(data);
    } catch (err) {
      console.error('Failed to load membership plan:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p className="p-6 text-gray-500 text-sm">Loading plan details...</p>;
  if (!plan) return <p className="p-6 text-red-500 text-sm">Membership plan not found.</p>;

  const membersList = plan.members || [];
  const featuresList = plan.features || [
    'Access to gym floor & equipment',
    'Locker room & shower access',
    'Free fitness assessment'
  ];

  return (
    <div className="space-y-6">
      <button 
        type="button" 
        onClick={() => navigate('/memberships')} 
        className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        ← Back to Memberships
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
          <StatusBadge status={plan.status || 'active'} />
        </div>
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="bg-[#84c22a] hover:bg-[#72a823] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          Edit Plan
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Price</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${plan.price} / mo</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {plan.duration_months ? `${plan.duration_months} Months` : `${plan.duration_days || 30} Days`}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Active Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{plan.activeMemberCount || membersList.length || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Renewal Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{plan.renewal_rate || 92}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Members</h3>
          {membersList.length === 0 ? (
            <p className="text-sm text-gray-400 py-2">No members on this plan yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Join Date</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {membersList.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 text-gray-800 font-medium">
                      {m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email}
                    </td>
                    <td className="py-2.5 text-gray-500">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={m.status || 'active'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Included Features</h3>
          <ul className="space-y-2.5 text-sm">
            {featuresList.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#84c22a]" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <EditPlanModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        plan={plan}
        onPlanUpdated={fetchData}
      />
    </div>
  );
}
