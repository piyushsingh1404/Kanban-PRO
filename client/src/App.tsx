import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './routes/Login';
import Boards from './routes/Boards';
import BoardView from './routes/BoardView';
import ProtectedRoute from './routes/ProtectedRoute';
import Topbar from './components/Topbar';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './store/authStore';

export default function App() {
  const { me } = useAuth();
  const { pathname } = useLocation();
  const isBoard = pathname.startsWith('/board/');

  // Initialize session once
  useEffect(() => { me(); }, []);

  return (
    <div className="bg-app min-h-screen">
      <Topbar />
      <main className={isBoard ? 'px-4 py-6' : 'max-w-6xl mx-auto px-4 py-6'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/boards" element={<ProtectedRoute><Boards /></ProtectedRoute>} />
          <Route path="/board/:id" element={<ProtectedRoute><BoardView /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="*" element={<Navigate to="/boards" replace />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
