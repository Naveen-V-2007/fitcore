import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import AddMemberModal from '../../components/members/AddMemberModal';
import { memberApi } from '../../api/memberApi';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        memberApi.list({ page, pageSize, search }),
        memberApi.getStats()
      ]);
      setMembers(listRes?.data || []);
      setTotalCount(listRes?.count || 0);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm">Manage gym members and member information.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#84c22a] hover:bg-[#72a823] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="TOTAL MEMBERS" value={stats.total} />
        <StatCard label="ACTIVE MEMBERS" value={stats.active} />
        <StatCard label="NEW THIS MONTH" value={stats.newThisMonth} />
        <StatCard label="EXPIRING SOON" value={stats.expiringSoon} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#84c22a] bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">MEMBER</th>
                <th className="px-6 py-3">MEMBER ID</th>
                <th className="px-6 py-3">MEMBERSHIP</th>
                <th className="px-6 py-3">CONTACT</th>
                <th className="px-6 py-3">JOIN DATE</th>
                <th className="px-6 py-3">TRAINER</th>
                <th className="px-6 py-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const displayName =
                    m.name ||
                    `${m.first_name || ''} ${m.last_name || ''}`.trim() ||
                    m.email;
                  const memberCode = m.member_code || `FT-${m.id?.slice(0, 4)?.toUpperCase() || '0000'}`;
                  const planName = m.membership_plans?.name || m.membership_plan || '—';
                  const trainerName = m.trainers?.name || m.trainer_name || '—';
                  const joinDate = m.created_at
                    ? new Date(m.created_at).toLocaleDateString()
                    : m.join_date || '—';

                  return (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{displayName}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{memberCode}</td>
                      <td className="px-6 py-4 text-gray-700">{planName}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <div>{m.email}</div>
                        {m.phone && <div className="text-xs text-gray-400">{m.phone}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{joinDate}</td>
                      <td className="px-6 py-4 text-gray-700">{trainerName}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={m.status || 'active'} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {members.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(page * pageSize, totalCount)} of {totalCount} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium text-gray-700 px-2">
              {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={loadData}
      />
    </div>
  );
}
