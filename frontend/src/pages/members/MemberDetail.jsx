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

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Alex Johnson';
  const joinDate = new Date(profile.created_at || Date.now());
  const daysSince = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalVisits = profile.attendance?.length || 0;
  const isSuspended = profile.status === 'suspended';

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
            {fullName.charAt(0)}
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
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium">Join Date</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {joinDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium">Member Since</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{daysSince} days</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium">Total Visits</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{totalVisits}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 font-medium">Current Streak</p>
          <p className="text-lg font-bold text-gray-900 mt-1 flex items-center gap-1">
            5 days <Flame size={16} className="text-purple-600" />
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
                <p className="text-xs text-gray-500">Plan</p>
                <p className="font-semibold text-gray-900 mt-0.5">{profile.membership_plans?.name || 'Premium'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-semibold text-gray-900 mt-0.5">${profile.membership_plans?.price || '89.00'} / mo</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span className="font-semibold text-emerald-600 capitalize mt-0.5 block">{profile.status || 'Active'}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-gray-700 mt-0.5">{joinDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expiry Date</p>
                <p className="text-gray-700 mt-0.5">14 Sep 2026</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Membership ID</p>
                <p className="text-gray-700 mt-0.5">PREM-4492</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-base">
                <CreditCard size={18} /> Payment History
              </div>
              <button type="button" className="text-xs font-semibold text-emerald-700 hover:underline">
                View All
              </button>
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
                    <span className="font-semibold">${p.amount}</span>
                    <span>{p.payment_method || 'Visa **** 4242'}</span>
                    <span><StatusBadge status={p.status || 'completed'} /></span>
                    <span className="text-right">
                      <Download size={14} className="inline text-gray-400 hover:text-gray-700 cursor-pointer" />
                    </span>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-5 text-xs items-center py-3 text-gray-700">
                  <span>{joinDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="font-semibold">$89.00</span>
                  <span>Visa **** 4242</span>
                  <span><StatusBadge status="completed" /></span>
                  <span className="text-right">
                    <Download size={14} className="inline text-gray-400 hover:text-gray-700 cursor-pointer" />
                  </span>
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
                <p className="text-gray-500">Email</p>
                <p className="text-gray-800 font-medium mt-0.5">{profile.email || 'alex.johnson@email.com'}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="text-gray-800 font-medium mt-0.5">{profile.phone || '(555) 123-4567'}</p>
              </div>
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="text-gray-800 font-medium mt-0.5">Male</p>
              </div>
              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p className="text-gray-800 font-medium mt-0.5">24 Oct 1990 (33 y/o)</p>
              </div>
              <div>
                <p className="text-gray-500">Address</p>
                <p className="text-gray-800 font-medium mt-0.5">123 Fitness Blvd, Apt 4B<br />New York, NY 10001</p>
              </div>
            </div>
          </div>

          {/* Assigned Trainer */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100 font-semibold text-emerald-800 text-sm">
              <Dumbbell size={16} /> Assigned Trainer
            </div>
            <div className="pt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-600">
                {profile.trainers?.name?.charAt(0) || 'M'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {profile.trainers?.name || profile.trainers?.full_name || 'Marcus Thompson'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile.trainers?.specialty || 'Strength & Conditioning'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Message Trainer
            </button>
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
