import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CreateUserModal from '../components/users/CreateUserModal';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ users: [], pagination: {} });
  const [filters, setFilters] = useState({ search: '', role: '', status: '', page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Strip empty filters
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const { data: res } = await usersAPI.getAll(params);
      setData(res);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? They will no longer be able to log in.`)) return;
    try {
      await usersAPI.delete(id);
      toast.success(`${name} has been deactivated`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deactivating user');
    }
  };

  const handleHardDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      await usersAPI.hardDelete(id);
      toast.success(`${name} permanently deleted`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Users</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            {data.pagination.total ?? '—'} total users
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + New User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ flex: 1, minWidth: 200, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', outline: 'none' }}
            placeholder="🔍 Search name or email..."
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters((p) => ({ ...p, role: e.target.value, page: 1 }))}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', background: 'white' }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.875rem', background: 'white' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(filters.search || filters.role || filters.status) && (
            <button
              className="btn btn-secondary"
              style={{ padding: '0.5rem 0.75rem' }}
              onClick={() => setFilters({ search: '', role: '', status: '', page: 1, limit: 10 })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading users...</div>
        ) : data.users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No users found</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                      </td>
                      <td style={{ color: '#6b7280' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                      <td style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <Link
                            to={`/users/${u._id}`}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.625rem', fontSize: '0.8rem' }}
                          >
                            View
                          </Link>
                          {isAdmin && u.status === 'active' && (
                            <button
                              className="btn btn-danger"
                              style={{ padding: '0.3rem 0.625rem', fontSize: '0.8rem' }}
                              onClick={() => handleDeactivate(u._id, u.name)}
                            >
                              Deactivate
                            </button>
                          )}
                          {isAdmin && u.status === 'inactive' && (
                            <button
                              className="btn"
                              style={{ padding: '0.3rem 0.625rem', fontSize: '0.8rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                              onClick={() => handleHardDelete(u._id, u.name)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem' }}
                  disabled={filters.page === 1}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                >
                  ‹
                </button>
                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn ${p === filters.page ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.375rem 0.625rem', minWidth: 36 }}
                    onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem' }}
                  disabled={filters.page === data.pagination.pages}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); fetchUsers(); }}
        />
      )}
    </div>
  );
}
