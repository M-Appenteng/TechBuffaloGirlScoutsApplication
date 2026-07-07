import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Account() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <section className="screen">
      <p className="eyebrow">Account</p>
      <h1 className="hero-title">{profile?.name}</h1>

      <dl className="account-details">
        <div>
          <dt>Role</dt>
          <dd>{profile?.role === 'staff' ? 'Staff' : 'Volunteer'}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{profile?.email}</dd>
        </div>
        <div>
          <dt>ZIP Code</dt>
          <dd>{profile?.zip_code ?? 'Not set'}</dd>
        </div>
      </dl>

      <button className="btn btn--ghost" onClick={handleLogout}>
        Sign Out
      </button>
    </section>
  );
}
