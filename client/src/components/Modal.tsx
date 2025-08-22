import { ReactNode } from 'react';

export default function Modal({
  open,
  title,
  onClose,
  children,
}: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 hover:bg-black/5">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
