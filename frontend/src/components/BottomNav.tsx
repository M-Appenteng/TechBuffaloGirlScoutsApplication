import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VOLUNTEER_TABS = [
  { to: '/explore', label: 'Explore' },
  { to: '/upcoming', label: 'Upcoming' },
  { to: '/past', label: 'Past' },
  { to: '/account', label: 'Account' },
];

const STAFF_TABS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/account', label: 'Account' },
];

export function BottomNav() {
  const { profile } = useAuth();
  const tabs = profile?.role === 'staff' ? STAFF_TABS : VOLUNTEER_TABS;

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `bottom-nav__tab${isActive ? ' bottom-nav__tab--active' : ''}`}>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
