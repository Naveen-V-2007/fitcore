import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Dumbbell, Mail, Phone, Users } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import EditTrainerModal from '../../components/trainers/EditTrainerModal';
import { trainerApi } from '../../api/trainerApi';

export default function TrainerDetail() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await trainerApi.getFullProfile(id);
      setTrainer(data);
      setAssignedMembers(data?.members || []);
    } catch (err) {
      console.error('Failed to load trainer details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleDeactivate = async () => {
    if (!trainer) return;
    const isCurrentlyInactive = trainer.status === 'inactive';
    const nextStatus = isCurrentlyInactive ? 'active' : 'inactive';
    const confirmMessage = isCurrentlyInactive
      ? 'Reactivate this trainer?'
      : 'Are you sure you want to deactivate this trainer?';

    if (!window.confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      await trainerApi.update(trainer.id, { status: nextStatus });
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to update trainer status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="p-8 text-gray-400 text-sm">Loading trainer profile...</p>;
  if (!trainer) return <p className="p-8 text-red-500 text-sm">Trainer not found.</p>;

  const trainerName = trainer.name || trainer.full_name || `${trainer.first_name || ''} ${trainer.last_name || ''}`.trim() || 'Trainer';
  const isInactive = trainer.status === 'inactive';

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight size={12} />
        <Link to="/trainers" className="hover:text-gray-900">Trainers</Link>
        <ChevronRight size={12} />
        <span className="text-gray-900 font-medium">{trainerName}</span>
      </div>

      {/* Header Info & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold">
            {trainerName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900">{trainerName}</h1>
              <StatusBadge status={trainer.status || 'active'} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {trainer.specialty || trainer.specialization || 'General Trainer'} · Code: {trainer.trainer_code || `TR-${trainer.id?.slice(0, 4)?.toUpperCase() || '101'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleDeactivate}
            disabled={actionLoading}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              isInactive
                ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                : 'border-red-300 text-red-600 hover:bg-red-50'
            }`}
          >
            {actionLoading ? 'Updating...' : isInactive ? 'Reactivate Trainer' : 'Deactivate Trainer'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-[#84c22a] hover:bg-[#72a823] text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            Edit Trainer
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Assigned Clients</p>
            <p className="text-lg font-bold text-gray-900">{trainer.totalClients ?? assignedMembers.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Email Address</p>
            <p className="text-sm font-semibold text-gray-900">{trainer.email || '—'}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <Phone size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Phone Number</p>
            <p className="text-sm font-semibold text-gray-900">{trainer.phone || '—'}</p>
          </div>
        </div>
      </div>

      {/* Assigned Members List */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 text-base mb-4 flex items-center gap-2">
          <Dumbbell size={18} className="text-emerald-700" /> Assigned Members
        </h3>

        {assignedMembers.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No members assigned to this trainer yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignedMembers.map((m) => {
              const memberDisplayName =
                m.name ||
                `${m.first_name || ''} ${m.last_name || ''}`.trim() ||
                m.email;

              return (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link
                      to={`/members/${m.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-brand-600 transition-colors"
                    >
                      {memberDisplayName}
                    </Link>
                    <p className="text-xs text-gray-500">{m.email || m.phone || 'No contact details'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : ''}
                    </span>
                    <StatusBadge status={m.status || 'active'} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EditTrainerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        trainer={trainer}
        onTrainerUpdated={loadData}
      />
    </div>
  );
}
