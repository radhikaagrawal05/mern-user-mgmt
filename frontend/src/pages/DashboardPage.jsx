import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';

const StatCard = ({ label, value, color, icon }) => (
  <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.375rem' }}>{label}</div>
  </div>
);

export default function DashboardPage() {
  const { user, isAdmin, isManager } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    if (isAdmin || isManager) {
      usersAPI.getAll({ limit: 100, page: 1 }).then(({ data }) => {
        const users = data.users;
        setStats({
          total: data.pagination.total,
          active: users.filter((u) => u.status === 'active').length,
          inactive: users.filter((u) => u.status === 'inactive').length,
          admins: users.filter((u) => u.role === 'admin').length,
          managers: users.filter((u) => u.role === 'manager').length,
          regularUsers: users.filter((u) => u.role === 'user').length,
        });
        setRecentUsers(users.slice(0, 5));
      }).catch(() => {});
    }
  }, [isAdmin, isManager]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Logged in as <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </p>
      </div>

      {/* Stats grid (Admin/Manager only) */}
      {stats && (
        <>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard label="Total Users" value={stats.total} color="#6d28d9" icon="👥" />
            <StatCard label="Active" value={stats.active} color="#16a34a" icon="✅" />
            <StatCard label="Inactive" value={stats.inactive} color="#dc2626" icon="⛔" />
            <StatCard label="Admins" value={stats.admins} color="#9333ea" icon="🛡️" />
            <StatCard label="Managers" value={stats.managers} color="#2563eb" icon="👔" />
            <StatCard label="Users" value={stats.regularUsers} color="#0891b2" icon="👤" />
          </div>

          {/* Recent users */}
          {recentUsers.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Users</h3>
                <Link to="/users" style={{ fontSize: '0.8rem', color: '#6d28d9', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: '#6b7280' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Permissions card */}
      <div className="card" style={{ marginTop: stats ? '1.5rem' : 0 }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Your Permissions</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {user?.permissions?.map((p) => (
            <span
              key={p}
              style={{
                padding: '0.3rem 0.75rem',
                background: '#ede9fe',
                color: '#6d28d9',
                borderRadius: 20,
                fontSize: '0.78rem',
                fontFamily: 'monospace',
                fontWeight: 500,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
