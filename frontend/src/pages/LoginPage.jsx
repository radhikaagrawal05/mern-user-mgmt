import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@example.com', password: 'Admin@123' },
      manager: { email: 'manager@example.com', password: 'Manager@123' },
      user: { email: 'user@example.com', password: 'User@123' },
    };
    setForm(creds[role]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)',
        padding: '1rem',
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>👥</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Sign In</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>User Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#6d28d9', fontWeight: 500 }}>
            Register here
          </Link>
        </p>

        {/* Demo credentials */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f5f3ff', borderRadius: 8, border: '1px solid #ede9fe' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5b21b6', marginBottom: '0.5rem' }}>Quick Demo Login</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['admin', 'manager', 'user'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => fillDemo(role)}
                className={`btn badge-${role}`}
                style={{ flex: 1, padding: '0.375rem', fontSize: '0.75rem', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
