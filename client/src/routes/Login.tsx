import { useState } from 'react';
import { useAuth } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, loading } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState('demo1@mail.com');
  const [password, setPassword] = useState('Password@123');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      nav('/boards', { replace: true }); // ✅ soft navigation (no reload)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center">
      <form className="card w-full max-w-sm p-6 space-y-3" onSubmit={onSubmit}>
        <div className="flex items-center gap-2 mb-1">
          <img src="/converted.jpg" alt="" className="h-5 w-5 rounded-md object-cover" />
          <h1 className="text-xl font-semibold">Sign in</h1>
        </div>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
