import React, { useState } from 'react';
import { staffApi } from '../../api/staffApi';

export default function AddStaffModal({ isOpen, onClose, onStaffAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'receptionist',
    phone: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await staffApi.create({
        full_name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        status: formData.status
      });
      if (onStaffAdded) onStaffAdded();
      onClose();
    } catch (err) {
      console.error('Failed to create staff member:', err);
      setError(err.message || 'Error creating staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Staff Member</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Rachel Green"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="rachel@fitcore.com"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Role</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="receptionist">Receptionist</option>
                <option value="manager">Manager</option>
                <option value="cleaning">Maintenance</option>
                <option value="trainer">Trainer</option>
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
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="+1 555-0188"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-[#84c22a] hover:bg-[#72a823] rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Saving...' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
