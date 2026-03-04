import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: '',
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/profile', profile);
      updateUser(res.data);
      addToast('Profile updated successfully');
    } catch (err) {
      addToast('Error updating profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/users/change-password', {
        newPassword: passwords.newPassword,
      });
      setPasswords({ newPassword: '', confirmPassword: '' });
      addToast('Password changed successfully');
    } catch (err) {
      addToast('Error changing password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Profile Section */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <h3>
            <User size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Profile Settings
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                className="form-input"
                value={user?.username || ''}
                disabled
                style={{ opacity: 0.6 }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                Username cannot be changed
              </span>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
            >
              {savingProfile ? <span className="spinner" /> : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="card">
        <div className="card-header">
          <h3>
            <Lock size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Change Password
          </h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-danger"
              disabled={savingPassword}
            >
              {savingPassword ? <span className="spinner" /> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
