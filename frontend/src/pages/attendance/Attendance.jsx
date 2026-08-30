import { useEffect, useState, useCallback } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { attendanceApi } from '../../api/attendanceApi';
import { memberApi } from '../../api/memberApi';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [attData, memberList] = await Promise.all([
        attendanceApi.getAll(),
        memberApi.getAll()
      ]);
      setRecords(attData || []);
      setMembers(memberList || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckIn = async () => {
    if (!selectedMember) return;
    setActionLoading(true);
    try {
      await attendanceApi.checkIn(selectedMember);
      setSelectedMember('');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await attendanceApi.checkOut(attendanceId);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Check-out failed');
    }
  };

  const activeCheckIns = records.filter((r) => !r.check_out);

  const columns = [
    {
      key: 'member',
      label: 'Member',
      render: (r) => {
        const memberInfo = r.members || members.find((m) => m.id === r.member_id);
        const name = memberInfo 
          ? `${memberInfo.first_name || ''} ${memberInfo.last_name || ''}`.trim() || memberInfo.email
          : `Member #${r.member_id?.slice(0, 6)}`;
        return <span className="font-medium text-gray-900">{name}</span>;
      }
    },
    {
      key: 'check_in',
      label: 'Check In',
      render: (r) => r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
    },
    {
      key: 'check_out',
      label: 'Check Out',
      render: (r) => r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.check_out ? 'completed' : 'active'} />
    },
    {
      key: 'actions',
      label: 'Action',
      render: (r) => (
        !r.check_out ? (
          <button
            type="button"
            onClick={() => handleCheckOut(r.id)}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <LogOut size={13} /> Check Out
          </button>
        ) : (
          <span className="text-xs text-gray-400">Completed</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance</h2>
          <p className="text-gray-500 text-sm">Real-time floor capacity and daily member check-ins.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Currently Inside" value={activeCheckIns.length} />
        <StatCard label="Total Logged Today" value={records.length} />
        <StatCard label="Completed Visits" value={records.length - activeCheckIns.length} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-full sm:w-80 border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-[#84c22a] bg-white"
        >
          <option value="">Select member to check in...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : m.email}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={!selectedMember || actionLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#84c22a] hover:bg-[#72a823] text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          <LogIn size={16} /> {actionLoading ? 'Processing...' : 'Check In Member'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading attendance records...</p>
        ) : records.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No check-ins recorded yet. Select a member above to log a check-in.</p>
        ) : (
          <DataTable columns={columns} rows={records} />
        )}
      </div>
    </div>
  );
}
