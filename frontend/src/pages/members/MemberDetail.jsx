import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  CreditCard, 
  Download, 
  User, 
  Dumbbell, 
  Flame 
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import EditMemberModal from '../../components/members/EditMemberModal';
import { memberApi } from '../../api/memberApi';

export default function MemberDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await memberApi.getFullProfile(id);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSuspend = async () => {
    if (!profile) return;
    const isCurrentlySuspended = profile.status === 'suspended';
    const nextStatus = isCurrentlySuspended ? 'active' : 'suspended';
    const confirmMessage = isCurrentlySuspended 
      ? 'Reactivate this member?' 
      : 'Are you sure you want to suspend this member?';

    if (!window.confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      await memberApi.update(profile.id, { status: nextStatus });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update member status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="p-8 text-gray-400 text-sm">Loading member profile...</p>;
  if (!profile) return <p className="p-8 text-red-500 text-sm">Member not found.</p>;

  const fullName = profile.name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'Member';
  const joinDate = new Date(profile.created_at || Date.now());
  const daysSince = Math.max(0, Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalVisits = profile.attendance?.length || 0;
  const isSuspended = profile.status === 'suspended';

  const plan = profile.membership_plans;
  const trainer = profile.trainers;

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight size={12} />
        <Link to="/members" className="hover:text-gray-900">Members</Link>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">{fullName}</span>
      </div>

      {/* Header Profile Info & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl font-bold text-emerald-600">
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <StatusBadge status={profile.status || 'active'} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Member ID: {profile.member_code || `FT-${profile.id?.slice(0, 4)?.toUpperCase() || '1024'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleSuspend}
            disabled={actionLoading}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              isSuspended
                ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                : 'border-red-300 text-red-600 hover:bg-red-50'
            }`}
          >
            {actionLoading ? 'Updating...' : isSuspended ? 'Reactivate Member' : 'Suspend Member'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-[#84c22a] hover:bg-[#72a823] text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            Edit Member
          </button>
        </div>
      </div>

      {/* Top Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Join Date</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {joinDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Member Since</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{daysSince} days</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Total Visits</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{totalVisits}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium uppercase">Current Streak</p>
          <p className="text-lg font-bold text-gray-900 mt-1 flex items-center gap-1">
            {totalVisits > 0 ? `${Math.min(totalVisits, 5)} days` : '0 days'} <Flame size={16} className="text-orange-500" />
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membership Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-emerald-800 font-semibold text-base">
              <CreditCard size={18} /> Membership Information
            </div>
            <div className="grid grid-cols-3 gap-y-4 pt-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Plan</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {plan?.name ? (
                    <Link to={`/memberships/${plan.id}`} className="hover:text-emerald-700 underline decoration-dotted">
                      {plan.name}
                    </Link>
                  ) : (
                    'No Plan Assigned'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                <p className="font-semibold text-gray-900 mt-0.5">
                  {plan?.price ? `$${plan.price} / mo` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                <span className="font-semibold text-emerald-600 capitalize mt-0.5 block">{profile.status || 'Active'}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Start Date</p>
                <p className="text-gray-700 mt-0.5">
                  {joinDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Expiry Date</p>
                <p className="text-gray-700 mt-0.5">
                  {new Date(joinDate.getTime() + (plan?.duration_days || 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Membership ID</p>
                <p className="text-gray-700 mt-0.5">
                  {plan?.plan_code || (plan?.id ? `PLN-${plan.id.slice(0, 4).toUpperCase()}` : '—')}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-base">
                <CreditCard size={18} /> Payment History
              </div>
              <Link to="/payments" className="text-xs font-semibold text-emerald-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-5 text-xs font-medium text-gray-500 py-3">
                <span>Date</span>
                <span>Amount</span>
                <span>Method</span>
                <span>Status</span>
                <span className="text-right">Invoice</span>
              </div>

              {profile.payments?.length > 0 ? (
                profile.payments.map((p) => (
                  <div key={p.id} className="grid grid-cols-5 text-xs items-center py-3 text-gray-700">
                    <span>{new Date(p.payment_date || p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="font-semibold">${Number(p.amount).toFixed(2)}</span>
                    <span className="capitalize">{p.payment_method || 'Credit Card'}</span>
                    <span><StatusBadge status={p.status || 'completed'} /></span>
                    <span className="text-right">
                      <button type="button" className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer">
                        <Download size={14} />
                      </button>
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  No payment transactions recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 font-semibold text-gray-900 text-sm">
              <User size={16} /> Personal Info
            </div>
            <div className="space-y-3 pt-4 text-xs">
              <div>
                <p className="text-gray-500 uppercase font-semibold">Email</p>
                <p className="text-gray-800 font-medium mt-0.5">{profile.email || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase font-semibold">Phone</p>
                <p className="text-gray-800 font-medium mt-0.5">{profile.phone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase font-semibold">Gender</p>
                <p className="text-gray-800 font-medium mt-0.5 capitalize">{profile.gender || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase font-semibold">Address</p>
                <p className="text-gray-800 font-medium mt-0.5">{profile.address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Assigned Trainer */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 font-semibold text-emerald-800 text-sm">
              <Dumbbell size={16} /> Assigned Trainer
            </div>
            {trainer ? (
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    {trainer.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <Link 
                      to={`/trainers/${trainer.id}`} 
                      className="text-sm font-semibold text-gray-900 hover:text-emerald-700 hover:underline"
                    >
                      {trainer.name || `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim()}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {trainer.specialty || trainer.specialization || 'Fitness Coach'}
                    </p>
                  </div>
                </div>
                {trainer.email && <p className="text-xs text-gray-500">Email: {trainer.email}</p>}
                {trainer.phone && <p className="text-xs text-gray-500">Phone: {trainer.phone}</p>}
                <Link
                  to={`/trainers/${trainer.id}`}
                  className="mt-2 block w-full py-2 border border-gray-300 rounded-lg text-xs font-medium text-center text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Trainer Profile
                </Link>
              </div>
            ) : (
              <div className="pt-6 pb-2 text-center space-y-2">
                <p className="text-xs text-gray-400">No trainer assigned to this member.</p>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-medium text-[#84c22a] hover:underline cursor-pointer"
                >
                  + Assign Trainer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={profile}
        onMemberUpdated={loadData}
      />
    </div>
  );
}
