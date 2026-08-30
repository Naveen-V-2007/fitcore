import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import { staffApi } from '../../api/staffApi';

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { staffApi.getById(id).then(setMember).finally(() => setLoading(false)); }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!member) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/staff')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Staff</button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-900">{member.name?.charAt(0)}</div>
          <div>
            <div className="flex items-center gap-2"><h2 className="text-2xl font-bold">{member.name}</h2><StatusBadge status={member.status} /></div>
            <p className="text-gray-500 text-sm">{member.role_title} · Emp ID: {member.staff_code}</p>
          </div>
        </div>
        <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Edit Staff</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Profile Overview</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500">Department</p><p className="font-medium">{member.department || '—'}</p></div>
            <div><p className="text-gray-500">Join Date</p><p className="font-medium">{member.join_date}</p></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Email:</span> {member.email || '—'}</p>
            <p><span className="text-gray-500">Phone:</span> {member.phone || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
