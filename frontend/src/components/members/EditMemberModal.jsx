import React, { useState, useEffect } from 'react';
import { memberApi } from '../../api/memberApi';
import { membershipApi } from '../../api/membershipApi';
import { trainerApi } from '../../api/trainerApi';

export default function EditMemberModal({ isOpen, onClose, member, onMemberUpdated }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    membership_plan_id: '',
    trainer_id: ''
  });

  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        membershipApi.getAll ? membershipApi.getAll() : membershipApi.list().then(res => res.data),
        trainerApi.getAll ? trainerApi.getAll() : trainerApi.list().then(res => res.data)
      ])
        .then(([plansData, trainersData]) => {
          setPlans(plansData || []);
          setTrainers(trainersData || []);
        })
        .catch(err => console.error('Failed to load options:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || member.name?.split(' ')[0] || '',
        last_name: member.last_name || member.name?.split(' ').slice(1).join(' ') || '',
        email: member.email || '',
        phone: member.phone || '',
        status: member.status || 'active',
        membership_plan_id: member.membership_plan_id || member.membership_plans?.id || '',
        trainer_id: member.trainer_id || member.trainers?.id || ''
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await memberApi.update(member.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        membership_plan_id: formData.membership_plan_id || null,
        trainer_id: formData.trainer_id || null
      });

      if (onMemberUpdated) onMemberUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update member:', err);
      setError(err.message || 'Error updating member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Member</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Membership Plan</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.membership_plan_id}
              onChange={(e) => setFormData({ ...formData, membership_plan_id: e.target.value })}
            >
              <option value="">-- Select a Plan --</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price}/mo)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Assigned Trainer</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.trainer_id}
              onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
            >
              <option value="">-- No Trainer Assigned --</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim()} {t.specialty ? `(${t.specialty})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-[#84c22a] hover:bg-[#72a823] rounded-lg transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
