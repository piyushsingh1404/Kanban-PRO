import { LogOut, LayoutDashboard } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Topbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-slate-950/60 border-b border-white/20 dark:border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/boards" className="flex items-center gap-2 group">
          <LayoutDashboard className="text-slate-800 dark:text-slate-100 group-hover:scale-105 transition" size={18}/>
          <span className="font-semibold heading-hero group-hover:underline">Kanban Pro</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-80 hidden sm:block">{user.name || user.email}</span>
              <button
                type="button"
                className="btn px-2"
                title="Logout"
                aria-label="Logout"
                onClick={async () => {
                  try {
                    await logout();
                    nav('/login', { replace: true });
                  } catch {
                    toast.error('Could not log out. Try again.');
                  }
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
