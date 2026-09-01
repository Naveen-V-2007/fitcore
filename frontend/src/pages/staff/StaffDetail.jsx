import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import EditStaffModal from '../../components/staff/EditStaffModal';
import { staffApi } from '../../api/staffApi';

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const data = await staffApi.getById(id);
      setMember(data);
    } catch (err) {
      console.error('Failed to load staff details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  if (loading) return <p className="p-6 text-gray-500 text-sm">Loading staff member...</p>;
  if (!member) return <p className="p-6 text-red-500 text-sm">Staff member not found.</p>;

  const staffName = member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Staff Member';
  const roleDisplay = member.role_title || member.role || 'Front Desk';

  return (
    <div className="space-y-6 max-w-5xl">
      <button
        type="button"
        onClick={() => navigate('/staff')}
        className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
      >
        ← Back to Staff
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-900">
            {staffName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">{staffName}</h2>
              <StatusBadge status={member.status || 'active'} />
            </div>
            <p className="text-gray-500 text-sm">
              {roleDisplay} · Emp ID: {member.staff_code || `ST-${member.id?.slice(0, 4)?.toUpperCase() || '101'}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          Edit Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Overview</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase">Department</p>
              <p className="font-medium text-gray-800 mt-0.5">{member.department || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Join Date</p>
              <p className="font-medium text-gray-800 mt-0.5">{member.join_date || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Email:</span>{' '}
              <span className="text-gray-800 font-medium">{member.email || '—'}</span>
            </p>
            <p>
              <span className="text-gray-500">Phone:</span>{' '}
              <span className="text-gray-800 font-medium">{member.phone || '—'}</span>
            </p>
          </div>
        </div>
      </div>

      <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        staff={member}
        onStaffUpdated={fetchStaff}
      />
    </div>
  );
}
