import React, { useState, useEffect } from 'react';
import { classApi } from '../../api/classApi';
import { trainerApi } from '../../api/trainerApi';

export default function AddClassModal({ isOpen, onClose, onClassAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    trainer_id: '',
    schedule_time: '',
    capacity: 20,
    room: 'Studio A'
  });
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      trainerApi.getAll?.()
        .then((data) => setTrainers(data || []))
        .catch(() => {
          trainerApi.list?.({ page: 1, pageSize: 50 })
            .then((res) => setTrainers(res?.data || []))
            .catch((err) => console.error('Error fetching trainers:', err));
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await classApi.create({
        name: formData.name,
        trainer_id: formData.trainer_id || null,
        schedule_time: new Date(formData.schedule_time).toISOString(),
        capacity: Number(formData.capacity),
        room: formData.room
      });
      if (onClassAdded) onClassAdded();
      onClose();
    } catch (err) {
      console.error('Failed to create class:', err);
      setError(err.message || 'Error creating class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Schedule New Class</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Class Name</label>
            <input
              type="text"
              required
              placeholder="e.g. HIIT Power, Morning Yoga"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Assign Trainer</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
              value={formData.trainer_id}
              onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
            >
              <option value="">Select a trainer (optional)</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || `${t.first_name || ''} ${t.last_name || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Schedule Time</label>
              <input
                type="datetime-local"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={formData.schedule_time}
                onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Room / Studio</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
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
              {loading ? 'Scheduling...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
