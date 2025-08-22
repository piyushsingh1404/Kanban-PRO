// server/src/controllers/lists.controller.ts
import type { Response } from 'express';
import { AuthedRequest } from '../middlewares/auth';
import List from '../models/List';

// GET /api/v1/lists/board/:boardId -> { lists }
export async function getListsByBoard(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { boardId } = req.params;
  const lists = await List.find({ boardId, ownerId }).sort({ position: 1 }).lean();
  res.json({ lists });
}

// POST /api/v1/lists -> { list }
export async function createList(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { boardId, name, position } = req.body ?? {};
  const list = await List.create({
    boardId,
    name: String(name || '').trim(),
    position: Number(position) || 1000,
    ownerId,
  });
  res.status(201).json({ list: list.toObject() });
}

// PATCH /api/v1/lists/:id -> { list }
export async function renameList(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const name = String(req.body?.name || '').trim();
  const list = await List.findOneAndUpdate({ _id: id, ownerId }, { $set: { name } }, { new: true }).lean();
  if (!list) return res.status(404).json({ message: 'List not found' });
  res.json({ list });
}

// DELETE /api/v1/lists/:id -> { ok: true }
export async function removeList(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { id } = req.params;
  const ok = await List.findOneAndDelete({ _id: id, ownerId }).lean();
  if (!ok) return res.status(404).json({ message: 'List not found' });
  res.json({ ok: true });
}

// PATCH /api/v1/lists/reorder -> { ok: true }
export async function reorderLists(req: AuthedRequest, res: Response) {
  const ownerId = req.user?.id || req.userId!;
  const { boardId, items } = req.body as { boardId: string; items: Array<{ listId: string; position: number }> };

  const ops = items.map(({ listId, position }) =>
    List.updateOne({ _id: listId, ownerId, boardId }, { $set: { position } })
  );
  await Promise.all(ops);
  res.json({ ok: true });
}
