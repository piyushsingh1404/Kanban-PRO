import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Board } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Board | null>(null);
  const [title, setTitle] = useState('');

  async function fetchBoards() {
    setLoading(true);
    try {
      const { data } = await api.get('/boards');
      setBoards(data?.boards ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBoards(); }, []);

  async function onCreate() {
    try {
      const { data } = await api.post('/boards', { title });
      setBoards(prev => [data.board, ...prev]);
      setTitle('');
      setCreateOpen(false);
      toast.success('Board created');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create');
    }
  }

  async function onRename() {
    if (!editOpen) return;
    try {
      const { data } = await api.patch(`/boards/${editOpen._id}`, { title });
      setBoards(prev => prev.map(b => (b._id === data.board._id ? data.board : b)));
      setEditOpen(null);
      setTitle('');
      toast.success('Board renamed');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to rename');
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this board?')) return;
    try {
      await api.delete(`/boards/${id}`);
      setBoards(prev => prev.filter(b => b._id !== id));
      toast.success('Board deleted');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete');
    }
  }

  // pretty gradient bg
  const bg = useMemo(
    () => 'min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-slate-50 via-white to-emerald-50',
    []
  );

  return (
    <div className={bg}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <button onClick={() => setCreateOpen(true)} className="btn btn-primary">
            + New Board
          </button>
        </div>

        {loading ? (
          <div className="opacity-60">Loading…</div>
        ) : boards.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-medium">No boards yet.</p>
            <p className="mt-1 text-sm text-slate-500">Create your first board to get started.</p>
            <button onClick={() => setCreateOpen(true)} className="btn btn-primary mt-4">
              Create board
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((b) => (
              <li key={b._id} className="group rounded-2xl border bg-white/90 p-5 shadow-sm backdrop-blur transition hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  {/* Link instead of <a> for SPA navigation */}
                  <Link to={`/board/${b._id}`} className="block text-lg font-semibold hover:underline">
                    {b.title}
                  </Link>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => { setEditOpen(b); setTitle(b.title); }}
                      className="rounded-md px-2 py-1 hover:bg-black/5"
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(b._id)}
                      className="rounded-md px-2 py-1 hover:bg-black/5"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Updated {new Date(b.updatedAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} title="Create board" onClose={() => setCreateOpen(false)}>
        <div className="space-y-3">
          <input
            className="input w-full"
            placeholder="Board title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="btn" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={onCreate} disabled={title.trim().length < 2}>
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal open={!!editOpen} title="Rename board" onClose={() => setEditOpen(null)}>
        <div className="space-y-3">
          <input
            className="input w-full"
            placeholder="Board title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        <div className="flex justify-end gap-2">
            <button className="btn" onClick={() => setEditOpen(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={onRename} disabled={title.trim().length < 2}>
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
