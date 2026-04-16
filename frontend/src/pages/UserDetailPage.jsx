import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Field = ({ label, value }) => (
  <div>
    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ fontWeight: 500, color: '#1e293b' }}>{value || '—'}</p>
  </div>
);

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    usersAPI
      .getById(id)
      .then(({ data }) => {
        setUser(data);
        setForm({ name: data.name, email: data.email, role: data.role, status: data.status });
      })
      .catch(() => {
        toast.error('User not found');
        navigate('/users');
      })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.update(id, form);
      setUser(data);
      setEditing(false);
      toast.success('User updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setEditing(false);
  };

  if (fetching) return <div style={{ padding: '2rem', color: '#6b7280' }}>Loading user...</div>;
  if (!user) return null;

  const canEdit = isAdmin || isManager;

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Back */}
      <button
        onClick={() => navigate('/users')}
        style={{ background: 'none', border: 'none', color: '#6d28d9', cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
      >
        ← Back to Users
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
              <span className={`badge badge-${user.status}`}>{user.status}</span>
            </div>
          </div>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!editing ? (
              <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit</button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : '✓ Save'}
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profile Information</h3>
        {editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            {isAdmin && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Full Name" value={user.name} />
            <Field label="Email Address" value={user.email} />
            <Field label="Role" value={<span className={`badge badge-${user.role}`}>{user.role}</span>} />
            <Field label="Status" value={<span className={`badge badge-${user.status}`}>{user.status}</span>} />
          </div>
        )}
      </div>

      {/* Audit trail */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Trail</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <Field label="Created At" value={new Date(user.createdAt).toLocaleString()} />
          <Field label="Last Updated" value={new Date(user.updatedAt).toLocaleString()} />
          <Field
            label="Created By"
            value={user.createdBy ? `${user.createdBy.name} (${user.createdBy.email})` : 'System / Self-registered'}
          />
          <Field
            label="Last Updated By"
            value={user.updatedBy ? `${user.updatedBy.name} (${user.updatedBy.email})` : '—'}
          />
        </div>
      </div>
    </div>
  );
}
