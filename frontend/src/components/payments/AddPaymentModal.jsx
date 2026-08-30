import React, { useState, useEffect } from 'react';
import { paymentApi } from '../../api/paymentApi';
import { memberApi } from '../../api/memberApi';

export default function AddPaymentModal({ isOpen, onClose, onPaymentAdded }) {
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_method: 'card',
    status: 'completed'
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      memberApi.getAll?.()
        .then((data) => setMembers(data || []))
        .catch(() => {
          memberApi.list?.({ page: 1, pageSize: 50 })
            .then((res) => setMembers(res?.data || []))
            .catch((err) => console.error('Error fetching members:', err));
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await paymentApi.create({
        member_id: formData.member_id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        status: formData.status
      });
      if (onPaymentAdded) onPaymentAdded();
      onClose();
    } catch (err) {
      console.error('Failed to record payment:', err);
      setError(err.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Select Member</label>
            <select
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
            >
              <option value="">Choose a member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name ? `${m.first_name} ${m.last_name || ''}` : m.name || m.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Payment Method</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            >
              <option value="card">Credit / Debit Card</option>
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
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
              {loading ? 'Processing...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
