import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password && form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    const payload = { name: form.name, email: form.email };
    if (form.password) payload.password = form.password;

    try {
      await usersAPI.update(user._id, payload);
      await refreshUser();
      toast.success('Profile updated successfully');
      setForm((p) => ({ ...p, password: '', confirmPassword: '' }));
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email, password: '', confirmPassword: '' });
    setEditing(false);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 700 }}>My Profile</h2>

      {/* Avatar / identity card */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700, flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{user?.name}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.375rem' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            <span className={`badge badge-${user?.status}`}>{user?.status}</span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Account Details</h3>
          {!editing ? (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!editing}
                style={{ background: editing ? 'white' : '#f8fafc' }}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={!editing}
                style={{ background: editing ? 'white' : '#f8fafc' }}
                required
              />
            </div>
          </div>

          <div style={{ margin: '1.25rem 0', padding: '0.75rem', background: '#f5f3ff', borderRadius: 8, fontSize: '0.8rem', color: '#5b21b6' }}>
            🔒 Role: <strong>{user?.role}</strong> — You cannot change your own role.
          </div>

          {editing && (
            <>
              <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb', borderStyle: 'solid' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>Change Password (optional)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.625rem 1.5rem' }}>
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
