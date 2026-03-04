import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Wrench } from 'lucide-react';

export default function Login() {
  const { login, loading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Brand with store photo background */}
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-overlay" />
        <div className="login-left-content">
          <div className="login-logo-circle">
            <img src="/logo.svg" alt="A&D Hardware Logo" />
          </div>
          <h1 className="login-brand-name">A&D HARDWARE</h1>
          <p className="login-brand-est">EST. 2022</p>
          <p className="login-brand-address">
            442, Bucot, Aliaga, Nueva Ecija
          </p>
          <p className="login-brand-phone">(0907) 264 3757</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h1>
              <Wrench size={24} style={{ color: 'var(--primary)' }} />
              Inventory Management System
            </h1>
            <p>Sign in to manage your inventory</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="form-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'SIGN IN'}
            </button>
          </form>

          <div className="login-footer">
            A&D Hardware Inventory System v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
